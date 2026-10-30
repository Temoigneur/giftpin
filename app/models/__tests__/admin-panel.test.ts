import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The Giftpin panels in the Shopify admin. Worth pinning: every query is
 * scoped to the asking shop, a malformed id never reaches the database, and a
 * refunded gift stays visible but marked.
 */

vi.mock("../../db.server", () => ({
  default: {
    purchase: { findMany: vi.fn() },
    registry: { findMany: vi.fn() },
    registryItem: { findMany: vi.fn(), count: vi.fn() },
  },
}));

import db from "../../db.server";
import { customerPanel, numericId, orderPanel, productPanel } from "../admin-panel.server";

const registry = {
  id: "reg_1",
  slug: "sam-and-alex",
  title: "Sam & Alex",
  eventType: "wedding",
  eventDate: new Date("2027-06-01T00:00:00Z"),
  status: "active",
  registrants: [{ name: "Sam" }, { name: "Alex" }],
};

beforeEach(() => vi.clearAllMocks());

describe("numericId", () => {
  it("accepts only the matching gid type", () => {
    expect(numericId("gid://shopify/Order/123", "Order")).toBe("123");
    expect(numericId("gid://shopify/Customer/123", "Order")).toBeNull();
    expect(numericId("123", "Order")).toBeNull();
    expect(numericId(null, "Order")).toBeNull();
  });
});

describe("orderPanel", () => {
  it("does not query for a malformed id", async () => {
    expect(await orderPanel("shop_1", "s.myshopify.com", "nope")).toEqual({ registries: [] });
    expect(db.purchase.findMany).not.toHaveBeenCalled();
  });

  it("scopes to the shop and groups gifts under their registry, keeping refunds visible", async () => {
    vi.mocked(db.purchase.findMany).mockResolvedValue([
      { qty: 1, amount: "40.00", currency: "CAD", isContribution: false, shippedToRegistrant: true, voidedAt: null, orderName: "#1001", item: { snapshotTitle: "Pan", registry } },
      { qty: 2, amount: "10.00", currency: "CAD", isContribution: false, shippedToRegistrant: false, voidedAt: new Date(), orderName: "#1001", item: { snapshotTitle: "Mug", registry } },
    ] as never);

    const { registries } = await orderPanel("shop_1", "s.myshopify.com", "gid://shopify/Order/9");

    expect(vi.mocked(db.purchase.findMany).mock.calls[0][0]?.where).toMatchObject({
      orderId: "gid://shopify/Order/9",
      item: { registry: { shopId: "shop_1" } },
    });
    expect(registries).toHaveLength(1);
    expect(registries[0].registry.names).toBe("Sam & Alex");
    expect(registries[0].registry.publicUrl).toBe("https://s.myshopify.com/apps/registry/r/sam-and-alex");
    expect(registries[0].gifts.map((g) => g.voided)).toEqual([false, true]);
  });
});

describe("customerPanel", () => {
  it("looks up by the numeric customer id within the shop", async () => {
    vi.mocked(db.registry.findMany).mockResolvedValue([registry] as never);
    vi.mocked(db.purchase.findMany).mockResolvedValue([] as never);

    const result = await customerPanel("shop_1", "s.myshopify.com", "gid://shopify/Customer/55");

    expect(vi.mocked(db.registry.findMany).mock.calls[0][0]?.where).toMatchObject({ shopId: "shop_1", customerId: "55" });
    expect(vi.mocked(db.purchase.findMany).mock.calls[0][0]?.where).toMatchObject({ buyerCustomerId: "55" });
    expect(result.owned).toHaveLength(1);
  });

  it("does not query for a malformed id", async () => {
    expect(await customerPanel("shop_1", "s.myshopify.com", "x")).toEqual({ owned: [], gifts: [] });
    expect(db.registry.findMany).not.toHaveBeenCalled();
  });
});

describe("productPanel", () => {
  it("lists active registries in this shop with progress capped at the wanted quantity", async () => {
    vi.mocked(db.registryItem.findMany).mockResolvedValue([
      { desiredQty: 2, purchasedQty: 3, snapshotTitle: "Pan", registry },
    ] as never);
    vi.mocked(db.registryItem.count).mockResolvedValue(1);

    const result = await productPanel("shop_1", "s.myshopify.com", "gid://shopify/Product/7");

    expect(vi.mocked(db.registryItem.findMany).mock.calls[0][0]?.where).toMatchObject({
      productGid: "gid://shopify/Product/7",
      registry: { shopId: "shop_1", status: "active" },
    });
    expect(result.registries[0]).toMatchObject({ wanted: 2, bought: 2 });
  });
});
