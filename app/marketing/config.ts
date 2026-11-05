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
