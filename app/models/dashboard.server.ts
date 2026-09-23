import db from "../db.server";

/**
 * The merchant dashboard numbers.
 *
 * Three of these matter and one matters most:
 *
 *   registryRevenue     — proves the app pays for itself
 *   newCustomers        — proves the app is customer ACQUISITION, not just a
 *                         nicer wishlist. This is the viral loop made legible.
 *   merchantSharePercent — the answer to "why am I paying for an app that
 *                         links to Amazon?" If it reads 68%, the merchant sees
 *                         that two thirds of a list that would otherwise have
 *                         lived entirely on Amazon is theirs.
 *
 * An app whose value is visible as a number retains better, and retention is
 * what the App Store's post-search ranking actually rewards.
 */

export interface DashboardStats {
  registries: { active: number; createdThisPeriod: number };
  registryRevenue: number;
  currency: string;
  orders: number;
  newCustomers: number;
  giftsGiven: number;
  merchantSharePercent: number;
  externalItemCount: number;
  internalItemCount: number;
  topProducts: { title: string; timesRegistered: number; timesBought: number }[];
  /** Where registrants are putting items that aren't the merchant's. */
  topExternalDomains: { domain: string; count: number }[];
}

export async function dashboardStats(shopId: string, sinceDays = 365): Promise<DashboardStats> {
  const since = new Date(Date.now() - sinceDays * 86_400_000);

  const shop = await db.shop.findUnique({ where: { id: shopId } });
  const currency = shop?.currency ?? "USD";

  const [activeRegistries, createdThisPeriod, purchases, items] = await Promise.all([
    db.registry.count({ where: { shopId, status: "active" } }),
    db.registry.count({ where: { shopId, status: "active", createdAt: { gte: since } } }),
    db.purchase.findMany({
      where: {
        voidedAt: null,
        source: "online",
        createdAt: { gte: since },
        item: { registry: { shopId } },
      },
      select: { amount: true, qty: true, orderId: true, isNewCustomer: true },
    }),
    db.registryItem.findMany({
      where: { registry: { shopId, status: "active" } },
      select: {
        sourceType: true,
        desiredQty: true,
        purchasedQty: true,
        snapshotTitle: true,
        snapshotPrice: true,
        externalSource: { select: { domain: true, price: true } },
      },
    }),
  ]);

  const registryRevenue = purchases.reduce((sum, p) => sum + Number(p.amount ?? 0), 0);
  const orders = new Set(purchases.map((p) => p.orderId).filter(Boolean)).size;
  const newCustomers = new Set(
    purchases.filter((p) => p.isNewCustomer).map((p) => p.orderId).filter(Boolean),
  ).size;
  const giftsGiven = purchases.reduce((sum, p) => sum + p.qty, 0);

  let internalValue = 0;
  let externalValue = 0;
  let internalCount = 0;
  let externalCount = 0;
  const domains = new Map<string, number>();
  const products = new Map<string, { timesRegistered: number; timesBought: number }>();

  for (const item of items) {
    const unit = Number(item.externalSource?.price ?? item.snapshotPrice ?? 0);
    const value = (Number.isFinite(unit) ? unit : 0) * item.desiredQty;

    if (item.sourceType === "internal") {
      internalCount++;
      internalValue += value;

      const title = item.snapshotTitle ?? "Untitled";
      const entry = products.get(title) ?? { timesRegistered: 0, timesBought: 0 };
      entry.timesRegistered += 1;
      entry.timesBought += item.purchasedQty;
      products.set(title, entry);
    } else {
      externalCount++;
      externalValue += value;
      const domain = item.externalSource?.domain;
      if (domain) domains.set(domain, (domains.get(domain) ?? 0) + 1);
    }
  }

  const totalValue = internalValue + externalValue;

  return {
    registries: { active: activeRegistries, createdThisPeriod },
    registryRevenue,
    currency,
    orders,
    newCustomers,
    giftsGiven,
    merchantSharePercent: totalValue > 0 ? Math.round((internalValue / totalValue) * 100) : 100,
    internalItemCount: internalCount,
    externalItemCount: externalCount,
    topProducts: Array.from(products.entries())
      .map(([title, counts]) => ({ title, ...counts }))
      .sort((a, b) => b.timesRegistered - a.timesRegistered)
      .slice(0, 8),
    topExternalDomains: Array.from(domains.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
  };
}

export async function listRegistries(shopId: string, page = 0, pageSize = 25) {
  const [rows, total] = await Promise.all([
    db.registry.findMany({
      where: { shopId, status: "active" },
      include: {
        registrants: { select: { name: true } },
        items: { select: { desiredQty: true, purchasedQty: true, sourceType: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: page * pageSize,
      take: pageSize,
    }),
    db.registry.count({ where: { shopId, status: "active" } }),
  ]);

  return {
    total,
    registries: rows.map((registry) => {
      const wanted = registry.items.reduce((sum, i) => sum + i.desiredQty, 0);
      const bought = registry.items.reduce((sum, i) => sum + i.purchasedQty, 0);
      return {
        id: registry.id,
        slug: registry.slug,
        title: registry.title,
        eventType: registry.eventType,
        eventDate: registry.eventDate,
        createdAt: registry.createdAt,
        names: registry.registrants.map((r) => r.name).join(", "),
        itemCount: registry.items.length,
        internalCount: registry.items.filter((i) => i.sourceType === "internal").length,
        wanted,
        bought,
        percentComplete: wanted > 0 ? Math.round((bought / wanted) * 100) : 0,
      };
    }),
  };
}
