import db from "../../db.server";
import { sha256 } from "../crypto.server";
import { registerHandler, enqueue } from "../queue.server";
import { canonicalizeUrl, shopifyProductHandle, InvalidProductUrl } from "./canonical";
import { fetchProductPage, FetchRefused } from "./fetcher.server";
import { extractProduct } from "./metadata";
import { parseShopifyProduct } from "./shopify-public";

/**
 * The resolver ladder. First hit wins.
 *
 *   0. Merchant's own catalog     — handled before we get here (models/item.server.ts),
 *                                   because those items are buyable and attributable.
 *   1. Any other Shopify store    — public product JSON: variants, live stock.
 *   2. Page structured data       — JSON-LD, then microdata, then OpenGraph.
 *   3. Manual                     — the registrant types it in.
 *
 * Layers 1 and 2 mean the app supports every retailer in North America on day
 * one with zero per-retailer integrations. Named retailers are a refinement,
 * never a prerequisite.
 *
 * Everything here stores a REFERENCE to someone else's product — title, image
 * URL, price, link — on a customer's private gift list. Nothing is ever written
 * into the merchant's catalog. That distinction is what separates this from the
 * catalog-cloning pattern App Store requirement 1.1.13 prohibits, and it should
 * stay true of every change to this file.
 */

export interface ResolveResult {
  externalSourceId: string;
  title: string | null;
  status: "ok" | "pending" | "failed";
}

/**
 * Creates or returns the deduplicated ExternalSource for a pasted URL and
 * queues a fetch if we don't have fresh data. Returns immediately — the
 * registrant should not wait on someone else's server.
 */
export async function resolveUrl(rawUrl: string): Promise<ResolveResult> {
  const { url, domain } = canonicalizeUrl(rawUrl);
  const hash = sha256(url);

  const existing = await db.externalSource.findUnique({ where: { canonicalUrlHash: hash } });

  if (existing) {
    if (isFresh(existing.lastFetchedAt, existing.ttlSeconds) && existing.fetchStatus === "ok") {
      return { externalSourceId: existing.id, title: existing.title, status: "ok" };
    }
    await enqueue("resolve-url", { externalSourceId: existing.id });
    return {
      externalSourceId: existing.id,
      title: existing.title,
      status: existing.title ? "ok" : "pending",
    };
  }

  const created = await db.externalSource.create({
    data: {
      canonicalUrlHash: hash,
      canonicalUrl: url,
      domain,
      resolver: "pending",
      fetchStatus: "pending",
    },
  });

  await enqueue("resolve-url", { externalSourceId: created.id });
  return { externalSourceId: created.id, title: null, status: "pending" };
}

function isFresh(lastFetchedAt: Date | null, ttlSeconds: number): boolean {
  if (!lastFetchedAt) return false;
  return Date.now() - lastFetchedAt.getTime() < ttlSeconds * 1000;
}

// ---------------------------------------------------------------------------
// The job that does the actual work
// ---------------------------------------------------------------------------

registerHandler("resolve-url", async ({ externalSourceId }) => {
  const source = await db.externalSource.findUnique({ where: { id: externalSourceId } });
  if (!source) return;

  try {
    const resolved = await performResolve(source.canonicalUrl);
    await db.externalSource.update({
      where: { id: source.id },
      data: {
        title: resolved.title,
        imageUrl: resolved.imageUrl,
        price: resolved.price ? resolved.price : null,
        currency: resolved.currency,
        availability: resolved.availability,
        resolver: resolved.resolver,
        ttlSeconds: resolved.ttlSeconds,
        fetchStatus: "ok",
        fetchError: null,
        lastFetchedAt: new Date(),
      },
    });
  } catch (err) {
    const refused = err instanceof FetchRefused;
    const status = refused && (err.reason === "denylisted" || err.reason === "robots")
      ? "blocked"
      : refused && err.reason === "bad_status"
        ? "gone"
        : "failed";

    await db.externalSource.update({
      where: { id: source.id },
      data: {
        fetchStatus: status,
        fetchError: (err as Error).message.slice(0, 500),
        lastFetchedAt: new Date(),
        // Back off hard on things we shouldn't or can't fetch.
        ttlSeconds: status === "blocked" ? 30 * 24 * 3600 : 24 * 3600,
      },
    });

    // Don't rethrow for a refusal — a retailer saying no is a normal outcome,
    // not a job failure to retry five times.
    if (!refused) throw err;
  }
});

interface ResolvedPayload {
  title: string | null;
  imageUrl: string | null;
  price: string | null;
  currency: string | null;
  availability: string;
  resolver: string;
  ttlSeconds: number;
}

async function performResolve(url: string): Promise<ResolvedPayload> {
  // --- Layer 1: another Shopify store ------------------------------------
  const handle = shopifyProductHandle(url);
  if (handle) {
    const shopifyResult = await tryShopifyPublic(url, handle);
    if (shopifyResult) return shopifyResult;
  }

  // --- Layer 2: the page's own structured data ---------------------------
  const page = await fetchProductPage(url);
  const extracted = extractProduct(page.html, page.finalUrl);

  if (!extracted || !extracted.title) {
    throw new FetchRefused("No product information found on that page", "bad_status");
  }

  return {
    title: extracted.title,
    imageUrl: extracted.imageUrl,
    price: extracted.price,
    currency: extracted.currency,
    availability: extracted.availability,
    resolver: extracted.resolver,
    // A metadata snapshot is a snapshot. Weekly is often enough, and it keeps
    // us off other people's servers.
    ttlSeconds: 7 * 24 * 3600,
  };
}

async function tryShopifyPublic(url: string, handle: string): Promise<ResolvedPayload | null> {
  const parsed = new URL(url);
  const jsonUrl = `${parsed.origin}/products/${handle}.js${parsed.searchParams.get("variant") ? `` : ``}`;

  let page: Awaited<ReturnType<typeof fetchProductPage>>;
  try {
    page = await fetchProductPage(jsonUrl);
  } catch {
    // Not Shopify, or the merchant disabled the endpoint. Fall through to
    // layer 2 rather than failing the whole resolve.
    return null;
  }

  if (!page.contentType.includes("json")) return null;

  let raw: unknown;
  try {
    raw = JSON.parse(page.html);
  } catch {
    return null;
  }

  const product = parseShopifyProduct(
    raw as Parameters<typeof parseShopifyProduct>[0],
    parsed.searchParams.get("variant"),
    parsed.origin,
  );
  if (!product) return null;

  return {
    title: product.variantTitle ? `${product.title} — ${product.variantTitle}` : product.title,
    imageUrl: product.imageUrl,
    price: product.price,
    currency: product.currency,
    availability: product.availability,
    resolver: "shopify_public",
    // Live data is worth re-checking daily; that's the whole selling point.
    ttlSeconds: 24 * 3600,
  };
}

// ---------------------------------------------------------------------------
// Nightly refresh
// ---------------------------------------------------------------------------

registerHandler("refresh-external", async ({ batchSize = 200 }) => {
  const now = new Date();

  // Oldest first, only rows that are actually stale, only rows someone still
  // references. An unreferenced source is dead weight we don't pay to refresh.
  const stale = await db.externalSource.findMany({
    where: {
      fetchStatus: { in: ["ok", "failed"] },
      items: { some: {} },
      OR: [
        { lastFetchedAt: null },
        { lastFetchedAt: { lt: new Date(now.getTime() - 24 * 3600 * 1000) } },
      ],
    },
    orderBy: { lastFetchedAt: "asc" },
    take: batchSize,
    select: { id: true, lastFetchedAt: true, ttlSeconds: true },
  });

  for (const source of stale) {
    if (isFresh(source.lastFetchedAt, source.ttlSeconds)) continue;
    await enqueue("resolve-url", { externalSourceId: source.id });
  }
});

export { InvalidProductUrl, FetchRefused };
