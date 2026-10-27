import db from "../db.server";
import { giftCardLines, type OrderLineItem } from "../lib/attribution";
import { settingsFor } from "./shop.server";
import {
  giftCardListingLive,
  listedGiftCardAmounts,
  type GiftCardListing,
} from "../shared/gift-card-listing";
import type { ContributionVariant } from "../shared/contributions";

/**
 * Gift cards sold through Giftpin's gift card listing (giftpin.app/gift-cards).
 *
 * Called from attributeOrder() and voidPurchases() in purchase.server.ts, so
 * it runs inside the existing attribute-order and void-purchases jobs: no new
 * job type, nothing to add to ensureHandlersLoaded() (CLAUDE.md hard rule 8).
 * Same idempotency as Purchase: the unique (orderId, lineItemId) index makes a
 * redelivered webhook a no-op, and voiding re-checks voidedAt.
 */

interface OrderLike {
  id: number | string;
  admin_graphql_api_id?: string;
  name?: string;
  currency?: string;
  line_items?: OrderLineItem[];
}

export async function recordGiftCardSales(shopDomain: string, order: OrderLike): Promise<number> {
  const shop = await db.shop.findUnique({ where: { domain: shopDomain } });
  if (!shop) return 0;

  const variantIds = new Set((settingsFor(shop).contributionProduct?.variants ?? []).map((v) => v.id));
  const lines = giftCardLines(order.line_items, shopDomain, variantIds);
  if (lines.length === 0) return 0;

  const orderId = String(order.admin_graphql_api_id ?? order.id);
  let recorded = 0;
  for (const line of lines) {
    try {
      await db.giftCardSale.create({
        data: {
          shopId: shop.id,
          orderId,
          lineItemId: line.lineItemId,
          orderName: order.name ?? null,
          qty: line.quantity,
          amount: line.amount,
          currency: order.currency ?? shop.currency,
          source: line.source,
        },
      });
      recorded++;
    } catch (err) {
      if ((err as { code?: string })?.code === "P2002") continue; // already recorded
      throw err;
    }
  }
  return recorded;
}

/** Refunds and cancellations. All lines of the order when lineItemIds is empty. */
export async function voidGiftCardSales(
  shopDomain: string,
  orderId: string,
  lineItemIds: string[] | undefined,
): Promise<number> {
  const { count } = await db.giftCardSale.updateMany({
    where: {
      orderId,
      voidedAt: null,
      shop: { domain: shopDomain },
      ...(lineItemIds && lineItemIds.length > 0 ? { lineItemId: { in: lineItemIds } } : {}),
    },
    data: { voidedAt: new Date() },
  });
  return count;
}

export interface GiftCardSalesSummary {
  count: number;
  total: number;
  currency: string;
  /** Giftpin's fee actually charged on these sales, in the billing currency (USD). */
  feesCharged: number;
}

/** Live (not refunded) gift cards sold through the listing since a date. */
export async function giftCardSalesSummary(
  shopId: string,
  since: Date,
  currency: string,
): Promise<GiftCardSalesSummary> {
  const [result, fees] = await Promise.all([
    db.giftCardSale.aggregate({
      where: { shopId, voidedAt: null, createdAt: { gte: since } },
      _sum: { amount: true, qty: true },
    }),
    // A fee stays charged even if the card is refunded later (Shopify has no
    // API to reverse it), so this one ignores voidedAt.
    db.giftCardSale.aggregate({
      where: { shopId, feeStatus: "charged", createdAt: { gte: since } },
      _sum: { feeAmount: true },
    }),
  ]);
  return {
    count: result._sum.qty ?? 0,
    total: Number(result._sum.amount ?? 0),
    currency,
    feesCharged: Number(fees._sum.feeAmount ?? 0),
  };
}

export interface ListedStore {
  domain: string;
  name: string;
  /** ISO country code, or null when not known yet. */
  country: string | null;
  blurb: string;
  currency: string;
  amounts: ContributionVariant[];
}

/**
 * Every store the giftpin.app directory shows, by name. Pro shops are few,
 * so reading them all and filtering the JSON settings here is cheaper than a
 * JSON query and keeps the rule in one place (giftCardListingLive).
 */
export async function listedGiftCardStores(): Promise<ListedStore[]> {
  const shops = await db.shop.findMany({
    where: { plan: "pro", uninstalledAt: null },
    select: { domain: true, name: true, currency: true, country: true, settings: true, plan: true, uninstalledAt: true },
  });
  return shops
    .map((shop) => ({ shop, settings: settingsFor(shop) }))
    .filter(({ shop, settings }) =>
      giftCardListingLive({
        pro: shop.plan === "pro",
        uninstalled: shop.uninstalledAt !== null,
        listing: settings.giftCardListing as GiftCardListing,
        product: settings.contributionProduct,
      }),
    )
    .map(({ shop, settings }) => ({
      domain: shop.domain,
      name: shop.name ?? shop.domain.replace(".myshopify.com", ""),
      country: shop.country ?? null,
      blurb: settings.giftCardListing.blurb,
      currency: shop.currency,
      amounts: listedGiftCardAmounts(settings.contributionProduct),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
