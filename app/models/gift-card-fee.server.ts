import db from "../db.server";
import { registerHandler } from "../lib/queue.server";
import { unauthenticated } from "../shopify.server";
import { GIFT_CARD_FEE_HOLD_DAYS, GIFT_CARD_FEE_PERCENT, PRO_PLAN } from "../shared/plans";

/**
 * Giftpin's 2% fee on gift cards sold through the giftpin.app listing
 * (Ben, 24 Oct 2026), billed as a Shopify usage charge on the store's Pro
 * subscription (the usage line in app/shopify.server.ts).
 *
 * Runs as its own daily job, never inside attribution, so a billing error can
 * never stop a sale being recorded. Each GiftCardSale is looked at once its
 * refund hold has passed (GIFT_CARD_FEE_HOLD_DAYS; none on dev stores, so
 * the flow can be tested), and ends with one feeStatus:
 *
 *   charged               usage record created (idempotency key = sale id)
 *   waived_voided         refunded or cancelled before the hold ended
 *   waived_not_pro        store no longer on Pro, or uninstalled
 *   waived_no_usage_line  subscription predates the fee; nothing to bill
 *   waived_trial          sold during the subscription's free trial, which
 *                         covers a founding store's whole free year
 *   failed                Shopify refused for 30 days (e.g. over the cap)
 *
 * A failure leaves feeStatus null so the next day's run tries again; the
 * idempotency key means a retry can never bill twice.
 *
 * NOT VERIFIED LIVE (CLAUDE.md hard rule 1): whether Shopify accepts usage
 * records during a trial, and whether existing subscribers keep a usage-free
 * subscription until they re-approve. Both are rows in SPIKE-C.md Part 4.
 */

const DAY_MS = 86_400_000;
const GIVE_UP_AFTER_DAYS = 30;
const BATCH = 500;

registerHandler("charge-gift-card-fees", async ({ shop }) => {
  await chargeGiftCardFees({ shop });
});

export interface SubscriptionInfo {
  /** Usage line item id, or null when the subscription has none. */
  usageLineItemId: string | null;
  /** Currency of the usage line's capped amount. */
  usageCurrency: string | null;
  createdAt: Date;
  trialDays: number;
}

export type FeeDecision =
  | { status: "waived_voided" | "waived_not_pro" | "waived_no_usage_line" | "waived_trial" }
  | { status: "charge"; fee: number };

/** The pure part: what to do with one sale. `fee` is in the shop's currency. */
export function decideFee(
  sale: { amount: number; createdAt: Date; voided: boolean },
  shop: { pro: boolean; uninstalled: boolean },
  subscription: SubscriptionInfo | null,
): FeeDecision {
  if (sale.voided) return { status: "waived_voided" };
  if (!shop.pro || shop.uninstalled || !subscription) return { status: "waived_not_pro" };
  if (!subscription.usageLineItemId) return { status: "waived_no_usage_line" };
  const trialEnds = subscription.createdAt.getTime() + subscription.trialDays * DAY_MS;
  if (sale.createdAt.getTime() < trialEnds) return { status: "waived_trial" };
  return { status: "charge", fee: feeFor(sale.amount) };
}

/** 2% of the card's value, to the cent. */
export function feeFor(amount: number): number {
  return Math.round(amount * GIFT_CARD_FEE_PERCENT) / 100;
}

const SUBSCRIPTIONS_QUERY = `#graphql
  query giftpinActiveSubscriptions {
    currentAppInstallation {
      activeSubscriptions {
        name
        createdAt
        trialDays
        lineItems {
          id
          plan {
            pricingDetails {
              __typename
              ... on AppUsagePricing { cappedAmount { currencyCode } }
            }
          }
        }
      }
    }
  }`;

const USAGE_RECORD_MUTATION = `#graphql
  mutation giftpinGiftCardFee($lineItemId: ID!, $description: String!, $price: MoneyInput!, $key: String!) {
    appUsageRecordCreate(
      subscriptionLineItemId: $lineItemId
      description: $description
      price: $price
      idempotencyKey: $key
    ) {
      appUsageRecord { id }
      userErrors { field message }
    }
  }`;

type Graphql = (query: string, options?: { variables?: Record<string, unknown> }) => Promise<Response>;

export function readSubscription(body: unknown): SubscriptionInfo | null {
  const subs =
    (body as { data?: { currentAppInstallation?: { activeSubscriptions?: unknown[] } } })?.data
      ?.currentAppInstallation?.activeSubscriptions ?? [];
  const sub = (subs as {
    name?: string;
    createdAt?: string;
    trialDays?: number;
    lineItems?: { id: string; plan?: { pricingDetails?: { __typename?: string; cappedAmount?: { currencyCode?: string } } } }[];
  }[]).find((s) => s.name === PRO_PLAN);
  if (!sub) return null;
  const usage = (sub.lineItems ?? []).find((li) => li.plan?.pricingDetails?.__typename === "AppUsagePricing");
  return {
    usageLineItemId: usage?.id ?? null,
    usageCurrency: usage?.plan?.pricingDetails?.cappedAmount?.currencyCode ?? null,
    createdAt: new Date(sub.createdAt ?? 0),
    trialDays: Number(sub.trialDays ?? 0),
  };
}

/**
 * Shop currency → billing currency, from the European Central Bank's daily
 * rates (api.frankfurter.dev, free, no key). A failed lookup throws, and the
 * sale waits for tomorrow's run rather than being billed at a guessed rate.
 */
export async function fxRate(from: string, to: string, fetchImpl: typeof fetch = fetch): Promise<number> {
  if (from === to) return 1;
  const res = await fetchImpl(`https://api.frankfurter.dev/v1/latest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  if (!res.ok) throw new Error(`exchange rate ${from}->${to}: HTTP ${res.status}`);
  const rate = Number(((await res.json()) as { rates?: Record<string, number> }).rates?.[to]);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error(`exchange rate ${from}->${to}: no rate`);
  return rate;
}

export interface FeeDeps {
  graphqlFor: (shopDomain: string) => Promise<Graphql>;
  rate: (from: string, to: string) => Promise<number>;
}

const defaultDeps: FeeDeps = {
  graphqlFor: async (shopDomain) => {
    const { admin } = await unauthenticated.admin(shopDomain);
    return (query, options) => admin.graphql(query, options);
  },
  rate: (from, to) => fxRate(from, to),
};

export async function chargeGiftCardFees(
  options: { shop?: string; now?: Date } = {},
  deps: FeeDeps = defaultDeps,
): Promise<{ charged: number; waived: number; failed: number }> {
  const now = options.now ?? new Date();
  const holdCutoff = new Date(now.getTime() - GIFT_CARD_FEE_HOLD_DAYS * DAY_MS);

  const sales = await db.giftCardSale.findMany({
    where: {
      feeStatus: null,
      // Dev stores skip the hold so the whole flow can be tested in a day.
      OR: [{ createdAt: { lte: holdCutoff } }, { shop: { devStore: true } }],
      ...(options.shop ? { shop: { domain: options.shop } } : {}),
    },
    include: { shop: true },
    orderBy: { createdAt: "asc" },
    take: BATCH,
  });

  const result = { charged: 0, waived: 0, failed: 0 };
  const subscriptions = new Map<string, SubscriptionInfo | null>();

  for (const sale of sales) {
    const shop = sale.shop;
    try {
      const pro = shop.plan === "pro" && shop.uninstalledAt === null;
      let subscription: SubscriptionInfo | null = null;
      if (pro && !sale.voidedAt) {
        if (!subscriptions.has(shop.id)) {
          const graphql = await deps.graphqlFor(shop.domain);
          subscriptions.set(shop.id, readSubscription(await (await graphql(SUBSCRIPTIONS_QUERY)).json()));
        }
        subscription = subscriptions.get(shop.id) ?? null;
      }

      const decision = decideFee(
        { amount: Number(sale.amount), createdAt: sale.createdAt, voided: sale.voidedAt !== null },
        { pro, uninstalled: shop.uninstalledAt !== null },
        subscription,
      );

      if (decision.status !== "charge") {
        await db.giftCardSale.update({
          where: { id: sale.id },
          data: { feeStatus: decision.status, feeCheckedAt: now },
        });
        result.waived++;
        continue;
      }

      const billingCurrency = subscription!.usageCurrency ?? "USD";
      const rate = await deps.rate(sale.currency, billingCurrency);
      const feeAmount = Math.max(0.01, Math.round(decision.fee * rate * 100) / 100);

      const graphql = await deps.graphqlFor(shop.domain);
      const body = (await (
        await graphql(USAGE_RECORD_MUTATION, {
          variables: {
            lineItemId: subscription!.usageLineItemId,
            description: `${GIFT_CARD_FEE_PERCENT}% of a ${Number(sale.amount).toFixed(2)} ${sale.currency} gift card sold through giftpin.app (order ${sale.orderName ?? sale.orderId})`,
            price: { amount: feeAmount.toFixed(2), currencyCode: billingCurrency },
            key: sale.id,
          },
        })
      ).json()) as {
        data?: { appUsageRecordCreate?: { appUsageRecord?: { id: string } | null; userErrors?: { message: string }[] } };
      };
      const created = body.data?.appUsageRecordCreate;
      if (!created?.appUsageRecord) {
        const message = created?.userErrors?.map((e) => e.message).join("; ") || "no usage record returned";
        throw new Error(message);
      }

      await db.giftCardSale.update({
        where: { id: sale.id },
        data: {
          feeStatus: "charged",
          feeAmount: feeAmount.toFixed(2),
          feeCurrency: billingCurrency,
          feeRate: rate.toFixed(6),
          usageRecordId: created.appUsageRecord.id,
          feeCheckedAt: now,
        },
      });
      result.charged++;
    } catch (err) {
      result.failed++;
      console.error(`[gift-card-fee] sale ${sale.id} (${shop.domain}):`, (err as Error).message);
      const giveUp = now.getTime() - sale.createdAt.getTime() > (GIFT_CARD_FEE_HOLD_DAYS + GIVE_UP_AFTER_DAYS) * DAY_MS;
      await db.giftCardSale.update({
        where: { id: sale.id },
        data: { feeCheckedAt: now, ...(giveUp ? { feeStatus: "failed" } : {}) },
      });
    }
  }

  if (sales.length > 0) console.log(`[gift-card-fee] ${JSON.stringify(result)}`);
  return result;
}
