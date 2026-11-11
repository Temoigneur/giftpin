import { describe, expect, it } from "vitest";
import {
  bannerLines,
  dealForProduct,
  dealPrice,
  dealsFromSummaries,
  itemDealText,
  promotionPerkLines,
  type Deal,
} from "../promotion-display";
import { withLocale } from "../../lib/i18n.server";
import type { PromotionConfig, PromotionSummary } from "../promotions";

const config = (over: Partial<PromotionConfig> = {}): PromotionConfig => ({
  v: 1, valueType: "percentage", amount: 15, allProducts: false,
  productIds: ["gid://shopify/Product/1"], collectionIds: [], minQuantity: 1, message: "Registry price", ...over,
});
const sale = (over: Partial<PromotionConfig> = {}): Deal => ({ kind: "sale", code: null, config: config(over) });
const coupon = (over: Partial<PromotionConfig> = {}): Deal => ({ kind: "coupon", code: "REG15", config: config(over) });
const summary = (over: Partial<PromotionSummary>): PromotionSummary => ({
  id: "x", kind: "sale", title: "t", code: null, status: "ACTIVE", startsAt: "", endsAt: null, usageCount: 0, config: config(), ...over,
});

describe("promotion display", () => {
  it("advertises only running promotions", () => {
    const deals = dealsFromSummaries([
      summary({}), summary({ status: "SCHEDULED" }), summary({ status: "EXPIRED" }),
      summary({ config: null }), summary({ kind: "coupon", code: null }),
    ]);
    expect(deals).toHaveLength(1);
  });
  it("matches by product, collection or all products", () => {
    expect(dealForProduct([sale()], "gid://shopify/Product/1")).not.toBeNull();
    expect(dealForProduct([sale()], "gid://shopify/Product/2")).toBeNull();
    expect(dealForProduct([sale()], null)).toBeNull();
    const byCollection = sale({ productIds: [], collectionIds: ["gid://shopify/Collection/5"] });
    expect(dealForProduct([byCollection], "gid://shopify/Product/2", ["gid://shopify/Collection/5"])).not.toBeNull();
    expect(dealForProduct([byCollection], "gid://shopify/Product/2", [])).toBeNull();
    expect(dealForProduct([sale({ allProducts: true, productIds: [] })], "gid://shopify/Product/9")).not.toBeNull();
  });
  it("prefers a sale over a coupon, then the bigger discount", () => {
    expect(dealForProduct([coupon({ amount: 40 }), sale({ amount: 10 })], "gid://shopify/Product/1")?.kind).toBe("sale");
    expect(dealForProduct([sale({ amount: 10 }), sale({ amount: 25 })], "gid://shopify/Product/1")?.config.amount).toBe(25);
  });
  it("computes the registry price", () => {
    expect(dealPrice(sale(), 40)).toBe(34);
    expect(dealPrice(sale({ valueType: "fixed", amount: 50 }), 40)).toBe(0);
    expect(dealPrice(sale({ minQuantity: 3 }), 40)).toBeNull();
    expect(dealPrice(sale(), 0)).toBeNull();
  });
  it("words the item, banner and registrant lines", () => {
    expect(itemDealText(sale(), 40, "CAD")).toContain("Registry price");
    expect(itemDealText(coupon(), 40, "CAD")).toContain("with code REG15");
    expect(itemDealText(sale({ minQuantity: 3 }), 40, "CAD")).toBe("15% off on 3+ registry gifts");
    expect(bannerLines([coupon()], "CAD")[0]).toContain("use code REG15 at checkout");
    expect(bannerLines([15, 20, 25, 30].map((amount) => sale({ amount })), "CAD")).toHaveLength(3);
    expect(promotionPerkLines([sale({ allProducts: true, productIds: [] })], "CAD")[0]).toBe(
      "15% off for guests who buy from your registry",
    );
  });
});

describe("duplicate promotions", () => {
  it("says the same line once", () => {
    const a = sale({ productIds: ["gid://shopify/Product/1"] });
    const b = sale({ productIds: ["gid://shopify/Product/2"] });
    expect(bannerLines([a, b], "CAD")).toHaveLength(1);
    expect(promotionPerkLines([a, b], "CAD")).toHaveLength(1);
  });

  it("shows the deal in the shopper's currency and language", () => {
    const ja = withLocale("ja", () => itemDealText(sale({ amount: 10 }), 2800, "JPY"));
    expect(ja).toContain("ギフトリスト価格");
    expect(ja).toMatch(/2,520/);
    expect(ja).not.toContain("$");
    expect(ja).not.toContain("2520.00");
  });
});
