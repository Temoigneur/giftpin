import crypto from "node:crypto";

/**
 * Registry completion discount (Pro) — the Shopify side.
 *
 * After the event, the registrant gets a single-use code for a percentage off
 * the merchant's products still left on their list. Built with
 * discountCodeBasicCreate, which needs the `write_discounts` scope.
 *
 * NOT YET VERIFIED LIVE (CLAUDE.md hard rule #1). The input shape below is
 * written from the 2026-07 Admin GraphQL reference: `context` replaces the
 * deprecated `customerSelection`, and a percentage is a 0-1 float. Confirmed
 * from the docs page for DiscountCodeBasicInput only; DiscountContextInput's
 * `all: ALL`, `customerGets.items.products.productsToAdd` and
 * `combinesWith` are from memory of earlier versions. Run one against the dev
 * store and update this comment before relying on it. Failures come back as
 * userErrors, are logged on the registry, and the job retries the next day.
 */

export const COMPLETION_DISCOUNT_MUTATION = `#graphql
  mutation giftpinCompletionDiscount($input: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $input) {
      codeDiscountNode { id }
      userErrors { field message code }
    }
  }`;

/** No lookalike characters, so it can be read aloud or typed from a phone. */
export function completionDiscountCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) out += alphabet[bytes[i] % alphabet.length];
  return `THANKS-${out}`;
}

export interface CompletionDiscountSpec {
  code: string;
  registryTitle: string;
  percent: number;
  productGids: string[];
  startsAt: Date;
  endsAt: Date;
}

export function completionDiscountInput(spec: CompletionDiscountSpec): Record<string, unknown> {
  return {
    title: `Giftpin registry thank-you: ${spec.registryTitle}`.slice(0, 255),
    code: spec.code,
    startsAt: spec.startsAt.toISOString(),
    endsAt: spec.endsAt.toISOString(),
    // One code per registry, used once. It's meant for the registrant, but
    // registrants don't need a customer account (see registry.server.ts), so
    // it can't be tied to one.
    usageLimit: 1,
    appliesOncePerCustomer: true,
    context: { all: "ALL" },
    customerGets: {
      value: { percentage: spec.percent / 100 },
      items: { products: { productsToAdd: spec.productGids } },
    },
    combinesWith: { orderDiscounts: false, productDiscounts: false, shippingDiscounts: true },
  };
}

type GraphqlClient = (query: string, options?: { variables?: Record<string, unknown> }) => Promise<Response>;

export type CreateDiscountResult =
  | { ok: true; discountId: string | null }
  | { ok: false; reason: string };

export async function createCompletionDiscount(
  graphql: GraphqlClient,
  spec: CompletionDiscountSpec,
): Promise<CreateDiscountResult> {
  const response = await graphql(COMPLETION_DISCOUNT_MUTATION, {
    variables: { input: completionDiscountInput(spec) },
  });
  const body = (await response.json()) as {
    data?: {
      discountCodeBasicCreate?: {
        codeDiscountNode?: { id: string } | null;
        userErrors?: { message: string }[];
      };
    };
    errors?: { message: string }[];
  };

  const errors = [
    ...(body.errors ?? []),
    ...(body.data?.discountCodeBasicCreate?.userErrors ?? []),
  ];
  if (errors.length > 0) return { ok: false, reason: errors.map((e) => e.message).join("; ") };
  if (!body.data?.discountCodeBasicCreate) return { ok: false, reason: "empty_response" };

  return { ok: true, discountId: body.data.discountCodeBasicCreate.codeDiscountNode?.id ?? null };
}
