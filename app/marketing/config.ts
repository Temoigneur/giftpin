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
 * installs from FOUNDING_OFFER_STARTS_AT get a year of Pro free; see
 * app/shared/plans.ts). The site can't count installs, so set this to false
 * once the last spot is taken.
 */
export const SHOW_FOUNDING_OFFER = true;

export const SITE_URL = "https://giftpin.app";
