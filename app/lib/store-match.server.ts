import db from "../db.server";
import { registerHandler } from "./queue.server";
import { unauthenticated } from "../shopify.server";
import { bestMatch, searchTerms, sharedNoun, type MatchCandidate } from "./store-match";
import { addInternalItem, removeItem, ItemError } from "../models/item.server";

/**
 * "Available in this store" suggestions.
 *
 * When a registrant adds something from another site, look in the HOSTING
 * store's own catalog for a similar product. If there is one, the registrant
 * is offered a link (keep it, dismiss it, or swap to the store's version).
 * Guests only ever see a match the registrant chose to keep.
 *
 * This reads the merchant's own catalog with the merchant's own permission
 * (read_products). Nothing is written to the catalog.
 *
 * storeMatchStatus: null (never looked) | "none" | "suggested" | "kept" | "dismissed"
 *
 * Two kinds of match share these columns:
 *   product — a similar product. storeMatchProductGid/VariantGid/Handle are set.
 *   search  — the store sells this KIND of thing but not this product.
 *             storeMatchProductGid is null and storeMatchTitle holds the search
 *             word (e.g. "snowboard"); the link goes to the store's own search.
 *
 * NOTE (CLAUDE.md hard rule #1): the GraphQL shapes below are written from
 * Shopify's documented schema but have NOT been run against a live shop yet.
 * The first real match is the verification — check the logs.
 */

const SEARCH_QUERY = `#graphql
  query giftpinStoreMatch($query: String!) {
    products(first: 10, query: $query) {
      nodes {
        id
        title
        handle
        onlineStoreUrl
        variants(first: 1) { nodes { id } }
      }
    }
  }`;

const PRODUCT_QUERY = `#graphql
  query giftpinStoreProduct($id: ID!) {
    product(id: $id) {
      id
      title
      handle
      featuredMedia { preview { image { url } } }
      variants(first: 1) { nodes { id price } }
    }
  }`;

interface SearchNode {
  id: string;
  title: string;
  handle: string;
  onlineStoreUrl: string | null;
  variants: { nodes: { id: string }[] };
}

export type StoreMatch =
  | { kind: "product"; productGid: string; variantId: string; title: string; handle: string }
  | { kind: "search"; term: string };

export async function findStoreMatch(shopDomain: string, title: string): Promise<StoreMatch | null> {
  const terms = searchTerms(title);
  if (terms.length === 0) return null;

  const { admin } = await unauthenticated.admin(shopDomain);
  const response = await admin.graphql(SEARCH_QUERY, {
    variables: { query: `status:active AND (${terms.join(" OR ")})` },
  });
  const body = (await response.json()) as { data?: { products?: { nodes?: SearchNode[] } } };
  const nodes = body.data?.products?.nodes ?? [];

  // Only products actually published to the online store — anything else has
  // no page to link to.
  const published = nodes.filter((n) => n.onlineStoreUrl);
  const candidates: (MatchCandidate & { productGid: string })[] = published.map((n) => ({
    id: n.id,
    productGid: n.id,
    title: n.title,
    handle: n.handle,
    variantId: n.variants.nodes[0]?.id ?? null,
  }));

  const hit = bestMatch(candidates, title);
  if (hit && hit.candidate.variantId) {
    return {
      kind: "product",
      productGid: hit.candidate.productGid,
      variantId: hit.candidate.variantId,
      title: hit.candidate.title,
      handle: hit.candidate.handle,
    };
  }

  const term = sharedNoun(title, published.map((n) => n.title));
  return term ? { kind: "search", term } : null;
}

registerHandler("match-store-item", async ({ itemId }) => {
  const item = await db.registryItem.findUnique({
    where: { id: itemId },
    include: { externalSource: true, registry: { include: { shop: true } } },
  });
  if (!item || item.sourceType === "internal" || item.storeMatchStatus) return;

  const shop = item.registry.shop;

  // Skip items that already point at the hosting store itself.
  const host = item.externalSource?.domain ?? safeHost(item.externalUrl);
  // A link to this very store is not a suggestion.
  if (host && host === shop.domain) return;

  // Manual items carry their own typed title; external items wait for the
  // resolver to have read the page (the resolver re-queues us when it does).
  const title = item.externalSource?.title ?? (item.sourceType === "manual" ? item.snapshotTitle : null);
  if (!title) return;

  let match: Awaited<ReturnType<typeof findStoreMatch>> = null;
  try {
    match = await findStoreMatch(shop.domain, title);
  } catch (err) {
    // Not fatal, and not worth retrying five times: the item simply has no suggestion.
    console.error("[store-match] search failed:", (err as Error).message);
    return;
  }

  await db.registryItem.update({
    where: { id: item.id },
    data: !match
      ? { storeMatchStatus: "none" }
      : match.kind === "product"
        ? {
            storeMatchStatus: "suggested",
            storeMatchProductGid: match.productGid,
            storeMatchVariantGid: match.variantId,
            storeMatchTitle: match.title.slice(0, 300),
            storeMatchHandle: match.handle,
          }
        : {
            storeMatchStatus: "suggested",
            storeMatchProductGid: null,
            storeMatchVariantGid: null,
            storeMatchTitle: match.term.slice(0, 60),
            storeMatchHandle: null,
          },
  });
});

function safeHost(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Registrant choices
// ---------------------------------------------------------------------------

export type MatchAction = "keep" | "dismiss" | "swap";

interface ChoiceInput {
  registryId: string;
  itemId: string;
  action: MatchAction;
}

/** Apply the registrant's choice. Throws ItemError with a message fit to show them. */
export async function applyMatchChoice({ registryId, itemId, action }: ChoiceInput): Promise<void> {
  const item = await db.registryItem.findFirst({
    where: { id: itemId, registryId },
    include: { purchases: { where: { voidedAt: null } }, registry: { include: { shop: true } } },
  });
  if (!item) throw new ItemError("Item not found");
  if (!item.storeMatchStatus || item.storeMatchStatus === "none" || !item.storeMatchTitle) {
    throw new ItemError("There's no store match for that item");
  }

  if (action === "keep" || action === "dismiss") {
    await db.registryItem.update({
      where: { id: item.id },
      data: { storeMatchStatus: action === "keep" ? "kept" : "dismissed" },
    });
    return;
  }

  // swap: replace the outside item with the store's own product.
  if (!item.storeMatchProductGid || !item.storeMatchVariantGid) {
    throw new ItemError("That suggestion is a link to the store's range, not a single product, so it can't be swapped in.");
  }
  if (item.purchases.length > 0 || item.purchasedQty > 0) {
    throw new ItemError("Someone has already bought this, so it can't be swapped. You can dismiss the suggestion instead.");
  }

  const { admin } = await unauthenticated.admin(item.registry.shop.domain);
  const response = await admin.graphql(PRODUCT_QUERY, { variables: { id: item.storeMatchProductGid } });
  const body = (await response.json()) as {
    data?: {
      product?: {
        id: string;
        title: string;
        featuredMedia?: { preview?: { image?: { url?: string } } } | null;
        variants: { nodes: { id: string; price: string }[] };
      } | null;
    };
  };
  const product = body.data?.product;
  const variant = product?.variants.nodes[0];
  if (!product || !variant) throw new ItemError("That product isn't available in the store any more");

  const result = await addInternalItem({
    registryId,
    productGid: product.id,
    variantGid: variant.id,
    title: product.title,
    imageUrl: product.featuredMedia?.preview?.image?.url ?? null,
    price: variant.price,
    currency: item.registry.shop.currency,
    desiredQty: item.desiredQty,
    note: item.note,
  });

  if (result.duplicate) {
    // Already on the registry as a store item: nothing to swap to, just tidy up.
    await removeItem(item.id, registryId);
    return;
  }
  await removeItem(item.id, registryId);
}
