import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { markWebhookProcessed } from "../lib/webhooks.server";
import { setPlanFromSubscription } from "../models/shop.server";

/**
 * Keeps Shop.plan in sync with Shopify's own billing state. Fires on
 * activation, cancellation, expiration, and freeze/unfreeze (e.g. a declined
 * renewal charge). This webhook is the source of truth for the plan column —
 * app/routes/app.billing.tsx's cancel action also writes it, but only so the
 * merchant doesn't have to wait on webhook delivery to see their own click
 * reflected.
 *
 * UNVERIFIED per CLAUDE.md hard rule #1 ("never trust a Shopify doc claim
 * without live verification"): the payload shape below (nested under
 * `app_subscription`, with `status` / `admin_graphql_api_id` fields) is
 * written from the 2026-07 webhook docs, not a real delivery — Giftpin has
 * never had a real subscription to receive one from. Read defensively
 * (nested OR flat) and log the raw payload if the expected field is missing,
 * so the first real delivery (from the fresh Shop Pay test checkout, or a
 * real Upgrade click) can confirm or correct this — see STATUS.md.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload, webhookId, topic } = await authenticate.webhook(request);

  if (await markWebhookProcessed(webhookId, "app_subscriptions/update", shop)) {
    return new Response();
  }

  const raw = payload as Record<string, unknown>;
  const sub = (raw.app_subscription ?? raw) as {
    status?: string;
    admin_graphql_api_id?: string;
  };

  if (!sub.status) {
    console.error(
      `[webhooks] ${topic}: expected a "status" field (flat or under app_subscription) — got neither. Raw payload:`,
      JSON.stringify(raw),
    );
    return new Response();
  }

  await setPlanFromSubscription(shop, sub.status, sub.admin_graphql_api_id ?? null);

  return new Response();
};
