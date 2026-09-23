import { describe, it, expect } from "vitest";
import { renderManagePage, type ManagePageData } from "../manage-page";
import type { DisplayItem } from "../../../models/item.server";

/**
 * Covers the wedding-only "suggested categories" checklist added 23 Sep
 * 2026 (Ben's request), expanded the same day to room-by-room detail — it
 * must show for wedding registries and stay out of the way for every other
 * event type, since the rooms/items don't apply.
 */

function page(overrides: Partial<ManagePageData> = {}): string {
  return renderManagePage({
    registryId: "registry_1",
    title: "Sam & Alex's Wedding",
    message: null,
    eventType: "wedding",
    eventDate: null,
    privacy: "unlisted",
    items: [] as DisplayItem[],
    shopName: "Maple & Clay",
    accentColor: "#2f5d50",
    currency: "CAD",
    shareUrl: "https://maple-clay.com/apps/registry/r/abc123",
    actionUrl: "/apps/registry",
    token: "tok_abc",
    manageUrl: "https://maple-clay.com/apps/registry/manage?t=tok_abc",
    externalItemsAllowed: true,
    storeSearchUrl: "/collections/all",
    gifts: [],
    ...overrides,
  });
}

describe("manage page hero art (default background, 23 Sep 2026)", () => {
  it("shows event-appropriate art at the top of the registrant's own page", () => {
    const html = page({ eventType: "wedding" });
    expect(html).toContain('class="hero-art"');
    expect(html).toContain("<svg");
  });

  it("shows different art for a non-wedding event type", () => {
    const wedding = page({ eventType: "wedding" });
    const baby = page({ eventType: "baby" });
    expect(wedding).not.toEqual(baby);
  });
});

describe("wedding registry category suggestions", () => {
  it("shows the room-by-room checklist for a wedding registry", () => {
    const html = page({ eventType: "wedding" });
    expect(html).toContain("Wedding registry ideas, room by room");
    expect(html).toContain(">Kitchen<");
    expect(html).toContain("Cash &amp; honeymoon funds");
  });

  it("breaks a room into subcategories of specific items", () => {
    const html = page({ eventType: "wedding" });
    expect(html).toContain("Small appliances");
    expect(html).toContain(">Stand mixer<");
    expect(html).toContain(">Dutch oven<");
  });

  it("links a browsable item to a storefront product search", () => {
    const html = page({ eventType: "wedding" });
    expect(html).toContain('href="/search?q=Stand%20mixer&amp;type=product"');
  });

  it("uses an item's override search term when the plain name searches badly", () => {
    const html = page({ eventType: "wedding" });
    // "Sheet set (queen)" is the label; "queen sheet set" is the better query.
    expect(html).toContain('href="/search?q=queen%20sheet%20set&amp;type=product"');
    expect(html).toContain(">Sheet set (queen)<");
  });

  it("suggests non-catalog rooms as plain items, not fake search links", () => {
    const html = page({ eventType: "wedding" });
    expect(html).toContain(">Honeymoon fund<");
    expect(html).not.toContain('href="/search?q=Honeymoon');
  });

  it("stays out of non-wedding registries", () => {
    for (const eventType of ["baby", "birthday", "housewarming", "graduation", "other"]) {
      const html = page({ eventType });
      expect(html).not.toContain("Wedding registry ideas");
    }
  });
});

describe("item category picker (24 Sep 2026)", () => {
  const base = {
    id: "item_1", sourceType: "internal" as const, title: "Stand mixer", imageUrl: null, price: 400,
    currency: "CAD", desiredQty: 1, purchasedQty: 0, claimedQty: 0, remainingQty: 1, note: null,
    category: null as string | null, storeMatch: null as null | { status: "suggested" | "kept"; kind: "product" | "search"; title: string; handle: string | null }, variantGid: "gid://shopify/ProductVariant/1", externalUrl: null,
    externalDomain: null, isExternal: false, isStale: false, availability: "in_stock", fulfilled: false,
  };

  it("offers every category on each item, with the current one selected", () => {
    const html = page({ items: [{ ...base, category: "kitchen" }] });
    expect(html).toContain('name="category"');
    expect(html).toContain('<option value="kitchen" selected>Kitchen</option>');
    expect(html).toContain('<option value="misc">Miscellaneous</option>');
  });

  it("defaults to no category", () => {
    const html = page({ items: [base] });
    expect(html).toContain('<option value="" selected>No category</option>');
  });
});

describe("in-store match (registrant view)", () => {
  const base = {
    id: "item_1", sourceType: "web" as const, title: "Stand mixer", imageUrl: null, price: 400,
    currency: "CAD", desiredQty: 1, purchasedQty: 0, claimedQty: 0, remainingQty: 1, note: null,
    category: null as string | null, variantGid: null, externalUrl: "https://x.example/p", externalDomain: "x.example",
    isExternal: true, isStale: true, availability: "in_stock", fulfilled: false,
  };
  const m = { title: "Artisan Stand Mixer", handle: "artisan-stand-mixer" };

  it("offers keep, swap and remove for a suggestion", () => {
    const html = page({ items: [{ ...base, storeMatch: { status: "suggested", kind: "product" as const, ...m } }] });
    expect(html).toContain('href="/products/artisan-stand-mixer"');
    expect(html).toContain('data-action="keep"');
    expect(html).toContain('data-action="swap"');
    expect(html).toContain('data-action="dismiss"');
  });

  it("only offers removal once a link is kept", () => {
    const html = page({ items: [{ ...base, storeMatch: { status: "kept", kind: "product" as const, ...m } }] });
    expect(html).toContain("Guests also see");
    expect(html).not.toContain('data-action="keep"');
  });

  it("shows nothing when there is no match", () => {
    const html = page({ items: [{ ...base, storeMatch: null }] });
    expect(html).not.toContain('class="match"');
  });

  it("adds the preview popup only when there is a suggestion to preview", () => {
    const withMatch = page({ items: [{ ...base, storeMatch: { status: "suggested", kind: "product" as const, ...m } }] });
    expect(withMatch).toContain('id="match-dialog"');
    expect(withMatch).toContain("js-match-preview");
    expect(withMatch).toContain("/match-preview");
    const without = page({ items: [{ ...base, storeMatch: null }] });
    expect(without).not.toContain('id="match-dialog"');
  });

  it("asks for a second click before a swap (it replaces the original item)", () => {
    const html = page({ items: [{ ...base, storeMatch: { status: "suggested", kind: "product" as const, ...m } }] });
    expect(html).toContain("Confirm swap");
  });
});

describe("manage page keeps the owner authorised (24 Sep 2026)", () => {
  it("carries the token on the settings and delete forms, which post without JavaScript", () => {
    const html = page({ token: "tok_abc" });
    expect(html).toContain('action="/apps/registry/settings?t=tok_abc"');
    expect(html).toContain('action="/apps/registry/delete?t=tok_abc"');
  });

  it("sends the token with every script request", () => {
    expect(page()).toContain("'?t='+encodeURIComponent(cfg.token)");
  });

  it("shows the private manage link with a copy button", () => {
    const html = page({ manageUrl: "https://maple-clay.com/apps/registry/manage?t=tok_abc" });
    expect(html).toContain('value="https://maple-clay.com/apps/registry/manage?t=tok_abc"');
    expect(html).toContain("js-copy");
  });
});

describe("category-level store suggestion (registrant view)", () => {
  const base = {
    id: "item_1", sourceType: "manual" as const, title: "Burton snowboard", imageUrl: null, price: 400,
    currency: "CAD", desiredQty: 1, purchasedQty: 0, claimedQty: 0, remainingQty: 1, note: null,
    category: null as string | null, variantGid: null, externalUrl: null, externalDomain: null,
    isExternal: true, isStale: true, availability: "in_stock", fulfilled: false,
  };

  it("offers a preview of the store's products, but not a direct swap, for a store-range suggestion", () => {
    const html = page({ items: [{ ...base, storeMatch: { status: "suggested", kind: "search", title: "snowboard", handle: null } }] });
    expect(html).toContain("Maple &amp; Clay sells snowboard products");
    expect(html).toContain('href="/search?q=snowboard&amp;type=product"');
    expect(html).toContain('data-action="keep"');
    expect(html).toContain('data-action="preview"');
    expect(html).not.toContain('data-action="swap"');
  });
});

describe("connect-the-extension box and chip fallback", () => {
  it("is titled by what it is for", () => {
    const html = page();
    expect(html).toContain("<h2>Connect the browser extension</h2>");
    expect(html).toContain("Copy connection link");
  });

  it("checks the store first and ships Canadian retailers for a CAD shop", () => {
    const html = page({ eventType: "wedding", currency: "CAD" });
    expect(html).toContain("/search/suggest.json");
    expect(html).toContain("js-cat");
    expect(html).toContain("amazon.ca");
    expect(html).not.toContain("target.com");
  });

  it("ships US retailers for a USD shop", () => {
    expect(page({ currency: "USD" })).toContain("target.com");
  });
});
