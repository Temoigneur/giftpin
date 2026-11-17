import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../db.server", () => ({
  default: {
    dailyStat: { groupBy: vi.fn() },
    purchase: { findMany: vi.fn() },
    registry: { groupBy: vi.fn() },
  },
}));
vi.mock("../store-group.server", async (orig) => ({
  ...(await orig<typeof import("../store-group.server")>()),
  groupShops: vi.fn(),
}));

import db from "../../db.server";
import { groupShops } from "../store-group.server";
import { groupPerformance, proCostFor, rate } from "../group-analytics.server";

beforeEach(() => vi.clearAllMocks());

describe("groupPerformance", () => {
  it("is null for a store that isn't linked", async () => {
    vi.mocked(groupShops).mockResolvedValue([]);
    expect(await groupPerformance("a")).toBeNull();
  });

  it("reports each store in its own currency and never converts", async () => {
    vi.mocked(groupShops).mockResolvedValue([
      { id: "a", domain: "a.myshopify.com", name: "Store A", currency: "USD", plan: "pro" },
      { id: "b", domain: "b.myshopify.com", name: null, currency: "CAD", plan: "free" },
    ]);
    vi.mocked(db.dailyStat.groupBy).mockResolvedValue([
      { shopId: "a", metric: "registry_view", _sum: { count: 200, value: 0 } },
      { shopId: "a", metric: "cart_add", _sum: { count: 30, value: 0 } },
      { shopId: "a", metric: "store_order", _sum: { count: 10, value: 1000 } },
      { shopId: "b", metric: "linked_arrival", _sum: { count: 12, value: 0 } },
    ] as never);
    vi.mocked(db.purchase.findMany)
      .mockResolvedValueOnce([{ amount: "100.00", qty: 2, isContribution: false }] as never)
      .mockResolvedValueOnce([{ amount: "40.00", qty: 1, isContribution: false }] as never);
    vi.mocked(db.registry.groupBy).mockResolvedValue([{ shopId: "a", _count: { _all: 3 } }] as never);

    const g = (await groupPerformance("a", 30))!;
    expect(g.stores.map((s) => [s.name, s.currency, s.registrySales, s.current])).toEqual([
      ["Store A", "USD", 100, true],
      ["b", "CAD", 40, false],
    ]);
    expect(g.stores[0].registrySharePercent).toBe(10);
    expect(g.stores[0].cartAddRate).toBe(15);
    expect(g.stores[1].linkedArrivals).toBe(12);
    expect(g.salesByCurrency).toEqual([
      { currency: "USD", amount: 100 },
      { currency: "CAD", amount: 40 },
    ]);
    expect(g.totals.giftsSold).toBe(3);
    // One Pro store for 30 days, USD sales only.
    expect(g.proCostUsd).toBe(proCostFor(30, 1));
    expect(g.proPaidForItselfTimes).toBe(Math.round((100 / proCostFor(30, 1)) * 10) / 10);
  });
});

describe("helpers", () => {
  it("prices Pro pro rata per Pro store", () => {
    expect(proCostFor(365, 1)).toBeCloseTo(119.88, 2);
    expect(proCostFor(30, 2)).toBeCloseTo(19.71, 2);
  });
  it("gives no rate without a base", () => {
    expect(rate(5, 0)).toBeNull();
    expect(rate(1, 3)).toBe(33.3);
  });
});
