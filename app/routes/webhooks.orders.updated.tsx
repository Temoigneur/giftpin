import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { enqueue } from "../lib/queue.server";
import { markWebhookProcessed } from "../lib/webhooks.server";

/**
 * orders/updated fires for a lot of reasons, most of them irrelevant to us.
 *
 * Two matter:
 *  - an order edit that ADDS a registry line after the fact (re-attribute;
 *    the unique index makes re-running safe)
 *  - an order that has become fully refunded or voided (reverse)
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload, webhookId } = await authenticate.webhook(request);

  if (await markWebhookProcessed(webhookId, "orders/updated", shop)) {
    return new Response();
  }

  const order = payload as {
    id: number | string;
    admin_graphql_api_id?: string;
    financial_status?: string;
    cancelled_at?: string | null;
  };

  const orderId = String(order.admin_graphql_api_id ?? order.id);
  const status = order.financial_status ?? "";

  if (order.cancelled_at || status === "refunded" || status === "voided") {
    await enqueue("void-purchases", { shop, orderId, reason: `orders/updated:${status || "cancelled"}` });
  } else {
    await enqueue("attribute-order", { shop, orderPayload: payload });
  }

  return new Response();
};
