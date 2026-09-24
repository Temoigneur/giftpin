/**
 * Layer 2 of the resolver ladder: read the page's own structured data.
 *
 * This works on effectively every retail product page in North America, and it
 * works because the retailer *wants* it to: schema.org Product markup is what
 * Google Shopping rich results are built from, so Amazon, Target, Walmart,
 * Wayfair, IKEA and the rest all publish it on purpose.
 *
 * Order of preference, best structure first:
 *   1. schema.org JSON-LD   — richest, has offers/price/availability
 *   2. schema.org microdata — older sites, same vocabulary inline
 *   3. OpenGraph            — near-universal, but title/image/price only
 *
 * Regex rather than a DOM parser is deliberate: we need four fields out of
 * documents that are frequently malformed, and a real parser is a dependency
 * plus a denial-of-service surface for no gain here.
 */

export interface ExtractedProduct {
  title: string | null;
  imageUrl: string | null;
  price: string | null;
  currency: string | null;
  availability: "in_stock" | "out_of_stock" | "unknown";
  resolver: "jsonld" | "microdata" | "opengraph";
}

export function extractProduct(html: string, baseUrl: string): ExtractedProduct | null {
  return (
    fromJsonLd(html, baseUrl) ?? fromMicrodata(html, baseUrl) ?? fromOpenGraph(html, baseUrl)
  );
}

// ---------------------------------------------------------------------------
// 1. JSON-LD
// ---------------------------------------------------------------------------

// JSON-LD is arbitrary third-party JSON; fields are probed defensively below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonLdNode = Record<string, any>;

function fromJsonLd(html: string, baseUrl: string): ExtractedProduct | null {
  const blocks = html.matchAll(
    /<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  for (const block of blocks) {
    let parsed: unknown;
    try {
      // Some sites emit HTML comments or trailing commas inside the block.
      parsed = JSON.parse(block[1].replace(/^\s*<!--/, "").replace(/-->\s*$/, "").trim());
    } catch {
      continue;
    }

    const product = findProductNode(parsed);
    if (!product) continue;

    const offer = firstOffer(product.offers);

    const result: ExtractedProduct = {
      title: cleanText(asString(product.name)),
      imageUrl: absolutize(firstImage(product.image), baseUrl),
      price: normalizePrice(asString(offer?.price ?? offer?.lowPrice ?? offer?.highPrice)),
      currency: normalizeCurrency(asString(offer?.priceCurrency)),
      availability: normalizeAvailability(asString(offer?.availability)),
      resolver: "jsonld",
    };

    if (result.title) return result;
  }

  return null;
}

/** Walks @graph arrays, nested arrays and plain objects looking for a Product. */
function findProductNode(node: unknown, depth = 0): JsonLdNode | null {
  if (depth > 6 || node === null || typeof node !== "object") return null;

  if (Array.isArray(node)) {
    for (const entry of node) {
      const found = findProductNode(entry, depth + 1);
      if (found) return found;
    }
    return null;
  }

  const record = node as JsonLdNode;
  const type = record["@type"];
  const types = Array.isArray(type) ? type : [type];
  if (types.some((t) => typeof t === "string" && /product|book|vehicle/i.test(t))) {
    return record;
  }

  if (record["@graph"]) return findProductNode(record["@graph"], depth + 1);
  if (record.mainEntity) return findProductNode(record.mainEntity, depth + 1);
  if (record.itemListElement) return findProductNode(record.itemListElement, depth + 1);

  return null;
}

function firstOffer(offers: unknown): JsonLdNode | null {
  if (!offers) return null;
  if (Array.isArray(offers)) {
    for (const offer of offers) {
      const found = firstOffer(offer);
      if (found) return found;
    }
    return null;
  }
  if (typeof offers !== "object") return null;
  const record = offers as JsonLdNode;
  // AggregateOffer wraps the real offers.
  if (record.offers) {
    const inner = firstOffer(record.offers);
    if (inner) return inner;
  }
  return record;
}

function firstImage(image: unknown): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (Array.isArray(image)) {
    for (const entry of image) {
      const found = firstImage(entry);
      if (found) return found;
    }
    return null;
  }
  if (typeof image === "object") {
    const record = image as JsonLdNode;
    return firstImage(record.url ?? record.contentUrl ?? null);
  }
  return null;
}

// ---------------------------------------------------------------------------
// 2. Microdata
// ---------------------------------------------------------------------------

function fromMicrodata(html: string, baseUrl: string): ExtractedProduct | null {
  if (!/itemtype\s*=\s*["']https?:\/\/schema\.org\/Product["']/i.test(html)) return null;

  const prop = (name: string): string | null => {
    // <meta itemprop="price" content="12.00">
    const meta = html.match(
      new RegExp(`<meta[^>]+itemprop\\s*=\\s*["']${name}["'][^>]*content\\s*=\\s*["']([^"']*)["']`, "i"),
    );
    if (meta) return meta[1];

    const metaReversed = html.match(
      new RegExp(`<meta[^>]+content\\s*=\\s*["']([^"']*)["'][^>]*itemprop\\s*=\\s*["']${name}["']`, "i"),
    );
    if (metaReversed) return metaReversed[1];

    // <img itemprop="image" src="..."> — must be checked BEFORE the inline-text
    // branch below. A void element has no text content, so the generic
    // `>...<` pattern would otherwise capture the whitespace that follows it
    // and resolve to the page's own URL.
    const src = html.match(
      new RegExp(`<(?:img|link|source)[^>]+itemprop\\s*=\\s*["']${name}["'][^>]*?(?:src|href)\\s*=\\s*["']([^"']*)["']`, "i"),
    );
    if (src) return src[1];

    const srcReversed = html.match(
      new RegExp(`<(?:img|link|source)[^>]+(?:src|href)\\s*=\\s*["']([^"']*)["'][^>]*?itemprop\\s*=\\s*["']${name}["']`, "i"),
    );
    if (srcReversed) return srcReversed[1];

    // <span itemprop="name">Thing</span> — requires real content, not whitespace.
    const inline = html.match(
      new RegExp(`itemprop\\s*=\\s*["']${name}["'][^>]*>([^<]{0,300}?\\S[^<]{0,300}?)<`, "i"),
    );
    if (inline) return inline[1];

    return null;
  };

  const title = cleanText(prop("name"));
  if (!title) return null;

  return {
    title,
    imageUrl: absolutize(prop("image"), baseUrl),
    price: normalizePrice(prop("price")),
    currency: normalizeCurrency(prop("priceCurrency")),
    availability: normalizeAvailability(prop("availability")),
    resolver: "microdata",
  };
}

// ---------------------------------------------------------------------------
// 3. OpenGraph (+ Twitter cards as a last resort)
// ---------------------------------------------------------------------------

function fromOpenGraph(html: string, baseUrl: string): ExtractedProduct | null {
  const meta = (property: string): string | null => {
    const forward = html.match(
      new RegExp(`<meta[^>]+(?:property|name)\\s*=\\s*["']${escapeRegex(property)}["'][^>]*content\\s*=\\s*["']([^"']*)["']`, "i"),
    );
    if (forward) return decodeEntities(forward[1]);

    const reversed = html.match(
      new RegExp(`<meta[^>]+content\\s*=\\s*["']([^"']*)["'][^>]*(?:property|name)\\s*=\\s*["']${escapeRegex(property)}["']`, "i"),
    );
    return reversed ? decodeEntities(reversed[1]) : null;
  };

  const title =
    cleanText(meta("og:title")) ??
    cleanText(meta("twitter:title")) ??
    cleanText(titleTag(html));

  if (!title) return null;

  return {
    title,
    imageUrl: absolutize(meta("og:image") ?? meta("og:image:secure_url") ?? meta("twitter:image"), baseUrl),
    price: normalizePrice(
      meta("product:price:amount") ??
        meta("og:price:amount") ??
        meta("twitter:data1"),
    ),
    currency: normalizeCurrency(meta("product:price:currency") ?? meta("og:price:currency")),
    availability: normalizeAvailability(meta("product:availability") ?? meta("og:availability")),
    resolver: "opengraph",
  };
}

function titleTag(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]{1,300}?)<\/title>/i);
  return match ? decodeEntities(match[1]) : null;
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

function asString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return asString(value[0]);
  return null;
}

function cleanText(value: string | null): string | null {
  if (!value) return null;
  const cleaned = decodeEntities(value).replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  return cleaned.length > 200 ? `${cleaned.slice(0, 197)}...` : cleaned;
}

export function normalizePrice(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  let text = String(value).trim();
  if (!text) return null;

  // Strip currency symbols and words, keep digits and separators.
  text = text.replace(/[^\d.,-]/g, "");
  if (!text) return null;

  const lastComma = text.lastIndexOf(",");
  const lastDot = text.lastIndexOf(".");

  if (lastComma > lastDot) {
    // European: 1.234,56
    text = text.replace(/\./g, "").replace(",", ".");
  } else {
    // North American: 1,234.56
    text = text.replace(/,/g, "");
  }

  const amount = Number.parseFloat(text);
  if (!Number.isFinite(amount) || amount < 0 || amount > 10_000_000) return null;
  return amount.toFixed(2);
}

export function normalizeCurrency(value: string | null | undefined): string | null {
  if (!value) return null;
  const code = String(value).trim().toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : null;
}

export function normalizeAvailability(value: string | null | undefined): ExtractedProduct["availability"] {
  if (!value) return "unknown";
  const text = String(value).toLowerCase();
  if (/out.?of.?stock|soldout|sold_out|discontinued|outofstock/.test(text)) return "out_of_stock";
  if (/instock|in.?stock|onlineonly|limitedavailability|preorder|backorder|available/.test(text)) {
    return "in_stock";
  }
  return "unknown";
}

function absolutize(value: string | null, baseUrl: string): string | null {
  if (!value) return null;
  try {
    const resolved = new URL(decodeEntities(value.trim()), baseUrl);
    if (resolved.protocol !== "https:" && resolved.protocol !== "http:") return null;
    return resolved.toString();
  } catch {
    return null;
  }
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)));
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
