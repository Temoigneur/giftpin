import { cleanContributionVariants, type ContributionProduct } from "../shared/contributions";

/**
 * The merchant's gift card products, for Settings → Group gifts and funds.
 *
 * Read-only on purpose. The merchant creates the gift card in Shopify admin
 * (Products → Gift cards); Giftpin never creates one, so group gifting needs
 * no scope beyond the read_products it already has. SPIKE-C.md.
 *
 * `gift_card:true` narrows the search; `isGiftCard` is checked again below in
 * case the filter is ignored, so a normal product can never be picked.
 */
const GIFT_CARD_PRODUCTS_QUERY = `#graphql
  query giftpinGiftCardProducts {
    products(first: 25, query: "gift_card:true status:active") {
      nodes {
        id
        title
        isGiftCard
        variants(first: 20) {
          nodes { id price }
        }
      }
    }
  }`;

interface ProductNode {
  id: string;
  title: string;
  isGiftCard?: boolean;
  variants?: { nodes?: { id: string; price: string | number }[] };
}

type Graphql = (query: string, options?: { variables?: Record<string, unknown> }) => Promise<Response>;

export async function listGiftCardProducts(graphql: Graphql): Promise<ContributionProduct[]> {
  const response = await graphql(GIFT_CARD_PRODUCTS_QUERY);
  const body = (await response.json()) as { data?: { products?: { nodes?: ProductNode[] } } };
  return (body.data?.products?.nodes ?? [])
    .map(toContributionProduct)
    .filter((p): p is ContributionProduct => p !== null);
}

export function toContributionProduct(node: ProductNode): ContributionProduct | null {
  if (!node?.isGiftCard) return null;
  const variants = cleanContributionVariants(
    (node.variants?.nodes ?? []).map((v) => ({ id: v.id, amount: v.price })),
  );
  if (variants.length === 0) return null;
  return { productGid: node.id, title: node.title, variants };
}
