import db from "../db.server";
import { registerHandler } from "../lib/queue.server";
import { attributedLines, type OrderLineItem } from "../lib/attribution";
import {
  touchRegistry,
  logEvent,
  registrantEmail,
  readShippingAddress,
  mintManageToken,
} from "./registry.server";
import { settingsFor } from "./shop.server";
import { sendEmail } from "../lib/email.server";
import { absoluteProxyUrl } from "../lib/proxy.server";
import { unauthenticated } from "../shopify.server";
import { audit } from "../lib/audit.server";
import { toMailingAddressInput } from "../shared/shipping-address";

/**
 * Order attribution.
 *
 * The arithmetic here is the one thing in the app that must never be wrong. A
 * registry that says two of six are bought when three are bought produces a
 * duplicate gift, which is the single failure a registry exists to prevent.
 * Everything below is therefore idempotent and reversible.
 */

interface OrderPayload {
  id: number | string;
  admin_graphql_api_id?: string;
  name?: string;
  currency?: string;
  line_items?: OrderLineItem[];
  customer?: {
    id?: number | string;
    first_name?: string;
    last_name?: string;
    email?: string;
    orders_count?: number;
  } | null;
  cart_token?: string | null;
  financial_status?: string;
}

registerHandler("attribute-order", async ({ shop, orderPayload }) => {
  await attributeOrder(shop, orderPayload as OrderPayload);
});

export async function attributeOrder(shopDomain: string, order: OrderPayload): Promise<void> {
  const lines = attributedLines(order.line_items);
  if (lines.length === 0) return;

  const orderId = String(order.admin_graphql_api_id ?? order.id);
  const shopRecord = await db.shop.findUnique({ where: { domain: shopDomain } });
  if (!shopRecord) return;

  const settings = settingsFor(shopRecord);

  // orders_count includes the order in hand, so 1 means first-ever purchase.
  const isNewCustomer = Number(order.customer?.orders_count ?? 0) <= 1;
  const buyerName =
    [order.customer?.first_name, order.customer?.last_name].filter(Boolean).join(" ") || null;
  // Kept only so customers/redact can find and erase this buyer's name later.
  const buyerCustomerId = order.customer?.id ? String(order.customer.id) : null;

  const touched = new Set<string>();
  const shipped = new Set<string>();

  for (const line of lines) {
    // Scope the item lookup by registry AND shop. A token is signed by us, but
    // a registry id from one shop must never credit another shop's registry.
    const item = await db.registryItem.findFirst({
      where: {
        id: line.itemId,
        registryId: line.registryId,
        registry: { shopId: shopRecord.id },
      },
      include: { registry: { include: { registrants: true } } },
    });

    if (!item) {
      console.warn(`[attribution] order ${orderId} referenced unknown item ${line.itemId}`);
      continue;
    }

    const registry = item.registry;
    // Decided when the order arrives, not when the line went into the cart:
    // the cart's `_rg_ship` flag is a snapshot, so a line added before the
    // registrant saved their address (or a cart left open for days) would
    // otherwise miss the rewrite. Live-tested 25 Sep 2026, order 7317031420053.
    const shipToRegistrant = line.shipToRegistrant || registry.shipToRegistrant;

    const hiddenUntil =
      settings.hideBuyerUntilEvent && registry.eventDate && registry.eventDate > new Date()
        ? registry.eventDate
        : null;

    try {
      await db.$transaction(async (tx) => {
        // The unique index on (orderId, lineItemId) is what makes a redelivered
        // webhook a no-op. Creating first means we only ever increment when the
        // insert actually happened.
        await tx.purchase.create({
          data: {
            itemId: item.id,
            source: "online",
            orderId,
            lineItemId: line.lineItemId,
            orderName: order.name ?? null,
            qty: line.quantity,
            amount: line.amount,
            currency: order.currency ?? shopRecord.currency,
            buyerName,
            buyerCustomerId,
            buyerMessage: null,
            hiddenUntil,
            shippedToRegistrant: shipToRegistrant,
            isNewCustomer,
          },
        });

        await tx.registryItem.update({
          where: { id: item.id },
          data: { purchasedQty: { increment: line.quantity } },
        });
      });
    } catch (err) {
      if (isUniqueViolation(err)) continue; // already processed
      throw err;
    }

    touched.add(registry.id);

    await logEvent(registry.id, "purchased", {
      itemId: item.id,
      orderId,
      qty: line.quantity,
      amount: line.amount,
      source: "online",
    });

    // Once per order and registry. The Purchase unique index above already
    // skipped this block on any line whose (orderId, lineItemId) was already
    // processed, so a redelivered webhook never re-issues the rewrite. See
    // applyShipToRegistrant's own guardrails (fulfillment status,
    // cross-jurisdiction) for everything else.
    if (shipToRegistrant && !shipped.has(registry.id)) {
      shipped.add(registry.id);
      await shipToRegistrantForOrder(shopDomain, orderId, registry.id).catch((err) => {
        console.error(
          `[ship-to-registrant] order ${orderId} registry ${registry.id}:`,
          (err as Error).message,
        );
      });
    }

    await notifyRegistrant(registry, shopDomain, {
      itemTitle: item.snapshotTitle ?? "an item",
      qty: line.quantity,
      desiredQty: item.desiredQty,
      buyerName,
      hidden: hiddenUntil !== null,
    });
  }

  for (const registryId of touched) {
    await touchRegistry(registryId).catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// Reversal
//
// Refunds and cancellations have to decrement, or the registry tells guests an
// item is bought when the money went back. Same idempotency problem in reverse:
// two refund webhooks for one refund must not decrement twice.
// ---------------------------------------------------------------------------

registerHandler("void-purchases", async ({ shop, orderId, lineItemIds, reason }) => {
  await voidPurchases(shop, orderId, lineItemIds, reason);
});

export async function voidPurchases(
  shopDomain: string,
  orderId: string,
  lineItemIds: string[] | undefined,
  reason: string,
): Promise<void> {
  const purchases = await db.purchase.findMany({
    where: {
      orderId,
      voidedAt: null,
      ...(lineItemIds && lineItemIds.length > 0 ? { lineItemId: { in: lineItemIds } } : {}),
      item: { registry: { shop: { domain: shopDomain } } },
    },
    include: { item: { select: { id: true, registryId: true } } },
  });

  if (purchases.length === 0) return;

  const touched = new Set<string>();

  for (const purchase of purchases) {
    await db.$transaction(async (tx) => {
      const { count } = await tx.purchase.updateMany({
        // Re-checking voidedAt inside the transaction is what stops a
        // concurrent duplicate webhook from decrementing twice.
        where: { id: purchase.id, voidedAt: null },
        data: { voidedAt: new Date() },
      });
      if (count === 0) return;

      const item = await tx.registryItem.findUnique({
        where: { id: purchase.itemId },
        select: { purchasedQty: true },
      });
      if (!item) return;

      await tx.registryItem.update({
        where: { id: purchase.itemId },
        // Never let the counter go negative, whatever order the webhooks arrive in.
        data: { purchasedQty: Math.max(0, item.purchasedQty - purchase.qty) },
      });
    });

    touched.add(purchase.item.registryId);
    await logEvent(purchase.item.registryId, "refunded", {
      itemId: purchase.itemId,
      orderId,
      qty: purchase.qty,
      reason,
    });
  }

  for (const registryId of touched) {
    await touchRegistry(registryId).catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// Registrant notification
// ---------------------------------------------------------------------------

async function notifyRegistrant(
  registry: { id: string; title: string; registrants: { emailEnc: string }[] },
  shopDomain: string,
  gift: {
    itemTitle: string;
    qty: number;
    desiredQty: number;
    buyerName: string | null;
    hidden: boolean;
  },
): Promise<void> {
  const owner = registry.registrants[0];
  if (!owner) return;

  const email = registrantEmail(owner);
  if (!email) return;

  await audit({
    shop: shopDomain,
    actor: "system:notify-registrant",
    action: "registrant_email_decrypted",
    subject: registry.id,
    detail: { purpose: "gift_purchased_notification" },
  });

  const buyerLine = gift.hidden
    ? "We'll tell you who it was after the event."
    : gift.buyerName
      ? `From ${gift.buyerName}.`
      : "The buyer chose not to share their name.";

  await sendEmail("gift-purchased", email, {
    itemTitle: gift.itemTitle,
    qty: gift.qty,
    desiredQty: gift.desiredQty,
    buyerLine,
    url: absoluteProxyUrl(shopDomain, "/apps/registry", "manage", {
      t: mintManageToken(registry.id),
    }),
  });
}

function isUniqueViolation(err: unknown): boolean {
  return (err as { code?: string })?.code === "P2002";
}

// ---------------------------------------------------------------------------
// Ship-to-registrant
//
// Checkout UI extensions are Plus-only and error under accelerated checkout, so
// the address is rewritten AFTER the order exists. See spike doc §2 B1.
//
// The fulfillment-status branch is load-bearing: as of 31 Aug 2026 orderUpdate
// recalculates tax against the new destination for entirely unfulfilled orders,
// but saves the address without recalculating once anything has shipped. Same
// call, two financial outcomes.
// ---------------------------------------------------------------------------

const ORDER_UPDATE_MUTATION = `#graphql
  mutation registroShipToRegistrant($input: OrderInput!) {
    orderUpdate(input: $input) {
      order {
        id
        displayFulfillmentStatus
        totalOutstandingSet { shopMoney { amount currencyCode } }
      }
      userErrors { field message }
    }
  }`;

const ORDER_STATUS_QUERY = `#graphql
  query registroOrderStatus($id: ID!) {
    order(id: $id) {
      id
      displayFulfillmentStatus
      shippingAddress { countryCodeV2 provinceCode }
    }
  }`;

type GraphqlClient = (query: string, options?: { variables?: Record<string, unknown> }) => Promise<Response>;

/**
 * Wires applyShipToRegistrant() into the order-attribution flow.
 *
 * This runs from the background job, not the webhook request, so it has no
 * `admin` client to reuse — the webhook's own client is tied to that HTTP
 * request and doesn't survive the enqueue. `unauthenticated.admin(shop)`
 * mints a fresh one from the stored offline access token, which is the
 * standard way to call the Admin API outside a request/response cycle.
 *
 * Never throws — the caller treats this as best-effort and logs the
 * failure without letting it affect attribution, which must still succeed
 * even if the address rewrite can't.
 */
async function shipToRegistrantForOrder(
  shopDomain: string,
  orderId: string,
  registryId: string,
): Promise<void> {
  const { admin } = await unauthenticated.admin(shopDomain);

  const result = await applyShipToRegistrant(
    (query, options) => admin.graphql(query, options),
    orderId,
    registryId,
  );

  await logEvent(registryId, "ship_to_registrant", {
    orderId,
    applied: result.applied,
    reason: result.reason ?? null,
  });

  if (!result.applied) {
    // Not an error — "already_fulfilled" and "cross_jurisdiction" are the
    // guardrails working as designed. Surfaced via the event log (and from
    // there the admin dashboard) so a merchant can fulfill it by hand
    // rather than the address silently staying wrong.
    console.warn(
      `[ship-to-registrant] order ${orderId} registry ${registryId} not applied: ${result.reason}`,
    );
  }
}

export async function applyShipToRegistrant(
  graphql: GraphqlClient,
  orderId: string,
  registryId: string,
): Promise<{ applied: boolean; reason?: string }> {
  const registry = await db.registry.findUnique({ where: { id: registryId } });
  if (!registry?.shipToRegistrant) return { applied: false, reason: "not_enabled" };

  const address = readShippingAddress(registry);
  if (!address) return { applied: false, reason: "no_address" };

  await audit({
    actor: "system:ship-to-registrant",
    action: "shipping_address_read",
    subject: registryId,
    detail: { orderId, purpose: "rewrite_order_shipping_address" },
  });

  const statusResponse = await graphql(ORDER_STATUS_QUERY, { variables: { id: orderId } });
  const status = (await statusResponse.json()) as {
    data?: { order?: { displayFulfillmentStatus?: string; shippingAddress?: { provinceCode?: string; countryCodeV2?: string } } };
  };

  const order = status.data?.order;
  if (!order) return { applied: false, reason: "order_not_found" };

  if (order.displayFulfillmentStatus !== "UNFULFILLED") {
    // Partially or fully fulfilled: the address would save but tax would not
    // recalculate, silently leaving the merchant short. Flag for a human.
    return { applied: false, reason: "already_fulfilled" };
  }

  // Guardrail until the tax recalculation behaviour is understood in practice:
  // only rewrite within the same country and province/state. Cross-jurisdiction moves are
  // where the money actually changes.
  const input = toMailingAddressInput(address);
  if (
    input.countryCode &&
    order.shippingAddress?.countryCodeV2 &&
    input.countryCode !== order.shippingAddress.countryCodeV2
  ) {
    return { applied: false, reason: "cross_jurisdiction" };
  }
  if (
    input.provinceCode &&
    order.shippingAddress?.provinceCode &&
    input.provinceCode !== order.shippingAddress.provinceCode
  ) {
    return { applied: false, reason: "cross_jurisdiction" };
  }

  const response = await graphql(ORDER_UPDATE_MUTATION, {
    variables: {
      input: {
        id: orderId,
        shippingAddress: input,
        tags: ["registry-ship-to-registrant"],
      },
    },
  });

  const result = (await response.json()) as {
    data?: { orderUpdate?: { userErrors?: { message: string }[] } };
  };

  const errors = result.data?.orderUpdate?.userErrors ?? [];
  if (errors.length > 0) {
    return { applied: false, reason: errors.map((e) => e.message).join("; ") };
  }

  return { applied: true };
}
