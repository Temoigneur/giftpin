# Click tracking: what is counted where

Built 12 Nov 2026. Three separate places, on purpose:

| Where | Tool | Who sees it |
| --- | --- | --- |
| giftpin.app (site, guides, gift card directory) | Google Analytics 4, `G-6ET2ZFN0P8` (`GA_MEASUREMENT_ID` in `app/marketing/config.ts`) | Ben, in GA |
| Shopify App Store listing | Shopify's own GA hookup (Partner Dashboard → Apps → Giftpin → Distribution → Manage listing → Tracking information) | Ben, in the same GA property |
| Merchants' storefronts (registry, manage, create, find, gift card pages) and the embedded admin | First-party daily counts in `DailyStat`, no cookies, no Google | Ben at `/ops` |

Google Analytics never goes on a merchant's storefront or inside Shopify admin. Those visitors are the
merchant's customers and staff: sending them to Giftpin's GA would need the merchant's consent banner
(Shopify's Customer Privacy API) and a disclosure in every merchant's own privacy policy. Counts in our own
database need neither.

## giftpin.app events (GA4)

GA4's automatic events still run (page_view, scroll, outbound `click`, etc.). On top of those, one delegated
click listener in `analyticsClicks()` (`app/marketing/layout.ts`) sends:

| Event | When | Parameters |
| --- | --- | --- |
| `install_click` | Any link to apps.shopify.com | `placement`, `page_lang` |
| `lang_switch` | A language picked in the flag menu | `lang_from`, `lang_to`, `placement` |
| `lang_menu_open` | The flag menu opened | `placement` |
| `setup_link_click` | A link to /setup, /setup/customize, /setup/pro, /registry-guide, /guest-guide | `link_path`, `placement` |
| `pricing_click` | A link to /pricing | `placement` |
| `demo_click` | A "Watch demo" / `#demo` link | `placement` |
| `faq_open` | An FAQ question opened | `faq_question` (first 100 characters of the question), `placement` |
| `contact_click` | A mailto: link | `placement` |
| `gift_card_store_click` | "Buy" on a store in /gift-cards | `store_host` (the store's myshopify domain) |

Every event also carries `page_lang`. `placement` is `header`, `menu` (phone menu), `hero`, `final` (the
gradient band at the bottom), `footer`, `faq` or `body`.

Consent: ads and ad personalisation are denied for everyone; analytics cookies are denied for EU/EEA, UK and
Swiss visitors (Google decides the region from the IP) and for any browser sending Global Privacy Control.
There is no cookie banner, so denied visitors only send cookieless pings and mostly won't show in reports.
Not live-tested: that Google applies the region default as documented. Check in GA DebugView with a VPN set
to Germany if it matters.

## UTM tags on App Store links

Every install button on giftpin.app links to
`apps.shopify.com/giftpin-gift-registry?utm_source=giftpin.app&utm_medium=website&utm_campaign=site&utm_content=<placement>`
(`appStoreHref()` in `config.ts`). Placements: `header`, `menu`, `hero`, `final`, `pricing_free`,
`pricing_pro`, `trust`.

**Not yet verified:** whether the App Store listing passes those UTM tags into the GA events it sends
(`view_item`, `add_to_cart`, `shopify_app_install`). Shopify's docs don't say clearly. To check: open GA
Realtime, click Install on giftpin.app, and see whether the listing's `view_item` shows source
`giftpin.app`. Either way the site's own `install_click` counts the click.

Use the same pattern for links outside the site (all lower case):

| Link lives in | utm_source | utm_medium | utm_campaign |
| --- | --- | --- | --- |
| Emails Ben sends by hand | `email` | `email` | e.g. `founding-10` |
| Facebook group posts | `fb-<group>` | `social-group` | `fbg-<post id>` |
| Business card QR | `business-card` | `print` | `card-2026` |
| Chrome extension listing | `chrome-web-store` | `referral` | `extension` |
| Search ads | (auto-tagged by Google Ads) | | |

## Storefront and admin counts (`/ops`)

Already counted before this change: registry views, create-page views, find-page views, gift card page views,
add to cart, clicks to other stores, every store order. Added:

- **Link shares**: Share, Copy link and QR code on a registrant's manage page (`POST /apps/registry/track`,
  only `share`/`copy`/`qr` accepted, only for the registry the manage token opens).
- **Admin opens**: each time a merchant's staff open a section of Giftpin in Shopify admin
  (`POST /app/track`, section only: overview, registries, promotions, analytics, in-store, settings,
  billing, import, other).

Both show in new `/ops` columns. Counts start the day this deploys.

## Ben's GA4 to-do (once, after merge)

1. Check the ID. Admin (gear, bottom left) → Data collection and modification → Data streams → the web
   stream → Measurement ID. If it isn't `G-6ET2ZFN0P8`, change `GA_MEASUREMENT_ID` in
   `app/marketing/config.ts`.
2. Register custom dimensions so the parameters show in reports. Admin → Data display → Custom definitions →
   Create custom dimension, scope **Event**, one each for: `placement`, `page_lang`, `lang_from`,
   `lang_to`, `link_path`, `faq_question`, `store_host`. (Dimension name can match the parameter.)
3. Mark key events. Admin → Data display → Key events → New key event, and type: `install_click`. Also
   mark the listing's `add_to_cart` (Install pressed on the listing) and `shopify_app_install` if they
   aren't already.
4. Where to look: Reports → View user engagement & retention → Events, then click an event name; or
   Explore → Free form with "Event name" and "placement" as rows.
