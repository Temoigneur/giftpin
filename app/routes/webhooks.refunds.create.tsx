import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { enqueue } from "../lib/queue.server";
import { markWebhookProcessed } from "../lib/webhooks.server";

/**
 * Partial refunds are the normal case: a guest buys two of six, returns one.
 *
 * The refund payload carries refund_line_items, each pointing at a line_item —
 * so we reverse exactly those lines, not the whole order. Spike row 13 checks
 * whether the payload carries properties or only IDs; we key on the line item
 * ID either way, which is why Purchase stores it.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload, webhookId } = await authenticate.webhook(request);

  if (await markWebhookProcessed(webhookId, "refunds/create", shop)) {
    return new Response();
  }

  const refund = payload as {
    order_id: number | string;
    admin_graphql_api_id?: string;
    refund_line_items?: { line_item_id: number | string; quantity: number }[];
  };

  const lineItemIds = (refund.refund_line_items ?? [])
    .filter((rli) => Number(rli.quantity) > 0)
    .map((rli) => String(rli.line_item_id));

  await enqueue("void-purchases", {
    shop,
    orderId: `gid://shopify/Order/${refund.order_id}`,
    lineItemIds,
    reason: "refunds/create",
  });

  return new Response();
};
