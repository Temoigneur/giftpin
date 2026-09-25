import { describe, it, expect } from "vitest";
import { renderRegistryPage, type RegistryPageData } from "../registry-page";
import type { DisplayItem } from "../../../models/item.server";

/**
 * The guest page is the product. These tests guard the two things that are
 * easy to regress and expensive to notice: how big it is, and whether
 * registrant-supplied text can escape into markup.
 */

function item(overrides: Partial<DisplayItem> = {}): DisplayItem {
  return {
    id: "item_1",
    sourceType: "internal",
    title: "Stoneware Dinner Set",
    imageUrl: "https://cdn.example.com/set.jpg",
    price: 180,
    currency: "CAD",
    desiredQty: 2,
    purchasedQty: 0,
    claimedQty: 0,
    remainingQty: 2,
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

function page(items: DisplayItem[], overrides: Partial<RegistryPageData> = {}): string {
  return renderRegistryPage({
    registryId: "registry_1",
    title: "Sam & Alex's Wedding",
    message: "Thank you for celebrating with us.",
    eventType: "wedding",
    eventLabel: "Wedding",
    eventDate: new Date("2027-06-12T00:00:00Z"),
    coverImageUrl: null,
    registrantNames: "Sam & Alex",
    items,
    progress: {
      totalItems: items.length,
      fulfilledItems: 0,
      internalItems: items.filter((i) => !i.isExternal).length,
      externalItems: items.filter((i) => i.isExternal).length,
      merchantSharePercent: 70,
    },
    shopName: "Maple & Clay",
    accentColor: "#2f5d50",
    indexable: false,
    currency: "CAD",
    shareUrl: "https://maple-clay.com/apps/registry/r/abc123",
    actionUrl: "/apps/registry",
    version: 1,
    versionUrl: "/apps/registry/r/abc123/version",
    ...overrides,
  });
}

describe("registry page weight", () => {
  it("stays well under 50KB with a realistic 30-item registry", () => {
    // The guest is on cellular, opening a link from a group chat. This budget
    // is the reason the page is hand-rendered HTML rather than a React SSR
    // bundle — if this assertion ever fails, something pulled in a framework.
    const items = Array.from({ length: 30 }, (_, i) =>
      item({ id: `item_${i}`, title: `Registry item number ${i}` }),
    );
    const bytes = Buffer.byteLength(page(items), "utf8");
    expect(bytes).toBeLessThan(50_000);
  });

  it("ships no external scripts or stylesheets", () => {
    const html = page([item()]);
    expect(html).not.toMatch(/<script[^>]+src=/i);
    expect(html).not.toMatch(/<link[^>]+stylesheet/i);
  });
});

describe("registry page rendering", () => {
  it("escapes a script tag in a registry title", () => {
    const html = page([item()], { title: '<img src=x onerror="alert(1)">' });
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x");
  });

  it("escapes an item title and an item note", () => {
    const html = page([item({ title: "<b>bold</b>", note: '"quoted"' })]);
    expect(html).not.toContain("<b>bold</b>");
    expect(html).toContain("&lt;b&gt;bold&lt;/b&gt;");
  });

  it("marks the page noindex unless explicitly indexable", () => {
    expect(page([item()])).toContain('name="robots"');
    expect(page([item()], { indexable: true })).not.toContain('name="robots"');
  });

  it("gives internal items an add-to-cart form and no outbound link", () => {
    const html = page([item()]);
    expect(html).toContain('<form class="row js-add"');
    expect(html).toContain('data-variant="40000001"');
    // The class names also appear in the inline delegation script, so assert
    // on rendered markup, not on the document as a whole.
    expect(html).not.toContain('class="btn sm ghost js-claim"');
  });

  it("gives internal items an in-cart state and an already-bought option", () => {
    const html = page([item()]);
    // The in-cart block is built by the script once the line is in the cart.
    expect(html).toContain('<strong>In your cart</strong> <a class="btn sm" href="/cart">');
    expect(html).toContain('class="btn sm js-add-btn" type="submit">Add to cart</button>');
    expect(html).toContain('class="linkish js-bought" data-item="item_1" data-store="1"');
    expect(html).toContain("Already bought it?");
  });

  it("greys out a store item once the order webhook has counted it", () => {
    const html = page([item({ purchasedQty: 1, desiredQty: 1, remainingQty: 0, fulfilled: true })]);
    expect(html).toContain('class="item done"');
    expect(html).toContain("Already taken care of");
    expect(html).not.toContain('<form class="row js-add"');
  });

  it("gives external items an outbound link, never an add-to-cart", () => {
    const html = page([
      item({
        sourceType: "web",
        isExternal: true,
        variantGid: null,
        externalUrl: "https://bestbuy.ca/product/123",
        externalDomain: "bestbuy.ca",
        isStale: true,
      }),
    ]);

    expect(html).toContain('class="btn sm ghost js-claim"');
    expect(html).toContain("Buy at bestbuy.ca");
    expect(html).not.toContain('<form class="row js-add"');
    // Outbound links must not leak the merchant's page or gain tracking params.
    expect(html).toContain('rel="noopener noreferrer nofollow"');
    expect(html).toContain("https://bestbuy.ca/product/123");
  });

  it("leaves an outbound link untouched when no affiliate network is configured", () => {
    // 20 Sep 2026: Ben's deliberate reversal of the old "no commission,
    // ever" rule — see CLAUDE.md's "Resolved" section. Giftpin now takes a
    // disclosed commission via whichever network's link-wrapper is
    // configured (app/lib/affiliate.ts), but that wrap is a no-op until
    // AFFILIATE_LINK_WRAPPER_BASE is actually set (no network signed up
    // yet), so the default/test behavior is still an unmodified link.
    const html = page([
      item({
        sourceType: "web",
        isExternal: true,
        variantGid: null,
        externalUrl: "https://www.amazon.ca/dp/B08N5WRWNW",
        externalDomain: "amazon.ca",
      }),
    ]);
    expect(html).toContain('href="https://www.amazon.ca/dp/B08N5WRWNW"');
  });

  it("wraps an outbound link through the configured affiliate network", () => {
    const html = page(
      [
        item({
          sourceType: "web",
          isExternal: true,
          variantGid: null,
          externalUrl: "https://www.amazon.ca/dp/B08N5WRWNW",
          externalDomain: "amazon.ca",
        }),
      ],
      { affiliateLinkWrapperBase: "https://redirect.example-network.com/?key=test123&u=" },
    );
    expect(html).toContain(
      'href="https://redirect.example-network.com/?key=test123&amp;u=https%3A%2F%2Fwww.amazon.ca%2Fdp%2FB08N5WRWNW"',
    );
    // The "Buy at ..." label and target store must still name the real
    // destination, not the wrapper — a guest should never be confused about
    // where they're actually buying from.
    expect(html).toContain("Buy at amazon.ca");
  });

  it("discloses the commission policy whenever a registry has external items", () => {
    const withExternal = page([
      item({ sourceType: "web", isExternal: true, variantGid: null, externalUrl: "https://x.com/p", externalDomain: "x.com" }),
    ]);
    expect(withExternal).toContain("may earn Giftpin a small commission");
    expect(withExternal).toContain("never changes what you pay");

    // An internal-only registry has nothing to disclose — no external
    // purchase, no possible commission.
    const internalOnly = page([item()]);
    expect(internalOnly).not.toContain("may earn Giftpin a small commission");
  });

  it("labels a Shopify-sourced item as live and a snapshot item as not", () => {
    const live = page([
      item({ sourceType: "shopify_ext", isExternal: true, externalDomain: "brand.com", isStale: false, variantGid: null, externalUrl: "https://brand.com/products/x" }),
    ]);
    expect(live).toContain('class="src live"');

    const snapshot = page([
      item({ sourceType: "web", isExternal: true, externalDomain: "ikea.com", isStale: true, variantGid: null, externalUrl: "https://ikea.com/p/x" }),
    ]);
    expect(snapshot).toContain("price may have changed");
  });

  it("shows a held item as maybe-taken rather than available", () => {
    const html = page([
      item({ sourceType: "web", isExternal: true, variantGid: null, externalUrl: "https://x.com/p", claimedQty: 2, remainingQty: 0, desiredQty: 2 }),
    ]);
    expect(html).toContain("Someone may be buying this");
  });

  it("renders an empty registry without breaking", () => {
    const html = page([]);
    expect(html).toContain("doesn't have any items yet");
  });

  it("never renders a registrant's surname", () => {
    // Guest-facing pages show first names only — no email, phone or address.
    const html = page([item()], { registrantNames: "Sam" });
    expect(html).toContain("Sam");
    expect(html).not.toMatch(/@[\w.-]+\.\w+/);
  });

  it("only ever declares a safe accent colour", () => {
    const html = page([item()], { accentColor: "red; } body { display:none } .x{" });
    expect(html).toContain("--accent:#1a1a1a");
    expect(html).not.toContain("body { display:none }");
  });
});

describe("registry page branding credit (Pro plan, confirmed 22 Sep 2026)", () => {
  it("shows the Powered-by credit by default", () => {
    expect(page([item()])).toContain("Powered by Giftpin");
  });

  it("hides the credit only when the shop is on Pro", () => {
    const html = page([item()], { hidePoweredBy: true });
    expect(html).not.toContain("Powered by Giftpin");
    // The merchant's own attribution line is a separate, unrelated feature —
    // Pro removes Giftpin's credit, never the merchant's own name.
    expect(html).toContain("Registry by <strong>Maple &amp; Clay</strong>");
  });
});

describe("registry page hero art (default background, 23 Sep 2026)", () => {
  it("shows default event art when no cover photo has been uploaded", () => {
    const html = page([item()], { coverImageUrl: null, eventType: "wedding" });
    expect(html).toContain('class="hero-art"');
    expect(html).toContain("<svg");
    expect(html).not.toContain('class="hero-img"');
  });

  it("prefers an uploaded cover photo over the default art", () => {
    const html = page([item()], {
      coverImageUrl: "https://cdn.example.com/cover.jpg",
      eventType: "wedding",
    });
    expect(html).toContain('class="hero-img"');
    expect(html).not.toContain('class="hero-art"');
  });

  it("renders different art for different event types", () => {
    const wedding = page([item()], { coverImageUrl: null, eventType: "wedding" });
    const baby = page([item()], { coverImageUrl: null, eventType: "baby" });
    const birthday = page([item()], { coverImageUrl: null, eventType: "birthday" });
    expect(wedding).not.toEqual(baby);
    expect(wedding).not.toEqual(birthday);
    expect(baby).not.toEqual(birthday);
  });

  it("falls back to generic art rather than breaking on an unrecognized event type", () => {
    const html = page([item()], { coverImageUrl: null, eventType: "not-a-real-type" });
    expect(html).toContain('class="hero-art"');
    expect(html).toContain("<svg");
  });

  it("uses the merchant's own accent color, not a hardcoded one", () => {
    // The art references var(--accent) rather than a literal color, so it
    // always matches whatever this merchant's brand color is.
    const html = page([item()], { coverImageUrl: null, eventType: "wedding" });
    expect(html).toContain("var(--accent)");
  });

  it("uses the painted wedding banner, served from the app origin, when one is known", () => {
    const html = page([item()], {
      coverImageUrl: null,
      eventType: "wedding",
      artBaseUrl: "https://app.example.com/",
    });
    expect(html).toContain('class="hero-img hero-painting"');
    expect(html).toContain('src="https://app.example.com/art/wedding-v3-2016.webp"');
    expect(html).toContain("https://app.example.com/art/wedding-v3-1024.webp 1024w");
    expect(html).not.toContain('class="hero-art"');
  });

  it("keeps line art for event types without a painting", () => {
    const html = page([item()], {
      coverImageUrl: null,
      eventType: "baby",
      artBaseUrl: "https://app.example.com",
    });
    expect(html).toContain('class="hero-art"');
    expect(html).not.toContain('class="hero-img hero-painting"');
  });

  it("still prefers an uploaded cover photo over the painted banner", () => {
    const html = page([item()], {
      coverImageUrl: "https://cdn.example.com/cover.jpg",
      eventType: "wedding",
      artBaseUrl: "https://app.example.com",
    });
    expect(html).not.toContain('class="hero-img hero-painting"');
  });
});

describe("registry page live-refresh banner", () => {
  it("renders the banner hidden by default, with the version and poll endpoint in config", () => {
    const html = page([item()], { version: 7, versionUrl: "/apps/registry/r/xyz/version" });
    expect(html).toContain('id="registro-refresh"');
    expect(html).toMatch(/id="registro-refresh"[^>]*hidden/);
    expect(html).toContain('"version":7');
    expect(html).toContain('"versionUrl":"/apps/registry/r/xyz/version"');
  });

  it("never auto-reloads — only wires a manual refresh button", () => {
    const html = page([item()]);
    // location.reload() must only be reachable from the explicit button
    // handler, never called on a bare interval/timeout.
    expect(html).toContain("refreshBtn.addEventListener('click',function(){location.reload();})");
  });
});

describe("gift categories (24 Sep 2026)", () => {
  it("renders a flat list, with no group headings, when nothing is categorised", () => {
    const html = page([item({ id: "a" }), item({ id: "b" })]);
    expect(html).not.toContain('<h2 class="cat-head">');
  });

  it("groups items under their category heading", () => {
    const html = page([
      item({ id: "a", title: "Stand mixer", category: "kitchen" }),
      item({ id: "b", title: "Bath towels", category: "bed-bath" }),
    ]);
    expect(html).toContain(">Kitchen<");
    expect(html).toContain(">Bed &amp; Bath<");
    expect(html.indexOf("Stand mixer")).toBeLessThan(html.indexOf("Bath towels"));
  });

  it("puts uncategorised items under Miscellaneous once any item is categorised", () => {
    const html = page([
      item({ id: "a", title: "Stand mixer", category: "kitchen" }),
      item({ id: "b", title: "Mystery gift", category: null }),
    ]);
    expect(html).toContain(">Miscellaneous<");
    expect(html.indexOf("Stand mixer")).toBeLessThan(html.indexOf("Mystery gift"));
  });

  it("treats an unrecognised category as uncategorised rather than breaking", () => {
    const html = page([item({ id: "a", category: "kitchen" }), item({ id: "b", title: "Odd one", category: "bogus" })]);
    expect(html).toContain("Odd one");
  });
});

describe("in-store match link (guest view)", () => {
  const kept = { status: "kept" as const, kind: "product" as const, title: "Artisan Stand Mixer", handle: "artisan-stand-mixer" };

  it("shows a link to the store's product only when the registrant kept it", () => {
    const html = page([item({ storeMatch: kept })]);
    expect(html).toContain('href="/products/artisan-stand-mixer"');
    expect(html).toContain("Similar item at Maple &amp; Clay");
  });

  it("never shows a suggestion the registrant hasn't accepted", () => {
    const html = page([item({ storeMatch: { ...kept, status: "suggested" } })]);
    expect(html).not.toContain("/products/artisan-stand-mixer");
  });
});

describe("owner shortcut on the guest page (24 Sep 2026)", () => {
  it("ships a visible owner link that the owner's browser upgrades with its token", () => {
    const html = page([item()]);
    expect(html).toMatch(/id="registro-owner"><a href="[^"]*\/manage"/);
    expect(html).toContain("registry_1"); // registryId in the config the script compares against
  });
});

describe("category-level store link (guest view)", () => {
  it("links to the store's own search for a kept 'kind of product' match", () => {
    const html = page([item({ storeMatch: { status: "kept", kind: "search", title: "snowboard", handle: null } })]);
    expect(html).toContain('href="/search?q=snowboard&amp;type=product"');
    expect(html).toContain("More snowboard at Maple &amp; Clay");
  });
});

describe("registry page live update in place (24 Sep 2026)", () => {
  it("wraps the items and progress so the poller can swap them without a reload", () => {
    const html = page([item()]);
    expect(html).toContain('id="registro-items"');
    expect(html).toContain('id="registro-progress"');
    expect(html).toContain("function applyUpdate()");
  });

  it("puts the config tag before the script that reads it", () => {
    const html = page([item()]);
    expect(html.indexOf('id="registro-config"')).toBeLessThan(html.indexOf("(function(){"));
  });

  it("shows an item's note to guests", () => {
    const html = page([item({ note: "Towels in grey or purple" })]);
    expect(html).toContain("Towels in grey or purple");
  });
});

describe("pre-event reminder sign-up (Pro)", () => {
  it("renders only when offered, hidden until the script shows it", () => {
    expect(page([item()])).not.toContain('class="note js-remind"');
    const html = page([item()], { offerReminder: true });
    expect(html).toContain('class="note js-remind" method="post" hidden');
    expect(html).toContain("Remind me");
  });
});
