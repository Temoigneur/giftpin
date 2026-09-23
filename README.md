# Giftpin — Gift Registry for Shopify

A gift and event registry that lives on the **merchant's own domain** and lets
registrants put items from anywhere on one list — with the merchant's catalog
anchored at the top of it.

Built from `architecture-decisions.md` (14 Sep 2026). Renamed from "Registro"
to "Giftpin" on 20 Sep 2026.

---

## What's here, and what isn't

**Working:**

- Merchant admin (React Router 7 + Polaris web components): onboarding, ROI
  dashboard with the merchant-share number, registry list, settings
- Theme app extension: "Add to registry" app block, survives theme updates
- Guest registry page via app proxy — server-rendered HTML, no client framework,
  under 50KB for a 30-item registry (asserted in tests)
- Registrant management via magic link — no customer account required
- The resolver ladder: merchant catalog → any Shopify store → JSON-LD /
  microdata / OpenGraph → manual
- Signed cart attribution, idempotent order webhooks, refunds and cancellations
- Soft claims for external items, with a reaper
- Find-a-registry search, thank-you CSV export, GDPR webhooks, deletion path

**Not built (deliberately — see "Before you trust this" below):**

- POS extension, group gifting, completion incentives, browser extension (all V2)
- Real email templates beyond the four transactional ones
- The attribution spike has **not been run**. That comes first.

---

## Getting it running

```bash
npm install
cp .env.example .env        # then fill in the two keys below
npx prisma generate
npx prisma migrate dev --name init
npm run dev                 # shopify app dev
```

Generate the two keys:

```bash
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log('SIGNING_KEY='   + require('crypto').randomBytes(32).toString('base64'))"
```

You need a Postgres URL in `DATABASE_URL` (Neon free tier is fine).
`REDIS_URL` is **optional** — without it the app uses an in-process cache and
runs jobs inline, which is correct for local development and wrong for
production with more than one process.

Then in your dev store: theme editor → product template → add the
**Add to registry** block. Visit `/apps/registry` to create one.

### Verifying

```bash
npm test         # 89 tests, no database needed
npm run typecheck
npm run build
```

---

## Architecture in one screen

```
Guest (phone, from a text)
   │
   ├─► merchant.com/apps/registry/r/abc123
   │        └─► Shopify proxy ──► app ──► Redis (rendered page, versioned key)
   │                                 └──► Postgres (cache miss only)
   │
   └─► add to cart ──► Shopify checkout ──► orders/create
                                                └─► queue ──► attribution

Registrant ──► magic link ──► /apps/registry/manage?t=<signed>
URL paste   ──► queue ──► resolver ladder ──► ExternalSource (deduped globally)
Merchant    ──► embedded admin ──► Postgres direct
```

**Layout:**

| Path | What |
|---|---|
| `app/lib/` | crypto, app proxy auth, cache, queue, email, attribution |
| `app/lib/resolver/` | the ladder: canonicalization, safe fetcher, metadata, Shopify public |
| `app/models/` | registry, item, claim, purchase, shop, dashboard |
| `app/proxy/` | guest-surface router and HTML rendering |
| `app/routes/` | admin UI, webhooks, the single `/proxy/*` resource route |
| `app/shared/` | isomorphic constants (see note below) |
| `extensions/registry-button/` | theme app extension |

---

## Five things that will bite you if you forget them

**1. App proxy strips cookies, both directions.** There is no session. The
registrant's credential is a signed token in the URL, or `logged_in_customer_id`
for shoppers with a store account. The storefront button reads tokens from
`localStorage` (same origin as the product page). The server re-verifies on
every write — `localStorage` is a convenience, never the source of truth.

**2. The app proxy HMAC proves Shopify sent the request, not who sent it.**
Every management route checks a magic-link token *as well*. See
`requireManage()` in `app/proxy/router.server.ts`.

**3. Merchants can rename the proxy path.** Never hardcode `/apps/registry` —
build links from `path_prefix` on the request.

**4. `.server.ts` files cannot be imported by anything a component body
touches.** React Router strips server code only from `loader`, `action`,
`middleware` and `headers`. This is why `app/shared/settings.ts` exists — the
build fails loudly if you get it wrong, which is how it was found.

**5. Purchased counts only move through attribution and claims.** `updateItem`
takes a narrow patch type on purpose: a registrant editing their own list must
never be able to touch `purchasedQty`, because that number is only reversible
through the paths that also write a `Purchase` row.

---

## Before you trust this

In rough order:

1. **Run spike A** (`spike-findings-and-protocols.md` §1) — the 14-row
   attribution matrix through Shop Pay, Apple Pay, Google Pay, PayPal, Shop app.
   Rows 1–7 are the gate. `ATTRIBUTION_PROPERTY` and the fallback ladder are
   both ready, but the whole product rests on this and it is **untested**.
2. **Run spike B1** — post-order address rewrite via `orderUpdate`.
   `applyShipToRegistrant()` is written and branches on `displayFulfillmentStatus`
   and province, per the 31 Aug 2026 tax-recalculation behaviour. Unverified.
3. **Request Level 2 protected customer data access.** This app stores
   registrant names, buyer names and shipping addresses. It is a queue, not a
   code change — start it now.
4. **Get requirement 1.1.13 confirmed in writing.** Describe the feature
   precisely to Partner support: *a customer's private gift list may contain a
   reference (title, image, link) to a product at another retailer; nothing is
   imported into the merchant's catalog.* Never use the phrase "import from any
   store" in the listing — it is the rule's own prohibited example.
5. **Measure the resolver hit rate.** Take 50 real product URLs from brands a
   Canadian couple would actually use, and see what fraction layers 1 and 2
   handle. That number decides how loudly the listing can claim "live pricing".
6. **Load-test the guest page.** One registry, 100 concurrent guests. Confirm
   the Redis path holds and Postgres never appears in the critical path.

---

## Deployment

Two Railway services off the same repo, plus Neon and Redis:

- **web** — `npm run docker-start` (runs migrations, then serves)
- **worker** — `npm run worker`

`REDIS_URL` must be set in production. Without it the web process runs jobs
inline and a second instance would each keep its own cache.

Billing is **Shopify App Pricing** — plans live in the Partner Dashboard, and
there is no billing code in this repo by design.

---

## A design note on external items

**Updated 20 Sep 2026 — reversed, see `CLAUDE.md`'s "Resolved" section.** The
app was originally built to take **no affiliate commission** when a guest buys
elsewhere, with the outbound-link renderer asserting no tracking parameters
were ever added, on the reasoning that the merchant is the customer, the page
lives on their domain, and being paid to route their shopper to Amazon risks
one-star reviews. Ben deliberately reversed this 20 Sep 2026: Giftpin now
takes a disclosed affiliate commission from launch (disclosed to both
merchant and guest — see `app-store-listing.md`). The outbound-link wrapping
mechanism and the on-page disclosure text are built (`app/lib/affiliate.ts`,
wired into `registry-page.ts`) — it's a no-op until
`AFFILIATE_LINK_WRAPPER_BASE` is set, which happens once Ben has signed up
with a real affiliate network.

The merchant's own products sort above everything else (`priority: 100`),
external items render visually secondary, and the dashboard shows the merchant
what share of registry value is theirs. That number is the answer to "why am I
paying for an app that links to other stores?", and it belongs on the front page
of the dashboard, not in a report.
