import db from "../db.server";
import { registerHandler, enqueue } from "../lib/queue.server";
import { audit } from "../lib/audit.server";
import { absoluteProxyUrl } from "../lib/proxy.server";
import { unauthenticated } from "../shopify.server";
import { EVENT_TYPES } from "../shared/settings";
import { fundState } from "../shared/contributions";
import { isPro } from "./shop.server";
import { registrantEmail, logEvent } from "./registry.server";
import { daysUntil } from "./automations.server";

/**
 * Shopify Flow triggers (Giftpin Pro). The trigger definitions live in
 * extensions/flow-*\/shopify.extension.toml and ship with `shopify app deploy`;
 * this file sends the events with the Admin API's flowTriggerReceive.
 *
 * Flow is also how a merchant reaches Klaviyo: Klaviyo's own Flow connector
 * has a "Track an event" action that takes a customer email, so a workflow can
 * pass "Registrant email" straight into a Klaviyo flow without Giftpin holding
 * anyone's Klaviyo key.
 *
 * What goes in a payload: the registry's own details and the registrant's name
 * and email, which the merchant can already see in the registry CSV export.
 * Never a guest's name or email, a shipping address or the manage link (it is
 * the registrant's credential). A purchase carries an order reference instead,
 * so Flow reads the buyer from Shopify's own order, under Shopify's rules.
 *
 * Every field in a trigger's TOML is required by Flow, so an undated registry
 * sends "" as its event date and -1 as its days until the event.
 */

export const FLOW_TRIGGERS = {
  registryCreated: "giftpin-registry-created",
  eventApproaching: "giftpin-event-approaching",
  giftPurchased: "giftpin-gift-purchased",
} as const;

export type FlowTrigger = keyof typeof FLOW_TRIGGERS;

/** Days before the event that "Event coming up" fires (the first daily run inside it). */
export const EVENT_APPROACHING_DAYS = 30;

const MARKER_EVENT_APPROACHING = "flow_event_approaching_sent";
const PROXY_PREFIX = "/apps/registry";
const DAY = 86_400_000;

export interface FlowRegistry {
  id: string;
  slug: string;
  title: string;
  eventType: string;
  eventDate: Date | null;
  items: { desiredQty: number; purchasedQty: number; fundGoal?: unknown; fundedAmount?: unknown }[];
}

function occasionLabel(eventType: string): string {
  return EVENT_TYPES.find((t) => t.value === eventType)?.label ?? "Other";
}

/** Bought outright, or a group gift / fund that reached its goal. */
export function itemsRemaining(items: FlowRegistry["items"]): number {
  return items.filter(
    (i) => !(i.purchasedQty >= i.desiredQty || fundState(i.fundGoal, i.fundedAmount)?.complete === true),
  ).length;
}

/** Fields every Giftpin trigger shares, keyed exactly as in the extension TOMLs. */
export function registryFields(
  shopDomain: string,
  registry: FlowRegistry,
  registrant: { name: string; email: string },
): Record<string, string | number> {
  return {
    "Registry ID": registry.id,
    "Registry title": registry.title,
    Occasion: occasionLabel(registry.eventType),
    "Event date": registry.eventDate ? registry.eventDate.toISOString().slice(0, 10) : "",
    "Registry URL": absoluteProxyUrl(shopDomain, PROXY_PREFIX, `r/${registry.slug}`),
    "Registrant name": registrant.name,
    "Registrant email": registrant.email,
    "Items remaining": itemsRemaining(registry.items),
  };
}

/** Flow's order_reference wants the numeric order id, not the GID we store. */
export function legacyOrderId(orderId: string): number | null {
  const match = /(\d+)$/.exec(orderId);
  return match ? Number(match[1]) : null;
}

export interface GiftPurchased {
  orderId: string;
  itemTitle: string;
  quantity: number;
  isContribution: boolean;
}

const flowRegistryInclude = {
  shop: { select: { domain: true, plan: true, uninstalledAt: true } },
  registrants: { select: { name: true, emailEnc: true, role: true }, orderBy: { createdAt: "asc" as const } },
  items: { select: { desiredQty: true, purchasedQty: true, fundGoal: true, fundedAmount: true } },
};

/**
 * Builds and queues one trigger. Never throws: a Flow hiccup must not fail
 * the registry sign-up or the order webhook that called it. Returns whether
 * anything was queued (false for Free shops, uninstalled shops, or no email).
 */
export async function queueFlowTrigger(
  registryId: string,
  trigger: FlowTrigger,
  extra?: { days?: number; purchase?: GiftPurchased },
): Promise<boolean> {
  try {
    const registry = await db.registry.findUnique({ where: { id: registryId }, include: flowRegistryInclude });
    if (!registry || registry.shop.uninstalledAt || !isPro(registry.shop as { plan: "free" | "pro" })) return false;

    const owner = registry.registrants.find((r) => r.role === "owner") ?? registry.registrants[0];
    const email = owner ? registrantEmail(owner) : null;
    if (!owner || !email) return false;
    await audit({
      shop: registry.shop.domain,
      actor: "system:flow",
      action: "registrant_email_decrypted",
      subject: registry.id,
      detail: { purpose: `flow_${trigger}` },
    });

    const payload: Record<string, unknown> = registryFields(registry.shop.domain, registry, {
      name: owner.name,
      email,
    });

    if (trigger === "eventApproaching") {
      payload["Days until event"] = extra?.days ?? -1;
    }
    if (trigger === "giftPurchased") {
      const purchase = extra?.purchase;
      const orderId = purchase ? legacyOrderId(purchase.orderId) : null;
      if (!purchase || orderId === null) return false;
      payload.order_id = orderId;
      payload["Item title"] = purchase.itemTitle;
      payload.Quantity = purchase.quantity;
      payload["Is contribution"] = purchase.isContribution;
    }

    await enqueue("flow-trigger", {
      shop: registry.shop.domain,
      handle: FLOW_TRIGGERS[trigger],
      payload,
    });
    return true;
  } catch (err) {
    console.error(`[flow] ${trigger} for ${registryId} not queued:`, (err as Error).message);
    return false;
  }
}

const FLOW_TRIGGER_RECEIVE = `#graphql
  mutation GiftpinFlowTrigger($handle: String, $payload: JSON) {
    flowTriggerReceive(handle: $handle, payload: $payload) {
      userErrors { field message }
    }
  }`;

/**
 * The job. A userError (most likely: the trigger isn't deployed yet, or the
 * shop's plan has no Flow) is logged, not thrown, because retrying it five
 * times can't help. A network or auth failure throws so BullMQ retries.
 */
export async function sendFlowTrigger(shop: string, handle: string, payload: Record<string, unknown>): Promise<void> {
  const { admin } = await unauthenticated.admin(shop);
  const response = await admin.graphql(FLOW_TRIGGER_RECEIVE, { variables: { handle, payload } });
  const body = (await response.json()) as {
    data?: { flowTriggerReceive?: { userErrors?: { field?: string[]; message: string }[] } };
    errors?: unknown;
  };
  if (body.errors) throw new Error(`flowTriggerReceive: ${JSON.stringify(body.errors)}`);
  const userErrors = body.data?.flowTriggerReceive?.userErrors ?? [];
  if (userErrors.length > 0) {
    console.warn(`[flow] ${handle} on ${shop} rejected: ${userErrors.map((e) => e.message).join("; ")}`);
  }
}

registerHandler("flow-trigger", async ({ shop, handle, payload }) => {
  await sendFlowTrigger(shop, handle, payload);
});

/**
 * Daily: "Event coming up" for each Pro registry whose event is 1 to 30 days
 * away and hasn't had it yet. A registry created 10 days out gets it on the
 * next run with Days until event = 10, so a workflow can branch on that.
 */
export async function runFlowEventReminders(now: Date = new Date()): Promise<number> {
  const registries = await db.registry.findMany({
    where: {
      status: "active",
      shop: { plan: "pro", uninstalledAt: null },
      eventDate: {
        gte: new Date(now.getTime()),
        lte: new Date(now.getTime() + (EVENT_APPROACHING_DAYS + 1) * DAY),
      },
      events: { none: { type: MARKER_EVENT_APPROACHING } },
    },
    select: { id: true, eventDate: true },
  });

  let queued = 0;
  for (const registry of registries) {
    if (!registry.eventDate) continue;
    const days = daysUntil(registry.eventDate, now);
    if (days < 1 || days > EVENT_APPROACHING_DAYS) continue;
    // Marked first: a second "coming up" is worse than a missed one.
    await logEvent(registry.id, MARKER_EVENT_APPROACHING, { days });
    if (await queueFlowTrigger(registry.id, "eventApproaching", { days })) queued++;
  }
  console.log(`[flow] event-approaching queued ${queued} of ${registries.length}`);
  return queued;
}

registerHandler("flow-event-reminders", async () => {
  await runFlowEventReminders();
});
