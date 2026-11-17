import db from "../db.server";
import { STAT_METRICS, statDay } from "../shared/stats";
import { PRO_PLAN_PRICE } from "../shared/plans";
import { groupShops, salesTakenByWhere } from "./store-group.server";

/**
 * "All your stores" (Pro, linked stores): registry sales, guest engagement
 * and return on Pro, store by store and in total, for a merchant whose stores
 * are linked (store-group.server.ts).
 *
 * Money is never converted between currencies: we have no rate source we
 * trust, and a made-up total would be the one number the merchant quotes.
 * Totals are given per currency instead. Pro is billed in USD, so the
 * "times Pro paid for itself" figure is only given for USD sales.
 */

export interface StorePerformance {
  shopId: string;
  name: string;
  currency: string;
  pro: boolean;
  current: boolean;
  /** Registry gifts this store sold online (its own registries and linked ones), store currency. */
  registrySales: number;
  giftsSold: number;
  /** Every order the store took in the period, store currency (for "registry share"). */
  storeSales: number;
  /** Registry share of the store's sales, %, or null with no store sales counted. */
  registrySharePercent: number | null;
  registryViews: number;
  cartAdds: number;
  /** Clicks out to other websites from this store's registry pages. */
  outsideClicks: number;
  /** Guests sent here by another linked store's "Buy at" button. */
  linkedArrivals: number;
  /** Cart adds per 100 registry views, or null with no views. */
  cartAddRate: number | null;
  /** Active registries homed on this store. */
  activeRegistries: number;
}

export interface GroupPerformance {
  sinceDays: number;
  stores: StorePerformance[];
  /** Registry sales summed per currency, largest first. */
  salesByCurrency: { currency: string; amount: number }[];
  totals: { giftsSold: number; registryViews: number; cartAdds: number; outsideClicks: number; linkedArrivals: number; activeRegistries: number };
  /** What Pro cost across the group's Pro stores for the period, USD. */
  proCostUsd: number;
  /** USD registry sales divided by proCostUsd, or null when there are none or no Pro cost. */
  proPaidForItselfTimes: number | null;
}

/** Pro's price for `days` days, pro rata. */
export function proCostFor(days: number, proStores: number): number {
  return Math.round(((PRO_PLAN_PRICE * 12) / 365) * days * proStores * 100) / 100;
}

export function rate(part: number, whole: number): number | null {
  return whole > 0 ? Math.round((part / whole) * 1000) / 10 : null;
}

/**
 * The group's numbers over the last `sinceDays` days, or null when `shopId`
 * isn't linked to another store.
 */
export async function groupPerformance(shopId: string, sinceDays = 30, now = new Date()): Promise<GroupPerformance | null> {
  const shops = await groupShops(shopId);
  if (shops.length < 2) return null;
  const ids = shops.map((s) => s.id);
  const since = new Date(now.getTime() - sinceDays * 86_400_000);

  const [stats, purchasesByShop, registries] = await Promise.all([
    db.dailyStat.groupBy({
      by: ["shopId", "metric"],
      where: { shopId: { in: ids }, day: { gte: statDay(since) } },
      _sum: { count: true, value: true },
    }),
    Promise.all(
      shops.map((s) =>
        db.purchase.findMany({
          where: { voidedAt: null, source: "online", createdAt: { gte: since }, ...salesTakenByWhere(s.id) },
          select: { amount: true, qty: true, isContribution: true },
        }),
      ),
    ),
    db.registry.groupBy({ by: ["shopId"], where: { shopId: { in: ids }, status: "active" }, _count: { _all: true } }),
  ]);

  const stat = (id: string, metric: string) => stats.find((r) => r.shopId === id && r.metric === metric)?._sum;

  const stores = shops.map((s, n): StorePerformance => {
    const mine = purchasesByShop[n];
    const registrySales = round2(mine.reduce((sum, p) => sum + Number(p.amount ?? 0), 0));
    const storeSales = Number(stat(s.id, STAT_METRICS.storeOrder)?.value ?? 0);
    const registryViews = stat(s.id, STAT_METRICS.registryView)?.count ?? 0;
    const cartAdds = stat(s.id, STAT_METRICS.cartAdd)?.count ?? 0;
    return {
      shopId: s.id,
      name: s.name ?? s.domain.replace(".myshopify.com", ""),
      currency: s.currency,
      pro: s.plan === "pro",
      current: s.id === shopId,
      registrySales,
      giftsSold: mine.reduce((sum, p) => sum + (p.isContribution ? 1 : p.qty), 0),
      storeSales: round2(storeSales),
      registrySharePercent: rate(registrySales, storeSales),
      registryViews,
      cartAdds,
      outsideClicks: stat(s.id, STAT_METRICS.externalClick)?.count ?? 0,
      linkedArrivals: stat(s.id, STAT_METRICS.linkedArrival)?.count ?? 0,
      cartAddRate: rate(cartAdds, registryViews),
      activeRegistries: registries.find((r) => r.shopId === s.id)?._count._all ?? 0,
    };
  });

  const byCurrency = new Map<string, number>();
  for (const s of stores) byCurrency.set(s.currency, (byCurrency.get(s.currency) ?? 0) + s.registrySales);
  const salesByCurrency = [...byCurrency]
    .map(([currency, amount]) => ({ currency, amount: round2(amount) }))
    .sort((a, b) => b.amount - a.amount);

  const sum = (k: keyof StorePerformance) => stores.reduce((acc, s) => acc + (s[k] as number), 0);
  const proCostUsd = proCostFor(sinceDays, stores.filter((s) => s.pro).length);
  const usdSales = byCurrency.get("USD") ?? 0;

  return {
    sinceDays,
    stores,
    salesByCurrency,
    totals: {
      giftsSold: sum("giftsSold"),
      registryViews: sum("registryViews"),
      cartAdds: sum("cartAdds"),
      outsideClicks: sum("outsideClicks"),
      linkedArrivals: sum("linkedArrivals"),
      activeRegistries: sum("activeRegistries"),
    },
    proCostUsd,
    proPaidForItselfTimes: proCostUsd > 0 && usdSales > 0 ? Math.round((usdSales / proCostUsd) * 10) / 10 : null,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
