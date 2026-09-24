import { describe, it, expect } from "vitest";
import {
  canonicalizeUrl,
  amazonAsin,
  shopifyProductHandle,
  looksLikeShopifyProduct,
  InvalidProductUrl,
} from "../resolver/canonical";
import {
  extractProduct,
  normalizePrice,
  normalizeCurrency,
  normalizeAvailability,
} from "../resolver/metadata";
import { parseShopifyProduct, parsePrice } from "../resolver/shopify-public";
import { __testables as fetcherInternals } from "../resolver/fetcher.server";

describe("canonicalizeUrl", () => {
  it("strips tracking and affiliate parameters", () => {
    const { url } = canonicalizeUrl(
      "https://www.example.com/products/thing?utm_source=x&gclid=y&fbclid=z&tag=someaffiliate-20",
    );
    expect(url).toBe("https://example.com/products/thing");
  });

  it("keeps parameters that identify a different product", () => {
    const { url } = canonicalizeUrl("https://shop.com/products/mug?variant=42&utm_medium=email");
    expect(url).toContain("variant=42");
    expect(url).not.toContain("utm_medium");
  });

  it("collapses the same product pasted four different ways into one row", () => {
    // This is what keeps us fetching a popular product once instead of once per
    // registrant, and what keeps ExternalSource deduplicated.
    const variants = [
      "https://www.example.com/products/thing/",
      "http://example.com/products/thing",
      "https://example.com/products/thing?utm_campaign=spring",
      "https://EXAMPLE.com/products/thing#reviews",
    ];
    const canonical = variants.map((v) => canonicalizeUrl(v).url);
    expect(new Set(canonical).size).toBe(1);
  });

  it("sorts query parameters so order does not create duplicates", () => {
    expect(canonicalizeUrl("https://s.com/p?b=2&a=1").url).toBe(
      canonicalizeUrl("https://s.com/p?a=1&b=2").url,
    );
  });

  it("rejects non-http schemes and junk", () => {
    expect(() => canonicalizeUrl("javascript:alert(1)")).toThrow(InvalidProductUrl);
    expect(() => canonicalizeUrl("data:text/html,<script>")).toThrow(InvalidProductUrl);
    expect(() => canonicalizeUrl("")).toThrow(InvalidProductUrl);
  });

  it("strips embedded credentials", () => {
    const { url } = canonicalizeUrl("https://user:pass@example.com/products/x");
    expect(url).not.toContain("user");
    expect(url).not.toContain("pass");
  });

  it("accepts a bare hostname the way a person would paste it", () => {
    expect(canonicalizeUrl("example.com/products/thing").url).toBe(
      "https://example.com/products/thing",
    );
  });
});

describe("retailer URL shapes", () => {
  it("extracts an ASIN from the Amazon URL forms people actually paste", () => {
    expect(amazonAsin("https://www.amazon.ca/dp/B08N5WRWNW")).toBe("B08N5WRWNW");
    expect(amazonAsin("https://amazon.com/Some-Long-Title/dp/B01MUAGZ49/ref=sr_1_3")).toBe(
      "B01MUAGZ49",
    );
    expect(amazonAsin("https://www.amazon.com/gp/product/B07FZ8S74R?psc=1")).toBe("B07FZ8S74R");
    expect(amazonAsin("https://www.amazon.com/s?k=blender")).toBeNull();
  });

  it("finds the handle on a Shopify product URL", () => {
    expect(shopifyProductHandle("https://brand.com/products/ceramic-mug")).toBe("ceramic-mug");
    expect(shopifyProductHandle("https://brand.com/collections/kitchen/products/mug?variant=1")).toBe("mug");
    expect(shopifyProductHandle("https://brand.com/pages/about")).toBeNull();
  });

  it("recognises a bare product path", () => {
    expect(looksLikeShopifyProduct("https://brand.com/products/mug")).toBe(true);
    expect(looksLikeShopifyProduct("https://brand.com/collections/all")).toBe(false);
  });
});

describe("metadata extraction", () => {
  it("prefers JSON-LD, including inside an @graph", () => {
    const html = `<html><head>
      <meta property="og:title" content="Wrong Title">
      <script type="application/ld+json">
      {"@context":"https://schema.org","@graph":[
        {"@type":"WebSite","name":"Store"},
        {"@type":"Product","name":"Stoneware Mug","image":["https://cdn.x/mug.jpg"],
         "offers":{"@type":"Offer","price":"24.00","priceCurrency":"CAD","availability":"https://schema.org/InStock"}}
      ]}
      </script></head></html>`;

    const result = extractProduct(html, "https://x.com/p")!;
    expect(result.resolver).toBe("jsonld");
    expect(result.title).toBe("Stoneware Mug");
    expect(result.price).toBe("24.00");
    expect(result.currency).toBe("CAD");
    expect(result.availability).toBe("in_stock");
    expect(result.imageUrl).toBe("https://cdn.x/mug.jpg");
  });

  it("unwraps an AggregateOffer", () => {
    const html = `<script type="application/ld+json">
      {"@type":"Product","name":"Knife Set",
       "offers":{"@type":"AggregateOffer","lowPrice":"89.99","priceCurrency":"USD"}}
    </script>`;
    const result = extractProduct(html, "https://x.com/p")!;
    expect(result.price).toBe("89.99");
  });

  it("falls back to microdata", () => {
    const html = `<div itemtype="http://schema.org/Product">
      <span itemprop="name">Wool Blanket</span>
      <meta itemprop="price" content="120.00">
      <meta itemprop="priceCurrency" content="CAD">
      <img itemprop="image" src="/img/blanket.jpg">
    </div>`;
    const result = extractProduct(html, "https://store.ca/p")!;
    expect(result.resolver).toBe("microdata");
    expect(result.title).toBe("Wool Blanket");
    expect(result.price).toBe("120.00");
    expect(result.imageUrl).toBe("https://store.ca/img/blanket.jpg");
  });

  it("falls back to OpenGraph, which is what most large retailers give us", () => {
    const html = `<head>
      <meta property="og:title" content="Cast Iron Skillet &amp; Lid">
      <meta property="og:image" content="//cdn.example.com/skillet.jpg">
      <meta property="product:price:amount" content="59.99">
      <meta property="product:price:currency" content="USD">
      <meta property="product:availability" content="instock">
    </head>`;
    const result = extractProduct(html, "https://retailer.com/p")!;
    expect(result.resolver).toBe("opengraph");
    expect(result.title).toBe("Cast Iron Skillet & Lid");
    expect(result.price).toBe("59.99");
    expect(result.imageUrl).toBe("https://cdn.example.com/skillet.jpg");
  });

  it("handles reversed meta attribute order", () => {
    const html = `<meta content="Reversed Product" property="og:title">`;
    expect(extractProduct(html, "https://x.com")!.title).toBe("Reversed Product");
  });

  it("returns null when a page has no product on it at all", () => {
    expect(extractProduct("<html><body><p>404</p></body></html>", "https://x.com")).toBeNull();
  });

  it("does not treat a javascript: image as a usable URL", () => {
    const html = `<meta property="og:title" content="X"><meta property="og:image" content="javascript:alert(1)">`;
    expect(extractProduct(html, "https://x.com")!.imageUrl).toBeNull();
  });
});

describe("price normalization", () => {
  it("handles North American and European separators", () => {
    expect(normalizePrice("1,234.56")).toBe("1234.56");
    expect(normalizePrice("1.234,56")).toBe("1234.56");
    expect(normalizePrice("$24")).toBe("24.00");
    expect(normalizePrice("CA$ 1,099.00")).toBe("1099.00");
    expect(normalizePrice(29.5 as unknown as string)).toBe("29.50");
  });

  it("rejects nonsense rather than storing a wrong price", () => {
    expect(normalizePrice("call for pricing")).toBeNull();
    expect(normalizePrice("")).toBeNull();
    expect(normalizePrice(null)).toBeNull();
    expect(normalizePrice("99999999999")).toBeNull();
  });

  it("normalizes currency and availability", () => {
    expect(normalizeCurrency("cad")).toBe("CAD");
    expect(normalizeCurrency("dollars")).toBeNull();
    expect(normalizeAvailability("https://schema.org/OutOfStock")).toBe("out_of_stock");
    expect(normalizeAvailability("https://schema.org/InStock")).toBe("in_stock");
    expect(normalizeAvailability(undefined)).toBe("unknown");
  });
});

describe("Shopify public product endpoint", () => {
  const raw = {
    title: "Ceramic Mug",
    vendor: "Studio",
    featured_image: "//cdn.shopify.com/mug.jpg",
    variants: [
      { id: 111, title: "Small", price: 2400, available: false },
      { id: 222, title: "Large", price: 3200, available: true },
    ],
  };

  it("reads cents as Shopify sends them", () => {
    expect(parsePrice(2400)).toBe("24.00");
    expect(parsePrice("2400")).toBe("24.00");
    expect(parsePrice("24.00")).toBe("24.00");
    expect(parsePrice(null)).toBeNull();
  });

  it("picks the requested variant", () => {
    const result = parseShopifyProduct(raw, "111", "https://brand.com")!;
    expect(result.variantTitle).toBe("Small");
    expect(result.price).toBe("24.00");
    expect(result.availability).toBe("out_of_stock");
  });

  it("falls back to the first available variant — live stock is the selling point", () => {
    const result = parseShopifyProduct(raw, null, "https://brand.com")!;
    expect(result.variantTitle).toBe("Large");
    expect(result.availability).toBe("in_stock");
    expect(result.imageUrl).toBe("https://cdn.shopify.com/mug.jpg");
  });

  it("ignores the meaningless Default Title", () => {
    const single = { title: "Thing", variants: [{ id: 1, title: "Default Title", price: 100, available: true }] };
    expect(parseShopifyProduct(single, null, "https://b.com")!.variantTitle).toBeNull();
  });

  it("returns null for a payload that is not a product", () => {
    expect(parseShopifyProduct({} as never, null, "https://b.com")).toBeNull();
  });
});

describe("SSRF guard", () => {
  const { isPrivateAddress } = fetcherInternals;

  it("refuses private, loopback and cloud metadata addresses", () => {
    // This endpoint takes a user-supplied URL. Without this it is a hole
    // straight into the cluster and the cloud metadata service.
    for (const ip of [
      "127.0.0.1",
      "10.0.0.5",
      "172.16.3.1",
      "192.168.1.1",
      "169.254.169.254",
      "100.64.0.1",
      "0.0.0.0",
      "::1",
      "fd00::1",
      "fe80::1",
      "::ffff:127.0.0.1",
    ]) {
      expect(isPrivateAddress(ip), ip).toBe(true);
    }
  });

  it("allows real public addresses", () => {
    for (const ip of ["1.1.1.1", "142.250.65.78", "2606:4700:4700::1111"]) {
      expect(isPrivateAddress(ip), ip).toBe(false);
    }
  });

  it("refuses anything it cannot parse", () => {
    expect(isPrivateAddress("not-an-ip")).toBe(true);
  });
});

describe("robots.txt", () => {
  const { robotsAllows } = fetcherInternals;

  it("honours a blanket disallow", () => {
    expect(robotsAllows("User-agent: *\nDisallow: /", "/products/x", "GiftpinBot")).toBe(false);
  });

  it("allows when the disallowed path does not match", () => {
    expect(robotsAllows("User-agent: *\nDisallow: /admin", "/products/x", "GiftpinBot")).toBe(true);
  });

  it("prefers a rule aimed at us over the wildcard", () => {
    const txt = "User-agent: *\nDisallow: /\n\nUser-agent: GiftpinBot\nAllow: /products\nDisallow: /";
    expect(robotsAllows(txt, "/products/mug", "GiftpinBot/1.0")).toBe(true);
    expect(robotsAllows(txt, "/checkout", "GiftpinBot/1.0")).toBe(false);
  });

  it("lets a longer Allow override a shorter Disallow", () => {
    const txt = "User-agent: *\nDisallow: /p\nAllow: /products/";
    expect(robotsAllows(txt, "/products/mug", "Bot")).toBe(true);
  });

  it("treats an empty or absent robots.txt as permission", () => {
    expect(robotsAllows("", "/anything", "Bot")).toBe(true);
    expect(robotsAllows("# just a comment", "/anything", "Bot")).toBe(true);
  });
});
