/**
 * Plan names and prices, shared by server billing code
 * (`shopify.server.ts`) and the public pricing page (`routes/pricing.tsx`).
 * Not a `.server` file so both sides can import it (CLAUDE.md hard rule 2),
 * and one source means the public page can't drift from what Shopify bills.
 *
 * PRO_PLAN is the billing key Shopify stores on the subscription, so
 * renaming it would stop billing.check() matching existing subscriptions.
 * PRO_PLAN_DISPLAY_NAME is the customer-facing name only.
 */
export const PRO_PLAN = "Pro";
export const PRO_PLAN_DISPLAY_NAME = "Giftpin Pro";
export const PRO_PLAN_PRICE = 9.99;
export const PRO_TRIAL_DAYS = 14;

/**
 * Founding offer (Ben, 23 Oct 2026, announced at a Toronto networking event
 * on 24 Oct): the first FOUNDING_OFFER_SLOTS stores to install Giftpin from
 * FOUNDING_OFFER_STARTS_AT onwards get a FOUNDING_OFFER_TRIAL_DAYS free
 * trial of Pro instead of the usual PRO_TRIAL_DAYS. It's still a normal
 * Shopify subscription under PRO_PLAN, so Shopify bills $9.99/mo after the
 * trial unless the merchant cancels, and nothing else has to know about it.
 *
 * "First ten" counts installs, not upgrades (Shop.installedAt, which a
 * reinstall doesn't reset), so the start date keeps every store installed
 * before the offer, Ben's own included, out of the count. A new dev store
 * Ben installs on after this date WOULD take a slot.
 */
export const FOUNDING_OFFER_SLOTS = 10;
export const FOUNDING_OFFER_TRIAL_DAYS = 365;
// Midnight 23 Oct 2026, Toronto time (EDT, UTC-4).
export const FOUNDING_OFFER_STARTS_AT = new Date("2026-10-23T04:00:00Z");

/**
 * Pure part of the founding-offer check: a store installed at `installedAt`,
 * with `earlierInstalls` stores installed on or after the start date before
 * it, gets a slot. See foundingOfferEligible() in app/models/shop.server.ts.
 */
export function isFoundingSlot(installedAt: Date, earlierInstalls: number): boolean {
  return (
    installedAt.getTime() >= FOUNDING_OFFER_STARTS_AT.getTime() &&
    earlierInstalls < FOUNDING_OFFER_SLOTS
  );
}

/**
 * Giftpin's fee on gift cards sold through the giftpin.app gift card listing
 * (Ben, 24 Oct 2026): 2% of the card's value, billed as a Shopify usage
 * charge on the Pro subscription. Founding-offer stores pay nothing during
 * their free year; in practice no fee is charged during any free trial (see
 * app/models/gift-card-fee.server.ts). It never applies to a store's own
 * product sales or to registry gifts.
 */
export const GIFT_CARD_FEE_PERCENT = 2;
/** Shopify usage line cap per 30-day cycle, in USD (the subscription's currency). */
export const GIFT_CARD_FEE_CAP = 100;
/**
 * Days a sale waits before its fee is charged, so a card refunded in that
 * time is never billed. Shopify has no API for reversing a usage charge from
 * the app; a refund after this needs a credit from the Partner Dashboard.
 */
export const GIFT_CARD_FEE_HOLD_DAYS = 14;
export const GIFT_CARD_FEE_TERMS = `Giftpin charges ${GIFT_CARD_FEE_PERCENT}% of the value of each gift card sold through your giftpin.app gift card listing, up to $${GIFT_CARD_FEE_CAP} USD per 30 days. This spending limit is used for nothing else. No fee during your free trial.`;
