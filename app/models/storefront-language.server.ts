/**
 * Publishes the store's Giftpin language to a shop metafield so the theme
 * blocks (Liquid, which can't call our server) can read it as
 * `app.metafields.giftpin.language`. Shopify's own `t` filter only follows the
 * storefront language, so a store that picked Japanese in Giftpin but keeps an
 * English storefront would otherwise see English buttons.
 *
 * Best effort: a failure here must never break saving settings.
 * Not yet checked live: that the block reads the app-owned metafield.
 */
type Graphql = (query: string, options?: { variables?: Record<string, unknown> }) => Promise<Response>;

const SHOP_ID_QUERY = `#graphql
  query GiftpinShopId { shop { id } }`;

const SET_MUTATION = `#graphql
  mutation GiftpinSetLanguage($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      userErrors { field message }
    }
  }`;

export async function syncStorefrontLanguage(graphql: Graphql, language: string): Promise<boolean> {
  try {
    const idRes = await graphql(SHOP_ID_QUERY);
    const shopId = ((await idRes.json()) as { data?: { shop?: { id?: string } } }).data?.shop?.id;
    if (!shopId) return false;
    const res = await graphql(SET_MUTATION, {
      variables: {
        metafields: [
          { ownerId: shopId, namespace: "$app:giftpin", key: "language", type: "single_line_text_field", value: language },
        ],
      },
    });
    const body = (await res.json()) as { data?: { metafieldsSet?: { userErrors?: unknown[] } } };
    const errors = body.data?.metafieldsSet?.userErrors ?? [];
    if (errors.length) console.warn("syncStorefrontLanguage userErrors", JSON.stringify(errors));
    return errors.length === 0;
  } catch (err) {
    console.warn("syncStorefrontLanguage failed", err);
    return false;
  }
}
