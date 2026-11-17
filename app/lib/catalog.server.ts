import { unauthenticated } from "../shopify.server";

/**
 * The merchant's own catalog, read with the app's offline Admin API access
 * (read_products). Used by the guest page's live stock check, the in-store
 * barcode scanner and the registry importer.
 *
 * Field names and the `barcode:`/`sku:` search syntax were checked against
 * the giftpin-merchant-view store on 24 Oct 2026: barcode search is an exact
 * match, so a 12-digit UPC doesn't find the same code saved as a 13-digit
 * EAN (see barcodeForms).
 */

export interface CatalogVariant {
  variantGid: string;
  productGid: string;
  title: string;
  imageUrl: string | null;
  price: string | null;
  availableForSale: boolean;
  barcode: string | null;
  sku: string | null;
}

type Graphql = (query: string, options?: { variables?: Record<string, unknown> }) => Promise<Response>;

const VARIANT_FIELDS = `
  id
  title
  barcode
  sku
  price
  availableForSale
  image { url }
  product { id title status featuredMedia { preview { image { url } } } }`;

const STOCK_QUERY = `#graphql
  query GiftpinVariantStock($ids: [ID!]!) {
    nodes(ids: $ids) { ... on ProductVariant { id availableForSale product { status } } }
  }`;

const VARIANT_QUERY = `#graphql
  query GiftpinVariant($id: ID!) {
    productVariant(id: $id) { ${VARIANT_FIELDS} }
  }`;

const SEARCH_QUERY = `#graphql
  query GiftpinVariantSearch($query: String!) {
    productVariants(first: 250, query: $query) { nodes { ${VARIANT_FIELDS} } }
  }`;

type VariantNode = {
  id: string;
  title: string;
  barcode: string | null;
  sku: string | null;
  price: string | null;
  availableForSale: boolean;
  image: { url: string } | null;
  product: {
    id: string;
    title: string;
    status: string;
    featuredMedia: { preview: { image: { url: string } | null } | null } | null;
  };
};

async function adminGraphql(shopDomain: string): Promise<Graphql> {
  const { admin } = await unauthenticated.admin(shopDomain);
  return (q, o) => admin.graphql(q, o);
}

async function run<T>(graphql: Graphql, query: string, variables: Record<string, unknown>): Promise<T> {
  const response = await graphql(query, { variables });
  const body = (await response.json()) as { data?: T; errors?: unknown };
  if (body.errors || !body.data) {
    throw new Error(`Admin API failed: ${JSON.stringify(body.errors ?? "no data").slice(0, 300)}`);
  }
  return body.data;
}

function toVariant(node: VariantNode): CatalogVariant | null {
  // Draft and archived products can't be bought, so they're never offered.
  if (!node?.product || node.product.status !== "ACTIVE") return null;
  const title = node.title && node.title !== "Default Title" ? `${node.product.title} - ${node.title}` : node.product.title;
  return {
    variantGid: node.id,
    productGid: node.product.id,
    title,
    imageUrl: node.image?.url ?? node.product.featuredMedia?.preview?.image?.url ?? null,
    price: node.price ?? null,
    availableForSale: node.availableForSale,
    barcode: node.barcode,
    sku: node.sku,
  };
}

/**
 * Which of these variants can be bought right now. Fails soft to null: a
 * Shopify hiccup must never take a registry page down, and showing an item
 * that might be sold out is the old behaviour, not a new risk.
 */
export async function fetchVariantStock(shopDomain: string, variantGids: string[], graphql?: Graphql) {
  const ids = [...new Set(variantGids.filter((id) => id.startsWith("gid://shopify/ProductVariant/")))];
  if (ids.length === 0) return new Map<string, boolean>();
  try {
    const gql = graphql ?? (await adminGraphql(shopDomain));
    const stock = new Map<string, boolean>();
    for (let i = 0; i < ids.length; i += 250) {
      const data = await run<{
        nodes: ({ id?: string; availableForSale?: boolean; product?: { status?: string } | null } | null)[];
      }>(gql, STOCK_QUERY, {
        ids: ids.slice(i, i + 250),
      });
      for (const node of data.nodes) {
        if (!node?.id || typeof node.availableForSale !== "boolean") continue;
        // availableForSale only reflects inventory: a Draft or Archived
        // product still reports true, though no storefront will sell it
        // (seen live 17 Nov 2026, SPIKE-D row D9).
        const status = node.product?.status;
        stock.set(node.id, node.availableForSale && status !== "DRAFT" && status !== "ARCHIVED");
      }
    }
    return stock;
  } catch (err) {
    console.error("[catalog] stock lookup failed:", (err as Error).message);
    return null;
  }
}

export async function getVariant(shopDomain: string, variantGid: string, graphql?: Graphql) {
  const gql = graphql ?? (await adminGraphql(shopDomain));
  const data = await run<{ productVariant: VariantNode | null }>(gql, VARIANT_QUERY, { id: variantGid });
  return data.productVariant ? toVariant(data.productVariant) : null;
}

/**
 * What a scanner or a spreadsheet gave us, cleaned to something safe inside a
 * quoted search term. Null when it can't be a barcode or SKU.
 */
export function cleanCode(raw: unknown): string | null {
  const code = String(raw ?? "").trim();
  if (!code || code.length > 64 || !/^[A-Za-z0-9._\-/]+$/.test(code)) return null;
  return code;
}

/**
 * The same retail barcode can be saved as a 12-digit UPC-A or as the 13-digit
 * EAN with a leading zero, and scanners report either. Search both.
 */
export function barcodeForms(code: string): string[] {
  const forms = new Set([code]);
  if (/^\d{12}$/.test(code)) forms.add(`0${code}`);
  if (/^0\d{12}$/.test(code)) forms.add(code.slice(1));
  return [...forms];
}

export function searchTermsFor(codes: string[]): string[] {
  const terms: string[] = [];
  for (const code of codes) {
    for (const form of barcodeForms(code)) terms.push(`barcode:"${form}"`);
    terms.push(`sku:"${code}"`);
  }
  return terms;
}

/** True when a variant answers to this code, by barcode or SKU. */
export function variantMatchesCode(variant: Pick<CatalogVariant, "barcode" | "sku">, code: string): boolean {
  const forms = barcodeForms(code);
  if (variant.barcode && forms.includes(variant.barcode.trim())) return true;
  return Boolean(variant.sku && variant.sku.trim().toLowerCase() === code.toLowerCase());
}

/**
 * Variants for many codes at once (the importer), in batches small enough for
 * Shopify's search query length. Returns code → matching variants.
 */
export async function findVariantsByCodes(shopDomain: string, rawCodes: string[], graphql?: Graphql) {
  const codes = [...new Set(rawCodes.map(cleanCode).filter((c): c is string => c !== null))];
  const found = new Map<string, CatalogVariant[]>();
  if (codes.length === 0) return found;
  const gql = graphql ?? (await adminGraphql(shopDomain));
  for (let i = 0; i < codes.length; i += 20) {
    const batch = codes.slice(i, i + 20);
    const data = await run<{ productVariants: { nodes: VariantNode[] } }>(gql, SEARCH_QUERY, {
      query: searchTermsFor(batch).join(" OR "),
    });
    const variants = data.productVariants.nodes.map(toVariant).filter((v): v is CatalogVariant => v !== null);
    for (const code of batch) {
      const hits = variants.filter((v) => variantMatchesCode(v, code));
      if (hits.length) found.set(code, hits);
    }
  }
  return found;
}

/** One scanned code. */
export async function findVariantsByCode(shopDomain: string, raw: unknown, graphql?: Graphql) {
  const code = cleanCode(raw);
  if (!code) return [];
  return (await findVariantsByCodes(shopDomain, [code], graphql)).get(code) ?? [];
}
