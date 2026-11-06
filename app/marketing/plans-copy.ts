import {
  FOUNDING_OFFER_SLOTS,
  FOUNDING_OFFER_TRIAL_DAYS,
  GIFT_CARD_FEE_PERCENT,
  PRO_PLAN_DISPLAY_NAME,
  PRO_PLAN_PRICE,
  PRO_TRIAL_DAYS,
} from "../shared/plans";
import type { Locale } from "../shared/i18n";
import { SHOW_FOUNDING_OFFER } from "./config";
import { SITE_COPY, fill } from "./site-copy";

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
export const TRIAL = fill(SITE_COPY.en.plans.trial, { days: PRO_TRIAL_DAYS });
export const TRIAL_DAYS = PRO_TRIAL_DAYS;

/** Values for the {placeholders} in the site copy, taken from the billing constants. */
export function siteVars(locale: Locale): Record<string, string | number> {
  return {
    pro: PRO_NAME,
    price: PRICE,
    days: PRO_TRIAL_DAYS,
    trial: fill(SITE_COPY[locale].plans.trial, { days: PRO_TRIAL_DAYS }),
    fee: GIFT_CARD_FEE_PERCENT,
    slots: FOUNDING_OFFER_SLOTS,
  };
}

/** The trial in words, e.g. "14-day free trial". */
export const trialText = (locale: Locale) => String(siteVars(locale).trial);

/**
 * One line on the founding offer, or "" once SHOW_FOUNDING_OFFER is off.
 * Worded so it stays true while spots remain: the Plan page, not the site,
 * tells a store whether it got one. The trial length here is
 * FOUNDING_OFFER_TRIAL_DAYS, not the standard one.
 */
export function foundingOffer(locale: Locale): string {
  if (!SHOW_FOUNDING_OFFER) return "";
  return fill(SITE_COPY[locale].plans.founding, { ...siteVars(locale), days: FOUNDING_OFFER_TRIAL_DAYS });
}

/** English, for the pages that aren't translated yet. */
export const FOUNDING_OFFER = foundingOffer("en");

export type Feature = { icon: string; title: string; detail: string };

// Icons are not language-specific, so they live here; the words live in site-copy/.
const FREE_ICONS = ["gift", "globe", "store", "heart", "shield", "card", "truck", "list", "link", "puzzle", "chart", "box", "upload", "mail"];
const PRO_ICONS = ["chart", "report", "palette", "percent", "bell", "gift", "scan", "star", "download", "headset"];

const withIcons = (icons: string[], items: { title: string; detail: string }[], vars: Record<string, string | number>): Feature[] =>
  items.map((f, i) => ({ icon: icons[i], title: fill(f.title, vars), detail: fill(f.detail, vars) }));

export const freeFeatures = (locale: Locale): Feature[] => withIcons(FREE_ICONS, SITE_COPY[locale].plans.free, siteVars(locale));
export const proFeatures = (locale: Locale): Feature[] => withIcons(PRO_ICONS, SITE_COPY[locale].plans.pro, siteVars(locale));
