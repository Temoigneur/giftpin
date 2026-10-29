import { describe, it, expect } from "vitest";
import { renderManagePage, type ManagePageData } from "../manage-page";
import type { DisplayItem } from "../../../models/item.server";
import { EVENT_TYPES } from "../../../shared/settings";
import { ideaGuideFor } from "../../../shared/registry-ideas";

/**
 * Covers the wedding-only "suggested categories" checklist added 23 Sep
 * 2026 (Ben's request), expanded the same day to room-by-room detail — it
 * must show for wedding registries and stay out of the way for every other
 * event type, since the rooms/items don't apply.
 */

function page(overrides: Partial<ManagePageData> = {}): string {
  return renderManagePage({
    chromeExtensionUrl: "https://chromewebstore.google.com/detail/giftpin/abc",
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

  it("shows the wedding guide only on wedding-style registries", () => {
    for (const eventType of ["baby", "birthday", "housewarming", "graduation", "other"]) {
      const html = page({ eventType });
      expect(html).not.toContain("Wedding registry ideas");
    }
  });
});

describe("ideas guides for every occasion (24 Sep 2026)", () => {
  it("gives every occasion in the dropdown its own guide", () => {
    for (const { value } of EVENT_TYPES) {
      const guide = ideaGuideFor(value);
      expect(guide.groups.length).toBeGreaterThan(0);
      for (const group of guide.groups) {
        expect(group.subcategories.length).toBeGreaterThan(0);
        for (const sub of group.subcategories) expect(sub.items.length).toBeGreaterThan(0);
      }
      expect(page({ eventType: value })).toContain("Not sure what to add?");
    }
  });

  it("organizes birthdays by age", () => {
    const html = page({ eventType: "birthday" });
    expect(html).toContain("Birthday registry ideas, by age");
    expect(html).toContain(">Toddlers (2 to 3)<");
    expect(html).toContain(">Teens (13 to 17)<");
    expect(html).toContain('href="/search?q=Balance%20bike&amp;type=product"');
  });

  it("organizes baby registries by need and anniversaries by milestone year", () => {
    expect(page({ eventType: "baby" })).toContain(">Nursery<");
    expect(page({ eventType: "anniversary" })).toContain(">Years 1 to 5<");
  });

  it("falls back to a general guide for an unknown occasion", () => {
    expect(page({ eventType: "made-up" })).toContain("Gift ideas, by category");
  });

  it("makes the guide's button the prominent one", () => {
    const html = page({ eventType: "birthday" });
    expect(html).toContain('<details class="note ideas">');
    expect(html).toContain('<span class="ideas-q">Not sure what to add?</span>');
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
    expect(html).toContain('<h2 id="extension">Connect the browser extension</h2>');
    expect(html).toContain("Copy connection link");
  });

  it("checks the store first, and links to .com stores by default even for a CAD shop", () => {
    const html = page({ eventType: "wedding", currency: "CAD" });
    expect(html).toContain("/search/suggest.json");
    expect(html).toContain("js-cat");
    expect(html).toContain("target.com/s?searchTerm=");
    expect(html).toContain("target.com");
    expect(html).not.toContain("walmart.ca");
  });

  it("filters the store's loose search results with the strict idea matcher (29 Oct 2026)", () => {
    const html = page({ eventType: "wedding" });
    expect(html).toContain("function gpIdeaMatch(term,products)");
    expect(html).toContain("gpIdeaMatch(names,list)");
    // Other names an item is sold under ride along on the chip.
    expect(html).toContain('data-term="Skillet" data-aliases="frying pan|fry pan"');
    expect(html).toContain("resources[limit]=10");
    expect(html).toContain("No match for");
    // A result no longer sends the registrant to the store's own (loose) search page.
    expect(html).not.toContain("list.length>0){location.href=href");
  });

  it("ships Canadian retailers when the registry's country is Canada", () => {
    const html = page({ country: "CA", currency: "CAD" });
    expect(html).toContain("canadiantire.ca");
    expect(html).not.toContain("target.com");
  });

  it("ships US retailers for a USD shop", () => {
    expect(page({ currency: "USD" })).toContain("target.com");
  });
});

describe("per-item guest notes (24 Sep 2026)", () => {
  it("offers an optional note field when adding an item by link", () => {
    const html = page();
    expect(html).toContain('name="note"');
    expect(html).toContain("note:paste.querySelector('[name=note]').value");
  });

  it("lets the registrant edit the note on an existing item, prefilled", () => {
    const html = page({
      items: [
        {
          id: "i1",
          title: "Bath towels",
          imageUrl: null,
          price: null,
          currency: null,
          isExternal: true,
          sourceType: "external",
          externalDomain: "amazon.ca",
          desiredQty: 2,
          purchasedQty: 0,
          fulfilled: false,
          category: null,
          note: "Grey or purple please",
          storeMatch: null,
        } as unknown as DisplayItem,
      ],
    });
    expect(html).toContain('value="Grey or purple please"');
    expect(html).toContain("note:item.querySelector('[name=note]').value");
  });
});

describe("manage page picks up items added elsewhere (24 Sep 2026)", () => {
  it("wraps the list so it can be swapped in place and polls the version endpoint", () => {
    const html = page({ version: 4, versionUrl: "/apps/registry/r/abc/version" });
    expect(html).toContain('id="registro-list"');
    expect(html).toContain('"versionUrl":"/apps/registry/r/abc/version"');
    expect(html).toContain("function pollList()");
  });
});

describe("registry storage key (product-page button)", () => {
  // The theme button can only find a registrant's registry through
  // localStorage. When the two sides used different keys, every tap on
  // "Add to registry" sent the registrant to "start a registry" (24 Sep 2026).
  it("matches the key the theme's Add to registry button reads", async () => {
    const { readFileSync } = await import("node:fs");
    const { REGISTRIES_STORAGE_KEY } = await import("../../../shared/storage-keys");
    const themeJs = readFileSync("extensions/registry-button/assets/giftpin.js", "utf8");
    const match = themeJs.match(/var STORE_KEY = "([^"]+)"/);
    expect(match?.[1]).toBe(REGISTRIES_STORAGE_KEY);
    expect(page()).toContain(`var KEY='${REGISTRIES_STORAGE_KEY}'`);
  });
});

// Ben, 25 Sep 2026: pasting a link "didn't work at all". The old box added
// straight away via a server-side page read that most big retailers block,
// so items landed with junk titles and no photo, price or store match. The
// box now looks the link up first and lets the registrant check it.
describe("paste-a-link box (25 Sep 2026)", () => {
  it("looks the link up before adding, then adds what the registrant confirmed", () => {
    const html = page();
    expect(html).toContain("Look it up");
    expect(html).toContain("post('/link-preview'");
    expect(html).toContain("post('/add-link'");
    expect(html).not.toContain("post('/add-external'");
    expect(html).toContain('id="paste-title"');
    expect(html).toContain('id="paste-price"');
  });

  it("names the store beside the closest match, and only shows it to guests when ticked", () => {
    const html = page();
    expect(html).toContain("Closest match in Maple &amp; Clay");
    expect(html).toMatch(/<input type="checkbox" name="showMatch">/);
    expect(html).toContain("showMatch:paste.querySelector('[name=showMatch]').checked");
  });

  it("hides the paste box when the store only allows its own products", () => {
    expect(page({ externalItemsAllowed: false })).not.toContain('<form class="js-paste"');
  });

  it("ships a script that parses", () => {
    const html = page();
    const scripts = [...html.matchAll(/<script(?![^>]*type="application\/json")[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    expect(scripts.length).toBeGreaterThan(0);
    for (const src of scripts) expect(() => new Function(src)).not.toThrow();
  });
});

describe("store-range suggestion button names the store (25 Sep 2026)", () => {
  it("reads See matching products in <store>", () => {
    const html = page({
      items: [{
        id: "item_1", sourceType: "manual" as const, title: "Burton snowboard", imageUrl: null, price: 400,
        currency: "CAD", desiredQty: 1, purchasedQty: 0, claimedQty: 0, remainingQty: 1, note: null,
        category: null, variantGid: null, externalUrl: null, externalDomain: null,
        isExternal: true, isStale: true, availability: "in_stock", fulfilled: false,
        storeMatch: { status: "suggested", kind: "search", title: "snowboard", handle: null },
      }],
    });
    expect(html).toContain("See matching products in Maple &amp; Clay");
  });
});

describe("before the Chrome extension is published (29 Sep 2026)", () => {
  it("never mentions the extension when there's no store link for it", () => {
    const html = page({ chromeExtensionUrl: null });
    expect(html).not.toContain('id="extension"');
    expect(html).not.toContain('href="#extension"');
    expect(html).not.toContain("Copy connection link");
    expect(html).toContain('"extension":false');
    expect(html).toContain("Some big stores block us from reading their pages");
  });

  it("still shows the connection link with &extension=1, without an install link", () => {
    const html = page({ chromeExtensionUrl: null, extensionConnect: true });
    expect(html).toContain('<h2 id="extension">');
    expect(html).toContain("Copy connection link");
    expect(html).not.toContain("Get the Giftpin extension for Chrome");
    expect(html).toContain('"extension":false');
  });

  it("links to the extension's store page once it's set", () => {
    const html = page();
    expect(html).toContain('href="https://chromewebstore.google.com/detail/giftpin/abc"');
    expect(html).toContain('"extension":true');
  });
});

describe("paste box as the extension's backup (25 Sep 2026)", () => {
  it("asks for a price before adding, and points computer users to the extension", () => {
    const html = page();
    expect(html).toContain("Please add the price");
    expect(html).toContain('href="#extension"');
    expect(html).toContain('<h2 id="extension">');
  });
});

// Ben, 25 Sep 2026: the extension is Chrome-on-a-computer only, so phone and
// tablet users get told that where they'd otherwise try it — not a blanket
// "desktop only" that would put guests off.
describe("phone message for importing (25 Sep 2026)", () => {
  it("tells touch-device users the extension needs a computer", () => {
    const html = page();
    expect(html).toMatch(/class="touch-only"[^>]*><strong>This part needs a computer/);
    expect(html).toMatch(/class="hint touch-only">On a phone, big stores like Amazon, Wayfair and Target/);
    expect(html).toContain('class="hint no-touch">On a computer?');
  });
});

describe("ship-to-registrant form (25 Sep 2026)", () => {
  it("is off by default, with the address fields hidden", () => {
    const html = page();
    expect(html).toContain('action="/apps/registry/shipping?t=tok_abc"');
    expect(html).not.toMatch(/class="js-ship-toggle" checked/);
    expect(html).toMatch(/class="js-ship-fields" hidden/);
  });

  it("shows the saved address when it's switched on", () => {
    const html = page({
      shipping: {
        enabled: true,
        address: { firstName: "Maya", lastName: "Chen", address1: "1 Main St", city: "Toronto", provinceCode: "ON", countryCode: "CA", zip: "M5V 1A1" },
      },
    });
    expect(html).toMatch(/class="js-ship-toggle" checked/);
    expect(html).toContain('value="1 Main St"');
    expect(html).toContain('<option value="ON" selected>Ontario</option>');
    // Only the matching country's province list is submitted.
    expect(html).toMatch(/id="ship-region-US" name="provinceCode"[^>]* disabled/);
    expect(html).not.toMatch(/id="ship-region-CA" name="provinceCode"[^>]* disabled/);
  });

  it("escapes what the registrant typed", () => {
    const html = page({ shipping: { enabled: true, address: { address1: '"><script>x</script>' } } });
    expect(html).not.toContain("<script>x</script>");
  });
});

describe("share with guests", () => {
  it("has a fallback list of ways to share, hidden until needed", () => {
    const html = page();
    expect(html).toContain('class="share-menu js-share-menu" hidden');
    expect(html).toContain("mailto:?subject=");
    expect(html).toContain(encodeURIComponent("https://maple-clay.com/apps/registry/r/abc123"));
    expect(html).toContain('data-url="https://maple-clay.com/apps/registry/r/abc123">Copy link');
    // The link itself is visible to copy by hand, and Copy link doesn't rely
    // on the async clipboard API alone (Ben, 27 Sep 2026: it copied nothing).
    expect(html).toContain('class="share-link" type="text" readonly value="https://maple-clay.com/apps/registry/r/abc123"');
    expect(html).toContain("execCommand('copy')");
  });
});

describe("linking the registry from The Knot or a wedding website (28 Oct 2026)", () => {
  it("offers a direct Copy link button for the guest link", () => {
    const html = page();
    expect(html).toContain(
      '<button class="btn sm ghost js-share-copy" type="button" data-url="https://maple-clay.com/apps/registry/r/abc123">Copy link</button>',
    );
  });

  it("names The Knot for a wedding registry, as plain text", () => {
    const html = page({ eventType: "wedding" });
    expect(html).toContain("Using The Knot or a wedding website?");
    expect(html).not.toMatch(/<img[^>]*knot/i);
  });

  it("stays generic for other occasions", () => {
    const html = page({ eventType: "baby" });
    expect(html).not.toContain("The Knot");
    expect(html).toContain("Add this as a registry from another store");
  });

  it("warns only when the registry needs a password", () => {
    expect(page({ privacy: "password" })).toContain("Your registry has a password");
    expect(page({ privacy: "unlisted" })).not.toContain("Your registry has a password");
    expect(page({ privacy: "public_" })).not.toContain("Your registry has a password");
  });
});

describe("manage page item tiles (29 Oct 2026)", () => {
  const item = (o: Partial<DisplayItem>): DisplayItem =>
    ({
      id: "i1", sourceType: "shopify_internal", title: "Linen Pillowcase Pair", imageUrl: null, price: 71.25, currency: "CAD",
      desiredQty: 4, purchasedQty: 1, claimedQty: 0, remainingQty: 3, note: null, category: null, storeMatch: null,
      variantGid: "gid://shopify/ProductVariant/1", externalUrl: null, externalDomain: null, isExternal: false, isStale: false,
      availability: "in_stock", fulfilled: false, ...o,
    }) as DisplayItem;

  it("shows the price, the bought count and a bar that matches it", () => {
    const html = page({ items: [item({})] });
    expect(html).toContain("1 of 4 bought");
    expect(html).toContain('<div class="mi-bar" aria-hidden="true"><i style="width:25%"></i></div>');
  });

  it("marks a fully bought item clearly, and never offers Remove on it", () => {
    const html = page({ items: [item({ purchasedQty: 4, remainingQty: 0, fulfilled: true })] });
    expect(html).toContain('class="item mi done"');
    expect(html).toContain("All bought");
    expect(html).not.toContain('class="mi-remove js-remove"');
  });

  it("ships its own styles, and skips the background wash when a Pro store picked its own background", () => {
    expect(page()).toContain("body.manage{background:");
    const branded = page({ branding: { backgroundColor: "#fff8ef" } as ManagePageData["branding"] });
    expect(branded).not.toContain("body.manage{background:");
    expect(branded).toContain(".mi-bar");
  });
});
