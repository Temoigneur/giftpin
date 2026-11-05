/**
 * Registry promotions (Giftpin Pro): the discount function itself.
 *
 * Discounts only the cart lines that were added from a registry, which are
 * the lines carrying Giftpin's `_rg` line property (app/lib/attribution.ts).
 * The same product added normally gets nothing.
 *
 * The function can't check the `_rg` signature (it has no access to the
 * signing key and no crypto), so it only checks the token's shape. That's
 * not a real loss: anyone can create a registry, add an item and buy it
 * themselves with a genuine token. A registry price is exactly as open as a
 * public coupon, and the admin page says so.
 *
 * Deliberately no imports: the settings shape is mirrored from
 * app/shared/promotions.ts, and app/shared/__tests__/promotions.test.ts runs
 * this function against configs built by the app so the two can't drift.
 *
 * NOT YET VERIFIED LIVE (CLAUDE.md hard rule #1): that `_rg` is readable here
 * through Shop Pay, and the exact output shape. See docs/registry-promotions.md.
 */

export const REGISTRY_TAG_SHAPE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export interface PromotionConfig {
  v: 1;
  valueType: "percentage" | "fixed";
  /** Percent off (1-90) or an amount off each item, in the shop's currency. */
  amount: number;
  /** Every product, or only the ones listed below. */
  allProducts: boolean;
  productIds: string[];
  collectionIds: string[];
  /** Registry items needed in the cart (summed quantities) before it applies. */
  minQuantity: number;
  /** Shown to the guest at checkout next to the discounted line. */
  message: string;
}

export interface RunInput {
  cart: {
    lines: Array<{
      id: string;
      quantity: number;
      registryTag?: { value?: string | null } | null;
      merchandise: {
        __typename: string;
        id?: string;
        product?: { id: string; isGiftCard?: boolean; inAnyCollection?: boolean | null };
      };
    }>;
  };
  discount: {
    discountClasses: string[];
    metafield?: { jsonValue?: unknown } | null;
  };
}

export interface RunResult {
  operations: Array<{
    productDiscountsAdd: {
      selectionStrategy: "FIRST";
      candidates: Array<{
        message: string;
        targets: Array<{ cartLine: { id: string } }>;
        value:
          | { percentage: { value: number } }
          | { fixedAmount: { amount: number; appliesToEachItem: boolean } };
      }>;
    };
  }>;
}

const NO_DISCOUNT: RunResult = { operations: [] };

/** Reads the metafield defensively: anything unexpected means "no discount". */
export function readConfig(json: unknown): PromotionConfig | null {
  if (!json || typeof json !== "object") return null;
  const c = json as Partial<PromotionConfig>;
  if (c.v !== 1) return null;
  if (c.valueType !== "percentage" && c.valueType !== "fixed") return null;
  const amount = Number(c.amount);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (c.valueType === "percentage" && amount > 100) return null;
  const productIds = Array.isArray(c.productIds) ? c.productIds.filter((id) => typeof id === "string") : [];
  const collectionIds = Array.isArray(c.collectionIds) ? c.collectionIds.filter((id) => typeof id === "string") : [];
  const allProducts = c.allProducts === true;
  // A promotion with nothing selected must not quietly become "everything".
  if (!allProducts && productIds.length === 0 && collectionIds.length === 0) return null;
  const minQuantity = Math.max(1, Math.floor(Number(c.minQuantity) || 1));
  const message = typeof c.message === "string" && c.message.trim() ? c.message.trim() : "Registry price";
  return { v: 1, valueType: c.valueType, amount, allProducts, productIds, collectionIds, minQuantity, message };
}

export function cartLinesDiscountsGenerateRun(input: RunInput): RunResult {
  if (!input.discount.discountClasses.includes("PRODUCT")) return NO_DISCOUNT;
  const config = readConfig(input.discount.metafield?.jsonValue);
  if (!config) return NO_DISCOUNT;

  const eligible = input.cart.lines.filter((line) => {
    const tag = line.registryTag?.value;
    if (!tag || !REGISTRY_TAG_SHAPE.test(tag)) return false;
    const product = line.merchandise.__typename === "ProductVariant" ? line.merchandise.product : undefined;
    // Gift cards are cash funds and group gifts: never discount money.
    if (!product || product.isGiftCard) return false;
    return config.allProducts || config.productIds.includes(product.id) || product.inAnyCollection === true;
  });
  if (eligible.length === 0) return NO_DISCOUNT;

  const registryQuantity = eligible.reduce((sum, line) => sum + line.quantity, 0);
  if (registryQuantity < config.minQuantity) return NO_DISCOUNT;

  return {
    operations: [
      {
        productDiscountsAdd: {
          selectionStrategy: "FIRST",
          candidates: [
            {
              message: config.message,
              targets: eligible.map((line) => ({ cartLine: { id: line.id } })),
              value:
                config.valueType === "percentage"
                  ? { percentage: { value: config.amount } }
                  : { fixedAmount: { amount: config.amount, appliesToEachItem: true } },
            },
          ],
        },
      },
    ],
  };
}
