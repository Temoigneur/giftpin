import db from "../db.server";

/**
 * Webhook deduplication.
 *
 * Shopify delivers at least once, and will redeliver the same webhook if we're
 * slow or briefly down. For orders/create the unique index on
 * (orderId, lineItemId) already makes reprocessing a no-op, but refunds and
 * cancellations have no such natural key — and double-decrementing a registry
 * is exactly the bug that produces a duplicate gift.
 *
 * So we record every webhook id we've seen. Belt and braces, deliberately.
 *
 * @returns true if this webhook has already been handled.
 */
export async function markWebhookProcessed(
  webhookId: string | undefined,
  topic: string,
  shop: string,
): Promise<boolean> {
  // No id means we can't dedupe; process it and rely on the downstream
  // idempotency rather than dropping a real event.
  if (!webhookId) return false;

  try {
    await db.processedWebhook.create({ data: { id: webhookId, topic, shop } });
    return false;
  } catch (err) {
    if ((err as { code?: string })?.code === "P2002") return true;
    // A database hiccup must not turn into a dropped webhook.
    console.error("[webhooks] dedupe check failed:", (err as Error).message);
    return false;
  }
}

/** Housekeeping — the dedupe table only needs a few days of history. */
export async function pruneProcessedWebhooks(olderThanDays = 7): Promise<number> {
  const { count } = await db.processedWebhook.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - olderThanDays * 86_400_000) } },
  });
  return count;
}
