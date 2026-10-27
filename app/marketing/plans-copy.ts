import {
  GIFT_CARD_FEE_PERCENT,
  PRO_PLAN_DISPLAY_NAME,
  PRO_PLAN_PRICE,
  PRO_TRIAL_DAYS,
} from "../shared/plans";

/**
 * What each plan includes, as the marketing site words it. Price, trial and
 * plan name come from `app/shared/plans.ts`, the constants billing uses, so
 * the site can't quote a different price from what Shopify charges. Keep the
 * Pro list in step with what `isPro()` actually gates in the app, and don't
 * list anything that isn't merged to main (in-store POS mode and cash funds
 * weren't, as of 24 Sep 2026).
 */
export const PRICE = `$${PRO_PLAN_PRICE.toFixed(2)}`;
export const PRO_NAME = PRO_PLAN_DISPLAY_NAME;
export const TRIAL = `${PRO_TRIAL_DAYS}-day free trial`;
export const TRIAL_DAYS = PRO_TRIAL_DAYS;

export type Feature = { icon: string; title: string; detail: string };

export const FREE_FEATURES: Feature[] = [
  { icon: "gift", title: "Unlimited registries, items and guests", detail: "No caps and no per-registry fees." },
  { icon: "globe", title: "Gifts from your store and any online shop", detail: "Registrants paste a link and Giftpin fills in the photo, name and price." },
  { icon: "store", title: "Your matching product suggested", detail: "Beside every item added from another shop, when your catalog has a close match." },
  { icon: "heart", title: "Weddings, baby showers, birthdays and more", detail: "You choose which occasions your store offers." },
  { icon: "shield", title: "No duplicate gifts", detail: "Guests reserve a gift, so nothing is bought twice." },
  { icon: "card", title: "Credited through every checkout", detail: "Including Shop Pay, Apple Pay, Google Pay and the Shop app." },
  { icon: "truck", title: "Gifts ship straight to the registrant", detail: "When they save an address, gifts bought from your store go to them." },
  { icon: "list", title: "Who-gave-what list for thank-you notes", detail: "Registrants can download it as a spreadsheet." },
  { icon: "puzzle", title: "Theme blocks for your store", detail: "An Add to registry button on product pages, and create, find and manage links anywhere." },
  { icon: "chart", title: "Overview dashboard", detail: "Registries, items and gifts at a glance." },
  { icon: "mail", title: "Email support", detail: "" },
];

export const PRO_FEATURES: Feature[] = [
  { icon: "chart", title: "Registry analytics", detail: "Registries, items and gifts over 30 days, 90 days or 12 months, with revenue, new customers, where gifts were bought and registries by occasion." },
  { icon: "report", title: "Registry sales report", detail: "Revenue, orders, new customers and average order from registries, month by month." },
  { icon: "palette", title: "Your branding on registry pages", detail: "Your logo, colours and font, with the \"Powered by Giftpin\" credit removed." },
  { icon: "percent", title: "Completion discount", detail: "After the event, the registrant gets a single-use code for your products still on their list. You choose the percentage and how long it lasts." },
  { icon: "bell", title: "Automatic registry emails", detail: "A reminder before the event to guests who opt in, an alert when most items are gone, and a thank-you reminder listing who gave what." },
  { icon: "gift", title: "Your gift cards on giftpin.app", detail: `List your store in the giftpin.app gift card directory and add a gift card link to registry pages. Shoppers buy your gift cards at your own checkout. Giftpin charges ${GIFT_CARD_FEE_PERCENT}% of each card sold this way, nothing during your free trial.` },
  { icon: "download", title: "CSV export", detail: "Every registry and purchase, ready for your spreadsheet or email tool." },
  { icon: "headset", title: "Priority email support", detail: "Replies within one business day." },
];
