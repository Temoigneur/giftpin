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
