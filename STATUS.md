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
