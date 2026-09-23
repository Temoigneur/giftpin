# Giftpin (Gift Registry App) — Status & Next Steps
_Last updated: 23 Sep 2026_

**⚠️ Do this the moment the app deploys to production, not before:**
1. Switch the Partner Dashboard listing's privacy policy URL from the
   claude.ai artifact to `https://<your-real-domain>/privacy` (route already
   built: `app/routes/privacy.tsx`).
2. Set `BILLING_TEST_MODE=false` in production's env (see `.env.example`) —
   until then every Upgrade click runs in Shopify's test mode and no
   merchant is ever really charged, which is also true of every environment
   below production and exactly what you want during development.

(A version of this reminder was reported added on 20 Sep but wasn't actually
on disk when this file was read again on 23 Sep — device shell was down both
times, so the edit likely never landed. Re-adding it directly here, and
flagging per the "Known ongoing constraint" note below: verify anything
reported as committed.)

## 23 Sep, latest: guest page deploy fixed live + default hero art per event type (built)

**Deploy diagnosis, resolved:** Ben reported "Start a registry" landing on a
generic storefront page. Live-verified in Chrome: `/apps/registry` was
redirecting to a stale `default-app-home` app-proxy subpath and erroring —
`npm run deploy` hadn't actually pushed the current `shopify.app.toml`
(subpath `registry`) live before now. Ben re-ran `npm run deploy`, it
succeeded, and the subpath is now correct — confirmed live: `/apps/registry`
now reaches the app and shows Shopify's own "error in the third-party
application" page instead of a 404, which is expected and separate: the
`app_proxy.url` target (Railway) still has no code deployed there (known,
already flagged below). **To actually test the guest pages right now, run
`npm run dev`** — `automatically_update_urls_on_dev` temporarily points
Shopify's live proxy at the local tunnel while it's running. A real fix
(deploying actual code to Railway) is the same not-yet-done item as before.

**Default hero art, built same session:** Ben asked for a "classy"
background image on the guest registry page appropriate to each event type
(wedding: champagne coupes clinking + a tiered cake, was the explicit
example). Rather than a stock photo (licensing risk) or an AI-generated
raster (no image-gen tool in this session, and it'd need external hosting),
built original hand-drawn line-art SVG, one per `EVENT_TYPES` value:
- **`app/shared/event-art.ts`** (new) — `eventHeroArt(eventType)`, inline
  SVG per type: wedding (clinking coupes, cake, rising bubbles), baby
  (crescent moon + stars), birthday (candle-topped tiered cake + confetti),
  housewarming (house silhouette + key + plant), graduation (mortarboard +
  diploma scroll), anniversary (interlocking rings), corporate (minimal
  gift box), and a generic gift-box fallback for anything unrecognized.
  Every shape is plain SVG primitives (paths/ellipses/rects), nothing
  traced — no copyright question. Not a `.server` file, same reasoning as
  the other `app/shared/*` modules.
- **`app/proxy/render/registry-page.ts`** — new required `eventType` field
  on `RegistryPageData`; the hero now renders `eventHeroArt(eventType)`
  whenever the registrant hasn't uploaded a `coverImageUrl`, and the real
  photo still wins when one exists.
- **`app/proxy/router.server.ts`** — `buildRegistryHtml` now passes
  `eventType: registry.eventType` through (it already had the value on
  hand for `eventTypeLabel()`; just wasn't forwarded before).
- **`app/proxy/render/layout.ts`** — `.hero-art` CSS, sized like the
  existing `.hero-img`. Rendered as literal inline `<svg>` in the page body
  (not a data-URI `<img>`), so it inherits `var(--accent)` from the page's
  own CSS and matches each merchant's brand color automatically, light and
  dark mode both, with zero extra network requests.
- **`app/proxy/render/__tests__/registry-page.test.ts`** — added
  `eventType` to the test fixture (now required); new tests: default art
  shows when there's no cover photo, an uploaded cover photo still wins,
  different event types render different art, an unrecognized event type
  falls back to the generic art instead of breaking, and the art always
  references `var(--accent)` rather than a hardcoded color.
- **Not yet run**: `npm test`/`npm run typecheck` against this change.
- **Ben still needs to:** look at it live (needs `npm run dev` running per
  the deploy note above) and say whether the art style lands — easy to
  restyle per type if something feels off, it's all in one file.

## 23 Sep, later: wedding registry gift-category suggestions, room by room (built)

Ben asked whether open-source code could be imported to help brides populate
a wedding registry with gift categories, scoped to `eventType === "wedding"`
only. Answer: category names built from a few common nouns ("Kitchen",
"Bedding") aren't copyrightable expression on their own (*Feist v. Rural*),
so no repo needed — wrote an original taxonomy informed by (not copied
from) Zola's and The Knot's public checklist articles, then expanded same
day at Ben's request into a three-level room → subcategory → specific-item
structure (e.g. Kitchen → Small appliances → Stand mixer, Air fryer, Rice
cooker, ...) instead of flat category names.

- **`app/shared/wedding-categories.ts`** (new) — `WEDDING_GIFT_CATEGORIES`:
  10 rooms (kitchen, dining, bedding, bath, home & décor, outdoor, tech,
  travel, experiences, cash/honeymoon funds), each with 2-4 subcategories,
  each with 2-10 named items (~135 items total). Every room is flagged
  `browsable: true/false` — false only for experiences/funds, since most
  merchants don't stock those as SKUs. An item optionally carries its own
  `searchTerm` override for when the plain name would search badly (e.g.
  "Sheet set (queen)" searches as "queen sheet set"). Not a `.server` file,
  same reasoning as `app/shared/settings.ts`.
- **`app/proxy/render/manage-page.ts`** — `renderWeddingCategories()`,
  called right under "Add items", renders only when `data.eventType ===
  "wedding"`. One outer `<details>` ("Wedding registry ideas, room by
  room"), containing one nested `<details>` per room so a bride opens only
  the room she's thinking about; each open room shows its subcategories as
  small headings with a row of item chips underneath. In a browsable room
  every chip is an `<a>` to `/search?q=<item or override term>&type=product`
  (relative — resolves on the merchant's own storefront domain the same way
  the existing "Browse the store" link to `/collections/all` already does);
  in experiences/funds the chips are plain (non-link) suggestions. All
  native `<details>`, no JS.
- **`app/proxy/render/layout.ts`** — CSS for nested room `<details>`,
  subcategory labels (`.cat-sub`), and item chips (`.cat-chip`, a wrapping
  row rather than the earlier fixed grid, since ~135 items of varying
  length need to wrap naturally).
- **`app/proxy/render/__tests__/manage-page.test.ts`** — rewritten for the
  three-level structure: room and subcategory labels render; an item links
  to a search on its own name; an item with a `searchTerm` override uses
  the override, not its label; non-catalog items render with no search
  link; nothing shows for non-wedding event types.
- No schema change, no checkout/payment touch, no attribution logic touch —
  per CLAUDE.md's workflow rules this didn't need a review pause. Committed
  directly via `device_commit_files` (device shell still down).
- First `npm test` pass (against the earlier flat-category version) hit two
  bugs, both fixed and verified green (115/115) before the room-by-room
  expansion: (1) `layout.ts` used a raw `\2013` in a JS template literal,
  which esbuild reads as a legacy octal escape, not a unicode dash — fixed
  by using an actual en-dash character instead of any escape. (2) a
  `::-webkit-details-marker{display:none}` rule coincidentally shared the
  literal substring `security.test.ts`'s "only ever declares a safe accent
  colour" test uses as its CSS-injection canary (`not.toContain
  ("display:none")`) — not a real vulnerability (accentColor sanitization
  was untouched), but the test couldn't tell the difference. Fixed by
  hiding the marker with `width/height/opacity:0` instead. Both fixes carry
  forward into this version; `npm run typecheck` has passed clean since.
- **Ben still needs to:** run `npm test` again against this room-by-room
  version (the test file changed along with the feature — not yet verified
  live), then look at it in a wedding registry's manage page. The `/search`
  URL assumes the merchant's theme uses Shopify's default search endpoint —
  worth a live check per CLAUDE.md hard rule #1 if Dawn or another theme
  behaves differently.
- Not done: no suggestions for other event types (deliberately out of scope
  per Ben's request); no "mark this item done" state — it's inspiration
  only, not tracked per registry; item list isn't exhaustive by design (a
  couple of representative items per subcategory, not every SKU imaginable).
- **Once the device shell is back**, Claude runs and monitors `npm test`/
  `npm run typecheck` itself after changes instead of asking Ben to paste
  output (his request, 23 Sep). Still blocked as of this session — same
  Windows-update mount issue as everything else file-related.

## 23 Sep: Shopify Billing built (Pro plan)

Ben confirmed both open decisions from the "Next Session Priorities" doc:
**Public distribution** (already matched `shopify.server.ts`'s
`AppDistribution.AppStore`) and **pricing — Free (unlimited) + Pro
($9.99/mo)**. Built on that:

- `Shop.plan` (`free`/`pro`), `shopifyChargeId`, `planUpdatedAt` added to the
  schema — migration `20260923035807_shop_billing_plan`, applied directly to
  the live Neon DB via a tested branch migration (device shell down again
  this session), with a matching file in `prisma/migrations/` per the same
  pattern as `20260919181534_registry_item_dedup_constraints`. **You still
  need to run** `npx prisma migrate resolve --applied 20260923035807_shop_billing_plan`
  once at a terminal to sync Prisma's own tracking — same follow-up as last
  time, not urgent.
- `app/shopify.server.ts` — added a `billing` config block (`PRO_PLAN`,
  `$9.99/mo`, `BillingInterval.Every30Days`) using the shopify-app-react-router
  library's built-in billing support (`authenticate.admin(request)` returns a
  `billing` object with `require`/`check`/`request`/`cancel`), rather than a
  hand-rolled `appSubscriptionCreate` mutation.
- `app/routes/app.billing.tsx` (new) — merchant-facing "Plan" page (linked
  from the admin nav in `app.tsx`). Upgrade calls `billing.request()`, which
  throws Shopify's own embedded-safe redirect to the confirmation page.
  Cancel calls `billing.cancel()` then writes `plan: free` immediately so the
  merchant doesn't wait on webhook delivery.
- `app/routes/webhooks.app_subscriptions.update.tsx` (new) + a new
  `[[webhooks.subscriptions]]` block in `shopify.app.toml` — this webhook is
  the actual source of truth for `Shop.plan` (activation, cancellation,
  expiration, freeze on a declined renewal). **Unverified per CLAUDE.md hard
  rule #1**: the payload shape (nested under `app_subscription`, `status` +
  `admin_graphql_api_id` fields) is from the 2026-07 docs, never seen live —
  Giftpin has never had a real subscription fire it. The handler logs the
  raw payload if the expected field is missing, so the first real Upgrade
  click (even in test mode) will confirm or correct this.
- `app/models/shop.server.ts` — `isPro()`, `planFromSubscriptionStatus()`
  (pure, tested), `setPlanFromSubscription()`.
- Pro feature #1 implemented: the guest registry page's footer now shows a
  small "Powered by Giftpin" credit, hidden when the shop is on Pro
  (`app/proxy/render/layout.ts` + `registry-page.ts`, wired in
  `router.server.ts`). Only the main registry page is gated so far — the
  create/manage/find pages still always show it; extend if you want removal
  to apply everywhere. Analytics and priority-support are pricing-page
  promises only, no code yet — flag if you want the dashboard's analytics
  actually gated on Pro too, rather than just described as a perk.
- Tests added: `app/models/__tests__/shop.test.ts` (plan mapping, pure and
  fast) and two new cases in `registry-page.test.ts` for the branding gate.
  **You still need to run `npm test` and `npm run typecheck` yourself** —
  same as the affiliate-link work from the 20 Sep session, this wasn't
  runnable from this session either.

## What this is
A Shopify app ("Giftpin") that lets a guest build a gift
registry containing items from *any* store, not just the merchant's, and
correctly attributes purchases back to the right registry/item even through
Shop Pay, Apple Pay, Google Pay, and the Shop app. No affiliate commissions
on outbound links — that's a deliberate trust feature, not an oversight.

Read `CLAUDE.md` first for the hard rules. This file is the status/handoff;
`SPIKE-A.md` and `SPIKE-B.md` have the full spike detail.

## Done

- **Codebase built** (14 Sep): ~8,100 lines — admin UI, theme app extension,
  app-proxy guest pages, resolver, attribution, webhooks. 100/100 tests
  passing.
- **Spike A: complete**, gate cleared, all 15 rows pass (row 6/PayPal
  demoted to informational — not testable in Shopify test mode).
- **Spike B1 (ship-to-registrant address rewrite): fully closed.**
  Mechanical behavior and the tax-recalculation question both confirmed
  live against `registro-dev`:
  - Registered Canada (GST/HST) as an active tax-collecting region on
    `registro-dev` — one registration covers federal GST plus combined HST
    in NB, NL, NS, Ontario, PE.
  - **Case 1 (paid + unfulfilled → should recalculate): confirmed.**
    Cross-jurisdiction address edit on a paid/unfulfilled order produced a
    new tax line, updated total, and flipped the order to "Partially paid."
  - **Case 2 (paid + fulfilled → should NOT recalculate): confirmed.**
    Same edit on a paid/fulfilled order left total and status unchanged;
    Shopify's own UI warned taxes wouldn't recalculate before save. Matches
    the codebase's existing guardrail comment.
  - This unblocks full trust in `applyShipToRegistrant()`.
- **`shopify.app.toml` / `app/shopify.server.ts` aligned to API version
  `2026-07`** (was `2025-10`) — matches the version used when webhooks were
  created manually during the spikes.
- **`applyShipToRegistrant()` wired into the real order-attribution flow.**
  Previously existed as a tested-but-unused function in `purchase.server.ts`.
  Now:
  - `attributeOrder()` calls it via a new `shipToRegistrantForOrder()`
    helper that mints an Admin API client with `unauthenticated.admin(shop)`
    (the background job has no request-scoped `admin` client).
  - Idempotency piggybacks on the existing `Purchase` unique index — no
    separate dedup table needed.
  - Outcome logged via `logEvent()` as a new `ship_to_registrant` event
    type (visible without digging into logs).
  - Never throws into the attribution flow — failures are logged and
    swallowed; the purchase itself still records correctly.
  - `app/models/__tests__/purchase.test.ts` added (7 new tests: happy path,
    flag off, no saved address, already-fulfilled refusal,
    cross-jurisdiction refusal, mutation `userErrors`, order-not-found).
    Full suite 100/100 passing. `tsc --noEmit` clean (two pre-existing
    unrelated `tx` implicit-`any` warnings untouched).
  - Still worth one live end-to-end order test before fully trusting in
    production — everything so far exercises the mutation logic directly,
    not through a real webhook delivery.
- **Level 2 protected customer data request corrected** (see
  `partner-support-requests.md`). Spike B1 showed the app only *writes* an
  address via `orderUpdate`, never reads one back — the ask is now narrower:
  confirm whether `customer.first_name`/`last_name`/`orders_count` from the
  `orders/create` webhook need protected-data tier at all.
- Requirement 1.1.13 clarification request drafted, ready to submit.
- **Database migrated for real** (18 Sep, evening): `npx prisma migrate dev
  --name init` run against the live Neon DB — was previously blocked (no
  device shell access this session). All tables now exist, including
  `Session`; `shopify app dev` was failing on `MissingSessionTableError`
  before this.
- **Spike B2 (cart permalink prefill): first half confirmed live.**
  `properties=` and `checkout[shipping_address][...]` coexist in one
  permalink, the link skips `/cart` and lands straight on `/checkout`
  (worth remembering for any registry link that prefills an address), and
  every shipping field prefilled correctly. Store now has real tax
  configured (HST $1.69 on a test order) as a side effect — useful for
  re-testing Spike B1's tax-recalculation question too.
  - **Not done, blocked on Ben's test account, not the app:** whether Shop
    Pay overrides the prefilled address with the guest's saved one. The
    `bentley.humphries+shopapp@gmail.com` Shop Pay test account is in a bad
    state — direct sign-in at shop.app throws an `invalid_request` error,
    and the checkout's own SMS verification code never arrives. Needs a
    fresh Shop Pay test account (new email, full phone verification done
    in one sitting) rather than continuing to fight this one.

**Corrections to earlier bad info** (kept for reference): no "Nickname"
field in merchant checkout (it's on Shop Pay's own account page); Shop Pay
is testable in test mode, PayPal isn't; `_rg` cart-property hiding is theme
convention, not guarantee; classic cart permalinks need the whole
`properties=` blob base64url-encoded, not `properties[key]=`; Admin API
protected-data gating blocks *reading* PII, not *writing* it via a mutation
input.

## Next steps, in order

1. Submit the two Partner support requests from `partner-support-requests.md`
   (protected-data scope question, 1.1.13 clarification) — Ben's to submit,
   tied to his Partner account.
2. Finish Spike B2's last row: fresh Shop Pay test account, confirm whether
   it overrides the prefilled address. B3 is lower priority (needs a second
   Plus-tier dev store).
3. ~~Run `npx prisma generate`~~ — done (see above). `shopify app dev`
   should now start clean.
4. Re-run Row 2 (Shop Pay) with `npm run dev` running live, pointed at the
   real `orders/create` handler end to end; confirm a `Purchase` row appears
   with the right `qty`/`purchasedQty` increments.
5. Live end-to-end ship-to-registrant test: place a real order with the
   flag on, confirm the `ship_to_registrant` event shows `applied: true`
   and the order's address actually changed in the admin.

**On automation:** the device shell (`device_bash`) is still down this
session — a Windows-update mount issue, not fixed by the migration above.
File-level access (read/list/stage/commit) still works. Steps 2, 4, and 5
all need a live checkout with real payment/SMS flows, which Ben runs
himself either way — that's not something to automate even once the shell
is back.

## Where things live
- Codebase: `E:\Gift Registry App\registro` (also has `CLAUDE.md`,
  `SPIKE-A.md`, `SPIKE-B.md`, `partner-support-requests.md`, `README.md`)
- Architecture doc: `E:\Gift Registry App\architecture-decisions.md`
- Dev store: `registro-dev` (separate from the "Dev Ben Humphries" store
  used for the Notion app)

## Note for whoever (or whichever session) picks this up
`CLAUDE.md`'s "Known gaps" section is partly stale as of this file: the
`api_version` mismatch it lists is already fixed (see above), and
ship-to-registrant is now wired in. `prisma generate` is still genuinely
unrun. Trust this file over that section until someone updates it.
