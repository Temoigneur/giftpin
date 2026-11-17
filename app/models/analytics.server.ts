import db from "../db.server";
import { salesTakenByWhere } from "./store-group.server";

/**
 * Pro analytics: the three flows a merchant can watch move over time.
 *
 *   registries created — is the storefront entry point working?
 *   items added        — are registrants actually building lists (and from
 *                        whose shelves)?
 *   gifts credited     — are guests buying, and where?
 *
 * Unlike dashboardStats() (a snapshot of what's on active registries now),
 * these are flow counts over a window, so removed items and archived
 * registries still count for the period they were added in. Items added come
 * from the `item_added` event log for exactly that reason: RegistryItem rows
 * are hard-deleted on removal.
 *
 * Buckets are UTC. Close enough for a trend line; not meant for accounting.
 */

export const ANALYTICS_RANGES = [30, 90, 365] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];
export type Granularity = "day" | "week" | "month";

export function parseRange(value: string | null): AnalyticsRange {
  const n = Number(value);
  return (ANALYTICS_RANGES as readonly number[]).includes(n) ? (n as AnalyticsRange) : 90;
}

export interface AnalyticsBucket {
  /** ISO start of the bucket (inclusive). */
  start: string;
  registries: number;
  items: number;
  gifts: number;
}

export interface AnalyticsTotals {
  registriesCreated: number;
  itemsAdded: number;
  /** Of itemsAdded, how many were the merchant's own products. */
  itemsAddedInternal: number;
  giftsCredited: number;
  /** Online (in-store) purchase value, shop currency. */
  revenue: number;
  newCustomers: number;
}

export interface AnalyticsReport {
  range: AnalyticsRange;
  granularity: Granularity;
  currency: string;
  totals: AnalyticsTotals;
  /** Same-length window immediately before this one, for "vs previous". */
  previous: AnalyticsTotals;
  series: AnalyticsBucket[];
  giftsBySource: { store: number; elsewhere: number; markedByRegistrant: number };
  registriesByEventType: { eventType: string; count: number }[];
}

export interface AnalyticsRows {
  registries: { createdAt: Date; eventType: string }[];
  items: { createdAt: Date; payload: unknown }[];
  purchases: {
    createdAt: Date;
    source: string;
    qty: number;
    amount: unknown;
    isNewCustomer: boolean;
    orderId: string | null;
  }[];
}

const DAY = 86_400_000;

function utcMidnight(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * Bucket starts for a range, oldest first, plus where the previous
 * same-length window begins.
 *   30  → 30 daily buckets ending today
 *   90  → 13 weekly buckets (91 days) ending today
 *   365 → 12 calendar months ending with this one
 */
export function bucketsFor(range: AnalyticsRange, now: Date) {
  const today = utcMidnight(now);

  if (range === 365) {
    const starts = Array.from({ length: 12 }, (_, i) =>
      new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 11 + i, 1)),
    );
    const previousStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 23, 1));
    return { granularity: "month" as const, starts, previousStart };
  }

  const [count, step, granularity] = range === 30 ? [30, 1, "day" as const] : [13, 7, "week" as const];
  const first = new Date(today.getTime() - (count * step - 1) * DAY);
  const starts = Array.from({ length: count }, (_, i) => new Date(first.getTime() + i * step * DAY));
  const previousStart = new Date(first.getTime() - count * step * DAY);
  return { granularity, starts, previousStart };
}

function emptyTotals(): AnalyticsTotals {
  return { registriesCreated: 0, itemsAdded: 0, itemsAddedInternal: 0, giftsCredited: 0, revenue: 0, newCustomers: 0 };
}

function sourceTypeOf(payload: unknown): string | undefined {
  if (payload && typeof payload === "object" && "sourceType" in payload) {
    const value = (payload as { sourceType?: unknown }).sourceType;
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}

/** Pure: turns raw rows into the report. Rows may span both windows. */
export function buildReport(
  rows: AnalyticsRows,
  range: AnalyticsRange,
  currency: string,
  now: Date,
): AnalyticsReport {
  const { granularity, starts, previousStart } = bucketsFor(range, now);
  const periodStart = starts[0].getTime();
  const end = now.getTime();

  const series: AnalyticsBucket[] = starts.map((s) => ({ start: s.toISOString(), registries: 0, items: 0, gifts: 0 }));

  // Last bucket whose start is <= t. Only called for t in [periodStart, end].
  const bucketIndex = (t: number) => {
    let i = starts.length - 1;
    while (i > 0 && starts[i].getTime() > t) i--;
    return i;
  };

  const windowOf = (d: Date): "current" | "previous" | null => {
    const t = d.getTime();
    if (t > end) return null;
    if (t >= periodStart) return "current";
    if (t >= previousStart.getTime()) return "previous";
    return null;
  };

  const totals = emptyTotals();
  const previous = emptyTotals();
  const eventTypes = new Map<string, number>();
  const giftsBySource = { store: 0, elsewhere: 0, markedByRegistrant: 0 };

  for (const r of rows.registries) {
    const w = windowOf(r.createdAt);
    if (!w) continue;
    const t = w === "current" ? totals : previous;
    t.registriesCreated++;
    if (w === "current") {
      series[bucketIndex(r.createdAt.getTime())].registries++;
      eventTypes.set(r.eventType, (eventTypes.get(r.eventType) ?? 0) + 1);
    }
  }

  for (const item of rows.items) {
    const w = windowOf(item.createdAt);
    if (!w) continue;
    const t = w === "current" ? totals : previous;
    t.itemsAdded++;
    if (sourceTypeOf(item.payload) === "internal") t.itemsAddedInternal++;
    if (w === "current") series[bucketIndex(item.createdAt.getTime())].items++;
  }

  const newCustomerOrders = { current: new Set<string>(), previous: new Set<string>() };
  for (const p of rows.purchases) {
    const w = windowOf(p.createdAt);
    if (!w) continue;
    const t = w === "current" ? totals : previous;
    t.giftsCredited += p.qty;

    const inStore = p.source === "online" || p.source === "pos";
    if (inStore) {
      const amount = Number(p.amount ?? 0);
      t.revenue += Number.isFinite(amount) ? amount : 0;
      if (p.isNewCustomer && p.orderId) newCustomerOrders[w].add(p.orderId);
    }

    if (w === "current") {
      series[bucketIndex(p.createdAt.getTime())].gifts += p.qty;
      if (inStore) giftsBySource.store += p.qty;
      else if (p.source === "external") giftsBySource.elsewhere += p.qty;
      else giftsBySource.markedByRegistrant += p.qty;
    }
  }
  totals.newCustomers = newCustomerOrders.current.size;
  previous.newCustomers = newCustomerOrders.previous.size;

  return {
    range,
    granularity,
    currency,
    totals,
    previous,
    series,
    giftsBySource,
    registriesByEventType: Array.from(eventTypes.entries())
      .map(([eventType, count]) => ({ eventType, count }))
      .sort((a, b) => b.count - a.count),
  };
}

export async function analyticsReport(shopId: string, range: AnalyticsRange, now = new Date()): Promise<AnalyticsReport> {
  const { previousStart } = bucketsFor(range, now);
  const since = { gte: previousStart };

  const [shop, registries, items, purchases] = await Promise.all([
    db.shop.findUnique({ where: { id: shopId }, select: { currency: true } }),
    db.registry.findMany({
      where: { shopId, createdAt: since },
      select: { createdAt: true, eventType: true },
    }),
    db.registryEvent.findMany({
      where: { type: "item_added", createdAt: since, registry: { shopId } },
      select: { createdAt: true, payload: true },
    }),
    // Voided (refunded/cancelled) purchases are left out: a gift that was
    // returned wasn't given.
    db.purchase.findMany({
      where: { voidedAt: null, createdAt: since, ...salesTakenByWhere(shopId) },
      select: { createdAt: true, source: true, qty: true, amount: true, isNewCustomer: true, orderId: true },
    }),
  ]);

  return buildReport({ registries, items, purchases }, range, shop?.currency ?? "USD", now);
}

// ---------------------------------------------------------------------------
// Registry sales report (Pro): money, month by month
// ---------------------------------------------------------------------------

/**
 * One calendar month (UTC) of registry-driven sales in the merchant's store.
 *
 * Only gifts bought in this store count (source online/pos): a gift bought
 * elsewhere or marked by the registrant earned the merchant nothing.
 *
 *   revenue       — registry gift lines at the price on the order, before
 *                   order-level discounts (Purchase.amount; see
 *                   app/lib/attribution.ts). Not the whole order total: other
 *                   things in the same cart aren't recorded.
 *   orders        — distinct orders with at least one registry gift.
 *   newCustomers  — of those orders, how many were a first purchase at the
 *                   shop (Purchase.isNewCustomer).
 *   averageOrder  — revenue / orders, so registry spend per order.
 */
export interface MonthlySales {
  /** ISO start of the month. */
  month: string;
  revenue: number;
  orders: number;
  newCustomers: number;
  averageOrder: number;
}

export const SALES_REPORT_MONTHS = 12;

export type SalesRow = Pick<AnalyticsRows["purchases"][number], "createdAt" | "source" | "amount" | "isNewCustomer" | "orderId"> & {
  id: string;
};

/** Pure: 12 calendar months ending with this one, oldest first. */
export function buildMonthlySales(rows: SalesRow[], now: Date, months = SALES_REPORT_MONTHS): MonthlySales[] {
  const starts = Array.from(
    { length: months },
    (_, i) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1) + i, 1)),
  );
  const buckets = starts.map(() => ({ revenue: 0, orders: new Set<string>(), newCustomers: new Set<string>() }));

  for (const row of rows) {
    if (row.source !== "online" && row.source !== "pos") continue;
    const t = row.createdAt.getTime();
    if (t < starts[0].getTime() || t > now.getTime()) continue;
    let i = starts.length - 1;
    while (i > 0 && starts[i].getTime() > t) i--;

    const amount = Number(row.amount ?? 0);
    buckets[i].revenue += Number.isFinite(amount) ? amount : 0;
    // A purchase with no order id (POS, later) is its own order.
    const order = row.orderId ?? `purchase:${row.id}`;
    buckets[i].orders.add(order);
    if (row.isNewCustomer) buckets[i].newCustomers.add(order);
  }

  return starts.map((start, i) => {
    const { revenue, orders, newCustomers } = buckets[i];
    const rounded = Math.round(revenue * 100) / 100;
    return {
      month: start.toISOString(),
      revenue: rounded,
      orders: orders.size,
      newCustomers: newCustomers.size,
      averageOrder: orders.size > 0 ? Math.round((revenue / orders.size) * 100) / 100 : 0,
    };
  });
}

export async function monthlySales(shopId: string, now = new Date()): Promise<MonthlySales[]> {
  const since = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (SALES_REPORT_MONTHS - 1), 1));
  const rows = await db.purchase.findMany({
    where: {
      voidedAt: null,
      source: { in: ["online", "pos"] },
      createdAt: { gte: since },
      item: { registry: { shopId } },
    },
    select: { id: true, createdAt: true, source: true, amount: true, isNewCustomer: true, orderId: true },
  });
  return buildMonthlySales(rows, now);
}
