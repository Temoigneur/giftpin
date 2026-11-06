# Gift Registry App — Stack, Architecture & Retailer Strategy

**Prepared:** 14 September 2026
**Companion to:** `giftregistryappbrief.md`, `spike-findings-and-protocols.md`
**Decides:** tech stack, system architecture, and which external retailers to connect for US + Canada
**Status:** decisions made; three items flagged for verification before code (§11)

---

## 0. Read this first — four things changed since 31 August

The brief is two weeks old and four facts in it have moved. Two of them change the plan.

**1. Swym entered the registry category.** Swym is a wishlist vendor claiming 45,000+ brands, and it now sells "Gift Lists & Registries" at Free / $15 / $50 / $99 — which is almost exactly the pricing ladder §11 of the brief proposed. This is a materially worse competitive picture than "3–5 apps, leader asleep since 2014." Swym does not need App Store search to find merchants; it already has them. **The brief's assumption that the category is thin is now only half true: it's thin on dedicated registry apps and no longer thin on companies who can ship one.**

**2. MyRegistry Lite has been on the App Store since Oct 2021** (4.0★, 12 reviews, free to install). It is worth understanding precisely, because it is the closest thing to what you described wanting. It works in the *opposite* direction: it pushes the merchant's products *out* to myregistry.com, where the registry lives. The merchant becomes a supplier to MyRegistry's registry. **Nobody currently offers a universal registry that lives on the merchant's own domain.** That gap is real and it is the one you're aiming at.

**3. Listify launched 30 Apr 2025**, not "recent 2026" — Free / $9.99 / $24.99 / $39.99, 5.0★ on 7 reviews. Pure own-catalog registry, no external items.

**4. Hudson's Bay closed every store in 2025.** Canada's default registry retailer for a century is gone and nothing has replaced it. Canadian couples are being funnelled to Amazon.ca by default. This is the single best market-timing fact in this document and it is not in the brief.

**Platform changes that affect the stack** (details in §4): the Remix app template has been superseded by a React Router 7 template; Polaris is now **web components**, not React; Managed Pricing has become **Shopify App Pricing** and is the default billing path for new public apps; and **PA-API 5 is dead** — Amazon now returns `403 AccessDeniedException: Product Advertising API is deprecated`.

---

## 1. The external-retailer decision — the honest version

You said you'd like to integrate external retailers because you want the app to sell itself and you don't want to pitch Shopify brands. I want to separate those two things, because one of them is achievable and the other isn't, and conflating them will cost you months.

### Universal items do not solve merchant acquisition

A Shopify app has two distribution problems:

- **Getting merchants to install.** Driven by App Store search rank, reviews, and word of mouth. ~60% of installs come from search.
- **Getting registrants and guests to use it.** Driven by the product itself.

Universal items help the second enormously and the first barely at all. Merchants do not search the App Store for "registry that links to Amazon." Worse, the naive version of this feature is actively *hostile* to the person paying you: you would be charging a merchant $19/month for a page on their own domain that sends their customer to Amazon. That app gets one-star reviews, and reviews are the whole ballgame under 25 of them.

**There is no version of a Shopify app where you never talk to merchants.** The brief already concluded this (§12: "10 installs and 5 reviews from merchants you personally onboarded"). That phase is unavoidable regardless of what the app does. If the goal is genuinely "never pitch anyone," the product you want is a consumer registry site monetised by affiliate commission — that's Zola/MyRegistry/Babylist, it's a different business with a much harder cold start, and I'd advise against it as a solo evenings project.

### But there is a version that works, and it's strong

Reframe the feature from the merchant's point of view:

> Couples register at Amazon and Target because those places let them put *everything* in one list. That's why they don't register with you. This app lets them build that one list **on your site**, with your products at the top of it — and shows you what share of it you won.

That is a pitch a bridal or homewares merchant says yes to, because the counterfactual isn't "they registered with me and I lost the Amazon sales." The counterfactual is **they never registered with you at all.** Completeness is what makes the registrant choose the merchant's registry as their *primary* registry, and primary is where the merchant's own products sit.

**Decision: build it, with the merchant's catalog structurally privileged.**

| Rule | Implementation |
|---|---|
| Merchant products are the default and the top of the list | Add-from-store is one tap; add-external requires pasting a URL |
| External items are visually secondary | Muted card, "from elsewhere" label, no buy button — an outbound link |
| Merchant controls the feature | Setting: off / on / on-but-capped-at-N% of items. Default **on**, because the registrant experience is the growth loop |
| **Never** monetise the outbound click | No affiliate links, ever. See below |
| External items never enter the merchant's catalog | They are rows in your DB, never Shopify products |
| The dashboard shows the split | "68% of registry value was your products" — this is the number that sells the app |

### Do not take affiliate commission

You will be tempted. Don't, for four separate reasons that all point the same way:

1. **It's a conflict of interest on the merchant's own domain.** You'd be paid to route their customer away. When one merchant discovers it — and one will — the review is fatal.
2. **It likely breaks App Store review.** Requirement 5.1.x requires that data collected through a merchant's storefront be returned to their admin, and the review team reads adversarially on anything that looks like using the merchant's traffic for your own revenue.
3. **Amazon's affiliate terms are now a moving target.** PA-API 5 is deprecated; the Creators API requires an active Associates account with qualifying sales, which you won't have on day one.
4. **The commission is trivial** relative to subscription revenue at any scale you'd reach, and it costs you the one thing that's actually scarce: merchant trust.

"We never make money when a guest leaves your store" is a *feature*. Put it in the listing. It's exactly the kind of claim that differentiates you from MyRegistry Lite, whose entire model is moving the registry off the merchant's site.

---

## 2. The App Store rules that shape the design

These are real constraints found in the current requirements, not hypotheticals. Design around them from the start.

| Req | Text | Consequence for you |
|---|---|---|
| **1.1.13** | "Your app should only duplicate product information that the merchant has the proper permission to use… Marketing claims like *'import from any store in the world'* or *'copy the product information from any website'*, whether using your app or a Chrome extension, are not acceptable." | **The biggest review risk in this project.** The rule targets dropship/catalog-cloning apps. Your defence is structural: you store a *customer's personal reference* to a product (title, image, link) on a private gift list — you never duplicate anything into the merchant's catalog. **But you must never use that phrasing in your listing**, and you should get this confirmed in writing by Partner support before submission (§11). |
| **1.1.11** | "Browser extensions are only permitted as an optional feature." | An "Add to registry" browser extension is allowed but the app must work fully without it. URL-paste is the primary path; the extension is V2 convenience. |
| **1.1.6** | Apps that turn stores into "classifieds-style marketplaces" are prohibited. | A registry page that's mostly outbound links to other retailers starts to look like this. The merchant-first ordering and the optional cap in §1 are your mitigation. |
| **Protected customer data, Level 2** | Required for any app touching name, address, phone, or email. | **You need Level 2 approval.** Registries hold registrant names, buyer emails, and (for ship-to-registrant) shipping addresses. Request it early — it requires data-protection details and participation in data protection reviews, and it's a review-time delay, not a code problem. |
| **1.2.1** | Billing must go through Shopify App Pricing or the Billing API. | Use **Shopify App Pricing**. No billing code at all. |
| **5.1.x** | Theme modification only via theme app extensions; storefront-collected data must be returned to the merchant admin. | Already the plan. It's also the fix for Gift Reggie's recurring "theme update broke the button" complaint. |

---

## 3. Retailer connection strategy — which stores, and in what order

The instinct is "integrate N retailers." That's the wrong shape. **Most of the value comes from a layered resolver that needs no per-retailer work at all**, and per-retailer integration is reserved for a handful where the payoff justifies the maintenance.

### The resolver ladder (first hit wins)

| Layer | Source | Coverage | Fidelity | Refresh |
|---|---|---|---|---|
| **0** | Merchant's own catalog (Storefront API) | The store | Full — variants, live stock, buyable, **attributable** | Live |
| **1** | **Any Shopify store** — `GET https://{host}/products.json` (and the per-product `/products/{handle}.js`) | Millions of stores — public, no key, no login | Near-full — variants, price, `available`, images | Daily |
| **2** | Structured page metadata — schema.org `Product` JSON-LD → microdata → OpenGraph (`og:title`, `og:image`, `product:price:amount`) → oEmbed | Effectively every retail PDP, because retailers publish it for Google Shopping | Title, image, price, currency | Weekly, lazy |
| **3** | Manual entry | Anything | Whatever the registrant types | Never |

**Layer 1 is the unexploited advantage and nobody in this category uses it.** Every Shopify storefront ships a public product JSON endpoint (a significant minority of merchants disable it — plan a fallback to layer 2). Detect Shopify (`/products/{handle}.js` returns 200, or `cdn.shopify.com` in the markup) and you get structured variants and live availability for a very large share of exactly the DTC gifting brands registrants actually want — the independent ceramics studio, the knife brand, the baby-goods label. Amazon gives you a grey box with a price that might be stale. A Shopify-sourced item gives you a live one. That asymmetry is a product feature: **"items from Shopify stores stay live; items from elsewhere are a snapshot."**

Layers 1–3 mean **you launch supporting every retailer in North America on day one with zero integrations.** Named integrations below are refinements, not prerequisites.

### Guardrails on layers 1–3 (this is what keeps you on the right side of 1.1.13)

- Fetch **only** a URL a registrant explicitly pasted. Never crawl, never enumerate a catalog, never bulk-import.
- Honour `robots.txt`, send an honest User-Agent with a contact URL, maintain a deny-list for anyone who asks.
- Rate-limit per destination domain; cache aggressively; never more than one fetch per item per day.
- Strip inbound affiliate/tracking parameters from pasted URLs. Add none of your own.
- Store a *reference*, never a catalog copy. Nothing ever becomes a Shopify product.

### Named retailers, ranked

Ranked by (registry gift volume) × (US + Canada coverage) × (data accessibility). "Layer" = what you'd actually get today.

**Tier A — handle these deliberately; they are where the gifts are**

| # | Retailer | US | CA | Data path today | Notes |
|---|---|---|---|---|---|
| 1 | **Amazon** (.com / .ca) | ✔ | ✔ | Layer 2 only | The #1 registry destination in both countries and the one you least control. **PA-API 5 now returns 403 — it is deprecated.** The Creators API replaces it but needs an Associates account with qualifying sales, and you're not taking affiliate revenue anyway. Parse the ASIN from the URL, read OG metadata, accept a snapshot, don't promise live price. Design so Amazon being degraded doesn't hurt. |
| 2 | **Best Buy** | ✔ | ⚠ | **Real free public API** (`developer.bestbuy.com`) — products, price, availability, stores | The easiest genuine integration of any large retailer, and it's live. Strong for baby monitors, graduation, housewarming. US catalog; **verify Canadian coverage** — Best Buy Canada is a separate operation and the API may not cover it. |
| 3 | **Walmart** (.com / .ca) | ✔ | ✔ | Documented Affiliate/Product API (walmart.io), access gated | Broad both countries, especially baby. Worth an application; fall back to Layer 2 if access doesn't come through. |
| 4 | **Target** | ✔ | ✘ | Layer 2 | Top-three US registry destination — their own wedding/baby registry is enormous. No public product API; affiliate via Impact. **No Canadian presence at all**, which matters for your positioning. |
| 5 | **Any Shopify store** | ✔ | ✔ | **Layer 1** | Not a retailer — a category. Treat it as a first-class named source in the UI: "Shopify store — live pricing." |

**Tier B — classic registry names, Layer 2 is sufficient**

Williams-Sonoma / Pottery Barn / West Elm · Crate & Barrel / CB2 · Wayfair · IKEA · Anthropologie · Article · Etsy (has a genuine public API v3, worth a real integration for the personalised-gift vertical) · Lululemon · MEC.

All ship to or operate in Canada except where noted. All publish clean JSON-LD. None need custom code — they just work through Layer 2. Add a curated "popular stores" picker in the UI pointing at their search pages; that's presentation, not integration.

**Tier C — Canada, where the actual opening is**

| Retailer | Why it matters |
|---|---|
| **Canadian Tire** | Enormous CA household/kitchen presence. Its registry is *powered by MyRegistry* (`canadiantire.myregistry.com`) — proof that big CA retailers outsource this rather than build it. |
| **Indigo** | Books, home, lifestyle. Distinctly Canadian gifting. |
| **Simons** | Quebec-born homeware, stores in six major cities, rising registry use. |
| **Structube, Linen Chest, Mastermind, EQ3** | The mid-market CA names that fill the gap left by the Bay. |
| **~~Hudson's Bay~~** | **Closed all stores 2025.** Canada's default registry for a century, gone. |

**This is your wedge, and it has a date on it.** Canada lost its default registry retailer in 2025. Canadian couples now default to Amazon.ca — a registry experience nobody loves — while Canadian DTC brands on Shopify have no registry story at all. You are in Toronto. You can talk to Canadian bridal, baby and homewares merchants in your own time zone, in both official languages if you localise, and be the obvious answer to "where do Canadians register now?" Neither Swym nor Gift Reggie is telling that story.

**Tier D — deliberately excluded:** eBay and marketplace listings (items vanish, prices swing), grocery and perishables, anything auction-priced, any site requiring login to see a product.

### Go-to-market implication

Lead the listing with the merchant benefit, not the universality:

> *"Couples put everything in one list — and that list is on your site."*

Never: *"add products from any store in the world."* That's requirement 1.1.13's exact prohibited phrasing.

---

## 4. Tech stack — evaluated from scratch

You asked me to evaluate from scratch rather than assume the Notion Order Sync stack. I did. It lands in the same place on most layers, and I'd rather say that plainly than manufacture change for its own sake. **Two layers genuinely change** (admin UI framework, and the addition of a cache/queue), and one is new (object storage).

| Layer | **Decision** | Also considered | Reasoning |
|---|---|---|---|
| Language | **TypeScript, Node 22 LTS** | Go, Python, Elixir | Shopify's first-party toolchain is Node-only. Everything else means writing OAuth, webhook HMAC, session storage and App Bridge plumbing yourself. Not a close call. |
| App framework | **Shopify React Router 7 template** (`shopify-app-template-react-router`, `@shopify/shopify-app-react-router`) | Remix template, Hydrogen, bare Express | The Remix template has been converted to React Router 7 and that's the maintained path. Hydrogen is for storefronts, not apps. **Migration from your Notion Order Sync code is mostly mechanical** — Shopify publishes an upgrade guide. |
| Admin UI | **Polaris web components** (`polaris-1.js` channel) **+ App Bridge web components** | Polaris React | ⚠️ **This is a real change from what you built Notion Order Sync with.** The CLI now scaffolds web components; they're framework-agnostic custom elements, and the auto-updating channel means Shopify's redesigns land without you touching anything. Your Polaris React components won't port directly — budget a few evenings. |
| Guest-facing rendering | **Server-rendered HTML, progressive enhancement, no client framework** | React SPA behind the proxy | The guest is on a phone, on cellular, opening a link from a group chat, and has never heard of your app. Time-to-first-paint *is* the product. This is the thesis of the whole build ("dated and clunky on mobile" is the wedge). Ship <50KB. |
| Theme surface | **Theme app extension** — app block + app embed, vanilla JS, no dependencies | Script tags (legacy) | Survives theme updates by construction. This is the structural fix for Gift Reggie's most-complained-about failure. |
| Database | **Postgres 16 on Neon** | Supabase, Railway PG, PlanetScale, SQLite/Turso | Relational data with real integrity requirements (purchase counts must never drift). Neon's branch-per-PR is genuinely useful solo, and you already know it. Caveat: **never let a cold start sit in a guest's critical path** — see caching. |
| ORM | **Prisma** | Drizzle, Kysely | Template default; migration tooling matters more than raw speed when you're the only one who can fix a bad migration at 11pm. |
| Cache + queue | **Redis on Railway — BullMQ for jobs, Redis for the registry-page cache** | pg-boss (no extra service), Inngest, Trigger.dev | One new dependency doing two necessary jobs. You need a queue regardless (Shopify webhooks must ack in ~5s, and external-URL fetches are slow and flaky), and you need a read cache for public pages. `pg-boss` avoids the extra service but leaves caching unsolved. |
| Object storage | **Cloudflare R2** | S3, Supabase Storage | **New requirement.** Never hotlink a retailer's product image — they break, they're hotlink-protected, and they leak your users' IPs to Amazon. Fetch once, resize, serve yourself. R2 has zero egress fees, and these images are served to every guest on every registry. |
| Hosting | **Railway** (app + Redis), single region, `us-east` | Fly.io, Render, Cloudflare Workers | Known, cheap, Docker-native, one-click Redis, has cron. Workers is tempting for edge-rendered registry pages but fights Prisma and the app template — not worth it as a solo dev on v1. Revisit if p95 origin latency becomes the constraint. |
| CDN / WAF | **Cloudflare** in front of the app origin | none | Rate-limits your proxy origin (public pages = public abuse surface), caches static assets, and gives you a kill switch. |
| Email | **Resend** | Postmark, SES | "Someone bought your gift" is a product moment, not a notification. Resend for DX and price; move to Postmark if deliverability slips. Set up SPF/DKIM on a real sending domain day one. |
| Billing | **Shopify App Pricing** (managed) | Billing API | Now the default for new public apps. Plans, prices, trials and proration live in the Partner Dashboard; you write no billing code, just check `activeSubscription` and gate. Strictly less code and less to get wrong. |
| Errors | **Sentry** | — | Free tier is enough. Source maps on. |
| Tests | **Vitest** (units, attribution logic) + **Playwright** (guest flow end-to-end) | — | The attribution arithmetic and the guest flow are the two things that must never break. Everything else can be fixed on Tuesday. |

**Rough fixed cost: ~$70–90/month** (Railway ~$25–40, Neon ~$19, Resend ~$20, R2 ~$1–5, Cloudflare/Sentry free). At $19/month Starter, break-even is about **five paying merchants**.

---

## 5. Architecture

### 5.1 Surfaces

| Surface | Technology | Purpose |
|---|---|---|
| Merchant admin | React Router 7, embedded, Polaris + App Bridge web components | Setup, registry list, ROI dashboard |
| PDP "Add to registry" | Theme app extension (app block + app embed) | Survives theme updates |
| **Registry page (guest)** | **App proxy**, SSR | The product. Lives on the merchant's domain. |
| Registrant management | App proxy + signed magic-link token | Create/edit without forcing account creation |
| Find-a-registry search | App proxy, indexable | SEO asset (V2) |
| **Checkout** | **Nothing at all** | Properties are written *before* checkout; the order is read *after*. Checkout UI extensions are Plus-only — confirmed dead for this market. |
| POS (V2) | POS UI extension | The unserved gap |
| Browser extension (V2) | Optional only (req. 1.1.11) | Convenience, never a dependency |

### 5.2 App proxy — the four gotchas

One app proxy route per app, so everything customer-facing lives under one prefix: `/apps/registry/*`.

1. **Cookies are stripped in both directions.** Shopify removes `Cookie` on the way in and `Set-Cookie` on the way out. You cannot hold a session. Registrant auth must be a **signed, expiring token in the URL** (magic link) or `logged_in_customer_id` for signed-in customers. Design for this on day one — retrofitting it is miserable.
2. **Verify the HMAC on every single request.** Shopify appends `signature`; recompute it over the sorted params with your shared secret. And separately: if a request claims to act for a customer, check `logged_in_customer_id` actually matches the registry owner. The signature proves the request wasn't tampered with, *not* that the caller is authorised.
3. **Merchants can change the prefix/subpath.** Never hardcode `/apps/registry` — read `path_prefix` off the request when building links.
4. **`Content-Type: application/liquid` renders your response in the shop's theme context.** This is how the registry page inherits the merchant's fonts, colours and header — the difference between "looks like part of the store" and "looks like a bolted-on app." Costs a render hop and couples you to theme quirks. **Recommendation: ship plain HTML with merchant-configurable brand tokens for MVP, and offer Liquid theme-wrapping as an opt-in setting once you've seen real themes.**

### 5.3 Runtime topology

```
Guest (phone, from a text)
   │
   ├─► merchant.com/apps/registry/abc123
   │        └─► Shopify proxy ──► Cloudflare ──► Railway (React Router SSR)
   │                                                  ├─► Redis  (rendered registry, ~60s TTL)
   │                                                  ├─► Neon   (cache miss only)
   │                                                  └─► R2     (item images, direct to guest)
   │
   └─► add to cart ──► Shopify checkout ──► orders/create webhook
                                                  └─► Railway ──► BullMQ ──► attribution worker

Registrant ──► magic link ──► /apps/registry/manage?t=<signed>
External URL paste ──► BullMQ resolver job ──► layer 0/1/2/3 ──► ExternalSource + R2 image
Merchant ──► embedded admin ──► Neon (direct reads, no cache)
```

**Caching rule:** the guest read path must never touch Postgres on a warm cache. Registry render cached in Redis, keyed `registry:{id}:v{version}`; bump `version` on any write (item added, purchase recorded, claim placed). Short TTL as a backstop only. This makes a viral registry — 100 guests hitting one link in an hour after the invite goes out — a Redis load, not a Postgres load, and keeps Neon's cold start off the critical path.

### 5.4 Background jobs (BullMQ)

| Queue | Trigger | Work |
|---|---|---|
| `webhooks` | `orders/create`, `orders/updated`, `orders/cancelled`, `refunds/create` | Ack Shopify immediately, process async. Idempotent on `(order_id, line_item_id)`. |
| `resolve` | Registrant pastes a URL | Run the layer ladder, fetch + resize + store image to R2, upsert `ExternalSource`. |
| `refresh` | Cron | Re-check external items: Shopify-sourced daily, metadata-sourced weekly. Flag price drift >15% and gone-away items. |
| `email` | Purchase, claim expiry, event-date reminders | Retry with backoff. |
| `reap` | Cron, every 15 min | Expire stale external claims (§6). |

### 5.5 Data model

```
Shop             id, domain, access_token_enc, plan, settings_json, installed_at

Registry         id, shop_id, customer_id, slug, event_type, event_date, title,
                 message, cover_image_key, privacy(unlisted|public|password),
                 indexable(bool, default false), password_hash,
                 ship_to_registrant(bool), shipping_address_enc,
                 status, created_at
                 UNIQUE (shop_id, slug)

Registrant       id, registry_id, email_enc, name, role(owner|co)
                 -- co-registrants: both partners manage one list

RegistryItem     id, registry_id, source_type(internal|shopify_ext|web|manual),
                 product_ref, variant_ref, external_source_id,
                 desired_qty, purchased_qty, claimed_qty,
                 priority, note, created_at
                 INDEX (registry_id, priority)

ExternalSource   id, canonical_url_hash, canonical_url, domain, resolver,
                 title, image_key, price_amount, price_currency, availability,
                 last_fetched_at, fetch_status, ttl
                 UNIQUE (canonical_url_hash)

Claim            id, registry_item_id, qty, expires_at, guest_fingerprint
                 -- soft hold, EXTERNAL ITEMS ONLY (§6)

Purchase         id, registry_item_id, source(online|pos|manual|external),
                 order_id, line_item_id, qty, buyer_name, buyer_email_enc,
                 buyer_message, hidden_until, shipped_to_registrant, created_at
                 UNIQUE (order_id, line_item_id)   -- webhook idempotency

RegistryEvent    id, registry_id, type, payload_json, created_at
                 -- audit trail + the merchant ROI dashboard's source of truth
```

**`ExternalSource` is deduplicated globally, across all shops.** Two things follow. First, the obvious one: you fetch each URL once no matter how many registrants paste it, which keeps you a polite citizen of other people's servers. Second, the interesting one: after a few thousand registries you own a structured graph of *what people actually put on gift lists in North America* — the highest-intent gifting dataset in the Shopify ecosystem, and something no competitor is accumulating. It contains zero customer data (public product info only), so sharing it across shops is clean. Don't build anything on it yet. Just make sure you're collecting it from day one.

Encrypt at rest with the AES-256-GCM helper you already wrote: `access_token`, `shipping_address`, all `email` fields.

---

## 6. Purchase attribution, with external items in the mix

### Internal items — unchanged from the brief and the spike doc

Write **one signed property** rather than two plain ones:

```js
properties: { '_rg': '<base64url(registry_id|item_id|nonce).hmac>' }
```

One key is cleaner in the cart, and the HMAC means a guest can't hand-edit the cart to credit a different registry. Still record `cart_token` on every order — it's the insurance for fallback (b) in the spike doc.

**Correction to brief §9.** The brief says the leading underscore "hides them from the customer-facing cart display". It doesn't, quite: private line item properties remain exposed in Liquid's `line_item.properties` and in the Ajax API, and [Shopify's Cart API reference](https://shopify.dev/docs/api/ajax/reference/cart) is explicit that hiding them is the *theme's* job. Dawn and most modern themes filter `_`-prefixed keys, but a theme that doesn't will render a ~107-character token beside the product in the cart. Double-underscore **cart attributes** are genuinely hidden from both surfaces — but they attach to the cart rather than the line, and per-line is the whole reason this survives Shop Pay. So the line property stays, and theme visibility becomes a per-theme check (row 15 of `SPIKE-A.md`) plus a support note, not an assumption.

Everything in `spike-findings-and-protocols.md` §1 stands: run the 14-row matrix before writing app code. Rows 1–7 are the gate.

### External items — a different mechanism entirely

There is no order, no webhook, no truth. What you have is the honour system, and the honour system is exactly where duplicate gifts happen — which is the single thing a registry exists to prevent.

**Soft claim, and this is the one place a reservation earns its complexity:**

1. Guest taps "Buy at Best Buy" → you write a `Claim` (qty, `expires_at = now + 2h`) and open the retailer in a new tab.
2. The item immediately shows as *"someone may be buying this"* — greyed, still clickable with a warning.
3. Guest returns (or follows the emailed link 20 minutes later): "Did you buy it?" → Yes creates a `Purchase`; No releases the claim.
4. No answer in 2h → the `reap` job releases it and emails once more.

Note the asymmetry, and put it in the docs: **internal items need no reservation because the order webhook is ground truth; external items need one because nothing else will ever tell you.** The brief's §9 recommendation ("don't reserve in MVP") was written before external items were in scope and applies only to internal ones.

### The dashboard number that sells the app

```
Registry-attributed revenue         $14,200
New customers from registries          312
Your share of registry value           68%   ← this one
Items claimed elsewhere                 41
```

That third line is the merchant's answer to "why am I paying for an app that links to Amazon." Show it on the main dashboard, not buried in a report.

---

## 7. Ship-to-registrant

Per the spike doc: the checkout UI extension path is **dead for this market** (Plus-only, and `applyShippingAddressChange` errors under accelerated checkout anyway). The mechanism is **post-order address rewrite** — `orderUpdate` from the `orders/create` handler, branching on `displayFulfillmentStatus` because of the 31 Aug 2026 tax-recalculation behaviour. Scope: `write_orders`.

MVP constraint, unchanged and worth stating in guest copy before you build it: **registry carts are registry-only** — one order has one shipping address and a mixed cart can't be split.

External items are shipped by the retailer to whatever address the guest enters there. You can prefill nothing and guarantee nothing. Say so plainly in the UI; don't let the registrant assume otherwise.

---

## 8. Privacy

Everything in brief §10 stands, and Level 2 protected-customer-data approval makes it non-optional rather than merely wise. Three additions:

- **`indexable` defaults to false, and `noindex` is on the response, not just the sitemap.** The AAA failure was registrant emails turning up in Google.
- **Don't leak the guest to the retailer.** Proxy external images through R2; never hotlink. Use `rel="noopener noreferrer"` and a referrer policy on outbound links.
- **Deletion is a first-class path, day one.** Registrant deletes → registry, items, claims, purchases, cached renders and R2 images all go. Wire it into the GDPR webhooks (`customers/redact`, `shop/redact`) at the same time, since you have to implement those anyway.

---

## 9. What this changes in the original brief

| Brief section | Change |
|---|---|
| §3 competitive landscape | Add **Swym** (45K brands, $15/$50/$99) and **MyRegistry Lite** (2021, 4.0★). The category is no longer "3–5 sleepy apps." |
| §8 MVP | Add **external items via URL paste** + the soft-claim flow. This is now a launch feature, not V2 — it's the only thing no competitor has. |
| §9 surfaces | Remove checkout UI extension entirely. Add Redis, R2, and the resolver. |
| §9 attribution | One signed `_rg` property, not two plain ones. |
| §11 pricing | Swym's ladder is Free/$15/$50/$99. Your proposed $19/$49/$99 is fine — **do not go below it**, and make the free tier 3 registries as planned. |
| §12 go-to-market | **Lead with Canada.** The Hudson's Bay vacuum is a dateable, defensible story and you're in the right country to tell it. |
| §13 risks | Add: App Store review risk on req. 1.1.13; Level 2 PCD approval delay; Swym's installed-base advantage. |

---

## 10. Build sequence

| Phase | Work | Why this order |
|---|---|---|
| **0** | Run spike A (attribution matrix) and spike B1 (post-order address rewrite) | Unchanged. Everything downstream is load-bearing on these. Do not write app code first. |
| **0.5** | Request **Level 2 protected customer data** access; ask Partner support in writing about req. 1.1.13 vs. registry references | Both are waiting-on-someone-else. Start the clock now. |
| **1** | Scaffold on the React Router 7 template. Port the Notion Order Sync webhook/OAuth/crypto code. Rebuild the admin UI in Polaris web components. | Gets the known-good pieces across and absorbs the Polaris change early. |
| **2** | Internal-only registry: theme app extension → app proxy registry page → `_rg` property → `orders/create` attribution. **Ship this to a dev store and give three friends a phone each.** | Prove the core loop before adding surface area. |
| **3** | Resolver layers 0–3, `ExternalSource`, R2 images, soft claims. | The differentiator. Layer 1 (Shopify stores) first — it's the highest fidelity and the easiest. |
| **4** | Merchant dashboard incl. the "your share" number. Email notifications. Shopify App Pricing. | What converts install → paid. |
| **5** | Submit. Manually onboard 10 merchants — **weight Canadian bridal, baby and homewares.** | Reviews before features, per brief §12. |
| **6** | V2: find-a-registry page, POS extension, completion incentive, browser extension, group gifting. | Only once merchants are asking. |

---

## 11. Verify before building

1. **Spike A and B1.** From `spike-findings-and-protocols.md`, unchanged, still first.
2. **Requirement 1.1.13.** Email Shopify Partner support describing the feature precisely — *"a customer's private gift list may contain a reference (title, image, link) to a product at another retailer; nothing is imported into the merchant's catalog"* — and get an answer in writing before you build phase 3. This is the one rule that could force a redesign after the fact.
3. **Best Buy API Canadian coverage.** Get a key, query a `.ca` SKU. If it's US-only, Best Buy drops from Tier A to Tier B for your home market.
4. **Walmart affiliate/product API access.** Apply; assume rejection and plan for Layer 2.
5. **Layer 1 hit rate.** Take 50 real product URLs from gifting brands you'd expect a Canadian couple to use, and measure what fraction respond to `/products/{handle}.js`. That number decides how loudly you can advertise "live pricing."
6. **Layer 2 hit rate on the Tier A/B list.** Same 50-URL exercise against JSON-LD/OG parsing. Anything under ~90% and the paste flow needs a manual-entry fallback that doesn't feel like failure.
7. **Polaris web components migration cost.** Port one non-trivial Notion Order Sync screen and time it before committing to a schedule.

---

## 12. Sources

- [Shopify React Router app template](https://github.com/Shopify/shopify-app-template-react-router) · [upgrading from Remix](https://github.com/Shopify/shopify-app-template-react-router/wiki/Upgrading-from-Remix) · [`@shopify/shopify-app-react-router`](https://shopify.dev/docs/api/shopify-app-react-router/latest)
- [Polaris web components](https://shopify.dev/docs/api/app-home/v1.0/web-components) · [Apps in App Home](https://shopify.dev/docs/apps/build/app-home)
- [About app proxies](https://shopify.dev/docs/apps/build/online-store/app-proxies) · [Authenticate app proxies](https://shopify.dev/docs/apps/build/online-store/app-proxies/authenticate-app-proxies)
- [Customer account full-page extensions](https://shopify.dev/docs/apps/build/customer-accounts/full-page-extensions) · [full-page target reference](https://shopify.dev/docs/api/customer-account-ui-extensions/2026-07/targets/full-page)
- [Shopify App Pricing](https://shopify.dev/docs/apps/launch/billing/shopify-app-pricing)
- [App Store requirements](https://shopify.dev/docs/apps/launch/shopify-app-store/app-store-requirements) (1.1.6, 1.1.11, 1.1.13, 1.2.1, 5.1.x) · [best practices](https://shopify.dev/docs/apps/launch/shopify-app-store/best-practices)
- [Work with protected customer data](https://shopify.dev/docs/apps/launch/protected-customer-data)
- [Amazon PA-API v5 deprecation notice](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/paapiv5-deprecation)
- [Best Buy developer portal](https://developer.bestbuy.com/) · [Best Buy API docs](https://bestbuyapis.github.io/api-documentation/)
- [Walmart I/O affiliate API](https://www.walmart.io/docs/affiliate/)
- [Every Shopify store ships a public product API](https://earezki.com/ai-news/2026-07-05-every-shopify-store-ships-a-public-product-api-almost-nobody-uses-it/)
- [Swym Gift Lists & Registries](https://www.getswym.com/features/gift-registry) · [Listify: Gift Registry](https://apps.shopify.com/listify-gift-registry) · [MyRegistry Lite](https://apps.shopify.com/registry-wishlist-solution) · [Canadian Tire registry, powered by MyRegistry](https://canadiantire.myregistry.com/)
- [Best wedding registries in Canada 2026 (Hudson's Bay closure)](https://invitecount.com/wedding-registry/canada)
- [React Router on Cloudflare Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/)
