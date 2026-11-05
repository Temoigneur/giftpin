import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { enqueue } from "../lib/queue.server";
import { markWebhookProcessed } from "../lib/webhooks.server";
import db from "../db.server";
import { countStoreOrder } from "../models/stats.server";

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

  // Every order, registry or not, goes into the store's daily sales total, so
  // registry sales can be shown as a share of the whole store. Counted here,
  // after the duplicate check, rather than in the job: a retried job would
  // count the order twice. Never throws (see stats.server.ts).
  const shopRow = await db.shop.findUnique({ where: { domain: shop }, select: { id: true } });
  if (shopRow) await countStoreOrder(shopRow.id, payload as { total_price?: unknown; created_at?: unknown });

  await enqueue("attribute-order", { shop, orderPayload: payload });

  return new Response();
};
