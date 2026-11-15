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
    products(first: 50, sortKey: RELEVANCE, query: $query) {
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
      status
      featuredMedia { preview { image { url } } }
      variants(first: 1) { nodes { id price } }
    }
  }`;

const PREVIEW_QUERY = `#graphql
  query giftpinMatchPreview($query: String!) {
    products(first: 12, query: $query) {
      nodes {
        id
        title
        handle
        productType
        featuredMedia { preview { image { url } } }
        variants(first: 1) { nodes { id price } }
      }
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
  const body = (await response.json()) as {
    data?: { products?: { nodes?: SearchNode[] } };
    errors?: { message: string }[] | string;
  };
  // A GraphQL error must not be mistaken for "the store has nothing": throw so
  // the job logs it and the item stays un-matched instead of being marked "none".
  if (body.errors || !body.data?.products) {
    throw new Error(`Admin API search failed: ${JSON.stringify(body.errors ?? "no data").slice(0, 300)}`);
  }
  const nodes = body.data.products.nodes ?? [];

  // Prefer products with an online-store page. If none report one (the field is
  // null for some app/publication setups), fall back to every active product:
  // the storefront link is built from the handle either way.
  const withUrl = nodes.filter((n) => n.onlineStoreUrl);
  const published = withUrl.length > 0 ? withUrl : nodes;
  console.log(
    `[store-match] shop=${shopDomain} terms=${terms.join(",")} results=${nodes.length} withUrl=${withUrl.length}`,
  );
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
    data: match ? storeMatchFields(match, "suggested") : { storeMatchStatus: "none" },
  });
});

/** The RegistryItem columns that record a match, at the given status. */
export function storeMatchFields(match: StoreMatch, status: "suggested" | "kept") {
  return match.kind === "product"
    ? {
        storeMatchStatus: status,
        storeMatchProductGid: match.productGid,
        storeMatchVariantGid: match.variantId,
        storeMatchTitle: match.title.slice(0, 300),
        storeMatchHandle: match.handle,
      }
    : {
        storeMatchStatus: status,
        storeMatchProductGid: null,
        storeMatchVariantGid: null,
        storeMatchTitle: match.term.slice(0, 60),
        storeMatchHandle: null,
      };
}

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
  /** For a swap: the store product to swap to. Defaults to the suggested product. */
  productGid?: string;
}

const PRODUCT_GID = /^gid:\/\/shopify\/Product\/\d+$/;

export interface PreviewProduct {
  id: string;
  title: string;
  handle: string;
  imageUrl: string | null;
  price: string | null;
}

export interface MatchPreview {
  kind: "product" | "search";
  /** The word we searched for (search kind), or the suggested product's title. */
  title: string;
  products: PreviewProduct[];
}

function formatPrice(amount: string | undefined, currency: string): string | null {
  if (!amount) return null;
  const n = Number(amount);
  if (!Number.isFinite(n)) return null;
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency }).format(n);
  } catch {
    return `${amount} ${currency}`;
  }
}

interface PreviewNode {
  id: string;
  title: string;
  handle: string;
  productType?: string | null;
  featuredMedia?: { preview?: { image?: { url?: string } } } | null;
  variants: { nodes: { id: string; price: string }[] };
}

/**
 * Shopify's search also matches words buried in a product's description, which
 * is how a gift card that merely mentions snowboards turned up as one. Keep only
 * products whose own title or product type names the kind of thing.
 */
export function namesKind(n: { title: string; productType?: string | null }, term: string): boolean {
  const hay = `${n.title} ${n.productType ?? ""}`.toLowerCase().replace(/[^a-z0-9]+/g, " ");
  return hay.split(" ").some((w) => w === term || w === `${term}s` || w === `${term}es`);
}

function toPreview(n: PreviewNode, currency: string): PreviewProduct {
  const url = n.featuredMedia?.preview?.image?.url ?? null;
  return {
    id: n.id,
    title: n.title,
    handle: n.handle,
    // Only ever hand the browser an https image address.
    imageUrl: url && url.startsWith("https://") ? url : null,
    price: formatPrice(n.variants.nodes[0]?.price, currency),
  };
}

/**
 * What the registrant sees in the "similar item" popup: the suggested product,
 * or (for a category suggestion) up to four of the store's products of that
 * kind. Read-only; nothing is changed in the store.
 */
export async function getMatchPreview(registryId: string, itemId: string): Promise<MatchPreview> {
  const item = await db.registryItem.findFirst({
    where: { id: itemId, registryId },
    include: { registry: { include: { shop: true } } },
  });
  if (!item || !item.storeMatchTitle || (item.storeMatchStatus !== "suggested" && item.storeMatchStatus !== "kept")) {
    throw new ItemError("There's no store match for that item");
  }
  const shop = item.registry.shop;
  return loadPreview(shop.domain, shop.currency, {
    productGid: item.storeMatchProductGid,
    title: item.storeMatchTitle,
  });
}

/**
 * The paste box's "closest match in this store", shown beside a link before
 * it's added. Same search as the match-store-item job, so what the registrant
 * sees here is what the item gets once added. Null when the store has nothing
 * close (or the search fails — a missing suggestion must never block the add).
 */
export async function previewStoreMatch(
  shopDomain: string,
  currency: string,
  title: string,
): Promise<{ match: StoreMatch; preview: MatchPreview } | null> {
  try {
    const match = await findStoreMatch(shopDomain, title);
    if (!match) return null;
    const preview = await loadPreview(
      shopDomain,
      currency,
      match.kind === "product" ? { productGid: match.productGid, title: match.title } : { productGid: null, title: match.term },
    );
    return preview.products.length > 0 ? { match, preview } : null;
  } catch (err) {
    console.error("[store-match] paste preview failed:", (err as Error).message);
    return null;
  }
}

async function loadPreview(
  shopDomain: string,
  currency: string,
  target: { productGid: string | null; title: string },
): Promise<MatchPreview> {
  const { admin } = await unauthenticated.admin(shopDomain);

  if (target.productGid) {
    const response = await admin.graphql(PRODUCT_QUERY, { variables: { id: target.productGid } });
    const body = (await response.json()) as { data?: { product?: (PreviewNode & { status?: string }) | null }; errors?: unknown };
    if (body.errors) throw new Error(`Admin API product lookup failed: ${JSON.stringify(body.errors).slice(0, 300)}`);
    const product = body.data?.product;
    if (!product || (product.status && product.status !== "ACTIVE")) {
      throw new ItemError("That product isn't available in the store any more");
    }
    return { kind: "product", title: target.title, products: [toPreview(product, currency)] };
  }

  // Category suggestion. The word came from our own tokeniser (a-z, 0-9), but
  // strip anything else anyway before it goes into a search query.
  const term = target.title.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!term) throw new ItemError("There's no store match for that item");
  const response = await admin.graphql(PREVIEW_QUERY, { variables: { query: `status:active AND ${term}` } });
  const body = (await response.json()) as { data?: { products?: { nodes?: PreviewNode[] } }; errors?: unknown };
  if (body.errors || !body.data?.products) {
    throw new Error(`Admin API preview failed: ${JSON.stringify(body.errors ?? "no data").slice(0, 300)}`);
  }
  const nodes = body.data.products.nodes ?? [];
  const relevant = nodes.filter((n) => namesKind(n, term)).slice(0, 4);
  return { kind: "search", title: target.title, products: relevant.map((n) => toPreview(n, currency)) };
}

/** Apply the registrant's choice. Throws ItemError with a message fit to show them. */
export async function applyMatchChoice({ registryId, itemId, action, productGid }: ChoiceInput): Promise<void> {
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
  const targetGid = productGid ?? item.storeMatchProductGid;
  if (!targetGid) throw new ItemError("Choose which of the store's products to swap to.");
  if (!PRODUCT_GID.test(targetGid)) throw new ItemError("That isn't a valid product");
  if (item.purchases.length > 0 || item.purchasedQty > 0) {
    throw new ItemError("Someone has already bought this, so it can't be swapped. You can dismiss the suggestion instead.");
  }

  const { admin } = await unauthenticated.admin(item.registry.shop.domain);
  const response = await admin.graphql(PRODUCT_QUERY, { variables: { id: targetGid } });
  const body = (await response.json()) as {
    data?: {
      product?: {
        id: string;
        title: string;
        status?: string;
        featuredMedia?: { preview?: { image?: { url?: string } } } | null;
        variants: { nodes: { id: string; price: string }[] };
      } | null;
    };
  };
  const product = body.data?.product;
  const variant = product?.variants.nodes[0];
  if (!product || !variant || (product.status && product.status !== "ACTIVE")) {
    throw new ItemError("That product isn't available in the store any more");
  }

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
