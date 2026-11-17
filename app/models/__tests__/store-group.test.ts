import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Linked stores (store-group.server.ts): the one-time link code, its rules,
 * and the helpers that decide which store sells an item.
 */

vi.mock("../../db.server", () => {
  const tx = {
    storeLinkCode: { updateMany: vi.fn(async () => ({ count: 1 })) },
    storeGroup: { create: vi.fn(async () => ({ id: "grp_new" })) },
    storeGroupMember: { create: vi.fn() },
  };
  return {
    default: {
      shop: { findUnique: vi.fn() },
      auditLog: { count: vi.fn(async () => 0) },
      storeLinkCode: { findUnique: vi.fn(), updateMany: vi.fn(), create: vi.fn() },
      storeGroupMember: { findUnique: vi.fn(), findMany: vi.fn(async () => []), count: vi.fn(async () => 1) },
      $transaction: vi.fn(async (arg: unknown) => (typeof arg === "function" ? (arg as (t: typeof tx) => unknown)(tx) : arg)),
      __tx: tx,
    },
  };
});
vi.mock("../../lib/audit.server", () => ({ audit: vi.fn() }));

import db from "../../db.server";
import {
  canHoldLinkedProducts,
  createLinkCode,
  generateLinkCode,
  itemShopId,
  normalizeLinkCode,
  redeemLinkCode,
  sameGroup,
  sourceShopIdFor,
} from "../store-group.server";

const tx = (db as unknown as { __tx: { storeGroup: { create: ReturnType<typeof vi.fn> }; storeGroupMember: { create: ReturnType<typeof vi.fn> } } }).__tx;
const now = new Date("2026-11-17T12:00:00Z");

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(db.auditLog.count).mockResolvedValue(0);
  vi.mocked(db.storeGroupMember.findUnique).mockReset();
});

describe("link codes", () => {
  it("are GP-XXXX-XXXX-XXXX in an unambiguous alphabet", () => {
    for (let i = 0; i < 50; i++) expect(generateLinkCode()).toMatch(/^GP-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/);
  });

  it("forgive case, spaces, dashes and look-alike letters", () => {
    expect(normalizeLinkCode(" gp 7kq4-m2xd-01ab ")).toBe("GP-7KQ4-M2XD-01AB");
    expect(normalizeLinkCode("GP-7KQ4-M2XD-OLAB")).toBe("GP-7KQ4-M2XD-01AB");
    expect(normalizeLinkCode("GP-7KQ4")).toBeNull();
  });

  it("can only be made on Pro", async () => {
    vi.mocked(db.shop.findUnique).mockResolvedValue({ id: "a", domain: "a.myshopify.com", plan: "free" } as never);
    expect(await createLinkCode("a", now)).toEqual({ ok: false, error: "not_pro" });
  });

  it("expire after 24 hours and retire the store's earlier codes", async () => {
    vi.mocked(db.shop.findUnique).mockResolvedValue({ id: "a", domain: "a.myshopify.com", plan: "pro" } as never);
    const res = await createLinkCode("a", now);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.expiresAt.getTime() - now.getTime()).toBe(24 * 3600 * 1000);
    expect(db.storeLinkCode.updateMany).toHaveBeenCalledWith({ where: { shopId: "a", usedAt: null }, data: { expiresAt: now } });
  });
});

describe("redeemLinkCode", () => {
  const code = "GP-7KQ4-M2XD-01AB";
  function shops(b: { devStore?: boolean } = {}) {
    vi.mocked(db.shop.findUnique).mockImplementation((async ({ where }: { where: { id: string } }) =>
      where.id === "b"
        ? { id: "b", domain: "b.myshopify.com", devStore: b.devStore ?? false }
        : { id: "a", domain: "a.myshopify.com", name: "Store A", currency: "USD", plan: "pro", devStore: false, uninstalledAt: null }) as never);
  }

  it("rejects an expired code", async () => {
    shops();
    vi.mocked(db.storeLinkCode.findUnique).mockResolvedValue({ id: "c", shopId: "a", usedAt: null, expiresAt: new Date(now.getTime() - 1) } as never);
    expect(await redeemLinkCode("b", code, now)).toEqual({ ok: false, error: "bad_code" });
  });

  it("rejects a store's own code", async () => {
    shops();
    vi.mocked(db.storeLinkCode.findUnique).mockResolvedValue({ id: "c", shopId: "b", usedAt: null, expiresAt: new Date(now.getTime() + 1000) } as never);
    expect(await redeemLinkCode("b", code, now)).toEqual({ ok: false, error: "own_code" });
  });

  it("never mixes a development store with a live one", async () => {
    shops({ devStore: true });
    vi.mocked(db.storeLinkCode.findUnique).mockResolvedValue({ id: "c", shopId: "a", usedAt: null, expiresAt: new Date(now.getTime() + 1000) } as never);
    expect(await redeemLinkCode("b", code, now)).toEqual({ ok: false, error: "dev_mismatch" });
  });

  it("stops checking codes after five wrong tries in an hour", async () => {
    shops();
    vi.mocked(db.auditLog.count).mockResolvedValue(5);
    expect(await redeemLinkCode("b", code, now)).toEqual({ ok: false, error: "too_many_tries" });
    expect(db.storeLinkCode.findUnique).not.toHaveBeenCalled();
  });

  it("puts both stores in a new group", async () => {
    shops();
    vi.mocked(db.storeLinkCode.findUnique).mockResolvedValue({ id: "c", shopId: "a", usedAt: null, expiresAt: new Date(now.getTime() + 1000) } as never);
    vi.mocked(db.storeGroupMember.findUnique)
      .mockResolvedValueOnce(null) // b's membership
      .mockResolvedValueOnce(null) // a's membership
      .mockResolvedValueOnce({ groupId: "grp_new" } as never); // after linking
    const res = await redeemLinkCode("b", code, now);
    expect(res).toMatchObject({ ok: true, linkedWith: { id: "a", name: "Store A" } });
    expect(tx.storeGroup.create).toHaveBeenCalledWith({ data: { members: { create: { shopId: "a" } } } });
    expect(tx.storeGroupMember.create).toHaveBeenCalledWith({ data: { groupId: "grp_new", shopId: "b" } });
  });

  it("won't silently merge two groups", async () => {
    shops();
    vi.mocked(db.storeLinkCode.findUnique).mockResolvedValue({ id: "c", shopId: "a", usedAt: null, expiresAt: new Date(now.getTime() + 1000) } as never);
    vi.mocked(db.storeGroupMember.findUnique)
      .mockResolvedValueOnce({ groupId: "g1" } as never)
      .mockResolvedValueOnce({ groupId: "g2" } as never);
    expect(await redeemLinkCode("b", code, now)).toEqual({ ok: false, error: "other_in_group" });
  });
});

describe("who may hold other stores' products", () => {
  it("is a registry whose own store, or any store linked to it, is on Pro", () => {
    expect(canHoldLinkedProducts({ plan: "pro" })).toBe(true);
    expect(canHoldLinkedProducts({ plan: "free" })).toBe(false);
    expect(canHoldLinkedProducts({ plan: "free" }, [{ plan: "free" }, { plan: "pro" }])).toBe(true);
    expect(canHoldLinkedProducts({ plan: "free" }, [{ plan: "free" }])).toBe(false);
  });
});

describe("which store sells an item", () => {
  it("is the source store when set, else the registry's", () => {
    expect(itemShopId({ sourceShopId: "b" }, "a")).toBe("b");
    expect(itemShopId({ sourceShopId: null }, "a")).toBe("a");
  });

  it("stores null for the registry's own store, so old rows look the same", () => {
    expect(sourceShopIdFor("a", "a")).toBeNull();
    expect(sourceShopIdFor("b", "a")).toBe("b");
  });

  it("treats a store as in its own group, and two stores only when both are installed members of one group", async () => {
    expect(await sameGroup("a", "a")).toBe(true);
    vi.mocked(db.storeGroupMember.findMany).mockResolvedValue([{ shopId: "a", groupId: "g" }, { shopId: "b", groupId: "g" }] as never);
    expect(await sameGroup("a", "b")).toBe(true);
    vi.mocked(db.storeGroupMember.findMany).mockResolvedValue([{ shopId: "a", groupId: "g" }] as never);
    expect(await sameGroup("a", "b")).toBe(false);
  });
});
