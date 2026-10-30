import db from "../db.server";
import { absoluteProxyUrl } from "../lib/proxy.server";

/**
 * Data for the Giftpin panels in the Shopify admin (extensions/admin-registry,
 * via app/routes/api.admin-panel.tsx): "More actions → Giftpin registry" on an
 * order, a customer or a product.
 *
 * Staff are the merchant, so they see what the admin Registries page and the
 * Purchases CSV already show: registry names, buyer names, quantities. Never a
 * registrant's email. Everything is scoped by shopId: an id from another shop
 * finds nothing.
 */

const PROXY_PREFIX = "/apps/registry";
const LIST_LIMIT = 25;

export interface PanelRegistry {
  id: string;
  title: string;
  names: string;
  eventType: string;
  eventDate: string | null;
  status: string;
  /** The guest page on the storefront. */
  publicUrl: string;
}

export interface PanelGift {
  itemTitle: string;
  qty: number;
  /** For a chip-in toward a group gift or fund, the money it added. */
  amount: number | null;
  currency: string | null;
  isContribution: boolean;
  shippedToRegistrant: boolean;
  /** Refunded or cancelled: no longer counts toward the registry. */
  voided: boolean;
  orderName: string | null;
}

type RegistryRow = {
  id: string;
  slug: string;
  title: string;
  eventType: string;
  eventDate: Date | null;
  status: string;
  registrants: { name: string }[];
};

const registrySelect = {
  id: true,
  slug: true,
  title: true,
  eventType: true,
  eventDate: true,
  status: true,
  registrants: { select: { name: true }, orderBy: { createdAt: "asc" as const } },
};

function toPanelRegistry(shopDomain: string, registry: RegistryRow): PanelRegistry {
  return {
    id: registry.id,
    title: registry.title,
    names: registry.registrants.map((r) => r.name).join(" & "),
    eventType: registry.eventType,
    eventDate: registry.eventDate ? registry.eventDate.toISOString().slice(0, 10) : null,
    status: registry.status,
    publicUrl: absoluteProxyUrl(shopDomain, PROXY_PREFIX, `r/${registry.slug}`),
  };
}

/** The numeric id at the end of a Shopify gid, or null if it isn't one. */
export function numericId(gid: string | null | undefined, type: string): string | null {
  const match = String(gid ?? "").match(new RegExp(`^gid://shopify/${type}/(\\d+)$`));
  return match ? match[1] : null;
}

type PurchaseRow = {
  qty: number;
  amount: unknown;
  currency: string | null;
  isContribution: boolean;
  shippedToRegistrant: boolean;
  voidedAt: Date | null;
  orderName: string | null;
  item: { snapshotTitle: string | null; registry: RegistryRow };
};

/** Purchases grouped under the registry they credited, in first-seen order. */
function groupByRegistry(shopDomain: string, purchases: PurchaseRow[]) {
  const groups = new Map<string, { registry: PanelRegistry; gifts: PanelGift[] }>();
  for (const p of purchases) {
    const registry = p.item.registry;
    let group = groups.get(registry.id);
    if (!group) {
      group = { registry: toPanelRegistry(shopDomain, registry), gifts: [] };
      groups.set(registry.id, group);
    }
    group.gifts.push({
      itemTitle: p.item.snapshotTitle ?? "Registry item",
      qty: p.qty,
      amount: p.amount == null ? null : Number(p.amount),
      currency: p.currency,
      isContribution: p.isContribution,
      shippedToRegistrant: p.shippedToRegistrant,
      voided: p.voidedAt !== null,
      orderName: p.orderName,
    });
  }
  return [...groups.values()];
}

const purchaseSelect = {
  qty: true,
  amount: true,
  currency: true,
  isContribution: true,
  shippedToRegistrant: true,
  voidedAt: true,
  orderName: true,
  item: { select: { snapshotTitle: true, registry: { select: registrySelect } } },
};

/** Order page: which registry (or registries) this order's gifts credited. */
export async function orderPanel(shopId: string, shopDomain: string, orderGid: string) {
  if (!numericId(orderGid, "Order")) return { registries: [] };
  const purchases = await db.purchase.findMany({
    where: { orderId: orderGid, item: { registry: { shopId, status: { not: "deleted" } } } },
    select: purchaseSelect,
    orderBy: { createdAt: "asc" },
  });
  return { registries: groupByRegistry(shopDomain, purchases) };
}

/**
 * Customer page: registries this customer started while signed in to their
 * store account, and registry gifts they bought. A registry made without
 * signing in has no customer id, so it can't show here; Giftpin doesn't have
 * the read_customers scope to match by email instead.
 */
export async function customerPanel(shopId: string, shopDomain: string, customerGid: string) {
  const customerId = numericId(customerGid, "Customer");
  if (!customerId) return { owned: [], gifts: [] };

  const [owned, purchases] = await Promise.all([
    db.registry.findMany({
      where: { shopId, customerId, status: { not: "deleted" } },
      select: registrySelect,
      orderBy: { createdAt: "desc" },
      take: LIST_LIMIT,
    }),
    db.purchase.findMany({
      where: { buyerCustomerId: customerId, item: { registry: { shopId, status: { not: "deleted" } } } },
      select: purchaseSelect,
      orderBy: { createdAt: "desc" },
      take: LIST_LIMIT * 4,
    }),
  ]);

  return {
    owned: owned.map((r) => toPanelRegistry(shopDomain, r)),
    gifts: groupByRegistry(shopDomain, purchases).slice(0, LIST_LIMIT),
  };
}

/** Product page: active registries that have this product on them. */
export async function productPanel(shopId: string, shopDomain: string, productGid: string) {
  if (!numericId(productGid, "Product")) return { registries: [], total: 0 };
  const where = { productGid, registry: { shopId, status: "active" as const } };
  const [items, total] = await Promise.all([
    db.registryItem.findMany({
      where,
      select: {
        desiredQty: true,
        purchasedQty: true,
        snapshotTitle: true,
        registry: { select: registrySelect },
      },
      orderBy: { registry: { eventDate: { sort: "asc", nulls: "last" } } },
      take: LIST_LIMIT,
    }),
    db.registryItem.count({ where }),
  ]);

  return {
    total,
    registries: items.map((item) => ({
      registry: toPanelRegistry(shopDomain, item.registry),
      variantTitle: item.snapshotTitle,
      wanted: item.desiredQty,
      bought: Math.min(item.purchasedQty, item.desiredQty),
    })),
  };
}
