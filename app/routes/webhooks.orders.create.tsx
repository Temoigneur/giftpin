import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { enqueue } from "../lib/queue.server";
import { markWebhookProcessed } from "../lib/webhooks.server";

/**
 * The attribution entry point.
 *
 * Shopify expects an acknowledgement in about five seconds and retries the
 * whole delivery if it doesn't get one. So: verify, enqueue, return. All the
 * real work happens in the worker.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload, webhookId } = await authenticate.webhook(request);

  if (await markWebhookProcessed(webhookId, "orders/create", shop)) {
    return new Response(); // already seen
  }

  await enqueue("attribute-order", { shop, orderPayload: payload });

  return new Response();
};
