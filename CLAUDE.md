# CLAUDE.md — Giftpin (Gift Registry App)

Read this before touching code. It exists because several of the bugs and
wasted hours below already happened once.

## What this app is

A Shopify app that lets a guest build a gift registry containing items from
*any* store (not just the merchant's), and correctly attributes purchases
back to the right registry/item even through Shop Pay, Apple Pay, Google Pay,
and the Shop app. Attribution correctness is the product — see
`app/lib/attribution.ts` and `SPIKE-A.md`.

## Hard rules — do not violate

1. **Never trust a Shopify doc claim without live verification.**
   We hit three confirmed-wrong doc claims during Spike A: a nonexistent
   "Nickname" field in Shop Pay checkout, PayPal being marked testable when
   it isn't, and "test mode" auto-fixing what was actually an
   already-registered-Shop-Pay-account conflict. If a doc claim can be
   checked against the live dev store (admin UI, checkout, webhook payload,
   GraphQL), check it before writing code or docs that depend on it. Don't
   propagate a doc's claim into a comment or spec until it's been confirmed
   live.

2. **`.server.ts` files cannot be imported by anything a React component
   body touches.** React Router only strips server code from `loader`,
   `action`, `middleware`, and `headers` exports — everything else in a
   route module gets bundled for the browser. Pure constants/helpers used by
   both admin UI and server code go in a non-`.server` file (see
   `app/shared/settings.ts`). This has already caused one build failure.

3. **The `_rg` cart line property hides from the buyer-facing cart by
   convention, not guarantee.** The leading underscore is a signal most
   themes (including Dawn) respect, but a theme is free to render it. Never
   claim it's "hidden" without qualifying that it's theme-dependent — see
   the comment block at the top of `app/lib/attribution.ts` and row 15 of
   `SPIKE-A.md`.

4. **Don't duplicate the HMAC/token logic without a drift guard.**
   `scripts/spike-a.mjs` re-implements `signAttribution`/`verifyAttribution`
   so the spike runbook works with no build step. Any script that
   re-implements app logic needs a test like
   `scripts/__tests__/spike-a.test.ts` that runs the script and asserts the
   real app's verifier accepts its output. Never let a second copy of
   security-critical logic go unchecked against the original.

5. **Claim/attribution logic errs toward "looks claimed," never toward
   "looks available."** We shipped one real bug this way: `held` was
   computed as `claimedQty > 0 && remaining > 0`, which made a fully-claimed
   item silently look available again — the exact duplicate-gift failure
   the app exists to prevent. When in doubt, the safer wrong answer is
   "someone might be buying this," not "go ahead."

6. **Inventory tracking on test/demo variants must be explicitly turned
   off**, or checkout will fail with a misleading "already sold out" 422
   that looks like a code bug. Shopify defaults new variants to tracked
   inventory.

## Before building on attribution, run the spike

`SPIKE-A.md` has the full matrix. Don't add new checkout-adjacent features
(ship-to-registrant, quantity>1, discounts) until the relevant row has
passed live and the result is recorded in the doc — not assumed from
reading Shopify's docs.

## Workflow conventions for this project

- **Single continuous session, no subagent role-prompting.** This is a
  solo one-app build; the value has come from one context holding the full
  app + live store state at once (e.g. diagnosing the Shop Pay/inventory/
  webhook issues required cross-referencing code and live admin state
  together). Don't fragment that into separate "reviewer" or "tester"
  personas for a project this size.
- **Pause for human review before**: schema changes, anything touching
  payment/checkout flow, and anything that changes how attribution is
  signed or verified. Small refactors, UI copy, and test additions don't
  need a pause.
- **Ben wants short, direct answers** — plain instructions over
  explanations, options only when there's a real decision to make.

## Known gaps / not-yet-verified

- Spike B2's remaining row (does Shop Pay override a prefilled address with
  the guest's saved one) is blocked on the `bentley.humphries+shopapp@gmail.com`
  test account — sign-in and SMS verification are both failing for that
  account/number. Needs a fresh Shop Pay test account, not a code fix.
- **`addExternalItem()`'s duplicate-add still silently increments** (by
  design — see Resolved below for why this is different from
  `addInternalItem()`).

## Hard rule #8, learned 19 Sep 2026

**A background-job handler only exists in a process that imports the file
that calls `registerHandler()` for it.** `worker.ts` importing
`purchase.server.ts`/`claim.server.ts`/`resolver/index.server.ts`/
`email.server.ts` "for their side effects" is not a curiosity, it's load
bearing — and it means the web process (`npm run dev`, no Redis, jobs run
inline) does **not** automatically get those handlers just because
`worker.ts` has them. This was a real bug: every job of every kind
(`attribute-order` included) silently no-op'd in dev for the entire life of
the project, because nothing in the web app imported those four files.
`queue.server.ts::runJob()` now lazily `import()`s them before running
anything, which fixes this for good — but if a new job type gets a
`registerHandler()` call in a new model file, that file needs to be added to
`ensureHandlersLoaded()`'s import list too, or it'll have exactly this bug
again. `console.warn` on a missing handler looks like a shrug, not an
alarm — don't trust "no error in the logs" as evidence a job ran; check the
database.

## Resolved (kept briefly for history)

- ~~In-store (POS) attribution unverified live~~ — confirmed passing 26 Sep
  2026 (order #1028, cash sale on the registro-dev store). The POS tile's
  `_rg` line property survived into orders/create and credited the registry
  item exactly once. The Purchase row records `source: "online"`, not
  `"pos"`; relabelling it would rely on the order's `source_name`, which
  hasn't been checked in a real payload yet. Getting the tile onto POS needs
  the product published to the Point of Sale channel, and the tile added from
  Point of Sale → POS editor → Add tile → Embedded Apps.
- ~~Hard rule "no affiliate/tracking params on outbound links, ever"~~ —
  deliberately reversed 20 Sep 2026, Ben's explicit call. Giftpin now
  takes a disclosed affiliate commission from launch (see
  `app-store-listing.md`'s pricing section for the disclosure copy: "may
  earn Giftpin a small commission — doesn't change your price"). **Done
  20 Sep 2026:** outbound-link wrapping (`app/lib/affiliate.ts`, wired into
  `registry-page.ts` and `router.server.ts` via `AFFILIATE_LINK_WRAPPER_BASE`)
  and the disclosure text on the registry page whenever it has external
  items; `registry-page.test.ts` now asserts both the wrap and the
  disclosure, replacing the old "adds no affiliate or tracking parameters"
  test. **Still not done:** the env var itself is unset — the wrap is a
  no-op until Ben signs up with a real affiliate network (Sovrn Commerce,
  Skimlinks, Walmart Creator, ...) and its redirect endpoint is set.
- ~~`shopify.app.toml` pinned `api_version = "2025-10"`~~ — aligned to
  `2026-07` on 18 Sep 2026.
- ~~`prisma generate`/migrations never run against this schema~~ — database
  migrated (`20260918213146_init`) on 18 Sep 2026; tables now exist.
- ~~`shopify.app.toml` had zero `[[webhooks.subscriptions]]` blocks~~ — fixed
  19 Sep 2026; see STATUS.md.
- ~~No background job ever ran in dev (see Hard rule #8)~~ — fixed 19 Sep
  2026.
- ~~Row 2 (Shop Pay) not confirmed end to end~~ — confirmed passing 19 Sep
  2026 (order #1021).
- ~~Live end-to-end ship-to-registrant test not yet run~~ — confirmed passing
  19 Sep 2026 (same order, `applied: true`, address-rewrite tag present).
- ~~Embedded admin UI rendered blank~~ — missing root route (`/` never
  redirected to `/app`); fixed 19 Sep 2026 with `app/routes/_index.tsx`.
- ~~`RegistryItem.snapshotImageUrl` Liquid-error bug~~ — fixed 19 Sep 2026;
  see STATUS.md for the root cause (unguarded `image_url` filter on a
  product with no featured image).
- ~~`addInternalItem()` silently bumped quantity on a duplicate add, with no
  way to distinguish an accidental double-add from a deliberate "I want two
  of these"~~ — fixed 19 Sep 2026. Now returns `duplicate: true` and does no
  write; the theme button prompts for an explicit total instead. Tested live
  end to end (see STATUS.md item 7).
- ~~Race condition in `addInternalItem()`/`addExternalItem()`/`addManualItem()`
  (two near-simultaneous adds both passing a `findFirst` check before either
  write lands)~~ — fixed 19 Sep 2026, at Ben's explicit go-ahead (schema
  change). `@@unique([registryId, variantGid])` and
  `@@unique([registryId, externalUrl])` added to `RegistryItem` — applied
  directly to the live DB via a tested Neon branch migration (device shell
  still down), with a matching file dropped into `prisma/migrations/` so
  Prisma's own history stays in sync. All three add functions now do their
  `create` inside a try/catch for the resulting `P2002` conflict: the loser
  of a real race re-fetches the winner's row and returns it, the same way
  the non-race duplicate path already worked. `addInternalItem()` reports
  `duplicate: true` (no write) on a race, matching its non-race behavior;
  `addExternalItem()`/`addManualItem()` fall back to incrementing the
  winner's row, matching *their* non-race behavior — each function's race
  path now mirrors its own non-race path, nothing new to remember. Verified
  live: the constraint rejects a real duplicate insert (tested on a
  temporary Neon branch before merging), and normal add/duplicate/confirm
  flows through the app still work post-migration.
- ~~Browser extension's Amazon image/price import failed silently ("No
  photo")~~ — fixed 19 Sep 2026. Amazon's real product pages ship none of
  the standard `og:*`/JSON-LD/`product:price:*` tags the generic
  `extractProductMetadata()` in `browser-extension/popup.js` relied on
  (confirmed live: zero matches on a real product page) — presumably
  deliberate anti-scraping. Added an Amazon-specific DOM fallback
  (`#landingImage`'s `data-old-hires`, `.a-price .a-offscreen` parsed for
  amount + host-inferred currency), nested inside the same function since
  it's serialized standalone into the page. Verified live against the
  originally-failing product page. Not yet extended to other target sites.
