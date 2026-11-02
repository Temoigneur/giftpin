import { randomUUID } from "node:crypto";
import db from "../db.server";
import { STAT_METRICS, isLikelyBot, statDay, type StatMetric } from "../shared/stats";

/**
 * Daily counters: registry page views, guest actions and the store's own
 * order totals. Feeds Giftpin's ops view (/ops) for every store, Free
 * included, and later the merchant's own analytics.
 *
 * A counter is never allowed to break the page or webhook that bumps it:
 * every write here swallows its own error. A lost view is a rounding error; a
 * guest page that 500s because a stats insert failed is a lost gift.
 */

/**
 * Adds `count` (and `value`) to today's row for this shop/metric/registry.
 * One atomic INSERT ... ON CONFLICT, so two guests opening the same registry
 * at the same instant both count (a Prisma upsert can lose that race).
 */
export async function bumpStat(
  shopId: string,
  metric: StatMetric,
  opts: { registryId?: string; count?: number; value?: number; at?: Date } = {},
): Promise<void> {
  const day = statDay(opts.at);
  const count = opts.count ?? 1;
  const value = opts.value ?? 0;
  const registryId = opts.registryId ?? "";
  try {
    await db.$executeRaw`
      INSERT INTO "DailyStat" ("id", "shopId", "day", "metric", "registryId", "count", "value")
      VALUES (${randomUUID()}, ${shopId}, ${day}::date, ${metric}, ${registryId}, ${count}, ${value})
      ON CONFLICT ("shopId", "day", "metric", "registryId")
      DO UPDATE SET "count" = "DailyStat"."count" + EXCLUDED."count",
                    "value" = "DailyStat"."value" + EXCLUDED."value"`;
  } catch (err) {
    console.warn(`[stats] could not record ${metric} for shop ${shopId}`, err);
  }
}

/**
 * Counts a page view from a guest-facing request, unless it looks like a bot
 * or a link unfurler. Fire and forget: callers don't await it, so the page is
 * never slowed down by the write.
 */
export function countView(
  request: Request,
  shopId: string,
  metric: StatMetric,
  registryId?: string,
): void {
  if (request.method !== "GET") return;
  if (isLikelyBot(request.headers.get("user-agent"))) return;
  void bumpStat(shopId, metric, { registryId });
}

/**
 * Adds one order to the store's daily order count and sales total, for the
 * "registry share of your sales" figure. Called for EVERY order the store
 * takes (orders/create), registry or not. Only the total is kept; no row
 * links back to the order or the buyer.
 *
 * `total_price` is the order total in the shop's currency (the presentment
 * currency lives in `presentment_money` fields), gross of later refunds.
 */
export async function countStoreOrder(shopId: string, order: { total_price?: unknown; created_at?: unknown }) {
  const total = Number(order.total_price);
  const at = typeof order.created_at === "string" ? new Date(order.created_at) : undefined;
  await bumpStat(shopId, STAT_METRICS.storeOrder, {
    value: Number.isFinite(total) && total > 0 ? total : 0,
    at: at && !Number.isNaN(at.getTime()) ? at : undefined,
  });
}

export interface OpsShopRow {
  domain: string;
  name: string | null;
  plan: "free" | "pro";
  devStore: boolean;
  installedAt: Date;
  uninstalledAt: Date | null;
  currency: string;
  activeRegistries: number;
  registriesCreated: number;
  registryViews: number;
  createPageViews: number;
  cartAdds: number;
  externalClicks: number;
  giftsFromStore: number;
  registrySales: number;
  newCustomers: number;
  storeOrders: number;
  storeSales: number;
  /** registrySales as a % of storeSales, or null with no store sales counted. */
  registrySharePercent: number | null;
  lastRegistryAt: Date | null;
  /** A Free store showing enough activity that Pro's numbers would land. */
  upgradeCandidate: boolean;
}

/** Pure: when a Free store is worth a nudge. Exported for tests. */
export function isUpgradeCandidate(row: Pick<OpsShopRow, "plan" | "uninstalledAt" | "registryViews" | "registrySales" | "activeRegistries">): boolean {
  if (row.plan !== "free" || row.uninstalledAt) return false;
  return row.registrySales > 0 || row.registryViews >= 50 || row.activeRegistries >= 3;
}

/**
 * Every store, Free and Pro, for Giftpin's own ops view (/ops). Never shown
 * to a merchant. Money is in each store's own currency.
 */
export async function opsOverview(days = 30): Promise<{ since: Date; shops: OpsShopRow[] }> {
  const since = new Date(Date.now() - days * 86_400_000);

  const [shops, stats, created, active, lastCreated, purchases] = await Promise.all([
    db.shop.findMany({ orderBy: { installedAt: "desc" } }),
    db.dailyStat.groupBy({
      by: ["shopId", "metric"],
      where: { day: { gte: statDay(since) } },
      _sum: { count: true, value: true },
    }),
    db.registry.groupBy({ by: ["shopId"], where: { createdAt: { gte: since } }, _count: { _all: true } }),
    db.registry.groupBy({ by: ["shopId"], where: { status: "active" }, _count: { _all: true } }),
    db.registry.groupBy({ by: ["shopId"], _max: { createdAt: true } }),
    db.purchase.findMany({
      where: { voidedAt: null, source: "online", createdAt: { gte: since } },
      select: { amount: true, qty: true, isNewCustomer: true, orderId: true, item: { select: { registry: { select: { shopId: true } } } } },
    }),
  ]);

  const stat = (shopId: string, metric: StatMetric) => stats.find((r) => r.shopId === shopId && r.metric === metric)?._sum;
  const byShop = <T extends { shopId: string }>(rows: T[], shopId: string) => rows.find((r) => r.shopId === shopId);

  const rows = shops.map((shop): OpsShopRow => {
    const mine = purchases.filter((p) => p.item.registry.shopId === shop.id);
    const registrySales = mine.reduce((sum, p) => sum + Number(p.amount ?? 0), 0);
    const newCustomerOrders = new Set(mine.filter((p) => p.isNewCustomer && p.orderId).map((p) => p.orderId));
    const store = stat(shop.id, STAT_METRICS.storeOrder);
    const storeSales = Number(store?.value ?? 0);
    const row: OpsShopRow = {
      domain: shop.domain,
      name: shop.name,
      plan: shop.plan,
      devStore: shop.devStore,
      installedAt: shop.installedAt,
      uninstalledAt: shop.uninstalledAt,
      currency: shop.currency,
      activeRegistries: byShop(active, shop.id)?._count._all ?? 0,
      registriesCreated: byShop(created, shop.id)?._count._all ?? 0,
      registryViews: stat(shop.id, STAT_METRICS.registryView)?.count ?? 0,
      createPageViews: stat(shop.id, STAT_METRICS.createPageView)?.count ?? 0,
      cartAdds: stat(shop.id, STAT_METRICS.cartAdd)?.count ?? 0,
      externalClicks: stat(shop.id, STAT_METRICS.externalClick)?.count ?? 0,
      giftsFromStore: mine.reduce((sum, p) => sum + p.qty, 0),
      registrySales,
      newCustomers: newCustomerOrders.size,
      storeOrders: store?.count ?? 0,
      storeSales,
      registrySharePercent: storeSales > 0 ? Math.round((registrySales / storeSales) * 1000) / 10 : null,
      lastRegistryAt: byShop(lastCreated, shop.id)?._max.createdAt ?? null,
      upgradeCandidate: false,
    };
    row.upgradeCandidate = isUpgradeCandidate(row);
    return row;
  });

  return { since, shops: rows };
}
