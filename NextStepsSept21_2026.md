# Giftpin (Gift Registry App) — Status & Next Steps
_Last updated: 20 Sep 2026 (later session)_

**A focused, priority-ordered checklist for the next session now lives in its own doc: "Giftpin — Next Session Priorities." This file stays the full history/reference; that one is the thing to work from.**

## What this is
A Shopify app ("Giftpin," renamed from "Registro" on 20 Sep) that lets a guest build a gift registry containing items from *any* store, not just the merchant's, and correctly attributes purchases back to the right registry/item even through Shop Pay, Apple Pay, Google Pay, and the Shop app. Monetization is a disclosed affiliate commission on external-store purchases (now actually built, see below) plus a proposed merchant-side Pro subscription tier (still just a proposal, pending Ben's confirmation).

## 20 Sep, later session: screenshots, remaining renames, submission research, disclosed-commission code shipped

**Shipped and live-verified:**
- `app/lib/affiliate.ts` — network-agnostic outbound-link wrapping (no-op until `AFFILIATE_LINK_WRAPPER_BASE` is set), wired into `registry-page.ts`/`router.server.ts`. Disclosure text confirmed rendering on the real guest registry page. `registry-page.test.ts` rewritten to match (three new tests replacing the old "no affiliate params" test). Ben still needs to run `npm test` himself.
- Browser extension: fixed a real Etsy image-extraction bug (JSON-LD `image` is an array of `ImageObject`s, not strings — was silently breaking every Etsy photo) and added a Wayfair price fallback (DOM-proximity-to-`<h1>` heuristic, since the page repeats `[data-test-id="PriceDisplay"]` ~60 times). Both verified against real live product pages.
- The last four App Store screenshots captured live (guest registry page, the "Add to registry" block on a real product page, merchant dashboard with the live commission copy, the guest-facing commission disclosure text) and delivered to Ben. `app-store-listing.md`'s screenshot blocker is now closed.
- `shopify.app.toml`'s `name` → `"Giftpin"` (was still `"Codebeans Gift Registry"`) — takes effect in the Partner/Dev Dashboard on the next `shopify app deploy`.
- Store display name → **"Giftpin dev"** (Settings → General → Store contact details) — fixes the guest-facing "Registry by ___" footer and storefront header. Confirmed live immediately (note: the guest registry page itself is Redis-cached, so its footer will show the old name until that cache entry next regenerates — not a bug).
- `STATUS.md` now opens with an unmissable "do this the moment you deploy" block for the privacy-policy-URL switch.

**Attempted, needs Ben's hand:** the myshopify.com subdomain change (`registro-dev` → e.g. `giftpin-dev`) has an edit control in Settings → Domains, but it didn't respond to automated browser clicks — likely deliberately gated to a real user interaction. Exact path is in the next-session doc.

**Researched, not yet actioned:**
- Chrome Web Store & Edge Add-ons submission steps (exact click-paths, including a correction: the Edge extension logo goes on the Store Listings page, not Properties, despite what was said earlier).
- Shopify distribution decision (Public vs. Custom) — flagged as a one-way door, Ben's to confirm before anyone clicks through it. Public is what fits given the App Store work so far, and it's also where the listing's icon-upload field actually lives.
- Affiliate network research: **Sovrn Commerce or Skimlinks** (pick one — single application, server-side link-wrapping API, covers most retailers at once), **Amazon Associates** (always separate), **Walmart Creator** (moved off general networks onto its own portal in 2026). All manual signups — account creation and tax/bank details are outside what Claude can do.
- Pricing: recommended keeping Free (unlimited) + Pro ($9.99/mo) as drafted rather than switching to a competitor-style registry-count cap — reasoning is in the next-session doc. Awaiting Ben's confirmation before Shopify Billing gets built (schema/payment change, pause-for-review per `CLAUDE.md`).

## 20 Sep, earlier: renamed Registro → Giftpin (text/branding pass)

Ben's call — "Registro" felt silly. See prior entries below for the full rename pass and the "deliberately left alone" list — most of that list is now resolved (see above); what's left is the myshopify.com subdomain and the repo folder, both listed as Ben's actions in the next-session doc.

## 19–20 Sep: everything before the sessions above

- Live-refresh banner, retailer metadata expansion (Best Buy CA, Canadian Tire, Williams Sonoma, generic Microdata/Walmart, Target price selector), Edge port confirmed needing no code changes, theme compatibility spot-check (Sense installed as draft, full visual check still manual/optional).
- Three early bugs fixed: blank embedded admin (missing root route), zero webhook subscriptions, no background job ever running in dev (`ensureHandlersLoaded()` fix).
- Duplicate-add UX (explicit confirm instead of silent quantity bump) and the real concurrent-write race condition, both fixed and verified live; `RegistryItem` gained unique constraints with Ben's explicit go-ahead for the schema change.
- Browser extension built, loaded by Ben, and used successfully end to end (Amazon add), including a same-day fix for a "no photo" bug from Amazon's anti-scraping page structure.

## Shopify Partner Support

- **1.1.13 (duplicated product info):** answered informally, not binding — Shopify Support says the app's pattern sounds distinguishable, but only App Review can make the binding call. Note: that reply predates the disclosed-commission decision; `app-store-listing.md` flags this as worth a quick re-check with Support, not yet sent.
- **Protected customer data scope question:** sent 19 Sep, awaiting Shopify's reply — paste it into `partner-support-requests.md` when it arrives.

## Support & legal links
- Support email: `humphries.jaguar+giftpin@gmail.com`
- Privacy policy: published claude.ai artifact for now; switch to `https://<production-domain>/privacy` the moment the app deploys to production (route already built: `app/routes/privacy.tsx`).

## Where things live
- Codebase: `E:\Gift Registry App\registro` (rename to `...\giftpin` still pending — Ben's action)
- Architecture doc: `E:\Gift Registry App\architecture-decisions.md`
- Dev store: `registro-dev` (myshopify.com subdomain rename still pending — Ben's action); store display name is now "Giftpin dev"

## Known ongoing constraint
`device_bash` (the shell on Ben's Windows machine) has been intermittent across sessions — when down, file edits go through stage → edit → commit rather than in-place shell edits, and browser automation (Claude in Chrome) is used for anything requiring a live Shopify session. Worth double-checking anything reported as "committed" actually landed if a session gets interrupted mid-edit.