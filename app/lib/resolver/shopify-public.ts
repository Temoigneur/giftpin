/**
 * Layer 1: any other Shopify store.
 *
 * Every Shopify storefront ships a public product JSON endpoint at
 * `/products/{handle}.js` — no key, no login, no rate limit to speak of. A
 * significant minority of merchants disable it, which is why this is a layer
 * and not the whole resolver.
 *
 * This matters more than it first appears. A large share of the DTC brands a
 * couple actually wants on a registry — the ceramics studio, the knife brand,
 * the baby-goods label — are on Shopify. For those we get real variants and
 * live availability, so the item stays accurate for the whole engagement.
 * Amazon gives us a snapshot and a hope. Being able to say "items from Shopify
 * stores stay live" is a product feature nobody else in this category has.
 */

export interface ShopifyPublicProduct {
  title: string;
  imageUrl: string | null;
  price: string | null;
  currency: string | null;
  availability: "in_stock" | "out_of_stock" | "unknown";
  variantId: string | null;
  variantTitle: string | null;
  vendor: string | null;
}

interface RawVariant {
  id: number;
  title: string;
  price: number | string;
  available: boolean;
  featured_image?: { src?: string } | null;
}

interface RawProduct {
  title?: string;
  vendor?: string;
  featured_image?: string | null;
  images?: string[];
  variants?: RawVariant[];
}

/**
 * Shopify's `.js` endpoint reports prices in cents as an integer, but some
 * proxies and older themes hand back a decimal string. Handle both.
 */
export function parsePrice(value: number | string | undefined | null): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return (value / 100).toFixed(2);
  const text = value.trim();
  if (!text) return null;
  if (/^\d+$/.test(text)) return (Number(text) / 100).toFixed(2);
  const parsed = Number.parseFloat(text.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed.toFixed(2) : null;
}

export function parseShopifyProduct(
  raw: RawProduct,
  requestedVariantId: string | null,
  baseUrl: string,
): ShopifyPublicProduct | null {
  if (!raw?.title) return null;

  const variants = Array.isArray(raw.variants) ? raw.variants : [];

  const variant =
    (requestedVariantId
      ? variants.find((v) => String(v.id) === String(requestedVariantId))
      : undefined) ??
    variants.find((v) => v.available) ??
    variants[0];

  const image =
    variant?.featured_image?.src ??
    raw.featured_image ??
    (Array.isArray(raw.images) ? raw.images[0] : null) ??
    null;

  let imageUrl: string | null = null;
  if (image) {
    try {
      // Shopify CDN paths often come back protocol-relative (//cdn.shopify.com/...).
      imageUrl = new URL(image.startsWith("//") ? `https:${image}` : image, baseUrl).toString();
    } catch {
      imageUrl = null;
    }
  }

  return {
    title: raw.title,
    imageUrl,
    price: parsePrice(variant?.price),
    // The .js endpoint doesn't carry a currency; the storefront's own currency
    // is the shop's. Callers fall back to the registry's shop currency.
    currency: null,
    availability: variant ? (variant.available ? "in_stock" : "out_of_stock") : "unknown",
    variantId: variant ? String(variant.id) : null,
    variantTitle: variant && variant.title !== "Default Title" ? variant.title : null,
    vendor: raw.vendor ?? null,
  };
}
