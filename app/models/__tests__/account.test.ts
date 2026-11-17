import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * "My registries": the email is the account. The account token opens every
 * registry one email holds at one store, so it must not verify for another
 * store, another purpose, or once tampered with, and a partner must get their
 * own revocable link, never the owner's.
 */

vi.mock("../../db.server", () => ({
  default: {
    registry: { findMany: vi.fn(), findUnique: vi.fn() },
    registrant: { findFirst: vi.fn() },
  },
}));

import db from "../../db.server";
import {
  mintAccountToken,
  readAccountToken,
  listAccountRegistries,
  readManageGrant,
  mintManageToken,
} from "../registry.server";
import { signToken } from "../../lib/crypto.server";

const findMany = vi.mocked(db.registry.findMany);

beforeEach(() => findMany.mockReset());

describe("account token", () => {
  it("round-trips for the same store", () => {
    expect(readAccountToken(mintAccountToken("shop_1", "hash_a"), "shop_1")).toBe("hash_a");
  });

  it("is refused at another store", () => {
    expect(readAccountToken(mintAccountToken("shop_1", "hash_a"), "shop_2")).toBeNull();
  });

  it("is refused when tampered, missing, or minted for another purpose", () => {
    const real = mintAccountToken("shop_1", "hash_a");
    const tampered = real.slice(0, -2) + (real.endsWith("AA") ? "BB" : "AA");
    expect(readAccountToken(tampered, "shop_1")).toBeNull();
    expect(readAccountToken(null, "shop_1")).toBeNull();
    expect(readAccountToken(signToken({ p: "manage", s: "shop_1", h: "hash_a" }, 60), "shop_1")).toBeNull();
  });

  it("is refused once expired", () => {
    expect(readAccountToken(signToken({ p: "account", s: "shop_1", h: "hash_a", e: 1 }), "shop_1")).toBeNull();
  });

  it("is not a manage link, and a manage link is not an account link", () => {
    expect(readManageGrant(mintAccountToken("shop_1", "hash_a"))).toBeNull();
    expect(readAccountToken(mintManageToken("reg_1"), "shop_1")).toBeNull();
  });
});

describe("listAccountRegistries", () => {
  it("returns nothing and skips the query with no email and no store sign-in", async () => {
    expect(await listAccountRegistries("shop_1", null, null)).toEqual([]);
    expect(findMany).not.toHaveBeenCalled();
  });

  it("scopes to the shop and active registries, matching the email on any role", async () => {
    findMany.mockResolvedValue([] as never);
    await listAccountRegistries("shop_1", "hash_a", null);
    const where = findMany.mock.calls[0][0]!.where!;
    expect(where.status).toBe("active");
    expect(where.OR).toEqual([{ shopId: { in: ["shop_1"] }, registrants: { some: { emailHash: "hash_a" } } }]);
  });

  it("matches the email across linked stores, but a store sign-in only on this store", async () => {
    findMany.mockResolvedValue([] as never);
    await listAccountRegistries("shop_1", "hash_a", "42", ["shop_1", "shop_2"]);
    expect(findMany.mock.calls[0][0]!.where!.OR).toEqual([
      { shopId: { in: ["shop_1", "shop_2"] }, registrants: { some: { emailHash: "hash_a" } } },
      { shopId: "shop_1", customerId: "42" },
    ]);
  });

  it("gives an owner an owner link and a partner their own revocable link", async () => {
    findMany.mockResolvedValue([
      { id: "reg_own", title: "Ours", eventType: "wedding", eventDate: null, customerId: null, registrants: [{ id: "rg_1", role: "owner" }] },
      { id: "reg_co", title: "Theirs", eventType: "baby", eventDate: null, customerId: null, registrants: [{ id: "rg_2", role: "co" }] },
    ] as never);
    const [own, co] = await listAccountRegistries("shop_1", "hash_a", null);
    expect(own.partner).toBe(false);
    expect(readManageGrant(own.token)).toEqual({ registryId: "reg_own", partnerId: null });
    expect(co.partner).toBe(true);
    expect(readManageGrant(co.token)).toEqual({ registryId: "reg_co", partnerId: "rg_2" });
  });

  it("includes the signed-in store customer's own registries", async () => {
    findMany.mockResolvedValue([
      { id: "reg_c", title: "Mine", eventType: "other", eventDate: null, customerId: "42", registrants: [] },
    ] as never);
    const rows = await listAccountRegistries("shop_1", "hash_a", "42");
    expect(findMany.mock.calls[0][0]!.where!.OR).toContainEqual({ shopId: "shop_1", customerId: "42" });
    expect(readManageGrant(rows[0].token)).toEqual({ registryId: "reg_c", partnerId: null });
  });
});
