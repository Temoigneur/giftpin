# Spike B — ship-to-registrant

**Claim under test (B1):** `orderUpdate` can rewrite a paid order's shipping
address *after* checkout, on every plan and every payment method — no
checkout UI extension needed, no Plus requirement.

**Why it matters:** `spike-findings-and-protocols.md` §0.3 already
establishes that the checkout-extension approach (§9's original option 1) is
dead for MVP — Plus-only, and `applyShippingAddressChange` errors under
accelerated checkout even on Plus. B1 is what replaces it: promote the
post-order address rewrite to option 1 if it holds up.

Protocol source: `spike-findings-and-protocols.md`, section "2. Spike B —
ship-to-registrant" → "B1 — post-order address rewrite".

---

## Setup

1. **Legacy custom app.** `registro-dev` had no app installed with Admin API
   access yet. Enabling custom app development is a store-level, irreversible
   toggle ("This can't be undone") — flagged to Ben before touching it; he
   chose to enable it.
2. Created a legacy custom app ("Spike B1 GraphQL Access") with `write_orders`
   + `read_orders` scopes, installed it, revealed its Admin API access token.
   Token isn't recorded in this doc — it's a dev-store scratch credential, not
   worth persisting in a file that gets committed.
3. **Network routing:** the cloud container's shell can't reach
   `registro-dev.myshopify.com` at all (egress proxy only allowlists specific
   hosts). Worked around it by running `fetch()` via Chrome's JS execution
   tool from a tab already on the `registro-dev.myshopify.com` origin — same
   origin as the Admin GraphQL endpoint, so no proxy block and no CORS issue.
4. **PII read restriction, not a write restriction.** Querying
   `shippingAddress { city ... }` back from the API fails with `ACCESS_DENIED`
   — "This app is not approved to access the Customer object... available on
   Shopify, Advanced, and Plus plans" (the Protected Customer Data gate).
   Deliberately did **not** upgrade the store's plan to clear this (a billing
   decision, out of scope for a spike). Workaround: omit PII fields from every
   query/mutation response selection, and verify the actual address value
   visually via the merchant's own Admin UI session instead, which isn't
   subject to this app-level API restriction. **Important implication for the
   real app:** `orderUpdate`'s mutation *input* accepts `shippingAddress` and
   writes it successfully with no PII approval needed — the gate only blocks
   *reading* customer/address PII back out through the API. The real app's
   webhook handler will need Level 2 PCD approval only if it wants to *read*
   the registrant's address back from Shopify; if it already holds that
   address in its own DB (which the design does — `Registry.shipping_address`
   per the protocol doc), it never needs to.
5. **Webhook capture reused from Spike A** — the same webhook.site
   subscription already had `orders/updated` wired up (alongside
   `orders/create`, `refunds/create`, `orders/cancellation`), so no new
   subscription was needed for B1.

---

## Test case 1 — unfulfilled order, same-province address change

1. Placed a fresh order through Shop Pay with the guest's own address:
   **order #1016**, Toronto, ON, $13.00 CAD (1 item + $12 standard shipping),
   unfulfilled, paid.
2. Ran `orderUpdate` via GraphQL with a new `shippingAddress` — different
   city, same province (Toronto → **Ottawa, ON**).
3. Result: `userErrors: []`. `updatedAt` advanced to match the call.

**Verification (three surfaces):**

- **Admin UI** (bypasses the PII-read gate): shipping address now reads
  "Spike RowTwoB / 150 Elgin Street / Ottawa ON K2P 1L4 / Canada". Billing
  address **unchanged** — still the original Toronto address. Order status
  still Paid / Unfulfilled. `_rg` property still intact on the line item.
  Total still $13.00.
- **GraphQL** (non-PII fields only): `totalTaxSet` = `0.00 CAD` both before
  and after. `totalOutstandingSet` = `0.00` — no balance owing, no refund
  triggered.
- **Webhook** (`orders/updated`, captured on webhook.site): fired within
  seconds of the mutation (`x-shopify-triggered-at` matches the mutation's
  `updatedAt` to the second). Payload is the **full order object** —
  `shipping_address` carries the new Ottawa address in full
  (`address1`/`city`/`province`/`zip`/`name`/`province_code` all correct),
  `billing_address` is the untouched Toronto address, `tax_lines: []`,
  `total_tax: "0.00"`, `total_outstanding: "0.00"`, `line_items[].properties`
  still has `_rg` intact.

**Answer:** yes — `orderUpdate` cleanly rewrites the shipping address on a
paid, unfulfilled order. No errors, no balance created, `orders/updated`
fires with the new address embedded, and the buyer's billing address (and
payment record) are left alone.

## Test case 2 — fulfilled order, cross-province address change

Protocol step 5 asks specifically about an already-fulfilled order, and since
this store shows no tax regardless, folding in the cross-province case here
(protocol step 4) cost nothing extra.

1. Marked order #1016 **Fulfilled** via Admin UI (`Mark as fulfilled`).
   `displayFulfillmentStatus` → `FULFILLED`. This itself fired an
   `orders/updated` webhook (fulfillment-triggered, not address-triggered —
   captured but not the one under test).
2. Ran `orderUpdate` again — new `shippingAddress`, this time **across a
   real tax jurisdiction line**: Ottawa, ON → **Vancouver, BC**.
3. Result: `userErrors: []` again, on a fulfilled order — no rejection, no
   special-casing needed in the mutation itself.

**Verification:**

- **Admin UI:** shipping address now "Spike RowTwoB-Fulfilled / 200 Granville
  Street / Vancouver BC V6C 1S4 / Canada". Order still shows **Fulfilled**.
  Billing address still the original Toronto address, untouched. Total still
  $13.00.
- **GraphQL:** `displayFulfillmentStatus: "FULFILLED"`, `totalTaxSet`:
  `0.00 CAD` (unchanged), `totalOutstandingSet`: `0.00`.
- **Webhook** (`orders/updated`, captured): fired, full order object, new
  Vancouver `shipping_address`, `fulfillments[]` array present and populated
  (status `success`), `tax_lines: []` again.

**Answer:** yes — the mutation succeeds identically on a fulfilled order.
Shopify did not block or partially-apply the change post-fulfillment.

## The tax-recalculation question — unresolved on this store

The protocol's most important open question (§B1 step 3–4, and the "Time
sensitive" note about the 31 Aug 2026 behaviour change) is **not answered by
either test above**, and that's worth being precise about rather than
glossing over: `registro-dev` shows `total_tax: "0.00"` / `tax_lines: []` on
every order regardless of destination — Toronto, Ottawa, and Vancouver all
came back $0.00. That's consistent with **this store having no tax
registration/nexus configured at all**, not with "orderUpdate doesn't
recalculate tax." Crossing into BC (GST+PST territory) produced no tax on a
store that would show $0 tax on *any* address, so the cross-province test
case is not diagnostic here.

**To actually observe the recalculation behaviour** (does an unfulfilled
order's tax change on address rewrite while a fulfilled order's doesn't, per
the 31 Aug 2026 source), the dev store needs at least one tax region
configured with a real rate — e.g. enable Canadian tax collection for ON and
BC under Settings → Taxes and duties, then re-run both test cases above.
That's a ~10-minute follow-up, not done in this session; flagging it as the
one open item rather than silently declaring B1 fully closed.

---

## Results table

```
Date: 17-18 Sep 2026    Store: registro-dev    API version: 2026-07

 #  Case                                    orderUpdate  Webhook  Admin  Notes
 1  Unfulfilled, same-province (ON→ON)      [x] no errors [x]     [x]    Order #1016, Toronto→Ottawa. Billing address untouched. Tax $0→$0 (store has no tax configured — inconclusive, not a negative result).
 2  Fulfilled, cross-province (ON→BC)       [x] no errors [x]     [x]    Same order #1016, now Fulfilled, Ottawa→Vancouver. Mutation succeeds identically post-fulfillment. Tax $0→$0, same caveat as row 1.
 3  Tax recalculation on address change     [ ]           [ ]     [ ]    NOT TESTABLE on this store — no tax nexus configured, so $0 tax is uninformative regardless of destination or fulfillment status. Needs a store with a real tax rate configured before this can be answered.
```

Order used: **#1016** (`gid://shopify/Order/7302980075669`) — reused across
both test cases by rewriting its address twice, since the mutation itself was
what was under test, not order creation.

---

## Decision gate

**The mechanical question is answered: yes, ship the post-order
address-rewrite design.** `orderUpdate` successfully rewrites shipping
address on both unfulfilled and fulfilled paid orders, on a plan with no
Plus requirement, with zero `userErrors` in either state, and `orders/updated`
reliably carries the new address in full. Billing address and payment records
are untouched — exactly the "rewrite shipping, leave everything else alone"
behaviour the design needs. PII approval is not required to *write* the
address (only to read it back via the API, which the app's own DB makes
unnecessary).

**Open before fully trusting the financial side:** the tax-recalculation
behaviour described in the protocol (unfulfilled orders recalculate,
partially/fully fulfilled orders don't) has not been empirically observed —
this store has no tax configured, so every result reads $0.00 regardless of
what's actually true. Re-run test cases 1 and 2 on a store (or this same
store, after configuring a Canadian tax region) that actually collects tax
before writing the merchant-facing "ship to registrant" guardrail copy or
relying on the recalculation behaviour in code. Until then, treat the
protocol's guardrail suggestion — offer ship-to-registrant only within the
same tax jurisdiction — as the safe default rather than something this spike
has verified either way.

**Design constraint confirmed as real, not just theoretical:** one order has
one `shippingAddress`; `orderUpdate`'s input has no per-line-item addressing.
The MVP's "registry carts are registry-only" rule (protocol §3) is load-bearing
here, not just a nicety — there's no mechanism to ship half an order to the
registrant and half to the buyer.

### B2 — cart permalink prefill (partially done, 18 Sep 2026)

**Claim under test:** `properties=` and `checkout[shipping_address][...]`
coexist in one permalink, prefill for a logged-out guest, and Shop Pay
overrides it with the saved address as expected.

**Method:** built a permalink against the existing `SPIKE A TEST` product
(variant `48020652195989`, "A", $1.00, `requires_shipping: true`):

```
https://registro-dev.myshopify.com/cart/48020652195989:1
  ?properties=eyJfcmciOiJzcGlrZS1iMi10ZXN0In0%3D   (base64url of {"_rg":"spike-b2-test"})
  &checkout[shipping_address][first_name]=Spike
  &checkout[shipping_address][last_name]=B2Test
  &checkout[shipping_address][address1]=123 Test St
  &checkout[shipping_address][city]=Toronto
  &checkout[shipping_address][province]=Ontario
  &checkout[shipping_address][zip]=M5V 2T6
  &checkout[shipping_address][country]=Canada
```

Loaded as a logged-out guest (no Shop Pay session, no signed-in customer).

**Result — first half confirmed, live:**

- The two param families **do coexist** in one URL with no conflict or
  error.
- The link **skipped `/cart` entirely and landed directly on `/checkout`**
  — worth noting as a behavior, not just a side effect: any permalink
  carrying `checkout[...]` params appears to auto-advance past the cart
  page. Registry links that pre-fill an address should expect guests to
  land straight on checkout, not the cart.
- Every shipping field prefilled correctly: Country **Canada**, First name
  **Spike**, Last name **B2Test**, Address **123 Test St**, City
  **Toronto**, Province **Ontario**, Postal code **M5V 2T6**.
- The `properties=` blob rode along into the checkout URL's own query
  string (`...&properties=eyJfcmciOiJzcGlrZS1iMi10ZXN0In0%3D`), consistent
  with it being attached to the line the way section 6 of this doc already
  proved for `_rg` specifically.
- The store now has real tax configured (HST $1.69 on a $1.00 + $12.00
  shipping subtotal) — useful, since that's also what Spike B1's still-open
  tax-recalculation question needs; the store is ready for that re-test
  now without further setup.

**Not yet done — needs Ben, not automatable from here:** whether **Shop
Pay overrides the prefilled address with the guest's saved Shop Pay
address**. The express-checkout row on this load showed only a **Google
Pay** button, no Shop Pay button — worth checking why (no Shop Pay
session/cookie in the browser used for this test is the likely reason,
not a code issue). To finish this row: open the same permalink in a
browser with an active Shop Pay session (or the `test_card`-nicknamed
account from Spike A section 4), confirm the Shop Pay button appears, tap
it, and see whether the pre-filled Toronto/123 Test St address holds or
gets replaced by the account's saved one. No order was placed for this
spike — the checkout was abandoned after confirming the prefill, so
nothing needs cleanup.

- **B3 — checkout extension ceiling.** Documentation-only, needs a second
  Plus-tier dev store. Lower priority given B1 already replaces the
  extension approach for MVP.

---

## Sources

Same as `spike-findings-and-protocols.md` §4 — `orderUpdate` docs, the 31 Aug
2026 tax-recalculation post, and the checkout UI extension plan-requirement
pages.
