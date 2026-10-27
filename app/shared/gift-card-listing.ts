/**
 * Gift cards on giftpin.app (Pro) — pure helpers.
 *
 * A merchant who opts in is listed at giftpin.app/gift-cards. A shopper picks
 * the store, lands on the store's own /apps/registry/gift-card page, and buys
 * the merchant's Shopify gift card at the merchant's normal checkout. Giftpin
 * never takes the money or issues a card: the store keeps the payment, the
 * liability and any unspent balance. That is the whole reason this works for
 * us without stored-value licensing.
 *
 * The amounts are the merchant's own gift card denominations (the same
 * product as group gifts and funds), up to MAX_LISTED_GIFT_CARD. A typed-in
 * amount would need a Cart Transform price change, which is Shopify Plus only
 * (see the group-gifting notes in SPIKE-C.md).
 *
 * Not a `.server` file: the admin settings page, the guest page and the
 * marketing site all use it (CLAUDE.md hard rule 2).
 */

import type { ContributionProduct, ContributionVariant } from "./contributions";

/** Highest single gift card the listing offers, in shop currency. */
export const MAX_LISTED_GIFT_CARD = 500;
export const GIFT_CARD_BLURB_MAX = 160;

/** Stored in Shop.settings.giftCardListing. */
export interface GiftCardListing {
  enabled: boolean;
  /** One line about the store for the giftpin.app directory. */
  blurb: string;
}

export const GIFT_CARD_LISTING_DEFAULTS: GiftCardListing = { enabled: false, blurb: "" };

export function cleanGiftCardBlurb(raw: unknown): string {
  // \s covers newlines and tabs; \p{Cc} catches any other control character.
  return String(raw ?? "")
    .replace(/[\s\p{Cc}]+/gu, " ")
    .trim()
    .slice(0, GIFT_CARD_BLURB_MAX);
}

/** The denominations the listing offers: the merchant's, capped at MAX_LISTED_GIFT_CARD. */
export function listedGiftCardAmounts(product: ContributionProduct | null | undefined): ContributionVariant[] {
  return (product?.variants ?? []).filter((v) => v.amount > 0 && v.amount <= MAX_LISTED_GIFT_CARD);
}

/**
 * Whether a shop shows up in the directory and serves its gift card page.
 * Pro, installed, switched on, and at least one amount to sell. Any one of
 * those lapsing hides the store rather than leaving a dead link.
 */
export function giftCardListingLive(shop: {
  pro: boolean;
  uninstalled: boolean;
  listing: GiftCardListing | null | undefined;
  product: ContributionProduct | null | undefined;
}): boolean {
  return (
    shop.pro &&
    !shop.uninstalled &&
    shop.listing?.enabled === true &&
    listedGiftCardAmounts(shop.product).length > 0
  );
}

/** Where the guest came from, carried on the signed cart line. */
export type GiftCardSource = "directory" | "registry" | "store";

export function giftCardSource(raw: unknown): GiftCardSource {
  return raw === "directory" || raw === "registry" ? raw : "store";
}

/** English country name for a directory heading, or null when unknown. */
export function countryName(code: string | null | undefined): string | null {
  if (!code || !/^[A-Z]{2}$/.test(code)) return null;
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? null;
  } catch {
    return null;
  }
}

/** Shopify's own amount formatting is per shop; this is the directory's plain fallback. */
export function formatGiftCardAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`.trim();
  }
}
