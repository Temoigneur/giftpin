# Registry promotions (Pro)

Sales and coupons that only apply to gifts bought from a registry. Overview →
Promotions in the merchant admin (`app/routes/app.promotions.tsx`).

## How it works
- One Shopify discount function, `extensions/registry-discount`, discounts only
  cart lines carrying the `_rg` registry tag. The same product bought normally
  is full price. Gift cards (cash funds, group gifts) are never discounted.
- Each promotion is a Shopify app discount: automatic (sale) or code (coupon).
  Its settings live in the discount's `$app:function-configuration` metafield.
  Giftpin stores only the discount ids (`ShopSettings.promotionIds`). No
  database change.
- Leaving Pro pauses every promotion (`webhooks.app_subscriptions.update`).
  Re-upgrading lets the merchant Resume them.
- The completion discount stays in Settings; the Promotions page links to it.

## Known limit
The function cannot verify the `_rg` signature (no key, no crypto in a
function), so it checks shape only. Anyone can make a registry and buy from it,
so a registry price is as open as a public coupon. The page says so.

## Not verified live (CLAUDE.md hard rule 1)
Needs `shopify app deploy` first (new function extension).
1. Create a sale and a coupon from the page; both appear in Shopify Discounts.
2. Standard checkout with a registry item: discount applies, name shows.
3. Shop Pay checkout: `_rg` line property is readable by the function.
4. Same product added normally: full price.
5. Collection selection, min-quantity tier, end date, usage limit.
6. Downgrade pauses; Resume works after re-upgrading.
7. Function input shape (`attribute(key:)` alias, `isGiftCard`) accepted by
   `shopify app function build`; generated types may need `npm run shopify
   app function typegen`.

## Advertising (PR 2)
Running promotions (status ACTIVE, Pro shops) are shown by `app/shared/promotion-display.ts`:
- banner above the list on the guest registry page (inline CSS, so pages without
  promotions carry no extra bytes; the 50KB test still passes);
- "Registry price $X" / "15% off on 3+ registry gifts" on each discounted store item;
- perk lines on the registrant's create and manage pages.
Coupon codes are shown publicly on the page. Fetched from Shopify at most once a
minute per shop (cache), on top of the 60s page cache, so a new promotion can
take up to ~2 minutes to appear. Unverified live: banner and tags on a real
storefront, collection-scoped matching.

## Function build (fix, 5 Nov)
The first version of the function never built (no schema.graphql, no codegen
config), so `shopify app deploy` released nothing and creating a promotion said
"Function registry-discount not found". Rebuilt on the CLI's own discount
scaffold. The logic is plain TypeScript in `src/registry_discount.ts` (tested by
`app/shared/__tests__/promotions.test.ts`); `src/cart_lines_discounts_generate_run.js`
re-exports it for the build. Verified with Shopify CLI 3.85: GraphQL types
generate against the schema and the JS bundles. The last step (javy → wasm) needs
Shopify's CDN, so the first full build happens on your `shopify app deploy`.

## Verified live (5 Nov 2026, giftpin-merchant-view, Bogus gateway)
- Function built and released with `shopify app deploy` (needed extension-level
  `[extensions.input.variables]` on Ben's older CLI).
- Registry sale created from the Promotions page (20% off, all products).
- Standard checkout, item added from a registry: 20% off applied.
- Same product added from its own product page: full price.
Still to check: Shop Pay (registro-dev), coupon with a code, collection and
min-quantity deals, pause on downgrade, banner and price tags (need #106 live).
