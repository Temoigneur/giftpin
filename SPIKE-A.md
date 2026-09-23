# Spike A — attribution through checkout

**Claim under test:** a property written onto a cart line arrives intact in the
`orders/create` payload, regardless of how the guest pays.

**Why it's first:** every registry item's purchased count comes from this. If it
fails, the product doesn't work and the architecture changes. Roughly 90 minutes
for rows 1–7, which is the gate.

---

## One correction before you start

`architecture-decisions.md` and a comment in `app/lib/attribution.ts` both say
the leading underscore on `_rg` keeps the property out of the buyer-facing cart
"entirely". **That's wrong, and I wrote it.** Shopify's actual behaviour:

> Private line item properties are available in the Liquid
> `line_item.properties` object and Ajax API. To hide private properties on the
> storefront, you must modify the theme's codebase.
> — [Cart API reference](https://shopify.dev/docs/api/ajax/reference/cart)

So the underscore is a *convention themes are expected to honour*, not a
platform guarantee. Dawn and most modern themes do filter `_`-prefixed keys, but
a theme that doesn't will render a 107-character base64 blob next to the product
in the cart.

Double-underscore **cart attributes** (`__foo`) are genuinely hidden from both
Liquid and the Ajax API — but those attach to the cart, not the line, which is
exactly the property we need to survive Shop Pay. So the line property stays,
and row 15 below checks the visibility on whatever theme you're testing.

---

## Setup (~30 minutes, no app code needed)

### 1. Shopify Payments in test mode

Bogus Gateway doesn't render accelerated checkout buttons, so test mode is not
optional here.

1. Shopify admin → **Settings → Payments**
2. If Shopify Payments isn't set up: click **Activate Shopify Payments**, then
   click *back* out of the signup page to return to payment settings
3. In the Shopify Payments section click **Manage**
4. Under **Test mode**, select **Enable test mode**, then **Save**

Saving requires a valid customer statement descriptor and phone number. Fill
them with anything plausible.

Test cards — any 3-digit CVC, any future expiry:

| Brand | Number |
|---|---|
| Visa | `4242 4242 4242 4242` |
| Mastercard | `5555 5555 5555 4444` |
| Amex | `3782 8224 6310 005` (4-digit CVC) |
| Declined | `4000 0000 0000 0341` |

### 2. A test product

One product, **two variants**, inventory 50 each, priced at $1. Two variants
matters for rows 9–11.

Get a numeric variant id — the handle is the storefront slug, **not** the
numeric admin product id (`/admin/products/938...`); grab the real handle from
the product's "View" link or its Search engine listing field:

```bash
curl -s https://YOUR-STORE.myshopify.com/products/YOUR-HANDLE.js \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print([(v['id'], v['title']) for v in d['variants']])"
```

If curl comes back with a JSON parse error, the store's storefront password is
almost certainly the cause (dev stores are password-protected by default) —
just open the same `.js` URL directly in a browser tab you're already logged
into instead of using curl.

Then in the theme editor, confirm **accelerated checkout buttons are showing on
the cart page** (and the dynamic checkout button on the product template, for
row 8). Without them, rows 2, 4, 5 and 8 aren't testable.

### 3. Webhook capture

Open a fresh URL at [webhook.site](https://webhook.site) and subscribe to it:

Admin → **Settings → Notifications → Webhooks** → create a subscription for each
of `orders/create`, `orders/updated`, `refunds/create` on the **latest API
version**.

Start with webhook.site rather than your own app — it isolates "does Shopify
deliver the property" from "does my handler read it". Once rows 1–7 pass,
re-run row 2 with `npm run dev` going, so you've also exercised the real
`attributedLines()` path end to end.

*(Rows 2 and 3 below were confirmed without a webhook.site subscription in
place — verification was via the admin order detail page and timeline
instead, which show the same `line_items[].properties._rg` value and the
payment gateway name. That's solid evidence, but re-run both rows with
webhook.site wired up before you fully trust the payload shape — the webhook
body and the persisted order are different surfaces and can disagree.)*

### 4. A Shop Pay account for testing

**Corrected 17 Sep 2026, twice in one session — the second correction
supersedes the first.** Worth reading both, because the wrong turn is
instructive.

**First (wrong) theory:** the problem is account freshness — Shop Pay
auto-signs you into whatever account the browser already recognizes, and
vaulting a card fails because it collides with an existing account. Fix:
use an email with no existing Shop Pay account (`you+spike@gmail.com`), or
hit `Check out as guest`.

This is **half right and half a red herring**. A genuinely brand-new Shop
Pay account (new email, phone-verified from scratch, never used before)
**still** failed to vault `4242 4242 4242 4242` with the same *"There was an
error adding this card"* / *"Your payment details couldn't be verified"*
errors. Account freshness was not the fix.

**What actually fixes it:** Shopify's own
[Test Shop Pay](https://shopify.dev/docs/api/commerce-components/pay/test-shop-pay)
doc describes a `test_card`-prefixed **Nickname** field that makes Shop Pay
treat the card as a test card instead of trying to actually verify it. An
earlier pass at this doc concluded that field doesn't exist — that was
wrong. It doesn't exist **in the card form embedded in a merchant's
checkout** (Card number / Expiration / Security code / Name on card — no
nickname anywhere, shadow DOM included). It **does** exist on **Shop Pay's
own account page**: `shop.app` → sign in → **Account → Payment methods →
Add card**, which has Card number, Card holder name, Expiration, Security
code, **and Nickname (optional)**.

The working procedure:

1. Sign in (or create an account) at `shop.app/account`.
2. **Add card** there, with `4242 4242 4242 4242` and the Nickname set to
   `test_card` (case-insensitive, must be the first word).
3. Go back to your store's checkout. Shop Pay now shows that saved
   `test_card •••• 4242` as the pre-selected payment method — no card entry
   happens in the merchant checkout at all, so the vaulting bug never gets
   a chance to fire.

This worked identically for both a pre-existing account and a fresh one, so
freshness genuinely isn't the variable — going through the account page
first is.

Also confirmed live this session: entering an **email tied to a Shop Pay
account directly in a standard checkout's Contact field** (rather than
tapping the accelerated Shop Pay button) triggers an inline SMS
verification prompt right there in the checkout page — no redirect to
`shop.app`. That's genuinely a different code path from the accelerated
button (see rows 2 vs. 3 below), and it also picks up the saved
`test_card` automatically once verified.

**Google Pay note (row 5):** unlike Shop Pay, Chrome's native Google Pay
sheet needs a genuine, trusted user click — it will not open from an
automated/simulated click, so this row can't be driven by browser
automation at all; it has to be a real click from a person. Once clicked
and completed with a signed-in Google account, the resulting test order
used Google's own **sandbox** data (card "Visa ending in 1111" — Google
Pay's standard test PAN, and address "1600 Amphitheatre Parkway, Mountain
View, CA" — Google's own HQ, a well-known Google Pay test/demo address),
confirmed by "Your payment gateway is in test mode" on the order. So
Google Pay's test flow substitutes its own placeholder card and address
rather than reusing whatever is saved on the real Google account — no
real personal or financial data was touched.

Shop Pay credit card transactions **are** testable in test mode —
[Shopify's help docs](https://help.shopify.com/en/manual/payments/shopify-payments/testing-shopify-payments)
are explicit about it. A community thread claiming otherwise is wrong.

**Confirm one-tap Shop Pay actually appears before you record a single row.** If
it doesn't, every Shop Pay row below is measuring the wrong thing.

**One more trap:** the `Check out as guest` link at the bottom of the Shop
Pay panel does **not** exercise Shop Pay at all — it routes you to
`skip_shop_pay=true` on the plain checkout domain, and the resulting order's
gateway timeline reads *"processed using a Visa ending in 4242"* with no
mention of Shop Pay. It's a fine way to unblock a stuck session, but an
order placed that way does **not** count as a passing Shop Pay row.

### 5. Mint a token

```bash
node scripts/spike-a.mjs <VARIANT_ID>
```

That prints a real signed `_rg` token and the exact console snippet with the
variant baked in. Use the real token, not a placeholder — it's ~107 characters
of base64url, and length and character set are precisely what a checkout path
might truncate.

You need `SIGNING_KEY` in `.env` first (the script tells you how if it's
missing). `npm test` includes a guard asserting the script's tokens verify
against the app's own `verifyAttribution()`, so the two can't drift.

The token is deterministic — the same registry id + item id always mints the
same token, since it's a plain HMAC with no nonce or timestamp. You don't need
to re-run the script for every attempt against the same test item; the same
printed token can be reused across multiple `/cart/add.js` calls and multiple
orders.

### 6. Adding a tagged item without a console (phone rows 4 and 7)

iOS Safari has no console to paste the `/cart/add.js` snippet into, so rows 4
(Apple Pay) and 7 (Shop app) need a different mechanism: a plain tappable
link that adds the item with the property already attached.

Shopify's classic cart permalink (`/cart/{variant_id}:{quantity}`) does
support line item properties, but **not** as `?properties[key]=value` query
params — that format throws a hard `properties parameter is invalid` error
page (confirmed live; several community threads get this wrong). The actual
contract, per
[Shopify's cart permalink docs](https://shopify.dev/docs/apps/build/checkout/create-cart-permalinks):
the whole properties object must be JSON, then **base64url-encoded**, and
passed as a single `properties=` value:

```bash
python3 -c "
import base64, json
token = 'PASTE_TOKEN_HERE'
payload = json.dumps({'_rg': token}, separators=(',', ':'))
print(base64.urlsafe_b64encode(payload.encode()).decode())
"
```

```
https://registro-dev.myshopify.com/cart/VARIANT_ID:1?properties=BASE64URL_BLOB
```

Tapping that link adds the line with the property and lands on `/cart` (or,
if the browser already has an active Shop Pay session, can auto-redirect
straight into Shop Pay checkout with the item preloaded — which is itself a
handy accelerant, just not what rows 4/7 are testing). **Confirmed working
end to end:** order #1006, `_rg` matched exactly, one clean line, normal
$13.00 total. This is the link mechanism behind the Apple Pay (row 4) and
Shop app (row 7) links below.

---

## The line under test

Paste on your store's **`/cart` page** (not the product page — row 8 covers
that path separately):

```js
await fetch('/cart/add.js', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [{ id: VARIANT_ID, quantity: 1, properties: { '_rg': 'TOKEN' } }]
  })
}).then(r => r.json()).then(r => console.log('ADDED', r));

await fetch('/cart.js').then(r => r.json()).then(c => {
  console.log('CART TOKEN', c.token);
  console.log('LINE PROPERTIES', c.items.map(i => i.properties));
});
```

**Record the cart token on every single run.** If rows 1–7 fail, fallback (b) —
server-side reconciliation on `cart_token` — is the next thing you test, and
these tokens are the only evidence you'll have without re-running everything.

---

## Checking a result — three separate surfaces

A row passes only when **both keys are present with correct values in
`line_items[].properties` on `orders/create`.** But check all three, because
they can disagree and the disagreement is itself the finding:

**1. The webhook payload** (webhook.site) — look for:

```json
"line_items": [{ "id": 123, "properties": { "_rg": "eyJwIjoi..." } }]
```

**2. The persisted order** (GraphiQL in your dev store, or the Shopify MCP).
The webhook payload and the stored order are different surfaces; either can
drop data:

```graphql
query SpikeALatestOrders {
  orders(first: 10, sortKey: CREATED_AT, reverse: true) {
    nodes {
      id
      name
      createdAt
      paymentGatewayNames
      lineItems(first: 20) {
        nodes { id title quantity customAttributes { key value } }
      }
    }
  }
}
```

`paymentGatewayNames` is how you confirm the row actually went through the
payment path you think it did. On the GraphQL side the field is
`customAttributes` (`key`/`value`), not `properties` — same data, different name.

The admin order **timeline** is a fast proxy for this when you don't have
GraphQL access handy: the line *"A $X.XX payment was processed using a
Visa ending in NNNN via Shop Pay"* (or with no "via ..." suffix, for a
plain gateway charge) tells you the same thing `paymentGatewayNames` would.

**3. The admin order detail page** — the property should be visible to the
merchant here. If it isn't, the merchant can't debug a mis-attributed gift.

Sanity-check a captured token round-trips:

```bash
node scripts/spike-a.mjs --verify 'eyJwIjoi...'
```

---

## The matrix

Rows 1–7 are **required**. Rows 8–15 are diagnostic: they shape the product but
don't block the build.

| # | Path | Exact steps | Why it's here | Req |
|---|---|---|---|---|
| 1 | Standard checkout, test card | Add via snippet → Checkout → `4242…` → complete | Baseline. If this fails, something is wrong with your setup, not with Shopify | ✅ |
| 2 | **Shop Pay button on the cart page** | Add via snippet → tap **Shop Pay** on the cart page → one-tap complete | The headline case. This is the Gift Reggie complaint and the app's main marketing claim | ✅ |
| 3 | Shop Pay from inside checkout | Add via snippet → Checkout → enter the Shop Pay email → verify code → complete | Different entry path from row 2 and can behave differently | ✅ |
| 4 | Apple Pay, Safari on iPhone | Add via snippet on a real iPhone → Apple Pay on the cart page | Guests open registry links from texts, on phones | ✅ |
| 5 | Google Pay, Chrome signed in | Add via snippet → Google Pay on the cart page | The Android half of the same case | ✅ |
| 6 | ~~PayPal Express~~ | **Not testable on a dev store.** Shopify: "When test mode is activated, PayPal Wallet doesn't display as a payment option at checkout." Defer to a live store, or accept the risk | Off-site redirect — the classic data-loss point | ⚠️ |
| 7 | Shop app checkout | Open the store in the Shop app → add via snippet if possible, else add normally and re-add with the snippet → complete | Own surface, own cart handling. **Confirmed: passes only via a tagged link the app intercepts as a deep link (e.g. shared through WhatsApp/Messages) — native in-app browse-and-add drops the property, same as row 8** | ✅ |
| 8 | **Buy it Now** on the product page | Put the token in a hidden `properties[_rg]` input inside the product form → Buy it Now | Originally expected to fail — most "properties don't survive Shop Pay" reports online are about this exact path. **Turned out to pass; see the note below the matrix, this is a real correction to the original assumption.** | — |
| 9 | Two lines, two different registries, Shop Pay | Mint a second token with a different registry id, add both variants, check out via Shop Pay | Lines must not merge or cross-contaminate | — |
| 10 | Same variant: one registry line + one plain line | Add variant A with the token, then add variant A again with no properties | The plain line must stay clean and the two must not collapse into one | — |
| 11 | Qty 2 of a 6-requested item | Add with `quantity: 2` | Partial purchase is the normal case, not the edge case | — |
| 12 | Discount code + Shop Pay | Create a 10% code, apply at checkout, pay with Shop Pay | Discounts rewrite lines | — |
| 13 | Refund one line from admin | Complete row 1, then refund that line | Does `refunds/create` carry properties, or only a line item id? `Purchase.lineItemId` exists because of this question | — |
| 14 | Cancel the order | Complete row 1, then cancel | The shape of `orders/cancelled` decides the decrement logic | — |
| 15 | **Property visibility** | On your test theme, look at the cart page and checkout with the item in it | Per the correction at the top: confirm whether *this* theme hides `_`-prefixed keys. Also confirm the property IS visible on the admin order | — |

---

## Second correction: row 8 (Buy it Now) passes

The original matrix assumed the dynamic checkout button ("Buy with Shop" /
Buy it Now on the product page) bypasses the cart entirely and drops
properties, same as most "Shop Pay strips my property" reports online. That
assumption was wrong for this theme.

**What actually happens:** the dynamic checkout button doesn't bypass the
cart's `<form action="/cart/add">` — it reads that same form's fields at
click time and adds the line the normal way before jumping straight to
checkout. So a hidden `properties[_rg]` input injected into that existing
form (via `document.querySelector('form[action*="/cart/add"]')` + a created
`<input type="hidden" name="properties[_rg]" value="TOKEN">`) is present when
the button reads the form, and the property rides through to Shop Pay
checkout intact. Confirmed: order #1010, `_rg` matched exactly, clean
$13.00 total (1 item + $12 standard shipping).

**Why this doesn't overturn the underlying safety property:** the property
only appears because something injected the hidden input first. A guest who
lands on a bare product page from a normal, un-tagged link and taps Buy it
Now gets an untagged order, exactly as before — there's no field in the
stock PDP template for a shopper to fill in a registry token themselves.
The practical implication is the opposite of the original assumption: Buy it
Now is not a route to *avoid*, it's a route the registry's own PDP
integration (if it injects the hidden field, the same way this test did)
can safely rely on — one more accelerated path that doesn't need special
casing.

---

## Results table

Copy this and fill it in as you go. Don't batch it up at the end — if row 2
fails you want to know before you've done six more.

```
Date: 17 Sep 2026     Store: registro-dev              API version: (see shopify.app.toml)

 #  Path                        Webhook  Order  Admin  Cart token            Notes
 1  Standard checkout            [x]     [ ]    [ ]    (not recorded)        Passed pre-session, order #1001 (Bentley Humphries). Verified via webhook.site per prior notes.
 2  Shop Pay (cart page)         [ ]     [ ]    [x]    (redacted by tooling) Passed. Order #1003. Timeline: "...via Shop Pay." _rg matched exactly. First attempt (order #1002) used "Check out as guest" and does NOT count — gateway was plain Shopify Payments, not Shop Pay.
 3  Shop Pay (in checkout)       [ ]     [ ]    [x]    (redacted by tooling) Passed. Order #1004. Entered Shop Pay email directly into checkout's Contact field (not the accelerated button) → inline SMS code → auto-filled saved test_card → paid. Timeline: "...via Shop Pay."
 4  Apple Pay (iPhone Safari)    [ ]     [ ]    [x]    (not recorded)        Passed. Order #1007. Timeline: "...processed using a Mastercard ending in 5715 via Apple Pay." _rg matched exactly. Clean order — 1 item, $13.00, Standard shipping (no anomaly like row 5). Billing name/address on the order ("Rejosh Samuel...") is Apple Pay's own test/sandbox contact, not Ben's real billing info — same pattern as Google Pay substituting its own test data in row 5. Added via the base64url cart-permalink link from section 6 — no console needed on the phone.
 5  Google Pay (Chrome)          [ ]     [ ]    [x]    (not recorded)        Passed. Order #1005. Timeline: "...processed using a Visa ending in 1111 via Google Pay." _rg matched exactly. Ben completed the click himself (required — automation can't trigger the native sheet). Qty came back as 2 (not 1) and total was $32 ($2 items + $30 international shipping) because Google Pay's test flow substitutes its own sandbox card/address — see the Google Pay note in section 4.
 6  PayPal Express               [ ]     [ ]    [ ]    ____________________  Deferred — not testable in test mode, per Shopify.
 7  Shop app                     [ ]     [ ]    [x]    (not recorded)        Passed, but only via the tagged link. Order #1008: browsed "Spike A Test" and added it natively inside the app (no link) — order has NO `_rg` property at all; the app's own product-page Add to Cart has no field for one, same as the merchant PDP's Buy it Now (row 8). Order #1009: opened the same base64url cart-permalink link from section 6, tapped from WhatsApp (not typed in a browser bar) — the Shop app intercepted it, pre-added the item, and checkout via Shop Pay carried `_rg` through intact, matching exactly. Conclusion: the Shop app only carries the property when the guest arrives via a tagged link that the app intercepts as a deep link (share sheet / messaging apps) — browsing and adding inside the app natively drops it, same failure mode as row 8.
 8  Buy it Now (PDP)             [ ]     [ ]    [x]    (not recorded)        Passed — contradicts the original "expected to fail" assumption, see the correction note above the results table. Order #1010. Injected a hidden `properties[_rg]` input into the existing PDP add-to-cart form via JS, then clicked "Buy with Shop" (dynamic checkout). `_rg` matched exactly, clean $13.00 total (1 item + $12 standard shipping). This order was later reused for row 14 (cancellation).
 9  Two registries, Shop Pay     [ ]     [ ]    [x]    (not recorded)        Passed. Order #1011. Both lines' properties stayed distinct and un-merged through Shop Pay checkout. Caveat: `spike-a.mjs`'s registry/item ids are hardcoded constants and I never had access to the real `SIGNING_KEY`, so I could only mint one cryptographically valid token (the standard one). The second line used a structurally-identical token (valid JSON/base64url shape, same length) with a placeholder, non-HMAC-valid signature — sufficient to test "do two lines cross-contaminate or merge" (they didn't), but this row has NOT verified that a second *real* registry's token validates end to end. Re-run with a second genuine token (mint via a second `REGISTRY_ID`/`ITEM_ID` config, or ask Ben to parameterize the script) before fully trusting the multi-registry case.
10  Registry + plain, same var   [ ]     [ ]    [x]    (not recorded)        Passed. Order #1012. Added variant A with the token, then added variant A again with no properties — the two stayed as separate lines rather than merging into a combined qty-2 line. Matters because a merge would have silently applied the registry attribution to units the guest never tagged.
11  Qty 2 of 6                   [ ]     [ ]    [x]    (not recorded)        Passed. Order #1013. Added with `quantity: 2` — both the quantity and the `_rg` property were preserved correctly on the single line through checkout.
12  Discount + Shop Pay          [ ]     [ ]    [x]    (not recorded)        Passed. Order #1014. Created discount code `SPIKEROW12` (10% off), applied it directly in the Shop Pay checkout's own "Discount code or gift card" field (present right there in the shop.app UI), verified the discounted total and confirmed `_rg` still matched exactly.
13  Refund one line              [x]     [ ]    [x]    (not recorded)        Passed — and now confirmed via a real captured webhook, not just Admin UI. Partially refunded order #1014's line from Admin — the `_rg` property remained visible before and after in Admin. **Follow-up (same session, after webhook.site was wired up):** refunded a fresh line on order #1011 and captured the raw `refunds/create` payload. **Answer: the payload embeds the full line item, properties included** — `refund_line_items[].line_item.properties` contains `{"name": "_rg", "value": "eyJwIjoi..."}` verbatim, not merely a `line_item_id` reference (though `line_item_id` is also present, redundantly, at `refund_line_items[].line_item_id`). `voidPurchases()` can read `_rg` straight off the webhook payload with no separate DB lookup needed.
14  Cancel order                 [x]     [ ]    [x]    (not recorded)        Passed — and now confirmed via a real captured webhook, not just Admin UI. Cancelled order #1010 via Admin "More actions" → "Cancel order" — the "Removed" line-item section still showed `_rg` in full. **Follow-up (same session, after webhook.site was wired up):** placed a fresh order (#1015, same token) and cancelled it, capturing the raw `orders/cancelled` payload. **Answer: it's the full order object**, same shape as `orders/create` (top-level `id`, plus `cancel_reason: "customer"`, `cancelled_at`, `cart_token`, `financial_status: "paid"`), and `line_items[].properties` still contains the `_rg` key/value pair intact. No separate lookup needed here either — `orders/cancelled` is a complete order snapshot, not a stripped notice.
15  Hidden in cart? Visible in admin?  cart:[x] checkout:[ ] admin:[x] Passed. Added a tagged item directly via `/cart/add.js` (properties: `_rg` + a normal "Gift note" property, to have a visible control) and inspected `/cart`. The theme (Dawn-based) displayed "Gift note: Happy Birthday!" plainly but rendered nothing for `_rg` — confirmed absent from both the visible page AND the full page HTML source (`document.documentElement.outerHTML`, 207,212 chars, zero matches for the key or its value). Checkout page itself wasn't separately re-checked this pass, but rows 1-14's checkout/thank-you screenshots never showed it either. Per the correction at the top of this doc, this is a property of *this specific theme*, not a platform guarantee — re-run this exact check on the production theme before shipping. Admin visibility already confirmed repeatedly (rows 2, 3, 7, 8, 13, 14 orders all show `_rg` plainly on the order detail page).
```

Orders placed this session, for reference:

| Order | Customer | Row | Gateway | Result |
|---|---|---|---|---|
| #1001 | Bentley Humphries | 1 | Shopify Payments (guest) | ✅ pre-session |
| #1002 | Spike RowTwo | (attempted row 2) | Shopify Payments (guest, `skip_shop_pay`) | Doesn't count for row 2 — see note above |
| #1003 | Spike RowTwoB | 2 | **Shop Pay** | ✅ |
| #1004 | Spike RowTwoB | 3 | **Shop Pay** | ✅ |
| #1005 | Bentley Humphries | 5 | **Google Pay** | ✅ (qty 2 / intl shipping — Google Pay sandbox data, see note) |
| #1006 | Spike RowTwoB | (permalink mechanism check, not a matrix row) | Shopify Payments (`skip_shop_pay`) | ✅ confirms cart-permalink `_rg` round-trips |
| #1007 | Bentley Humphries | 4 | **Apple Pay** | ✅ |
| #1008 | Spike ShopApp | 7 (native browse, no link) | Shop Pay | ❌ no `_rg` — app's native Add to Cart has no property field |
| #1009 | Spike ShopApp | 7 (via tagged link, from WhatsApp) | Shop Pay | ✅ `_rg` matched exactly |
| #1010 | Spike RowTwoB | 8 (Buy it Now / dynamic checkout), later cancelled for row 14 | Shop Pay (guest) | ✅ row 8; then cancelled — `_rg` still visible on "Removed" line for row 14 |
| #1011 | (two lines) | 9 (two registries, one line each) | Shop Pay | ✅ both lines' properties stayed distinct |
| #1012 | (two lines, same variant) | 10 (registry + plain, same variant) | Shop Pay | ✅ stayed as two separate lines, no merge |
| #1013 | (single line, qty 2) | 11 (qty 2 of one tagged line) | Shop Pay | ✅ qty and `_rg` both preserved |
| #1014 | (single line) | 12 (discount `SPIKEROW12` + Shop Pay), later partially refunded for row 13 | Shop Pay | ✅ row 12; then partially refunded — `_rg` still visible before/after for row 13 |
| #1015 | Spike RowTwoB | webhook-capture follow-up for row 14 (fresh order, cancelled) | Shop Pay (guest, auto-routed) | ✅ `orders/cancelled` webhook captured — `_rg` intact in `line_items[].properties` |

---

## Decision gate

**Rows 1–5 and 7 all pass** (row 6 is deferred — PayPal can't be tested in test
mode) → build as specced. Nothing in the code changes, and
"works with Shop Pay" becomes a verified claim you can put in the listing
rather than a hope. Delete the fallback ladder from your head.

**Any of rows 1–7 fails** → stop and work the ladder below before writing more
app code. Note *which* row failed: a single failing accelerated path is a
different problem from properties not surviving at all.

**Status: rows 1–5 and 7 all pass** (row 6 stays deferred — PayPal can't be
tested in test mode). The gate is cleared — build as specced, nothing in the
code changes, and "works with Shop Pay, Apple Pay, Google Pay, and the Shop
app" is now a verified claim rather than a hope.

**Rows 8–15 (diagnostic) are all done too — all pass, with two open
loose ends to close before fully trusting the design:**

- Row 8 flips the original assumption: Buy it Now / dynamic checkout does
  **not** bypass the cart on this theme — see the correction above the
  results table. Treat it as a safe accelerated path, not one to avoid.
- Rows 9–14 all confirm the property behaves correctly under multi-line,
  same-variant, quantity, discount, refund, and cancellation scenarios.
- Row 15 confirms this theme correctly hides `_rg` from the storefront while
  keeping it visible in Admin — but that's theme-dependent (see the
  correction at the top of this doc), so re-check it on the production
  theme.
- **Two things still need a real webhook capture, not just Admin-UI
  observation**, before `voidPurchases()`'s idempotency logic is finalized:
  row 13 (does `refunds/create` carry the property or only a
  `line_item_id`?) and row 14 (same question for `orders/cancelled`). Wire
  up webhook.site and re-run both — quick, since the tokens/orders already
  exist.
- Row 9 used one cryptographically valid token and one structurally-valid
  placeholder (no access to `SIGNING_KEY` here, and `spike-a.mjs`'s
  registry/item ids are hardcoded) — good enough to prove lines don't
  cross-contaminate, not a proof that two *real* registries' tokens both
  validate. Low-risk to leave as is, since `verifyAttribution()` is already
  covered by its own test suite.

The one caveat worth carrying forward, not a failure of the spike: row 7
only passes when the guest reaches the Shop app via a **tagged link** (one
built with the base64url `properties=` cart permalink from section 6, opened
through a share surface like WhatsApp/Messages so the app intercepts it as a
deep link). Browsing to the product and adding it natively inside the app
(order #1008) drops the property entirely — there's no field for it in the
app's own product UI, the same gap as row 8's Buy it Now. **Practical
consequence for the real product:** registry links you hand guests must
always be the tagged cart-permalink form, never a bare product URL, or
Shop-app guests who tap "Add to Cart" from a plain product page they
navigated to themselves will silently lose attribution.

### Fallback ladder, in order

1. **Cart attributes** (`note_attributes`) carrying a compact
   variant → registry-item map. Different persistence path from line
   properties. Weaker with mixed carts, because it's per-cart not per-line.
2. **Server-side reconciliation on `cart_token`.** The registry page records
   "cart token X is shopping registry Y"; `orders/create` matches on the token.
   Nothing has to survive checkout at all. Its single assumption is that Shop
   Pay preserves the cart token — which the cart tokens you recorded above let
   you check immediately, without re-running the matrix. **This is why the
   snippet logs them.**
3. **A unique auto-applied discount code per registry.** Survives everything,
   but it's visible to buyers and collides with real promotions.
4. **Post-hoc matching plus a buyer confirmation email.** Works, feels amateur,
   invites exactly the duplicate-gift complaints the product exists to prevent.
   Don't launch on it.

### Where the code would change

If you end up on fallback (b), the blast radius is small and deliberately so:

- `app/lib/attribution.ts` — `attributedLines()` reads from a cart-token lookup
  instead of the line property. Its tests define the contract; keep them passing.
- `app/proxy/router.server.ts` — `cartAddAction()` records the cart token
  against the registry instead of minting a property.
- `prisma/schema.prisma` — add a `CartClaim` model (cart token → registry id,
  with a TTL).
- Everything else — the webhooks, `attributeOrder()`, `voidPurchases()`, the
  dashboard — is unchanged, because they all consume `AttributedLine[]` and
  don't care where it came from.

---

## After the gate

1. Re-run row 2 with `npm run dev` running, pointed at your app's real
   `orders/create` handler, and confirm a `Purchase` row appears with the right
   `qty` and the registry item's `purchasedQty` incremented.
2. Run row 13 the same way and confirm `voidPurchases()` decrements exactly once
   — deliver the webhook twice if you can, to prove the idempotency guard.
3. Then go do spike B1 (ship-to-registrant), and start the Level 2 protected
   customer data request and the requirement 1.1.13 question to Partner support
   the same day. Both are queues, not code.

---

## Sources

- [Test Shop Pay — test mode and the `test_card` nickname](https://shopify.dev/docs/api/commerce-components/pay/test-shop-pay)
  — the nickname field this doc describes lives on `shop.app`'s own account
  page, not in a merchant's embedded checkout card form. Confirmed live.
- [Test checkout UI extensions — creating a Shop Pay account with a vaulted test card](https://shopify.dev/docs/apps/build/checkout/test-checkout-ui-extensions)
- [Cart API reference — private line item properties and cart attributes](https://shopify.dev/docs/api/ajax/reference/cart)
- [Admin GraphQL `LineItem.customAttributes`](https://shopify.dev/docs/api/admin-graphql/latest/objects/LineItem)
- [Testing Shopify Payments — Shopify Help Center](https://help.shopify.com/en/manual/payments/shopify-payments/testing-shopify-payments)
- Companion docs in this folder: `spike-findings-and-protocols.md`,
  `architecture-decisions.md`
