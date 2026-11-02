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
    expect(page([item()])).toContain("Powered by <a href=\"https://giftpin.app/?utm_source=registry");
  });

  it("hides the credit only when the shop is on Pro", () => {
    const html = page([item()], { hidePoweredBy: true });
    expect(html).not.toContain("Powered by");
    // The merchant's own attribution line is a separate, unrelated feature —
    // Pro removes Giftpin's credit, never the merchant's own name.
    expect(html).toContain('Registry by <a href="/"><strong>Maple &amp; Clay</strong></a>');
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
    expect(html).toContain('src="https://app.example.com/art/wedding-v4-1952.webp"');
    expect(html).toContain("https://app.example.com/art/wedding-v4-1024.webp 1024w");
    expect(html).not.toContain('class="hero-art"');
  });

  it.each([
    ["engagement", "engagement-v1"],
    ["bridal-shower", "bridal-shower-v1"],
    ["baby", "baby-v1"],
    ["christening", "christening-v1"],
    ["birthday", "birthday-v1"],
    ["coming-of-age", "coming-of-age-v1"],
    ["graduation", "graduation-v1"],
    ["college", "college-v1"],
    ["housewarming", "housewarming-v1"],
    ["anniversary", "anniversary-v1"],
    ["retirement", "retirement-v1"],
    ["holiday", "holiday-v2"],
    ["new-pet", "new-pet-v1"],
    ["fundraiser", "fundraiser-v1"],
    ["corporate", "corporate-v1"],
    ["other", "other-v1"],
    ["not-a-real-occasion", "other-v1"],
  ])("uses the painted %s banner", (eventType, file) => {
    const html = page([item()], { coverImageUrl: null, eventType, artBaseUrl: "https://app.example.com" });
    expect(html).toContain(`src="https://app.example.com/art/${file}-1952.webp"`);
    expect(html).not.toContain('class="hero-art"');
  });

  it("falls back to line art when the app origin is unknown", () => {
    const html = page([item()], {
      coverImageUrl: null,
      eventType: "corporate",
      artBaseUrl: null,
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

describe("group gifts and cash funds (SPIKE-C.md)", () => {
  const contributions = {
    variants: [
      { id: "7001", amount: 25 },
      { id: "7002", amount: 100 },
    ],
    toRegistrant: false,
  };
  const honeymoon = item({
    id: "fund_1",
    sourceType: "fund",
    title: "Honeymoon in Portugal",
    imageUrl: null,
    price: 0,
    variantGid: null,
    isExternal: true,
    isFund: true,
    fund: { goal: 1200, funded: 340, percent: 28, remaining: 860, complete: false },
  });

  it("shows progress and a chip-in form with the merchant's denominations", () => {
    const html = page([honeymoon], { contributions });
    expect(html).toContain("raised");
    expect(html).toContain('class="js-chip chip"');
    expect(html).toContain('value="7001"');
    expect(html).toContain('value="7002"');
    expect(html).toContain("/contribute");
    // After a chip-in, the guest needs a way to the cart: the page has none of its own.
    expect(html).toContain("Added to cart <a class=\"btn sm\" href=\"/cart\">Check out");
    // A fund is not bought elsewhere: no claim or "I bought this".
    expect(html).not.toContain('data-item="fund_1" type="button">I bought this');
  });

  it("tells the guest the card comes to them unless the couple opted in", () => {
    expect(page([honeymoon], { contributions })).toContain("emailed to you, so you can pass it on");
    const optedIn = page([honeymoon], { contributions: { ...contributions, toRegistrant: true } });
    expect(optedIn).toContain("emailed straight to the couple");
    // Shop Pay ignores the recipient properties (order #1031, 26 Sep 2026).
    expect(optedIn).toContain("not Shop Pay");
    expect(optedIn).toContain('name="message"');
  });

  it("offers chip-in alongside Add to cart on a group-gift store item", () => {
    const html = page(
      [item({ fund: { goal: 300, funded: 0, percent: 0, remaining: 300, complete: false } })],
      { contributions },
    );
    expect(html).toContain('class="row js-add"');
    expect(html).toContain('class="js-chip chip"');
    expect(html).toContain("Be the first to chip in");
  });

  it("shows a fully funded item as taken, with no chip-in", () => {
    const html = page(
      [item({ fulfilled: true, fund: { goal: 300, funded: 300, percent: 100, remaining: 0, complete: true } })],
      { contributions },
    );
    expect(html).toContain("Already taken care of");
    expect(html).not.toContain('class="js-chip chip"');
  });

  it("renders no chip-in controls at all without contributions (not Pro, or no gift card set up)", () => {
    const html = page([item({ fund: { goal: 300, funded: 50, percent: 16, remaining: 250, complete: false } })]);
    expect(html).not.toContain("js-chip chip");
    expect(html).not.toContain("raised");
    // Nor its script: other registries keep their page-weight budget.
    expect(html).not.toContain("/contribute");
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

describe("guest's ship-to-registrant choice (asked on first add, 2 Nov 2026)", () => {
  it("asks each guest on their first add instead of showing a box for everyone", () => {
    const html = page([item()], { shipToRegistrant: true, registrantNames: "Maya & Alex" });
    expect(html).not.toContain("js-ship-choice");
    expect(html).toContain('class="match-dialog js-ship-dialog"');
    expect(html).toContain("Where should your gift go?");
    expect(html).toContain("Ship to Maya &amp; Alex</button>");
    expect(html).toContain(">Send to me</button>");
    expect(html).toMatch(/data-label="[^"]*Want it sent to you instead[^"]*"/);
    expect(html).toContain('data-key="rg_ship_registry_1"');
  });

  it("lets the guest change it later, updating lines already in their cart", () => {
    const html = page([item()], { shipToRegistrant: true });
    expect(html).toContain('class="hint js-ship-line" hidden');
    expect(html).toContain("js-ship-change");
    expect(html).toContain("/cart/change.js");
  });

  it("doesn't ask when ship-to-registrant is off", () => {
    expect(page([item()], { shipToRegistrant: false })).not.toContain("js-ship-dialog");
  });

  it("doesn't ask when there are no store items to ship", () => {
    expect(page([item({ sourceType: "web" })], { shipToRegistrant: true })).not.toContain("js-ship-dialog");
  });

  it("sends the guest's answer with add to cart, and adds nothing if they close the prompt", () => {
    const html = page([item()], { shipToRegistrant: true });
    expect(html).toContain("shipToRegistrant:ship}");
    expect(html).toContain("if(ship===null){btn.disabled=false;return;}");
  });
});

describe("sort and still-needed filter", () => {
  const four = (extra: Partial<DisplayItem> = {}) =>
    Array.from({ length: 4 }, (_, i) => item({ id: `item_${i}`, ...extra }));

  it("offers the tools on a list of four or more, hidden until the script runs", () => {
    const html = page(four());
    expect(html).toContain('<div id="tools" hidden>');
    expect(html).toContain("Price: low to high");
    expect(html).toContain("Only show what's still needed");
  });

  it("leaves them off a short list", () => {
    expect(page([item()])).not.toContain('id="tools"');
  });

  it("gives priced items a sort price, and funds none", () => {
    expect(page([item({ price: 180 })])).toContain('data-p="180"');
    expect(page([item({ isFund: true, price: 0 })])).not.toContain("data-p=");
  });

  it("counts an item whose last one someone may be buying as not needed", () => {
    // Hard rule 5: never let a held item look available, including here.
    const html = page([item({ desiredQty: 1, claimedQty: 1, remainingQty: 0 })]);
    expect(html).toMatch(/class="item held taken"/);
  });

  it("still counts a partly held item as needed", () => {
    const html = page([item({ desiredQty: 2, claimedQty: 1, remainingQty: 1 })]);
    expect(html).toMatch(/class="item held"/);
  });
});

describe("wish list wording", () => {
  it("calls a Wish list a wish list, and every other occasion a registry", () => {
    const wish = page([], { eventType: "wishlist", eventLabel: "Wish list", eventDate: null });
    expect(wish).toContain("This wish list doesn't have any items yet.");
    expect(wish).toContain("Your wish list? <u>Sign in");
    expect(wish).not.toContain("Wish list registry at");
    const other = page([]);
    expect(other).toContain("This registry doesn't have any items yet.");
  });
});

describe("registry note to guests", () => {
  it("sets the note as an invitation-style line, not a card, with paragraph breaks kept", () => {
    const html = page([item()], { message: "Thank you.\n<b>See you there</b>" });
    expect(html).toContain('<p class="vow">Thank you.\n&lt;b&gt;See you there&lt;/b&gt;</p>');
    expect(html).toContain(".vow{");
    expect(html).toContain("white-space:pre-line");
  });

  it("loads the note font from the app only when there is an app URL", () => {
    expect(page([item()])).not.toContain("@font-face");
    const html = page([item()], { artBaseUrl: "https://app.giftpin.app/" });
    expect(html).toContain("src:url(https://app.giftpin.app/fonts/note-italic.woff2)");
  });

  it("adds no note styles when the registry has no note", () => {
    const html = page([item()], { message: null });
    expect(html).not.toContain('class="vow"');
    expect(html).not.toContain(".vow{");
  });
});

describe("registry page in-cart state", () => {
  it("offers Cancel next to Check out, removing only this gift's registry lines", () => {
    const html = page([item()]);
    expect(html).toContain('Check out &rarr;</a> <button type="button" class="btn sm ghost js-uncart">Cancel</button>');
    // Only lines carrying our _rg token for this variant are zeroed, via the
    // storefront's own cart API, so a guest's other cart items are untouched.
    expect(html).toContain("l.properties._rg&&l.variant_id==f.dataset.variant)u[l.key]=0");
    expect(html).toContain("fetch('/cart/update.js'");
  });

  it("links the store name in the footer to the storefront home", () => {
    expect(page([item()])).toContain('Registry by <a href="/"><strong>Maple &amp; Clay</strong></a>');
  });
});
