import { describe, it, expect } from "vitest";
import {
  GIFT_CARD_PROPERTY,
  ATTRIBUTION_PROPERTY,
  attributedLines,
  giftCardLines,
  signAttribution,
  signGiftCardAttribution,
  verifyAttribution,
  verifyGiftCardAttribution,
} from "../attribution";
import {
  cleanGiftCardBlurb,
  giftCardListingLive,
  giftCardSource,
  listedGiftCardAmounts,
} from "../../shared/gift-card-listing";
import { mergeSettings } from "../../shared/settings";
import { renderGiftCardPage } from "../../proxy/render/gift-card-page";
import { giftCardsHtml, groupByCountry } from "../../marketing/gift-cards";
import { renderRegistryPage } from "../../proxy/render/registry-page";

/** Gift cards on giftpin.app: the signed `_gpc` tag, the listing rules and the two pages. */

const SHOP = "maple.myshopify.com";
const PRODUCT = {
  productGid: "gid://shopify/Product/1",
  title: "Gift card",
  variants: [
    { id: "11", amount: 25 },
    { id: "12", amount: 100 },
    { id: "13", amount: 500 },
    { id: "14", amount: 1000 },
  ],
};

const line = (overrides: Record<string, unknown> = {}) => ({
  id: 901,
  quantity: 1,
  price: "100.00",
  variant_id: 12,
  gift_card: true,
  properties: [{ name: GIFT_CARD_PROPERTY, value: signGiftCardAttribution(SHOP, "directory") }],
  ...overrides,
});

describe("_gpc token", () => {
  it("round-trips the shop and source", () => {
    expect(verifyGiftCardAttribution(signGiftCardAttribution(SHOP, "directory"))).toEqual({ s: SHOP, src: "directory" });
    expect(verifyGiftCardAttribution(signGiftCardAttribution(SHOP, "store"))).toEqual({ s: SHOP, src: "store" });
  });

  it("is not interchangeable with the registry _rg token", () => {
    expect(verifyGiftCardAttribution(signAttribution("reg_1", "item_1"))).toBeNull();
    expect(verifyAttribution(signGiftCardAttribution(SHOP, "store"))).toBeNull();
  });

  it("rejects a tampered token", () => {
    const token = signGiftCardAttribution(SHOP, "store");
    expect(verifyGiftCardAttribution(`${token.slice(0, -2)}xx`)).toBeNull();
    expect(verifyGiftCardAttribution("")).toBeNull();
  });
});

describe("giftCardLines", () => {
  it("records a signed gift card line with its total and source", () => {
    expect(giftCardLines([line({ quantity: 2 })], SHOP)).toEqual([
      { lineItemId: "901", quantity: 2, amount: "200.00", source: "directory" },
    ]);
  });

  it("ignores a token minted for another shop", () => {
    expect(giftCardLines([line()], "other.myshopify.com")).toEqual([]);
  });

  it("ignores a _gpc on a line that isn't a gift card", () => {
    expect(giftCardLines([line({ gift_card: false })], SHOP)).toEqual([]);
  });

  it("falls back to the merchant's gift card variants when the flag is missing", () => {
    expect(giftCardLines([line({ gift_card: undefined })], SHOP, new Set(["12"]))).toHaveLength(1);
  });

  it("ignores lines with no tag, a forged tag, or no price", () => {
    expect(giftCardLines([line({ properties: [] })], SHOP)).toEqual([]);
    expect(giftCardLines([line({ properties: [{ name: GIFT_CARD_PROPERTY, value: "forged.sig" }] })], SHOP)).toEqual([]);
    expect(giftCardLines([line({ price: undefined })], SHOP)).toEqual([]);
  });

  it("never reaches registry attribution", () => {
    expect(attributedLines([line()])).toEqual([]);
    const registryLine = line({ properties: [{ name: ATTRIBUTION_PROPERTY, value: signAttribution("reg_1", "item_1") }] });
    expect(giftCardLines([registryLine], SHOP)).toEqual([]);
  });
});

describe("listing rules", () => {
  it("offers only the merchant's amounts up to $500", () => {
    expect(listedGiftCardAmounts(PRODUCT).map((v) => v.amount)).toEqual([25, 100, 500]);
    expect(listedGiftCardAmounts(null)).toEqual([]);
  });

  it("is live only on Pro, installed, switched on, with something to sell", () => {
    const base = { pro: true, uninstalled: false, listing: { enabled: true, blurb: "" }, product: PRODUCT };
    expect(giftCardListingLive(base)).toBe(true);
    expect(giftCardListingLive({ ...base, pro: false })).toBe(false);
    expect(giftCardListingLive({ ...base, uninstalled: true })).toBe(false);
    expect(giftCardListingLive({ ...base, listing: { enabled: false, blurb: "" } })).toBe(false);
    expect(giftCardListingLive({ ...base, product: { ...PRODUCT, variants: [{ id: "14", amount: 1000 }] } })).toBe(false);
  });

  it("defaults to off for existing shops", () => {
    expect(mergeSettings({}).giftCardListing).toEqual({ enabled: false, blurb: "" });
  });

  it("cleans the blurb and the source", () => {
    expect(cleanGiftCardBlurb("  Hand-made\n  pottery  ")).toBe("Hand-made pottery");
    expect(cleanGiftCardBlurb("x".repeat(400))).toHaveLength(160);
    expect(giftCardSource("directory")).toBe("directory");
    expect(giftCardSource("registry")).toBe("registry");
    expect(giftCardSource("anything")).toBe("store");
  });
});

describe("store gift card page", () => {
  const html = renderGiftCardPage({
    shopName: "Maple & Co",
    accentColor: "#123456",
    currency: "CAD",
    amounts: listedGiftCardAmounts(PRODUCT),
    blurb: "",
    token: "tok.sig",
  });

  it("posts straight to the store's cart with the signed tag", () => {
    expect(html).toContain('action="/cart/add"');
    expect(html).toContain(`name="properties[${GIFT_CARD_PROPERTY}]" value="tok.sig"`);
    expect(html).toContain('name="id" value="11" checked');
    expect(html).not.toContain('value="14"');
  });

  it("posts no recipient fields until the guest asks to send it", () => {
    expect(html).toMatch(/name="properties\[Recipient email\]"[^>]*disabled/);
    expect(html).toMatch(/name="properties\[__shopify_send_gift_card_to_recipient\]"[^>]*disabled/);
  });

  it("escapes the shop name", () => {
    expect(html).toContain("Maple &amp; Co gift card");
  });
});

describe("giftpin.app/gift-cards", () => {
  it("links each store to its own gift card page", () => {
    const html = giftCardsHtml([
      { domain: SHOP, name: "Maple <Co>", blurb: "Pottery", currency: "CAD", amounts: [{ amount: 25 }, { amount: 100 }] },
    ]);
    expect(html).toContain(`href="https://${SHOP}/apps/registry/gift-card?src=directory"`);
    expect(html).toContain("Maple &lt;Co&gt;");
    expect(html).toContain('<link rel="canonical" href="https://giftpin.app/gift-cards">');
  });

  it("says so when no store is listed", () => {
    expect(giftCardsHtml([])).toContain("No stores listed yet");
  });

  it("never offers a Giftpin card spendable at more than one store", () => {
    const html = giftCardsHtml([]).toLowerCase();
    expect(html).not.toContain("giftpin card");
    expect(html).not.toContain("any store");
    expect(html).toContain("only be spent at that store");
  });
});

describe("directory by country", () => {
  const store = (name: string, country: string | null) => ({
    domain: `${name.toLowerCase()}.myshopify.com`,
    name,
    country,
    blurb: "",
    currency: "USD",
    amounts: [{ amount: 50 }],
  });

  it("groups stores under country names, A to Z, unknown last", () => {
    const groups = groupByCountry([store("Zed", "US"), store("Alder", "CA"), store("Birch", null), store("Ash", "US")]);
    expect(groups.map((g) => g.heading)).toEqual(["Canada", "United States", "Other countries"]);
    expect(groups[1].stores.map((s) => s.name)).toEqual(["Ash", "Zed"]);
  });

  it("puts the country headings on the page", () => {
    const html = giftCardsHtml([store("Alder", "CA")]);
    expect(html).toContain('<h2 class="gc-country rise">Canada</h2>');
  });
});

describe("registry page gift card link", () => {
  const base = {
    title: "Maya & Jared",
    message: null,
    eventType: "wedding",
    eventLabel: "Wedding",
    eventDate: null,
    coverImageUrl: null,
    registrantNames: "Maya & Jared",
    registryId: "reg_1",
    items: [],
    progress: { totalItems: 0, fulfilledItems: 0 },
    shopName: "Maple & Co",
    accentColor: "#123456",
    indexable: false,
    currency: "CAD",
    shareUrl: "https://maple.example/apps/registry/r/abc",
    actionUrl: "/apps/registry",
    version: 1,
    versionUrl: "/apps/registry/r/abc/version",
  } as never;

  it("links to the store's gift card page only when given the URL", () => {
    const withLink = renderRegistryPage({ ...(base as object), giftCardUrl: "/apps/registry/gift-card?src=registry" } as never);
    expect(withLink).toContain('href="/apps/registry/gift-card?src=registry"');
    expect(withLink).toContain("Buy a Maple &amp; Co gift card");
    expect(renderRegistryPage(base)).not.toContain("gift-card?src=registry");
  });

  it("carries the registry source on the signed tag", () => {
    expect(verifyGiftCardAttribution(signGiftCardAttribution(SHOP, "registry"))).toEqual({ s: SHOP, src: "registry" });
  });
});
