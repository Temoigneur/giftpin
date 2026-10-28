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
import {
  authorizeManage,
  manageTokenFor,
  mintManageToken,
  readManageGrant,
  renewManageToken,
} from "../registry.server";
import { signToken } from "../../lib/crypto.server";

const mockedFindUnique = vi.mocked(db.registry.findUnique);

function registryRow(
  overrides: Partial<{ id: string; status: string; customerId: string | null; registrants: unknown[] }> = {},
) {
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

describe("partner links", () => {
  const partner = { id: "rgt_partner", role: "co" };

  it("lets in a partner's link while they're on the registry", async () => {
    mockedFindUnique.mockResolvedValue(registryRow({ registrants: [partner] }) as never);
    expect(await authorizeManage("reg_1", mintManageToken("reg_1", "rgt_partner"), null)).not.toBeNull();
  });

  it("turns away a partner's link once they've been removed", async () => {
    expect(await authorizeManage("reg_1", mintManageToken("reg_1", "rgt_partner"), null)).toBeNull();
  });

  it("turns away a partner id that belongs to the owner row", async () => {
    mockedFindUnique.mockResolvedValue(
      registryRow({ registrants: [{ id: "rgt_owner", role: "owner" }] }) as never,
    );
    expect(await authorizeManage("reg_1", mintManageToken("reg_1", "rgt_owner"), null)).toBeNull();
  });

  it("renews a partner's link as a partner's link, never as the owner's", () => {
    const renewed = renewManageToken(mintManageToken("reg_1", "rgt_partner"), "reg_1");
    expect(readManageGrant(renewed)).toEqual({ registryId: "reg_1", partnerId: "rgt_partner" });
    expect(readManageGrant(renewManageToken(mintManageToken("reg_1"), "reg_1"))).toEqual({
      registryId: "reg_1",
      partnerId: null,
    });
  });

  it("hands each registrant the right kind of link", () => {
    expect(readManageGrant(manageTokenFor("reg_1", partner))?.partnerId).toBe("rgt_partner");
    expect(readManageGrant(manageTokenFor("reg_1", { id: "rgt_owner", role: "owner" }))?.partnerId).toBeNull();
  });
});
