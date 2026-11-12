/**
 * The two switches for the public marketing site at giftpin.app. Both are
 * empty until the thing they point at exists; every page reads them, so
 * setting one here updates the whole site in one edit.
 *
 * DEMO_VIDEO_URL: a YouTube or Vimeo link, or a direct .mp4/.webm file.
 *   Empty shows a "demo coming soon" placeholder in the same 16:9 frame.
 * APP_STORE_URL: the Shopify App Store listing. Empty keeps every call to
 *   action on "Get early access" (an email to support); set, they all become
 *   "Install on Shopify" and link here.
 */
export const DEMO_VIDEO_URL = "https://www.youtube.com/watch?v=EbJI5aFbeo4";
export const APP_STORE_URL = "https://apps.shopify.com/giftpin-gift-registry";

/**
 * Google Analytics 4 for giftpin.app only (the same property the App Store
 * listing reports to, so a site visit and a listing visit sit side by side).
 * Empty turns the tag and every click event off. Never put this on a
 * merchant's storefront or in the embedded admin: those visitors are the
 * merchant's customers, counted first-party in DailyStat instead.
 */
export const GA_MEASUREMENT_ID = "G-6ET2ZFN0P8";

/**
 * The App Store link with UTM tags, so a click from giftpin.app can be told
 * apart from a search inside the App Store. `placement` says which button
 * (header, hero, final, pricing_pro...) and lands in utm_content.
 */
export function appStoreHref(placement: string): string {
  if (!APP_STORE_URL) return "";
  const u = new URL(APP_STORE_URL);
  u.searchParams.set("utm_source", "giftpin.app");
  u.searchParams.set("utm_medium", "website");
  u.searchParams.set("utm_campaign", "site");
  u.searchParams.set("utm_content", placement);
  return u.toString();
}

/**
 * Whether the site advertises the founding offer (first FOUNDING_OFFER_SLOTS
 * installs from FOUNDING_OFFER_STARTS_AT get FOUNDING_OFFER_TRIAL_DAYS days of Pro free; see
 * app/shared/plans.ts). The site can't count installs, so set this to false
 * once the last spot is taken.
 */
export const SHOW_FOUNDING_OFFER = true;

export const SITE_URL = "https://giftpin.app";

/**
 * The seasonal "Holiday wish lists" promo (giftpin.app/holiday-wish-lists,
 * built 29 Oct 2026): the home page banner, the footer link and the sitemap
 * entry all switch off on their own at this moment, the day after Boxing Day
 * (Toronto time), with no deploy needed. The page itself keeps working for
 * anyone holding the link. To run it again next year, move this date; to
 * retire it for good, delete app/routes/holiday-wish-lists.tsx and
 * holidayWishListsHtml() in guides.ts.
 */
export const HOLIDAY_PROMO_ENDS_AT = new Date("2026-12-27T00:00:00-05:00");

export function holidayPromoOn(now: Date = new Date()): boolean {
  return now < HOLIDAY_PROMO_ENDS_AT;
}
