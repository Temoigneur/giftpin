/**
 * How registry promotions are shown to people (see app/shared/promotions.ts
 * for what a promotion is): a banner on the guest registry page, a price tag
 * on each discounted item, and a perk line for the registrant. Pure, so the
 * server and the tests share it.
 *
 * These are advertising only. The discount itself is applied by the Shopify
 * function at checkout, from the same settings, so the page can never grant
 * a price the function wouldn't.
 */

import type { PromotionConfig, PromotionSummary } from "./promotions";

export interface Deal {
  kind: "sale" | "coupon";
  /** Coupons only. */
  code: string | null;
  config: PromotionConfig;
}

/** Live promotions only: running now, with settings we can read. */
export function dealsFromSummaries(summaries: PromotionSummary[]): Deal[] {
  return summaries
    .filter((p) => p.status === "ACTIVE" && p.config && (p.kind === "sale" || p.code))
    .map((p) => ({ kind: p.kind, code: p.code, config: p.config! }));
}

/**
 * The deal to show on one product, or null. A sale beats a coupon (guests
 * get it without doing anything), then the bigger percentage wins.
 */
export function dealForProduct(deals: Deal[], productGid: string | null, collectionIds: string[] = []): Deal | null {
  if (!productGid) return null;
  const matching = deals.filter(({ config: c }) => {
    return c.allProducts || c.productIds.includes(productGid) || c.collectionIds.some((id) => collectionIds.includes(id));
  });
  matching.sort((a, b) => Number(b.kind === "sale") - Number(a.kind === "sale") || b.config.amount - a.config.amount);
  return matching[0] ?? null;
}

function money(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency }).format(amount);
}

/** "15% off" or "$5.00 off each". */
export function dealValue(deal: Deal, currency: string): string {
  const { config } = deal;
  return config.valueType === "percentage" ? `${config.amount}% off` : `${money(config.amount, currency)} off each`;
}

/** The price after the deal, or null when it depends on the cart (a tier) or there's no price. */
export function dealPrice(deal: Deal, price: number): number | null {
  if (deal.config.minQuantity > 1 || !(price > 0)) return null;
  const off = deal.config.valueType === "percentage" ? (price * deal.config.amount) / 100 : deal.config.amount;
  return Math.max(0, Math.round((price - off) * 100) / 100);
}

/** The line under a discounted item's price. */
export function itemDealText(deal: Deal, price: number, currency: string): string {
  const after = dealPrice(deal, price);
  const how = deal.kind === "coupon" ? ` with code ${deal.code}` : "";
  if (after !== null) return `Registry price ${money(after, currency)}${how}`;
  const tier = deal.config.minQuantity > 1 ? ` on ${deal.config.minQuantity}+ registry gifts` : "";
  return `${dealValue(deal, currency)}${tier}${how}`;
}

function scope(deal: Deal): string {
  const c = deal.config;
  if (c.allProducts) return "";
  return c.productIds.length + c.collectionIds.length > 1 ? " on selected gifts" : " on select gifts";
}

/** One banner line per deal, at most `max`. */
export function bannerLines(deals: Deal[], currency: string, max = 3): string[] {
  return deals.slice(0, max).map((deal) => {
    const tier = deal.config.minQuantity > 1 ? ` when you buy ${deal.config.minQuantity}+ gifts from this registry` : " when you buy from this registry";
    const base = `${dealValue(deal, currency)}${scope(deal)}${tier}`;
    return deal.kind === "coupon" ? `${base}: use code ${deal.code} at checkout` : `${base}, applied at checkout`;
  });
}

/** What the registrant is told they're offering their guests. */
export function promotionPerkLines(deals: Deal[], currency: string, max = 2): string[] {
  return deals.slice(0, max).map((deal) => {
    const tier = deal.config.minQuantity > 1 ? ` when guests buy ${deal.config.minQuantity}+ gifts` : " for guests who buy from your registry";
    return `${dealValue(deal, currency)}${scope(deal)}${tier}${deal.kind === "coupon" ? ` (code ${deal.code})` : ""}`;
  });
}
