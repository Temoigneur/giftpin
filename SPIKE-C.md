# Spike C: group gifting and cash funds

**Claim under test:** a guest can buy a gift card from the merchant's own
store as a contribution toward a registry item or fund, and:

1. the `_rg` line property survives checkout on the gift card line, the same
   way it does on a normal product (Spike A), and
2. Shopify's recipient properties deliver the gift card to the couple when we
   set them.

**Why:** cash funds and group gifting (Pro feature 5) are built on this. The
code is on the `claude/project-thread-jwaw93` branch and **must not be merged
until rows C1–C4 pass live** (CLAUDE.md: "Before building on attribution, run
the spike").

---

## What was ruled out, and why (from docs, not yet live)

| Option | Why not |
|---|---|
| Let guests type any amount (Cart Transform `lineUpdate` price override) | "lineUpdate, including price, title, and image overrides, is currently limited to development stores and Shopify Plus stores." ([forum, Jul 2026](https://community.shopify.dev/t/why-is-cart-transform-lineupdate-limited-to-shopify-plus/36095)). **It works on a dev store**, so it would pass our own tests and then fail on every non-Plus merchant. |
| Giftpin issues the gift card itself (`giftCardCreate`) | The REST gift card docs say `read_gift_cards`/`write_gift_cards` must be requested from Shopify Support. The access-scopes page lists no such requirement. The two docs contradict each other, so we don't depend on it. |
| Pay cash to the couple | That's money transmission. An app can't do it, and App Review would reject it. |

## What was built

- The merchant creates a normal **gift card product** in Shopify admin
  (Products → Gift cards) with a few denominations, e.g. $25 / $50 / $100 /
  $250. Then, in Giftpin → Settings → **Group gifts and funds**, they pick it.
  This needs no new API scope: Giftpin only reads the product.
- A guest picks an amount on a fund or group-gift item. The page adds **one
  gift card line** to the cart with `_rg` (the same signed token as every
  other registry line). If the couple opted in, it also sets Shopify's
  recipient properties (below).
- `orders/create` records the line as a contribution: `Purchase.isContribution
  = true`, and `RegistryItem.fundedAmount` goes up by the line's amount. It
  never touches `purchasedQty`. Refunds and cancellations reverse it.
- An item counts as taken once `fundedAmount >= fundGoal`.

Recipient properties used, per
[Shopify's gift card recipient docs](https://shopify.dev/docs/storefronts/themes/product-merchandising/gift-cards)
(**unverified live**):

```
Recipient email                         <couple's email>
Recipient name                          <couple's first names>
Message                                 <guest's note, 200 chars max>
__shopify_send_gift_card_to_recipient   true
```

The same doc says: *"The recipient form validation doesn't support
accelerated checkout buttons."* That is about the product-page form. Whether
the properties still work when the line is added through `/cart/add.js` and
paid with Shop Pay is row C2.

---

## Setup (~15 minutes)

1. Dev store admin → **Products → Gift cards → Create gift card**. Title
   "Registry contribution", denominations $25, $50, $100. Gift cards don't
   track inventory, but check anyway (CLAUDE.md hard rule 6).
2. Make the store's Giftpin plan Pro: start the free trial from Giftpin →
   Plan. `BILLING_TEST_MODE` stays on.
3. Giftpin → Settings → **Group gifts and funds** → pick "Registry
   contribution" → Save.
4. Open a test registry's manage link → **Add a cash fund** ("Honeymoon",
   goal $500). Tick "Email chip-in gift cards straight to me" for rows C2–C3.
   Untick it for row C4.
5. On the registry page, the fund shows "Chip in".

## The matrix

| # | Path | Steps | Pass when | Result |
|---|---|---|---|---|
| C1 | Standard checkout, test card | Chip in $50 → cart → Checkout → `4242…` | Admin order shows the gift card line with `_rg`. `orders/create` has the line with `gift_card: true` and `_rg` in `properties`. Fund page shows "$50 of $500". | — |
| C2 | **Shop Pay from the cart page**, recipient opted in | Chip in $25 → cart → Shop Pay button | Same as C1, **and** the gift card email goes to the couple's address, not the buyer's | — |
| C3 | Standard checkout, recipient opted in | As C1 with the opt-in on | Couple receives the gift card email with the guest's message | — |
| C4 | Opt-in off | As C1 | Gift card email goes to the buyer. The couple's email appears nowhere in the cart or checkout. | — |
| C5 | Refund the C1 line from admin | Refund | Fund drops back by $50 | — |
| C6 | Group gift on an internal item | Manage page → "Let guests chip in" on a $300 item → chip in $100, then buy the item outright via Add to cart | Chip-in shows "$100 of $300". The outright buy marks the item taken, same as today. | — |
| C7 | Apple Pay / Google Pay | As C2 on a phone | Same as C2 | — |

**If C2 fails** (the recipient is dropped under Shop Pay, but `_rg` survives),
the fallback is to stop setting recipient properties at all. The card then
goes to the guest to forward, which is what the opt-out path already does.

**If C1 fails** (no `_rg` on a gift card line), stop: group gifting can't be
attributed and the feature doesn't ship.

## Results

_Not run yet._
