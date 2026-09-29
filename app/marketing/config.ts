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
export const DEMO_VIDEO_URL = "https://youtu.be/EbJI5aFbeo4";
// Paused 29 Sep 2026 until the Chrome extension is approved. To relaunch,
// set this back to "https://apps.shopify.com/giftpin-gift-registry".
export const APP_STORE_URL = "";

export const SITE_URL = "https://giftpin.app";
