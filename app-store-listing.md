# Shopify App Store listing — draft (20 Sep 2026, renamed to Giftpin)

Submission itself is yours (tied to your Partner account). This is the copy
plus the testing instructions Eman N's 1.1.13 reply asked for — both folded
in already, see notes at the bottom.

**Updated 20 Sep 2026:** renamed "Registro" → "Giftpin" throughout, and
rewrote the affiliate-commission framing to match Ben's 20 Sep decision to
take a disclosed commission from launch instead of "no commission, ever"
(see `CLAUDE.md`'s "Resolved" section for the reversal note). Pricing,
support email, and privacy policy URL are now filled in below; screenshots
are still blocked on a live capture.

---

## App name

Giftpin Gift Registry

(Matches `name` in `shopify.app.toml`, which is what Shopify admin and the
Dev Dashboard show once `shopify app deploy` succeeds — renamed from
"Codebeans Gift Registry" on 23 Sep 2026.)

## Tagline (one line, shown in search results)

Let guests build one gift registry from any store — not just yours.

## App introduction (shown at the top of the listing, ~100 characters)

The only gift registry that isn't limited to your catalog.

## App details (main listing body)

Most registry apps only let guests add products from your store. Giftpin
lets them add a gift from *any* store — Amazon, Etsy, a boutique shop, your
own catalog — onto one shareable registry page, and correctly credits the
purchase back to the right item no matter how the guest checks out (Shop
Pay, Apple Pay, Google Pay, the Shop app, or your regular checkout).

**Why merchants add it:**
- Registries are a proven reason customers pick one store's app over
  another — but only if the registry can hold everything the couple/family
  actually wants, not just what you sell.
- Every registry page links back to your store's checkout for your own
  products, and out to the original store for everything else — you're
  never asked to fulfill something you don't carry.
- Giftpin discloses upfront, to merchants and guests alike, that it may earn
  a small commission when a guest buys from an external store through a
  registry link — it never changes the guest's price, and never applies to
  purchases of the merchant's own products.

**What guests get:**
- One link to share, listing gifts from anywhere.
- A one-click browser extension to add a product from any site they're
  already browsing (no copy-pasting URLs).
- Duplicate-gift protection — the registry shows "someone may be buying
  this" the moment a purchase is in flight, not just after it's confirmed.

**What merchants get:**
- A registry dashboard showing what's been bought, by whom, and what's
  still needed.
- Optional ship-to-registrant: route a gift to the registrant's saved
  address even when it's bought through the merchant's own store.
- Attribution that survives Shop Pay / Apple Pay / Google Pay / Shop app
  checkouts, not just the default cart flow.

## Key benefits (3 short bullets, Shopify's listing format)

1. Guests can add gifts from any store, not just yours — one link, one
   registry.
2. Commission is disclosed, capped to external-store purchases only, and
   never touches the guest's price or your own product sales.
3. Purchase attribution survives Shop Pay, Apple Pay, Google Pay, and the
   Shop app — not just the default checkout.

## Pricing

**Proposed — not yet built or billed. This is a starting point for you to
approve or change, not a final decision; flag any change back so I can keep
`app/shared/settings.ts` (or whatever billing config ships) in sync with
whatever you land on.**

- **Free** — unlimited registries, unlimited items, full browser-extension
  support. No monthly fee. Giftpin's disclosed affiliate commission on
  external-store purchases (see above) is the only revenue on this tier.
- **Pro — $9.99/mo, 14-day free trial** — adds the merchant dashboard's
  advanced analytics (resolver hit-rate, external-vs-catalog value split),
  priority support, and removes Giftpin's own branding from guest-facing
  registry pages.

Neither tier changes what a guest pays or adds a fee on the merchant's own
product sales — the commission (Free tier) and the subscription (Pro tier)
are the only two revenue paths, and they don't stack on the same purchase.

## Screenshots needed (not yet captured)

None of these exist as real captures yet — they need your local dev server
running against `registro-dev` so I can drive the browser and take them
live, rather than fabricating mockups and presenting them as product
screenshots:

1. Guest-facing registry page with a mix of internal + external items
   (shows the "any store" pitch visually).
2. The browser extension popup mid-add on a real product page.
3. Merchant dashboard showing purchased/claimed/needed items.
4. The commission-disclosure statement, zoomed in enough to read.

Say the word once your dev server (`npm run dev`) is up and I'll capture all
four in one pass.

## Privacy / data use disclosure (required field, keep this exact framing)

Giftpin reads publicly-displayed product information (title, image,
price) from the page a guest is already viewing, and stores it against
their own registry. For external (non-Shopify) products this comes from
that page's own on-page metadata, read client-side by the browser
extension or by fetching the page's public metadata server-side — never a
private or authenticated source. No product data is imported into the
merchant's catalog, and no purchase happens through Giftpin itself; every
external item links out to its original store for the actual purchase,
where Giftpin may earn a disclosed commission on that sale. The app does
not read back customer PII from the Admin API; shipping-address data used
for the ship-to-registrant feature is entered directly by the registrant
into Giftpin's own database, not pulled from a Shopify customer record.

## Reviewer testing instructions (required field — this is what Eman's
## 1.1.13 reply asked to have spelled out explicitly)

To test the core "any store" flow:

1. Install the app on a test store and open its admin page — create a
   registry (any occasion, any name).
2. Open the registry's guest-facing link (shown on the admin dashboard).
3. Add an item two ways:
   a. **From the merchant's own catalog** — use the "Add to registry"
      button injected into the product page by the theme app extension
      (Online Store → Themes → Customize → add the "Add to registry"
      block to a product template if it isn't already there).
   b. **From an external store** — on the registry's manage page, paste a
      product URL from any other site (e.g. an Amazon or Etsy product
      page). The app fetches that page's own public title/image/price —
      the same data a browser shows a human — and displays it on the
      registry. **This does not import the product into the merchant's
      catalog and does not enable the merchant to sell it** — it is
      read-only display, and the registry item links back out to the
      original store for the actual purchase.
4. Confirm the registry page shows both items, and that the external
   item's "Buy" link points to the original store, not back into this
   store's checkout.
5. Confirm the commission disclosure is visible on the registry page next
   to external items (view the page directly).
6. To test duplicate-gift protection: add the same catalog item to the
   registry twice — the second add should prompt for a total quantity
   rather than silently doubling it.

Do not use "import" language to describe step 3b to reviewers or in the
listing copy itself — 1.1.13's flagged phrasing ("import from any store in
the world," "copy the product information from any website") describes a
different pattern (catalog replication) than what Giftpin does (per-page,
read-only, no catalog write, no resale).  Eman's reply agreed this
read-only/outbound-link pattern is distinguishable from what 1.1.13
targets, while noting only Shopify's App Review team can make the binding
call — that reply predates the commission-disclosure decision, so it's
worth a quick re-check with Support that adding a disclosed commission
doesn't change their read, since 1.1.13's concern is about data duplication
rather than monetization, but confirm rather than assume.

## Support

- Support email: humphries.jaguar+giftpin@gmail.com (a "+" alias off your
  regular Gmail — mail sent to it lands in your normal inbox, easy to
  filter on `+giftpin` if you want a separate label later).
- Privacy policy URL: https://claude.ai/artifact/Q4aPWpbwe2yzfApnHSZp5B

---

### Notes on how this draft was built

- Folds in both of Eman N's 18 Sep recommendations from
  `partner-support-requests.md`: (1) reviewer instructions explicitly state
  no catalog import / no resale, (2) the read-only, display-only nature of
  external product data plus the outbound-link pattern is spelled out in
  both the main copy and the disclosure field.
- Avoids the exact phrasing 1.1.13 flags as unacceptable ("import from any
  store in the world", "copy the product information from any website")
  even though the underlying feature is fine per Eman's read.
- Flags the one open question the commission reversal raises: whether it's
  worth a quick note back to Shopify Support confirming 1.1.13's compliance
  read still holds now that a commission is disclosed (it almost certainly
  does — 1.1.13 is about data duplication, not monetization — but it's a
  free five-minute email that closes the loop instead of assuming).
- **Screenshots are the one item still genuinely blocked** — on your local
  dev server being up so I can capture the real product, not a mockup.
