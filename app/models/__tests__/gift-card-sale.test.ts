import { describe, it, expect, vi, beforeEach } from "vitest";

/** Recording and voiding gift cards sold through the giftpin.app listing. */

vi.mock("../../db.server", () => ({
  default: {
    shop: { findUnique: vi.fn(), findMany: vi.fn() },
    giftCardSale: { create: vi.fn(), updateMany: vi.fn(), aggregate: vi.fn() },
  },
}));

import db from "../../db.server";
import { signGiftCardAttribution, GIFT_CARD_PROPERTY } from "../../lib/attribution";
import { listedGiftCardStores, recordGiftCardSales, voidGiftCardSales } from "../gift-card-sale.server";

const SHOP = "maple.myshopify.com";
const shopRow = { id: "shop_1", domain: SHOP, currency: "CAD", settings: {} };

const order = {
  id: 77,
  admin_graphql_api_id: "gid://shopify/Order/77",
  name: "#1077",
  currency: "CAD",
  line_items: [
    {
      id: 5,
      quantity: 1,
      price: "50.00",
      gift_card: true,
      properties: [{ name: GIFT_CARD_PROPERTY, value: signGiftCardAttribution(SHOP, "directory") }],
    },
    { id: 6, quantity: 1, price: "20.00", gift_card: false, properties: [] },
  ],
};

beforeEach(() => {
  vi.mocked(db.shop.findUnique).mockReset().mockResolvedValue(shopRow as never);
  vi.mocked(db.giftCardSale.create).mockReset().mockResolvedValue({} as never);
  vi.mocked(db.giftCardSale.updateMany).mockReset().mockResolvedValue({ count: 1 } as never);
});

describe("recordGiftCardSales", () => {
  it("records only the tagged gift card line", async () => {
    expect(await recordGiftCardSales(SHOP, order)).toBe(1);
    expect(db.giftCardSale.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        shopId: "shop_1",
        orderId: "gid://shopify/Order/77",
        lineItemId: "5",
        amount: "50.00",
        currency: "CAD",
        source: "directory",
      }),
    });
  });

  it("treats a redelivered webhook as already recorded", async () => {
    vi.mocked(db.giftCardSale.create).mockRejectedValue(Object.assign(new Error("dup"), { code: "P2002" }));
    expect(await recordGiftCardSales(SHOP, order)).toBe(0);
  });

  it("does nothing for an unknown shop", async () => {
    vi.mocked(db.shop.findUnique).mockResolvedValue(null as never);
    expect(await recordGiftCardSales(SHOP, order)).toBe(0);
    expect(db.giftCardSale.create).not.toHaveBeenCalled();
  });
});

describe("voidGiftCardSales", () => {
  it("voids only this shop's unvoided lines", async () => {
    await voidGiftCardSales(SHOP, "gid://shopify/Order/77", ["5"]);
    expect(db.giftCardSale.updateMany).toHaveBeenCalledWith({
      where: { orderId: "gid://shopify/Order/77", voidedAt: null, shop: { domain: SHOP }, lineItemId: { in: ["5"] } },
      data: { voidedAt: expect.any(Date) },
    });
  });

  it("voids the whole order on a cancellation", async () => {
    await voidGiftCardSales(SHOP, "gid://shopify/Order/77", undefined);
    const where = vi.mocked(db.giftCardSale.updateMany).mock.calls[0][0]!.where as Record<string, unknown>;
    expect(where).not.toHaveProperty("lineItemId");
  });
});

describe("listedGiftCardStores", () => {
  it("lists only shops whose listing is live", async () => {
    const product = { productGid: "p", title: "Gift card", variants: [{ id: "1", amount: 50 }] };
    vi.mocked(db.shop.findMany).mockResolvedValue([
      { domain: "b.myshopify.com", name: "Birch", currency: "CAD", country: "CA", plan: "pro", uninstalledAt: null, settings: { contributionProduct: product, giftCardListing: { enabled: true, blurb: "Wood" } } },
      { domain: "a.myshopify.com", name: "Alder", currency: "USD", plan: "pro", uninstalledAt: null, settings: { contributionProduct: product, giftCardListing: { enabled: false, blurb: "" } } },
      { domain: "c.myshopify.com", name: null, currency: "USD", plan: "pro", uninstalledAt: null, settings: { giftCardListing: { enabled: true, blurb: "" } } },
    ] as never);
    const stores = await listedGiftCardStores();
    expect(stores).toEqual([
      { domain: "b.myshopify.com", name: "Birch", country: "CA", blurb: "Wood", currency: "CAD", amounts: [{ id: "1", amount: 50 }] },
    ]);
  });
});
