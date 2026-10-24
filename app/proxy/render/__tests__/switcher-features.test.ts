import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderRegistryPage, type RegistryPageData } from "../registry-page";
import { renderManagePage, type ManagePageData } from "../manage-page";
import { renderCreatePage } from "../create-page";
import type { DisplayItem } from "../../../models/item.server";

/**
 * Sold-out store products, registry perks and the in-store scanner (24 Oct
 * 2026, for stores switching from Gift Reggie).
 */

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
    variantGid: "gid://shopify/ProductVariant/40000001",
    externalUrl: null,
    externalDomain: null,
    isExternal: false,
    isStale: false,
    availability: "in_stock",
    fulfilled: false,
    ...overrides,
  };
}

function guestPage(items: DisplayItem[], overrides: Partial<RegistryPageData> = {}) {
  return renderRegistryPage({
    registryId: "registry_1",
    title: "Baby Lee",
    message: null,
    eventType: "baby",
    eventLabel: "Baby shower",
    eventDate: null,
    coverImageUrl: null,
    registrantNames: "Jo",
    items,
    progress: { totalItems: items.length, fulfilledItems: 0, internalItems: items.length, externalItems: 0, merchantSharePercent: 100 },
    shopName: "Baby & Co",
    accentColor: "#2f5d50",
    indexable: false,
    currency: "CAD",
    shareUrl: "https://example.com/apps/registry/r/abc",
    actionUrl: "/apps/registry",
    version: 1,
    versionUrl: "/apps/registry/r/abc/version",
    ...overrides,
  });
}

function managePage(overrides: Partial<ManagePageData> = {}) {
  return renderManagePage({
    registryId: "registry_1",
    title: "Baby Lee",
    message: null,
    eventType: "baby",
    eventDate: null,
    privacy: "unlisted",
    items: [],
    shopName: "Baby & Co",
    accentColor: "#2f5d50",
    currency: "CAD",
    shareUrl: "https://example.com/apps/registry/r/abc",
    actionUrl: "/apps/registry",
    token: "tok_abc",
    manageUrl: "https://example.com/apps/registry/manage?t=tok_abc",
    externalItemsAllowed: true,
    storeSearchUrl: "/collections/all",
    gifts: [],
    ...overrides,
  });
}

describe("sold-out store products on the guest page", () => {
  it("has no Add to cart for a sold-out store product, and says why", () => {
    const html = guestPage([item({ availability: "out_of_stock" })]);
    expect(html).toContain("Sold out right now.");
    expect(html).not.toContain('class="btn sm js-add-btn"');
    // A guest who got it in the shop can still mark it.
    expect(html).toContain("js-bought");
  });

  it("keeps Add to cart for products in stock", () => {
    expect(guestPage([item()])).toContain('class="btn sm js-add-btn"');
  });

  it("never lets a bought, sold-out item look available", () => {
    const html = guestPage([item({ availability: "out_of_stock", purchasedQty: 1, remainingQty: 0, fulfilled: true })]);
    expect(html).toContain("Already taken care of");
    expect(html).not.toContain('class="btn sm js-add-btn"');
  });
});

describe("registry perks", () => {
  it("shows perks on the create and manage pages, escaped", () => {
    const perks = ["Free gift wrapping", "<b>10% off</b>"];
    const create = renderCreatePage({ shopName: "Baby & Co", accentColor: "#000000", actionUrl: "/apps/registry", enabledEventTypes: ["baby"], perks });
    expect(create).toContain("Perks when you register with Baby &amp; Co");
    expect(create).toContain("<li>Free gift wrapping</li>");
    expect(create).toContain("&lt;b&gt;10% off&lt;/b&gt;");
    expect(managePage({ perks })).toContain("<li>Free gift wrapping</li>");
  });

  it("shows nothing without perks", () => {
    expect(renderCreatePage({ shopName: "S", accentColor: "#000000", actionUrl: "/a", enabledEventTypes: ["baby"] })).not.toContain("Perks when");
    expect(managePage()).not.toContain("Perks when");
  });

  it("never shows perks to guests", () => {
    expect(guestPage([item()])).not.toContain("Perks when");
  });
});

describe("in-store scanner on the manage page", () => {
  it("is only there when the store has it", () => {
    expect(managePage()).not.toContain("js-scan");
    const html = managePage({ scanner: true, scannerScriptUrl: "https://app.giftpin.app/vendor/zxing-library-0.21.3.min.js" });
    expect(html).toContain("Scan a barcode in the store");
    expect(html).toContain('data-zxing="https://app.giftpin.app/vendor/zxing-library-0.21.3.min.js"');
    // Typing the number always works, camera or not.
    expect(html).toContain('id="scan-code"');
  });

  it("doesn't load the barcode reader until someone taps Scan", () => {
    const html = managePage({ scanner: true, scannerScriptUrl: "https://app.giftpin.app/vendor/zxing-library-0.21.3.min.js" });
    expect(html).not.toMatch(/<script[^>]+src=/);
  });

  it("emits a script the browser can parse", () => {
    const html = managePage({ scanner: true, scannerScriptUrl: null });
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    expect(scripts.length).toBeGreaterThan(0);
    for (const src of scripts) expect(() => new Function(src)).not.toThrow();
  });

  it("serves the reader the router points at", () => {
    const router = readFileSync(resolve(__dirname, "../../router.server.ts"), "utf8");
    const file = router.match(/\/vendor\/(zxing-library-[\d.]+\.min\.js)/)?.[1];
    expect(file).toBeTruthy();
    expect(existsSync(resolve(__dirname, "../../../../public/vendor", file!))).toBe(true);
  });

  it("says when a store product on the list is sold out", () => {
    const sold = item({ availability: "out_of_stock" });
    expect(managePage({ items: [sold], soldOutHidden: true })).toContain("Guests won't see it until it's back in stock.");
    expect(managePage({ items: [sold] })).toContain("Guests can't add it to their cart until it's back in stock.");
  });
});
