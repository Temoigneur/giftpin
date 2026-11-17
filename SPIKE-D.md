# Spike D: linked stores (multi-store registries)

Built 17 Nov 2026 on branch `claude/project-thread-uoncqk`, **not live-tested**.
Scope doc: https://claude.ai/artifact/NLP6UR6Yt7vbfWpKbtJThY

Per CLAUDE.md hard rule 1, nothing below counts as working until its row
passes on two linked **development** stores (dev stores can only link with dev
stores). Record date and order number in each row.

## Setup

1. Two dev stores, Giftpin installed on both (A and B), both on Pro (test charge).
2. `npx prisma migrate deploy` has applied `20261117150000_linked_stores`.
3. Store A admin: Settings → Linked stores → Create link code. Store B admin:
   enter it. Both admins list both stores.
4. On both stores, test products with **inventory tracking off** (hard rule 6).

## Matrix

| # | Check | Result |
|---|---|---|
| D1 | Create a registry on A. Open its manage page from the emailed link; banner lists A and B with an "Also open on B" link | |
| D2 | Open the manage page on B through that link; it loads (same registry) | |
| D3 | On B, use the theme's Add to registry button on a B product; it lands on A's registry with `sourceShopId = B` (check DB) | |
| D4 | A's guest page (`/apps/registry/r/<slug>`) shows the B item with "Buy at B"; the link opens B's `/apps/registry/g/<id>#item-<itemId>` | |
| D5 | On B's page, Add to cart puts `_rg` on B's cart line; checkout on B (standard) credits A's registry item once; Purchase.shopId = B | |
| D6 | Same as D5 through Shop Pay on B | |
| D7 | Refund the D5 order on B; the item shows available again | |
| D8 | An A product on B's page shows "Buy at A" (not Add to cart); an order on B cannot credit an A item (forge: add A item's `_rg` to B cart by hand; must be ignored) | |
| D9 | Stock: sold-out B product shows sold out on A's page | |
| D10 | Unlink B. A's page shows the B item as "Find it at B" + "I bought this"; orders already in B carts still credit (hard rule 5) | |
| D11 | customers/redact on B for a buyer of D5 erases the buyer name on A's registry (trigger via Partner dashboard or a test payload) | |
| D12 | Uninstall B, wait for shop/redact (or POST a test): B items on A's registries become manual items, counts kept, A's registries intact | |
| D13 | Currency: A in CAD, B in USD. B items show USD on both pages; A's dashboard revenue excludes B's sales | |
| D14 | Password registry opened on B prompts for the password and unlocks on `g/<id>` | |
| D15 | "My registries" account link minted on A works on B and lists the registry | |

## Known limits (by design, MVP)

- Gift cards, cash funds and chip-ins stay on the registry's own store; B's
  page links funds back to A. The 2% gift card fee can only be charged to the
  selling store's own subscription.
- The store-match ("In this store") suggestion and swap run only on the
  registry's own store.
- Linked stores' URLs assume the default `/apps/registry` proxy prefix.
- Merging two existing groups isn't supported (unlink first).
- Variant ids are assumed globally unique across Shopify stores
  (`@@unique([registryId, variantGid])` unchanged). If ever wrong, the second
  add reports "already on your registry": the safe failure.
