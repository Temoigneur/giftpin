/**
 * Group gifting and cash funds (Pro) — pure helpers. See SPIKE-C.md.
 *
 * Guests chip in by buying a gift card from the merchant's own store. The gift
 * card line carries the same signed `_rg` token as any registry line, so no
 * change to how attribution is signed or verified; the webhook just treats the
 * line as money toward the item instead of a unit of it.
 *
 * Not a `.server` file: the admin settings page and the guest page renderer
 * both use these (CLAUDE.md hard rule 2).
 */

/** One denomination of the merchant's contribution gift card product. */
export interface ContributionVariant {
  /** Numeric ProductVariant id — what /cart/add.js takes. */
  id: string;
  /** Face value, in shop currency. */
  amount: number;
}

/** Stored in Shop.settings.contributionProduct. */
export interface ContributionProduct {
  productGid: string;
  title: string;
  variants: ContributionVariant[];
}

/** Keeps only well-formed, positive denominations, smallest first. */
export function cleanContributionVariants(raw: unknown): ContributionVariant[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: ContributionVariant[] = [];
  for (const entry of raw) {
    const id = String((entry as { id?: unknown })?.id ?? "").replace(/^gid:\/\/shopify\/ProductVariant\//, "");
    const amount = Number((entry as { amount?: unknown })?.amount);
    if (!/^\d+$/.test(id) || !Number.isFinite(amount) || amount <= 0 || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, amount: Math.round(amount * 100) / 100 });
  }
  return out.sort((a, b) => a.amount - b.amount);
}

export interface FundState {
  goal: number;
  funded: number;
  /** 0-100, capped. */
  percent: number;
  /** Never negative. */
  remaining: number;
  complete: boolean;
}

export function fundState(goal: unknown, funded: unknown): FundState | null {
  const g = Number(goal);
  if (goal === null || goal === undefined || !Number.isFinite(g) || g <= 0) return null;
  const f = Math.max(0, Number(funded) || 0);
  return {
    goal: g,
    funded: f,
    percent: Math.min(100, Math.floor((f / g) * 100)),
    remaining: Math.max(0, Math.round((g - f) * 100) / 100),
    complete: f >= g,
  };
}

/**
 * Whether an attributed order line is a chip-in rather than a purchase of the
 * item itself.
 *
 * - A fund has no product, so anything credited to it is money toward it.
 * - Otherwise a line is a contribution only if it is a gift card AND not the
 *   item's own variant. The second check matters: a registrant can list the
 *   store's gift card as an ordinary item ("a $50 gift card"), and buying that
 *   must count as buying it (purchasedQty), not as a chip-in.
 * - A non-gift-card line keeps today's behaviour (counts as a unit bought).
 *   Erring toward "bought" is the safe direction (CLAUDE.md hard rule 5).
 *
 * `giftCard` comes from the order webhook's `line_items[].gift_card`, with the
 * merchant's configured contribution variants as a second signal in case that
 * field is missing. SPIKE-C row C1 confirms the field live.
 */
export function isContributionLine(
  item: { sourceType: string; variantGid: string | null },
  line: { giftCard: boolean; variantId: string | null },
  contributionVariantIds: ReadonlySet<string> = new Set(),
): boolean {
  if (item.sourceType === "fund") return true;
  const isGiftCard = line.giftCard || (line.variantId !== null && contributionVariantIds.has(line.variantId));
  if (!isGiftCard) return false;
  const ownVariant = item.variantGid?.split("/").pop() ?? null;
  return line.variantId === null || line.variantId !== ownVariant;
}

/**
 * Shopify's gift card recipient line properties. Names are from
 * https://shopify.dev/docs/storefronts/themes/product-merchandising/gift-cards
 * and are NOT yet verified live (SPIKE-C rows C2–C3, CLAUDE.md hard rule 1).
 */
export function giftCardRecipientProperties(recipient: {
  email: string;
  name: string;
  message?: string | null;
}): Record<string, string> {
  const props: Record<string, string> = {
    "Recipient email": recipient.email,
    "Recipient name": recipient.name.slice(0, 255),
    __shopify_send_gift_card_to_recipient: "true",
  };
  const message = recipient.message?.trim();
  if (message) props.Message = message.slice(0, 200);
  return props;
}

/**
 * What a chip-in line is worth toward the goal. The order's own line price is
 * the truth; the configured denomination is the fallback for a payload with
 * no price. Discounts are ignored on purpose: a $50 card is $50 to the couple.
 */
export function contributionValue(
  line: { amount: string | null; quantity: number; variantId: string | null },
  variants: { id: string; amount: number }[],
): string | null {
  if (line.amount !== null) return line.amount;
  const variant = variants.find((v) => v.id === line.variantId);
  return variant ? (variant.amount * line.quantity).toFixed(2) : null;
}
