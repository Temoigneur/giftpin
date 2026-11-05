/**
 * Registry promotions (Pro): the Shopify side. See app/shared/promotions.ts
 * for what a promotion is, and extensions/registry-discount for the function
 * that applies it.
 *
 * Shopify is the source of truth. Giftpin keeps only the discount node ids
 * (ShopSettings.promotionIds); a promotion the merchant deletes in Shopify's
 * own Discounts page simply stops coming back from `nodes()` and drops off
 * the list.
 *
 * Written from the 2026-07 Admin GraphQL schema (checked with the schema
 * tool on 5 Nov 2026). NOT YET VERIFIED LIVE: create, list and the function
 * applying at checkout. See docs/registry-promotions.md.
 */

import {
  PROMOTION_METAFIELD,
  promotionDiscountInput,
  type PromotionDraft,
  type PromotionKind,
  type PromotionSummary,
} from "../shared/promotions";
import { unauthenticated } from "../shopify.server";
import { dealsFromSummaries, type Deal } from "../shared/promotion-display";
import { readConfig } from "../../extensions/registry-discount/src/registry_discount";

type GraphqlClient = (query: string, options?: { variables?: Record<string, unknown> }) => Promise<Response>;

interface GraphqlBody {
  data?: Record<string, unknown>;
  errors?: { message: string }[];
}

async function run(graphql: GraphqlClient, query: string, variables: Record<string, unknown>) {
  const response = await graphql(query, { variables });
  return (await response.json()) as GraphqlBody;
}

/** Top-level errors plus the mutation's userErrors, as one message. */
function errorsOf(body: GraphqlBody, field: string): string | null {
  const payload = body.data?.[field] as { userErrors?: { message: string }[] } | undefined;
  const messages = [...(body.errors ?? []), ...(payload?.userErrors ?? [])].map((e) => e.message);
  return messages.length ? messages.join("; ") : null;
}

const CREATE_SALE = `#graphql
  mutation giftpinPromotionSale($input: DiscountAutomaticAppInput!) {
    discountAutomaticAppCreate(automaticAppDiscount: $input) {
      automaticAppDiscount { discountId }
      userErrors { field message }
    }
  }`;

const CREATE_COUPON = `#graphql
  mutation giftpinPromotionCoupon($input: DiscountCodeAppInput!) {
    discountCodeAppCreate(codeAppDiscount: $input) {
      codeAppDiscount { discountId }
      userErrors { field message }
    }
  }`;

export type PromotionResult = { ok: true; id: string } | { ok: false; reason: string };

export async function createPromotion(graphql: GraphqlClient, draft: PromotionDraft): Promise<PromotionResult> {
  const sale = draft.kind === "sale";
  const field = sale ? "discountAutomaticAppCreate" : "discountCodeAppCreate";
  const body = await run(graphql, sale ? CREATE_SALE : CREATE_COUPON, { input: promotionDiscountInput(draft) });
  const error = errorsOf(body, field);
  if (error) return { ok: false, reason: error };
  const payload = body.data?.[field] as
    | { automaticAppDiscount?: { discountId: string } | null; codeAppDiscount?: { discountId: string } | null }
    | undefined;
  const id = (sale ? payload?.automaticAppDiscount : payload?.codeAppDiscount)?.discountId;
  return id ? { ok: true, id } : { ok: false, reason: "Shopify didn't return the new discount." };
}

const APP_DISCOUNT_FIELDS = `title status startsAt endsAt asyncUsageCount`;

export const LIST_PROMOTIONS = `#graphql
  query giftpinPromotions($ids: [ID!]!) {
    nodes(ids: $ids) {
      __typename
      ... on DiscountAutomaticNode {
        id
        metafield(namespace: "${PROMOTION_METAFIELD.namespace}", key: "${PROMOTION_METAFIELD.key}") { jsonValue }
        automaticDiscount {
          __typename
          ... on DiscountAutomaticApp { ${APP_DISCOUNT_FIELDS} }
        }
      }
      ... on DiscountCodeNode {
        id
        metafield(namespace: "${PROMOTION_METAFIELD.namespace}", key: "${PROMOTION_METAFIELD.key}") { jsonValue }
        codeDiscount {
          __typename
          ... on DiscountCodeApp { ${APP_DISCOUNT_FIELDS} codes(first: 1) { nodes { code } } }
        }
      }
    }
  }`;

interface AppDiscountFields {
  __typename: string;
  title?: string;
  status?: string;
  startsAt?: string;
  endsAt?: string | null;
  asyncUsageCount?: number;
  codes?: { nodes: { code: string }[] };
}

type PromotionNode =
  | null
  | {
      __typename: string;
      id?: string;
      metafield?: { jsonValue?: unknown } | null;
      automaticDiscount?: AppDiscountFields;
      codeDiscount?: AppDiscountFields;
    };

/**
 * The promotions behind `ids`, in the same order. Ids Shopify no longer has
 * (deleted from the Discounts page) are left out; `missing` lists them so
 * the caller can tidy settings.
 */
export async function listPromotions(
  graphql: GraphqlClient,
  ids: string[],
): Promise<{ promotions: PromotionSummary[]; missing: string[] }> {
  if (ids.length === 0) return { promotions: [], missing: [] };
  const body = await run(graphql, LIST_PROMOTIONS, { ids });
  if (body.errors?.length) throw new Error(body.errors.map((e) => e.message).join("; "));
  const nodes = (body.data?.nodes ?? []) as PromotionNode[];

  const promotions: PromotionSummary[] = [];
  const missing: string[] = [];
  ids.forEach((id, index) => {
    const node = nodes[index];
    const discount = node?.automaticDiscount ?? node?.codeDiscount;
    if (!node || !discount?.title) {
      missing.push(id);
      return;
    }
    const kind: PromotionKind = node.__typename === "DiscountCodeNode" ? "coupon" : "sale";
    promotions.push({
      id,
      kind,
      title: discount.title.replace(/^Giftpin: /, ""),
      code: discount.codes?.nodes[0]?.code ?? null,
      status: discount.status ?? "UNKNOWN",
      startsAt: discount.startsAt ?? "",
      endsAt: discount.endsAt ?? null,
      usageCount: discount.asyncUsageCount ?? 0,
      config: readConfig(node.metafield?.jsonValue),
    });
  });
  return { promotions, missing };
}

const MUTATIONS = {
  sale: {
    activate: ["discountAutomaticActivate", "automaticDiscountNode"],
    deactivate: ["discountAutomaticDeactivate", "automaticDiscountNode"],
    delete: ["discountAutomaticDelete", "deletedAutomaticDiscountId"],
  },
  coupon: {
    activate: ["discountCodeActivate", "codeDiscountNode"],
    deactivate: ["discountCodeDeactivate", "codeDiscountNode"],
    delete: ["discountCodeDelete", "deletedCodeDiscountId"],
  },
} as const;

export type PromotionChange = "activate" | "deactivate" | "delete";

export function promotionKindOf(id: string): PromotionKind | null {
  if (id.startsWith("gid://shopify/DiscountAutomaticNode/")) return "sale";
  if (id.startsWith("gid://shopify/DiscountCodeNode/")) return "coupon";
  return null;
}

export async function changePromotion(
  graphql: GraphqlClient,
  id: string,
  change: PromotionChange,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const kind = promotionKindOf(id);
  if (!kind) return { ok: false, reason: "Not a Giftpin promotion." };
  const [field, returned] = MUTATIONS[kind][change];
  const selection = returned.endsWith("Id") ? returned : `${returned} { id }`;
  const query = `#graphql
    mutation giftpinPromotionChange($id: ID!) {
      ${field}(id: $id) { ${selection} userErrors { field message } }
    }`;
  const body = await run(graphql, query, { id });
  const error = errorsOf(body, field);
  return error ? { ok: false, reason: error } : { ok: true };
}

/**
 * Pauses every promotion, for a shop that has left Pro. Best effort: a
 * failure is logged and the rest still get paused.
 */
export async function pauseAllPromotions(graphql: GraphqlClient, ids: string[]): Promise<number> {
  let paused = 0;
  for (const id of ids) {
    try {
      const result = await changePromotion(graphql, id, "deactivate");
      if (result.ok) paused++;
      else console.error(`[promotions] pausing ${id}: ${result.reason}`);
    } catch (err) {
      console.error(`[promotions] pausing ${id}:`, (err as Error).message);
    }
  }
  return paused;
}

/**
 * The live promotions guests and registrants are told about. Fails soft to
 * an empty list: Shopify hiccuping must never take a registry page down,
 * and the discount still applies at checkout either way.
 */
export async function liveDeals(shopDomain: string, ids: string[]): Promise<Deal[]> {
  if (ids.length === 0) return [];
  try {
    const { admin } = await unauthenticated.admin(shopDomain);
    const { promotions } = await listPromotions((q, o) => admin.graphql(q, o), ids);
    return dealsFromSummaries(promotions);
  } catch (err) {
    console.error("[promotions] live deals:", (err as Error).message);
    return [];
  }
}

const PRODUCT_COLLECTIONS = `#graphql
  query giftpinProductCollections($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product { id collections(first: 50) { nodes { id } } }
    }
  }`;

/** productGid → ids of the collections it's in. Only called when a live deal targets collections. */
export async function productCollections(shopDomain: string, productGids: string[]): Promise<Record<string, string[]>> {
  const out: Record<string, string[]> = {};
  const ids = [...new Set(productGids)].slice(0, 250);
  if (ids.length === 0) return out;
  try {
    const { admin } = await unauthenticated.admin(shopDomain);
    const body = await run((q, o) => admin.graphql(q, o), PRODUCT_COLLECTIONS, { ids });
    const nodes = (body.data?.nodes ?? []) as ({ id?: string; collections?: { nodes: { id: string }[] } } | null)[];
    for (const node of nodes) if (node?.id) out[node.id] = node.collections?.nodes.map((c) => c.id) ?? [];
  } catch (err) {
    console.error("[promotions] product collections:", (err as Error).message);
  }
  return out;
}
