# Partner Support requests — ready to submit

**Note (20 Sep 2026):** the app was called "Registro" in the messages below
at the time they were sent/received — quoted verbatim, not updated, since
they're a historical record of actual correspondence with Shopify Support.
The app has since been renamed to "Giftpin." No need to re-send anything;
just be aware the name in Shopify's own records of this thread is the old one.

Both go through Partner Dashboard → your org → Support (or the in-app
"Get support" link). Submit these yourself — they're tied to your Partner
account and need your business details attached.

---

## 1. Protected customer data — scope clarification (revised)

**Update from Spike B1 (11 Sep 2026 testing):** the original draft of this
request asked for Level 2 access to read shipping addresses. That turned
out to be unnecessary — `orderUpdate` accepts a `shippingAddress` in its
mutation *input* without protected-data approval; the app never reads an
address back from Shopify because it already holds the registrant's address
in its own database (entered directly by the registrant, not pulled from a
Shopify customer record). So **don't request address-read access** — it's
not needed and asking for more than the app uses just slows review down.

What the app still does need, and what's actually unclear, is whether the
**webhook payload fields it already receives** — `customer.first_name`,
`customer.last_name`, `customer.orders_count` on `orders/create` — require
any tier of protected-data approval at all, since Shopify redacts those
fields in webhooks for apps that aren't approved. Don't assume either way —
this is exactly the kind of claim to get Shopify to confirm directly rather
than guess from docs (see the doc-error pattern in `CLAUDE.md`).

**Where:** Partner Dashboard → Support → "Protected customer data" question
(this is a clarifying question, not necessarily a Level 2 request — let
support tell you which tier, if any, applies).

**What to submit (paste/adapt):**

> App: Registro (Gift Registry)
>
> I want to confirm what protected-customer-data tier, if any, this app
> needs. It uses `read_orders` and reads `customer.first_name`,
> `customer.last_name`, and `customer.orders_count` off the `orders/create`
> webhook payload — purely to show the registry owner who bought a gift
> ("From Taylor") and to flag first-time customers on the merchant's
> dashboard. It does not store, export, or read back any customer email or
> address from the Admin API — shipping addresses used for
> ship-to-registrant come from the app's own database, entered directly by
> the registrant, and are only ever written to an order via `orderUpdate`,
> never read back.
>
> Is any protected-data approval required for the webhook fields above, and
> if so which tier?

---

## 2. Requirement 1.1.13 (duplicated product information) clarification

**Where:** Support → general app review question, or attach to your app
submission notes when you first submit for review.

**What to submit (paste/adapt):**

> App: Registro (Gift Registry)
>
> Requirement 1.1.13 says apps must not duplicate product information
> already available through Shopify's native features. I want to confirm
> our specific pattern is compliant before submitting for review:
>
> Registro lets a shopper add items from *any* store — not just the
> merchant running the app — to a registry. For an item from another
> Shopify store, we resolve its title/image/price from that store's own
> public `/products/{handle}.js` endpoint (the same data Shopify already
> serves publicly to anyone), or from public JSON-LD/OpenGraph metadata on
> non-Shopify sites, purely to render it on the registry page. We don't
> import it into the merchant's catalog, don't let the merchant sell it,
> and every registry item links out to its original store for purchase —
> we take no commission or affiliate fee.
>
> Is this outside the intent of 1.1.13 (which I read as targeting apps
> that scrape/replicate *a merchant's own* catalog to bypass Shopify
> product APIs), or does external-store product display need separate
> sign-off?

---

## Replies received

### #2 (1.1.13) — replied 18 Sep 2026, Eman N (Shopify Support)

> Requirement 1.1.13 states that apps must only duplicate product information
> the merchant has permission to use, and flags marketing claims like "import
> from any store in the world" or "copy the product information from any
> website" as not acceptable.
>
> There are two reasonable readings of 1.1.13. One is that it targets the
> data action broadly, covering any fetching of external product data
> regardless of how it's used. The other is that it's aimed at apps that
> replicate or scrape catalogs to enable resale or bypass Shopify's product
> APIs. Registro's pattern (read-only display, no catalog import, no resale,
> outbound purchase links, no commission) does sound distinguishable from the
> use cases that language seems to be targeting, though we can't say for
> certain how the review team will read it.
>
> Support can't make a binding compliance call — the App Review team is the
> right authority. To give the submission the best chance: (1) in testing
> instructions, clearly document that Registro does not import products into
> the merchant's catalog and does not enable resale; (2) explain the
> read-only, display-only nature of the external product data and the
> outbound-link pattern.

**Status:** answered, not binding. Fold both of Eman's recommendations
directly into the App Store testing instructions before submitting. Also:
1.1.13 flags exact marketing phrasing ("import from any store in the world",
"copy the product information from any website") as unacceptable — don't use
that language in the listing copy even though the underlying feature is fine.

### #1 (protected customer data) — ready to send, same thread as #2

You asked to send this as a reply in the existing email thread with Eman N
rather than a fresh Partner Dashboard ticket, so it reads as one thread with
context instead of an unexplained new question. Text below is adapted for
that — thanks him for the 1.1.13 answer first, then asks the new question.
Paste this as your reply and send it yourself.

 Hi Eman,

 Thanks for the detail on 1.1.13 — that's helpful, and I'll fold both of
 your recommendations into the testing instructions before submitting.

 Separate question while I have this thread open: I want to confirm what
 protected-customer-data tier, if any, my app needs. It uses `read_orders`
 and reads `customer.first_name`, `customer.last_name`, and
 `customer.orders_count` off the `orders/create` webhook payload — purely to
 show the registry owner who bought a gift ("From Taylor") and to flag
 first-time customers on the merchant's dashboard. It doesn't store,
 export, or read back any customer email or address from the Admin API —
 shipping addresses used for our ship-to-registrant feature come from the
 app's own database, entered directly by the registrant, and are only ever
 written to an order via `orderUpdate`, never read back.

 Is any protected-data approval required for the webhook fields above, and
 if so which tier?

 Thanks again,
 Bentley

**Status:** sent 19 Sep 2026. Not a blocker for anything else — paste
Shopify's reply into this file when it arrives.

---

Keep replies from Shopify support in this file (or paste them back to me)
so the answer is on record before the App Store submission.
