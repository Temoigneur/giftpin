import { describe, expect, it } from "vitest";
import {
  cleanCouponCode,
  parsePromotionForm,
  promotionDiscountInput,
  type PromotionDraft,
} from "../promotions";
import {
  cartLinesDiscountsGenerateRun,
  readConfig,
  type RunInput,
} from "../../../extensions/registry-discount/src/registry_discount";

const form = (values: Record<string, string>) => ({ get: (name: string) => values[name] ?? null });
const NOW = new Date("2026-11-05T12:00:00Z");

function draft(values: Record<string, string>): PromotionDraft {
  const parsed = parsePromotionForm(form(values), NOW);
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.draft;
}

function cart(lines: Partial<RunInput["cart"]["lines"][number]>[], classes = ["PRODUCT"], config?: unknown): RunInput {
  return {
    cart: {
      lines: lines.map((l, i) => ({
        id: `gid://shopify/CartLine/${i}`,
        quantity: 1,
        registryTag: { value: "abc.def" },
        merchandise: { __typename: "ProductVariant", product: { id: "gid://shopify/Product/1", inAnyCollection: false } },
        ...l,
      })),
    },
    discount: { discountClasses: classes, metafield: { jsonValue: config } },
  };
}

describe("parsePromotionForm", () => {
  it("builds a sale with defaults", () => {
    const d = draft({ amount: "15", appliesTo: "all" });
    expect(d.kind).toBe("sale");
    expect(d.config).toMatchObject({ valueType: "percentage", amount: 15, allProducts: true, minQuantity: 1 });
    expect(d.startsAt).toEqual(NOW);
    expect(d.endsAt).toBeNull();
  });
  it("rejects out-of-range, empty selections and bad dates", () => {
    expect(parsePromotionForm(form({ amount: "95", appliesTo: "all" })).ok).toBe(false);
    expect(parsePromotionForm(form({ amount: "10", appliesTo: "selected" })).ok).toBe(false);
    expect(parsePromotionForm(form({ amount: "10", appliesTo: "all", startsAt: "2026-12-05", endsAt: "2026-12-01" })).ok).toBe(false);
    expect(parsePromotionForm(form({ kind: "coupon", amount: "10", appliesTo: "all", code: "a" })).ok).toBe(false);
  });
  it("ignores ids that aren't products or collections", () => {
    const parsed = parsePromotionForm(form({ amount: "10", appliesTo: "selected", productIds: '["gid://shopify/Order/1"]' }));
    expect(parsed.ok).toBe(false);
  });
  it("cleans coupon codes", () => {
    expect(cleanCouponCode(" registry 15! ")).toBe("REGISTRY15");
  });
  it("builds the Shopify input", () => {
    const sale = promotionDiscountInput(draft({ amount: "15", appliesTo: "all" }));
    expect(sale.code).toBeUndefined();
    expect(sale.discountClasses).toEqual(["PRODUCT"]);
    const coupon = promotionDiscountInput(draft({ kind: "coupon", code: "reg15", amount: "15", appliesTo: "all", usageLimit: "50" } as never));
    expect(coupon).toMatchObject({ code: "REG15", usageLimit: 50, combinesWith: { productDiscounts: false } });
  });
});

describe("registry discount function (drift guard against the app's own config)", () => {
  const config = draft({ amount: "20", appliesTo: "selected", productIds: '["gid://shopify/Product/1"]' }).config;

  it("discounts only lines carrying the registry tag", () => {
    const out = cartLinesDiscountsGenerateRun(cart([{}, { registryTag: null }], ["PRODUCT"], config));
    const targets = out.operations[0].productDiscountsAdd.candidates[0].targets;
    expect(targets).toEqual([{ cartLine: { id: "gid://shopify/CartLine/0" } }]);
  });
  it("does nothing without a well-formed tag", () => {
    expect(cartLinesDiscountsGenerateRun(cart([{ registryTag: { value: "nope" } }], ["PRODUCT"], config)).operations).toEqual([]);
  });
  it("skips products outside the selection and gift cards", () => {
    const other = { __typename: "ProductVariant", product: { id: "gid://shopify/Product/9", inAnyCollection: false } };
    expect(cartLinesDiscountsGenerateRun(cart([{ merchandise: other }], ["PRODUCT"], config)).operations).toEqual([]);
    const all = draft({ amount: "20", appliesTo: "all" }).config;
    const card = { __typename: "ProductVariant", product: { id: "gid://shopify/Product/1", isGiftCard: true } };
    expect(cartLinesDiscountsGenerateRun(cart([{ merchandise: card }], ["PRODUCT"], all)).operations).toEqual([]);
  });
  it("matches by collection", () => {
    const byCollection = draft({ amount: "20", appliesTo: "selected", collectionIds: '["gid://shopify/Collection/5"]' }).config;
    const line = { merchandise: { __typename: "ProductVariant", product: { id: "gid://shopify/Product/2", inAnyCollection: true } } };
    expect(cartLinesDiscountsGenerateRun(cart([line], ["PRODUCT"], byCollection)).operations).toHaveLength(1);
  });
  it("needs enough registry gifts for a tier", () => {
    const tier = draft({ amount: "20", appliesTo: "all", minQuantity: "3" }).config;
    expect(cartLinesDiscountsGenerateRun(cart([{ quantity: 2 }], ["PRODUCT"], tier)).operations).toEqual([]);
    expect(cartLinesDiscountsGenerateRun(cart([{ quantity: 2 }, {}], ["PRODUCT"], tier)).operations).toHaveLength(1);
  });
  it("emits fixed amounts per item", () => {
    const fixed = draft({ valueType: "fixed", amount: "5", appliesTo: "all" }).config;
    const value = cartLinesDiscountsGenerateRun(cart([{}], ["PRODUCT"], fixed)).operations[0].productDiscountsAdd.candidates[0].value;
    expect(value).toEqual({ fixedAmount: { amount: 5, appliesToEachItem: true } });
  });
  it("applies nothing for a missing, broken or empty-selection config, or the wrong class", () => {
    expect(cartLinesDiscountsGenerateRun(cart([{}], ["PRODUCT"], undefined)).operations).toEqual([]);
    expect(readConfig({ v: 1, valueType: "percentage", amount: 10, allProducts: false, productIds: [], collectionIds: [] })).toBeNull();
    expect(cartLinesDiscountsGenerateRun(cart([{}], ["ORDER"], config)).operations).toEqual([]);
  });
});
