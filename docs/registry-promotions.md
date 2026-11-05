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
