# Giftpin browser extension (V1 scaffold, 19 Sep 2026)

One-click "add to registry" from any product page — the alternative to
pasting a URL into the Shopify app, built specifically because URL-paste
fails often enough on sites like Amazon to risk bad reviews before the app
even gets traction (Ben's call, 19 Sep 2026, moved from V2 into V1 scope).

## How it works

- The registrant connects once, by pasting the same "manage your registry"
  link they were emailed — no separate login, no new credential.
- Clicking the toolbar icon on any product page reads that page's own
  already-rendered JSON-LD / Open Graph metadata (title, image, price) —
  the same data the page shows a human, not a server-side scrape. This is
  what avoids the bot-blocking a server-side fetch of Amazon (etc.) hits.
- It POSTs what it found to the merchant's own Shopify app proxy
  (`https://<shop>.myshopify.com/apps/registry/ext-add`), authenticated by
  the manage token alone. No separate app domain, no new auth system —
  same endpoint family as the theme "Add to registry" button, extended with
  two new cases (`ext-verify`, `ext-add`) in `app/proxy/router.server.ts`.
- Adding the same page twice shows the same "already on this registry, how
  many total?" prompt as the theme button (see `STATUS.md` item 7), not a
  silent quantity bump.

## Why `addManualItem`, not `addExternalItem`

`addExternalItem` (the URL-paste path) re-fetches the URL server-side to
resolve title/image/price. That re-fetch is exactly what the extension
exists to avoid — so `ext-add` stores what the extension already read
client-side, the same way a manually-typed item is stored. See the comment
above `extAddAction` in `router.server.ts`.

## Loading it for testing

1. Chrome → `chrome://extensions` → enable "Developer mode" (top right).
2. "Load unpacked" → select this `browser-extension` folder.
3. Pin the "Giftpin" icon to the toolbar for convenience.
4. Open your registry's manage page, copy its link (the same one from the
   registry-created email), and paste it into the extension popup's
   "Connect" screen.
5. Go to any product page (a Shopify store on `*.myshopify.com`, or any
   other site) and click the extension icon.

**Note on host permissions:** the manifest only requests
`https://*.myshopify.com/*` — that's the only place the extension ever
sends data (the merchant's own app proxy). Reading the *current* page's
metadata uses `activeTab` + `scripting`, which needs no permission beyond
the click that opens the popup, and works on any site without listing it in
the manifest.

## Metadata extraction — sites confirmed live (19-20 Sep 2026)

`extractProductMetadata()` in `popup.js` tries, in order: JSON-LD `Product`
schema → Open Graph/Twitter meta tags → generic schema.org Microdata
(`itemprop="price"/"image"`) → a short list of per-site DOM fallbacks for
sites that expose none of the above. Checked live against a real product
page on each:

| Site | Works via | Notes |
|---|---|---|
| Amazon (.com/.ca/etc.) | site-specific fallback | No OG tags, no JSON-LD, no Microdata at all on real product pages (confirmed live) — presumably deliberate anti-scraping. Image from `#landingImage`'s `data-old-hires`, price from `.a-price .a-offscreen`. |
| Walmart | generic Microdata | No OG/JSON-LD price either, but renders standard `<span itemprop="price">` — picked up by the new generic Microdata pass, no Walmart-specific code needed. |
| Target | site-specific fallback | Title/image via OG tags; price has no OG/JSON-LD/Microdata signal, needed `[data-test="product-price"]`. |
| Best Buy (Canada) | generic (JSON-LD) | Full `Product` schema with image + offers.price — no changes needed. |
| Canadian Tire | generic (OG + JSON-LD) | OG title/image, JSON-LD offers.price — no changes needed. |
| Williams Sonoma | generic (OG + JSON-LD) | Same as Canadian Tire. |
| Wayfair | generic (OG) + site-specific price fallback | Title/image via OG tags. No og:price/JSON-LD/Microdata price signal (confirmed live) — added a `[data-test-id="PriceDisplay"]` fallback (20 Sep), but that attribute repeats ~60 times per page (related items, recommendations), so it picks whichever match sits structurally closest to the page's `<h1>` rather than the first DOM match. Confirmed live against a real listing. |
| Etsy | generic (full JSON-LD) | Confirmed live (20 Sep) — Etsy's Product schema has offers.price/priceCurrency and works with no code changes. **Found and fixed a real bug while confirming this:** Etsy's JSON-LD `image` field is an array of `ImageObject` (`{"@type":"ImageObject","contentURL":"..."}`), not plain URL strings — the extractor was stringifying the object itself (`"[object Object]"`) instead of falling through to the working `og:image`, silently breaking every Etsy image. Fixed generically (unwraps `.contentURL`/`.url` off an object), not with an Etsy-specific branch, since any site using this valid schema.org pattern would hit the same bug. |

Currency is inferred from the store's domain (`.ca` → CAD, `.co.uk` → GBP,
etc., default USD) wherever a fallback path is used, since the currency
symbol alone is ambiguous.

**Adding another retailer:** if a site's price/image still comes up empty,
check its product page for (in order of preference) JSON-LD `Product`
schema, Open Graph tags, schema.org Microdata (`itemprop="price"`), then a
plain DOM selector as a last resort — each is checked in that order before
falling through to the next, so a site needs code only for whichever layer
it's actually missing (Target only needed a price selector; Amazon needed
both image and price).

## Not done yet — before this is submittable to a store

- **Icons.** No `icons` key in `manifest.json` yet — Chrome/Edge will show a
  generic puzzle-piece icon when loaded unpacked, which is fine for testing
  but both stores require real icon assets (128×128 at minimum, plus 48×48
  and 16×16 are good practice).
- **Live end-to-end test.** Confirmed working end to end on `registro-dev`
  (connect, read a real Amazon page, add, duplicate-confirm) — see
  `STATUS.md`.
- **Store listing copy**, screenshots, privacy-practices disclosure (the
  extension reads page content and sends registry data to the merchant's
  store — worth being explicit about in the listing, same spirit as the
  1.1.13 conversation with Shopify).

## Publishing to Microsoft Edge Add-ons

No code changes needed — Edge runs Manifest V3 `chrome.*` extensions
natively, and this manifest has no Chrome-specific fields (no `update_url`,
no "Chrome" branding in the name/description) that Microsoft's porting
guide calls out as needing a change. The exact same `browser-extension`
folder that's loaded unpacked in Chrome also loads unpacked in Edge
(`edge://extensions` → Developer mode → Load unpacked) and is the same
package to zip up for submission to both stores.

To publish (your steps — tied to your own account, same as the Shopify
Partner submission):

1. Create a Microsoft Partner Center developer account at
   [partner.microsoft.com/dashboard/microsoftedge](https://partner.microsoft.com/dashboard/microsoftedge/public/login)
   — sign in with a Microsoft account (Outlook/Live/Hotmail) or a GitHub
   account, choose Individual or Company. **No registration fee** (confirmed
   19 Sep 2026 — Microsoft dropped the one-time fee Chrome/Google still
   charges).
2. Once verified, submit the same zipped `browser-extension` folder used for
   the Chrome Web Store — same listing-copy and icon requirements as below.
3. Sideload/test in Edge first with "Load unpacked" the same way as Chrome,
   before submitting.
