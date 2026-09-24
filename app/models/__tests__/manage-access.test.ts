import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Who may edit a registry.
 *
 * The public registry page links every guest to /manage, so authorizeManage()
 * is the only thing standing between a curious guest and someone's gift list.
 * It must accept exactly two credentials: a signed magic link for THIS
 * registry, or the signed-in store customer who owns it.
 */

vi.mock("../../db.server", () => ({
  default: {
    registry: { findUnique: vi.fn() },
  },
}));

import db from "../../db.server";
import { authorizeManage, mintManageToken } from "../registry.server";
import { signToken } from "../../lib/crypto.server";

const mockedFindUnique = vi.mocked(db.registry.findUnique);

function registryRow(overrides: Partial<{ id: string; status: string; customerId: string | null }> = {}) {
  return { id: "reg_1", status: "active", customerId: "cust_owner", items: [], registrants: [], ...overrides };
}

beforeEach(() => {
  mockedFindUnique.mockReset();
  mockedFindUnique.mockResolvedValue(registryRow() as never);
});

describe("authorizeManage", () => {
  it("turns away a logged-out guest with no link", async () => {
    expect(await authorizeManage("reg_1", null, null)).toBeNull();
  });

  it("turns away a forged or tampered token", async () => {
    const real = mintManageToken("reg_1");
    const tampered = real.slice(0, -2) + (real.endsWith("AA") ? "BB" : "AA");
    expect(await authorizeManage("reg_1", "not-a-token", null)).toBeNull();
    expect(await authorizeManage("reg_1", tampered, null)).toBeNull();
  });

  it("turns away a valid link for a different registry", async () => {
    expect(await authorizeManage("reg_1", mintManageToken("reg_2"), null)).toBeNull();
  });

  it("turns away a token signed for another purpose", async () => {
    const other = signToken({ p: "unsubscribe", r: "reg_1" }, 3600);
    expect(await authorizeManage("reg_1", other, null)).toBeNull();
  });

  it("turns away a signed-in customer who isn't the owner", async () => {
    expect(await authorizeManage("reg_1", null, "cust_someone_else")).toBeNull();
  });

  it("turns away a signed-in customer when the registry has no owner account", async () => {
    mockedFindUnique.mockResolvedValue(registryRow({ customerId: null }) as never);
    expect(await authorizeManage("reg_1", null, "cust_owner")).toBeNull();
  });

  it("lets in the owner's magic link", async () => {
    expect(await authorizeManage("reg_1", mintManageToken("reg_1"), null)).not.toBeNull();
  });

  it("lets in the signed-in customer who owns it", async () => {
    expect(await authorizeManage("reg_1", null, "cust_owner")).not.toBeNull();
  });

  it("turns away even a valid link once the registry is no longer active", async () => {
    mockedFindUnique.mockResolvedValue(registryRow({ status: "deleted" }) as never);
    expect(await authorizeManage("reg_1", mintManageToken("reg_1"), null)).toBeNull();
  });
});
