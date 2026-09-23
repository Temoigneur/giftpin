/**
 * URL canonicalization.
 *
 * Two jobs:
 *
 * 1. Deduplicate. The same product pasted by four registrants with four
 *    different tracking tails must collapse to one ExternalSource row, so we
 *    fetch it once and stay a polite citizen of someone else's server.
 *
 * 2. Strip affiliate and tracking parameters. We remove whatever the pasted URL
 *    carried and add none of our own — the app takes no affiliate revenue, by
 *    design. See architecture-decisions.md §1.
 */

/** Removed from every URL before storage. */
const TRACKING_PARAMS = new Set([
  // generic analytics
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id",
  "gclid", "gbraid", "wbraid", "fbclid", "msclkid", "twclid", "ttclid", "igshid",
  "mc_cid", "mc_eid", "_branch_match_id", "irclickid", "irgwc",
  // affiliate networks
  "tag", "ascsubtag", "linkCode", "linkId", "creative", "creativeASIN",
  "camp", "ref_", "pf_rd_r", "pf_rd_p", "pd_rd_r", "pd_rd_w", "pd_rd_wg",
  "psc", "th", "smid", "content-id",
  "affid", "affiliate_id", "aff_id", "clickid", "cjevent", "sscid",
  "ranMID", "ranEAID", "ranSiteID", "siteID", "publisherId",
  "sourceid", "srsltid",
  // storefront noise
  "_pos", "_sid", "_ss", "_fd", "pr_prod_strat", "pr_rec_id", "pr_rec_pid",
  "pr_ref_pid", "pr_seq", "variantid_tracking",
]);

/** Query params that genuinely identify a different product. Never stripped. */
const SIGNIFICANT_PARAMS = new Set([
  "variant", "variantId", "variant_id",
  "sku", "skuId", "color", "colour", "size", "style",
  "dwvar_color", "dwvar_size", // Salesforce Commerce Cloud
  "preselect_or_first_variant",
]);

export interface CanonicalResult {
  url: string;
  domain: string;
}

export class InvalidProductUrl extends Error {}

/**
 * Normalizes a registrant-pasted URL.
 * Throws InvalidProductUrl on anything we refuse to touch.
 */
export function canonicalizeUrl(input: string): CanonicalResult {
  const trimmed = input.trim();
  if (!trimmed) throw new InvalidProductUrl("Empty URL");

  let url: URL;
  try {
    url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    throw new InvalidProductUrl("That doesn't look like a link");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new InvalidProductUrl("Only http and https links are supported");
  }

  // Always store https. Almost every retailer redirects anyway, and it keeps
  // http:// and https:// versions of the same page from deduplicating apart.
  url.protocol = "https:";
  url.hash = "";
  url.username = "";
  url.password = "";
  url.port = "";

  url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");

  const kept = new URLSearchParams();
  const entries = Array.from(url.searchParams.entries())
    // Sort so param order doesn't create duplicate rows.
    .sort(([a], [b]) => a.localeCompare(b));

  for (const [key, value] of entries) {
    if (SIGNIFICANT_PARAMS.has(key)) {
      kept.append(key, value);
      continue;
    }
    if (TRACKING_PARAMS.has(key) || key.startsWith("utm_")) continue;
    kept.append(key, value);
  }

  url.search = kept.toString();

  // Trailing slash on a non-root path is noise.
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }

  return { url: url.toString(), domain: url.hostname };
}

/**
 * Amazon product URLs are long, mutable, and carry a dozen tracking segments.
 * They all reduce to an ASIN, which is the only stable part.
 */
export function amazonAsin(url: string): string | null {
  const match = url.match(/\/(?:dp|gp\/product|gp\/aw\/d|product)\/([A-Z0-9]{10})(?:[/?]|$)/i);
  return match ? match[1].toUpperCase() : null;
}

/** True when the URL looks like a Shopify storefront product page. */
export function looksLikeShopifyProduct(url: string): boolean {
  try {
    return /\/products\/[^/]+$/.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

/** `/collections/x/products/handle` and `/products/handle` both yield `handle`. */
export function shopifyProductHandle(url: string): string | null {
  try {
    const match = new URL(url).pathname.match(/\/products\/([^/?#]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
