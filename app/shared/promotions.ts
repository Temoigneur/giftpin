/**
 * Registry promotions (Pro): sales and coupons that only apply to gifts
 * bought from a registry. Pure, so the admin page and the server share it
 * (CLAUDE.md hard rule 2).
 *
 * How it works: every promotion is a Shopify app discount backed by the
 * `registry-discount` function (extensions/registry-discount). The function
 * only discounts cart lines carrying the `_rg` registry tag. A promotion's
 * settings live in the discount's own `$app:function-configuration`
 * metafield, so Shopify holds everything and Giftpin only keeps the list of
 * discount ids (ShopSettings.promotionIds). No schema change.
 *
 *  - "sale": an automatic discount. Guests get it without doing anything.
 *  - "coupon": a code discount. Guests type a code the store shares.
 */

import type { PromotionConfig } from "../../extensions/registry-discount/src/registry_discount";

export type { PromotionConfig };

export const PROMOTION_FUNCTION_HANDLE = "registry-discount";
export const PROMOTION_METAFIELD = { namespace: "$app", key: "function-configuration" } as const;

export const MAX_PROMOTIONS = 25;
/** Shopify rejects a list input-query variable over 100 elements. */
export const MAX_PROMOTION_COLLECTIONS = 100;
export const MAX_PROMOTION_PRODUCTS = 100;
export const PROMOTION_PERCENT_RANGE = { min: 1, max: 90 } as const;
export const PROMOTION_FIXED_MAX = 10000;
export const PROMOTION_MIN_QUANTITY_MAX = 50;
export const PROMOTION_MESSAGE_MAX = 60;
export const PROMOTION_TITLE_MAX = 80;

export type PromotionKind = "sale" | "coupon";

export interface PromotionDraft {
  kind: PromotionKind;
  title: string;
  /** Coupons only. */
  code: string;
  /** Coupons only. 0 = unlimited. */
  usageLimit: number;
  config: PromotionConfig;
  startsAt: Date;
  endsAt: Date | null;
  /** Lets it stack with the store's other product and order discounts. */
  combines: boolean;
}

export type ParsedPromotion = { ok: true; draft: PromotionDraft } | { ok: false; error: string };

function ids(value: unknown, prefix: string, max: number): string[] {
  let list: unknown = [];
  try {
    list = JSON.parse(String(value ?? "[]"));
  } catch {
    return [];
  }
  if (!Array.isArray(list)) return [];
  return [...new Set(list.filter((id): id is string => typeof id === "string" && id.startsWith(prefix)))].slice(0, max);
}

/** "2026-12-01" (the admin date field) at the start of that day, UTC. */
function day(value: unknown): Date | null {
  const text = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const date = new Date(`${text}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function cleanCouponCode(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9_-]/g, "")
    .slice(0, 40);
}

/**
 * Reads the admin form. Every limit is enforced here, not only in the UI,
 * because these numbers come straight off the merchant's margin.
 */
export function parsePromotionForm(form: { get(name: string): unknown }, now = new Date()): ParsedPromotion {
  const kind: PromotionKind = form.get("kind") === "coupon" ? "coupon" : "sale";
  const valueType = form.get("valueType") === "fixed" ? "fixed" : "percentage";
  const amount = Math.round(Number(form.get("amount")) * 100) / 100;
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Enter how much off." };
  if (valueType === "percentage" && (amount < PROMOTION_PERCENT_RANGE.min || amount > PROMOTION_PERCENT_RANGE.max)) {
    return { ok: false, error: `Percent off must be between ${PROMOTION_PERCENT_RANGE.min} and ${PROMOTION_PERCENT_RANGE.max}.` };
  }
  if (valueType === "fixed" && amount > PROMOTION_FIXED_MAX) {
    return { ok: false, error: `Amount off can be at most ${PROMOTION_FIXED_MAX}.` };
  }

  const allProducts = form.get("appliesTo") === "all";
  const productIds = allProducts ? [] : ids(form.get("productIds"), "gid://shopify/Product/", MAX_PROMOTION_PRODUCTS);
  const collectionIds = allProducts
    ? []
    : ids(form.get("collectionIds"), "gid://shopify/Collection/", MAX_PROMOTION_COLLECTIONS);
  if (!allProducts && productIds.length === 0 && collectionIds.length === 0) {
    return { ok: false, error: "Pick at least one product or collection, or choose All products." };
  }

  const minQuantity = Math.min(
    PROMOTION_MIN_QUANTITY_MAX,
    Math.max(1, Math.floor(Number(form.get("minQuantity")) || 1)),
  );

  const code = kind === "coupon" ? cleanCouponCode(form.get("code")) : "";
  if (kind === "coupon" && code.length < 3) return { ok: false, error: "Coupon codes need at least 3 letters or numbers." };
  const usageLimit = kind === "coupon" ? Math.max(0, Math.floor(Number(form.get("usageLimit")) || 0)) : 0;

  const startsAt = day(form.get("startsAt")) ?? now;
  const endsAt = day(form.get("endsAt"));
  if (endsAt && endsAt.getTime() <= startsAt.getTime()) {
    return { ok: false, error: "The end date has to be after the start date." };
  }

  const defaultTitle = kind === "coupon" ? `Registry coupon ${code}` : "Registry sale";
  const title = String(form.get("title") ?? "").trim().slice(0, PROMOTION_TITLE_MAX) || defaultTitle;
  // Blank means "say what the deal is", e.g. "Registry price: 20% off", so
  // the guest sees the amount in the cart and at checkout, not just a name.
  const deal = valueType === "percentage" ? `${amount}% off` : `$${amount} off each`;
  const message =
    String(form.get("message") ?? "").trim().slice(0, PROMOTION_MESSAGE_MAX) ||
    `${kind === "coupon" ? "Registry coupon" : "Registry price"}: ${deal}`;

  return {
    ok: true,
    draft: {
      kind,
      title,
      code,
      usageLimit,
      startsAt,
      endsAt,
      combines: form.get("combines") === "on",
      config: { v: 1, valueType, amount, allProducts, productIds, collectionIds, minQuantity, message },
    },
  };
}

/** The Shopify discount input. Same shape for automatic and code discounts, plus the code fields. */
export function promotionDiscountInput(draft: PromotionDraft): Record<string, unknown> {
  const input: Record<string, unknown> = {
    title: `Giftpin: ${draft.title}`.slice(0, 255),
    functionHandle: PROMOTION_FUNCTION_HANDLE,
    discountClasses: ["PRODUCT"],
    startsAt: draft.startsAt.toISOString(),
    endsAt: draft.endsAt ? draft.endsAt.toISOString() : null,
    combinesWith: {
      productDiscounts: draft.combines,
      orderDiscounts: draft.combines,
      shippingDiscounts: true,
    },
    metafields: [
      {
        namespace: PROMOTION_METAFIELD.namespace,
        key: PROMOTION_METAFIELD.key,
        type: "json",
        value: JSON.stringify(draft.config),
      },
    ],
  };
  if (draft.kind === "coupon") {
    input.code = draft.code;
    input.appliesOncePerCustomer = false;
    if (draft.usageLimit > 0) input.usageLimit = draft.usageLimit;
  }
  return input;
}

/** "15% off" / "$10.00 off each" for the list. */
export function describeValue(config: PromotionConfig, currency: string): string {
  if (config.valueType === "percentage") return `${config.amount}% off`;
  const amount = new Intl.NumberFormat("en-CA", { style: "currency", currency }).format(config.amount);
  return `${amount} off each`;
}

export function describeScope(config: PromotionConfig): string {
  if (config.allProducts) return "All products";
  const parts: string[] = [];
  if (config.productIds.length) parts.push(`${config.productIds.length} product${config.productIds.length === 1 ? "" : "s"}`);
  if (config.collectionIds.length) {
    parts.push(`${config.collectionIds.length} collection${config.collectionIds.length === 1 ? "" : "s"}`);
  }
  return parts.join(", ");
}

export interface PromotionSummary {
  id: string;
  kind: PromotionKind;
  title: string;
  code: string | null;
  status: string;
  startsAt: string;
  endsAt: string | null;
  usageCount: number;
  config: PromotionConfig | null;
}
