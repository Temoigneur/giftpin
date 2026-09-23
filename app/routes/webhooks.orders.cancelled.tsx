import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { enqueue } from "../lib/queue.server";
import { markWebhookProcessed } from "../lib/webhooks.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload, webhookId } = await authenticate.webhook(request);

  if (await markWebhookProcessed(webhookId, "orders/cancelled", shop)) {
    return new Response();
  }

  const order = payload as { id: number | string; admin_graphql_api_id?: string };
  await enqueue("void-purchases", {
    shop,
    orderId: String(order.admin_graphql_api_id ?? order.id),
    reason: "orders/cancelled",
  });

  return new Response();
};
