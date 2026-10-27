import type { DisplayItem } from "../models/item.server";

/**
 * Live stock for the merchant's own products on a registry.
 *
 * Internal items used to carry no stock at all ("unknown"), so a sold-out
 * product kept its Add to cart button and the guest only found out from
 * Shopify's "sold out" error. Now each render asks Shopify which variants are
 * availableForSale (app/lib/catalog.server.ts) and these pure helpers apply it.
 *
 * Nothing here removes an item from the registry. "Hide" only leaves it off
 * the guest page, so the moment it's restocked it shows again on its own.
 */

/** variantGid → availableForSale. Null when the lookup failed. */
export type StockMap = Map<string, boolean> | null;

export function applyStock(items: DisplayItem[], stock: StockMap): DisplayItem[] {
  if (!stock) return items;
  return items.map((item) => {
    if (item.sourceType !== "internal" || !item.variantGid || !stock.has(item.variantGid)) return item;
    return { ...item, availability: stock.get(item.variantGid) ? "in_stock" : "out_of_stock" };
  });
}

/** A store product guests can't buy right now. */
export function isSoldOutStoreItem(item: DisplayItem): boolean {
  return item.sourceType === "internal" && item.availability === "out_of_stock";
}

/**
 * Whether the guest page leaves this item off. Bought items stay, so the
 * registrant's progress and the guest's "already taken care of" still show.
 */
export function hiddenFromGuests(item: DisplayItem, soldOutItems: "show" | "hide"): boolean {
  return soldOutItems === "hide" && isSoldOutStoreItem(item) && !item.fulfilled;
}
