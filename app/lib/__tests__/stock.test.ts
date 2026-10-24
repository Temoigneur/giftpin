import { describe, it, expect } from "vitest";
import { applyStock, hiddenFromGuests, isSoldOutStoreItem } from "../stock";
import type { DisplayItem } from "../../models/item.server";

function item(overrides: Partial<DisplayItem> = {}): DisplayItem {
  return {
    id: "item_1",
    sourceType: "internal",
    title: "Crib sheet",
    imageUrl: null,
    price: 30,
    currency: "CAD",
    desiredQty: 1,
    purchasedQty: 0,
    claimedQty: 0,
    remainingQty: 1,
    note: null,
    category: null,
    storeMatch: null,
    variantGid: "gid://shopify/ProductVariant/1",
    externalUrl: null,
    externalDomain: null,
    isExternal: false,
    isStale: false,
    availability: "unknown",
    fulfilled: false,
    ...overrides,
  };
}

describe("live stock for store products", () => {
  it("marks store products from Shopify's availableForSale", () => {
    const stock = new Map([
      ["gid://shopify/ProductVariant/1", false],
      ["gid://shopify/ProductVariant/2", true],
    ]);
    const [a, b, c] = applyStock(
      [item(), item({ id: "b", variantGid: "gid://shopify/ProductVariant/2" }), item({ id: "c", variantGid: "gid://shopify/ProductVariant/3" })],
      stock,
    );
    expect(a.availability).toBe("out_of_stock");
    expect(b.availability).toBe("in_stock");
    // Not in the answer (deleted variant, partial failure): left as it was.
    expect(c.availability).toBe("unknown");
  });

  it("leaves everything alone when the lookup failed", () => {
    const items = [item()];
    expect(applyStock(items, null)).toBe(items);
  });

  it("never touches items from other stores", () => {
    const external = item({ sourceType: "shopify_ext", isExternal: true, availability: "in_stock" });
    expect(applyStock([external], new Map([["gid://shopify/ProductVariant/1", false]]))[0].availability).toBe("in_stock");
    expect(isSoldOutStoreItem({ ...external, availability: "out_of_stock" })).toBe(false);
  });

  it("hides a sold-out item only when the merchant chose to, and never a bought one", () => {
    const soldOut = item({ availability: "out_of_stock" });
    expect(hiddenFromGuests(soldOut, "hide")).toBe(true);
    expect(hiddenFromGuests(soldOut, "show")).toBe(false);
    expect(hiddenFromGuests({ ...soldOut, fulfilled: true }, "hide")).toBe(false);
    expect(hiddenFromGuests(item({ availability: "in_stock" }), "hide")).toBe(false);
  });
});
