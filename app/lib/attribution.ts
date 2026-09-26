import { signToken, verifyToken } from "./crypto.server";

/**
 * Cart attribution.
 *
 * When a guest adds a registry item to the cart, we attach ONE line item
 * property — `_rg` — carrying a signed token that identifies the registry and
 * the item. On orders/create we read it back.
 *
 * Why one signed property rather than two plain ones:
 *
 *  - A guest can edit cart properties. Two plain IDs mean anyone can credit any
 *    registry with any purchase, which corrupts the merchant's ROI number —
 *    the number the whole app is sold on. The HMAC makes that forgery useless.
 *  - One key keeps the cart clean. The leading underscore asks the theme to
 *    hide it — note that this is a CONVENTION, not a platform guarantee:
 *    private line item properties are still exposed in Liquid's
 *    `line_item.properties` and in the Ajax API, and hiding them is the
 *    theme's job. Dawn and most modern themes filter `_`-prefixed keys, but a
 *    theme that doesn't will render the token in the cart. Row 15 of SPIKE-A.md
 *    checks this per theme. (Double-underscore CART attributes are genuinely
 *    hidden, but they attach to the cart rather than the line — which is the
 *    one thing that has to survive Shop Pay, so they can't be used here.)
 *
 * The token deliberately has no expiry. A cart can sit for weeks, and a stale
 * token that resolves to a deleted registry simply finds nothing.
 *
 * VERIFY BEFORE BUILDING ON THIS: run the 14-row matrix in
 * spike-findings-and-protocols.md §1 against a dev store. Rows 1–7 (standard
 * checkout, Shop Pay both entry paths, Apple Pay, Google Pay, PayPal, Shop app)
 * are the gate. If any fails, work the fallback ladder before writing more code.
 */

export const ATTRIBUTION_PROPERTY = "_rg";

/** Visible cart/checkout line property naming who a gift ships to. */
export const SHIP_TO_LABEL = "Gift ships to";
/**
 * Visible on every registry cart line, in the cart and at checkout, so a
 * guest who opened the wrong same-named registry sees whose gift it is (and
 * the date) before paying.
 */
export const GIFT_FOR_LABEL = "Gift for";

/**
 * The visible "Gift ships to" value, including how to undo it. Shared with the
 * registry page, which rewrites cart lines when the guest unticks the box.
 */
export function shipToValue(names: string): string {
  return `${names || "The registrant"}, at their address (added after you order). Want it sent to you instead? Return to their registry page and untick the shipping box above the gift list. Your cart will update automatically.`;
}
export function giftForValue(names: string, eventLabel: string, eventDate: Date | null): string {
  const date = eventDate
    ? new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeZone: "UTC" }).format(eventDate)
    : null;
  return [names || null, eventLabel || null, date].filter(Boolean).join(" · ");
}
const PURPOSE = "cart";

export interface AttributionPayload {
  /** Registry id */
  r: string;
  /** Registry item id */
  i: string;
}

export function signAttribution(registryId: string, itemId: string): string {
  return signToken({ p: PURPOSE, r: registryId, i: itemId });
}

export function verifyAttribution(token: string | null | undefined): AttributionPayload | null {
  const payload = verifyToken<{ p: string; r?: unknown; i?: unknown }>(token, PURPOSE);
  if (!payload) return null;
  if (typeof payload.r !== "string" || typeof payload.i !== "string") return null;
  return { r: payload.r, i: payload.i };
}

// ---------------------------------------------------------------------------
// Reading webhook payloads
// ---------------------------------------------------------------------------

export interface OrderLineItem {
  id: number | string;
  quantity: number;
  price?: string;
  properties?: { name: string; value: string }[] | Record<string, string> | null;
  title?: string;
  variant_id?: number | string | null;
  /** True on gift card lines. Used to tell a chip-in from a purchase (SPIKE-C.md). */
  gift_card?: boolean;
}

/** Line item properties arrive as an array on REST webhooks, an object elsewhere. */
export function readLineProperty(line: OrderLineItem, name: string): string | null {
  const properties = line.properties;
  if (!properties) return null;

  if (Array.isArray(properties)) {
    const found = properties.find((p) => p?.name === name);
    return found && typeof found.value === "string" ? found.value : null;
  }

  const value = (properties as Record<string, unknown>)[name];
  return typeof value === "string" ? value : null;
}

export interface AttributedLine {
  lineItemId: string;
  registryId: string;
  itemId: string;
  quantity: number;
  amount: string | null;
  title: string | null;
  shipToRegistrant: boolean;
  /** Numeric variant id of the line, when the payload has one. */
  variantId: string | null;
  giftCard: boolean;
}

/** Pulls every registry-attributed line out of an order webhook payload. */
export function attributedLines(lineItems: OrderLineItem[] | undefined | null): AttributedLine[] {
  if (!Array.isArray(lineItems)) return [];

  const out: AttributedLine[] = [];

  for (const line of lineItems) {
    const token = readLineProperty(line, ATTRIBUTION_PROPERTY);
    if (!token) continue;

    const payload = verifyAttribution(token);
    // A line whose token doesn't verify is either a forgery or a key rotation.
    // Either way it is not attribution, and silently skipping is correct.
    if (!payload) continue;

    const quantity = Number(line.quantity);
    if (!Number.isFinite(quantity) || quantity < 1) continue;

    const unitPrice = line.price ? Number.parseFloat(line.price) : null;

    out.push({
      lineItemId: String(line.id),
      registryId: payload.r,
      itemId: payload.i,
      quantity: Math.floor(quantity),
      amount:
        unitPrice !== null && Number.isFinite(unitPrice)
          ? (unitPrice * Math.floor(quantity)).toFixed(2)
          : null,
      title: line.title ?? null,
      shipToRegistrant: readLineProperty(line, "_rg_ship") === "1",
      variantId: line.variant_id === null || line.variant_id === undefined ? null : String(line.variant_id),
      giftCard: line.gift_card === true,
    });
  }

  return out;
}

/**
 * Builds the `/cart/add.js` body the storefront uses.
 * Kept here so the theme extension and the guest page can never drift apart.
 */
export function cartAddPayload(
  variantId: string,
  quantity: number,
  registryId: string,
  itemId: string,
  shipToRegistrant = false,
  shipToNames = "",
  giftFor = "",
): { items: { id: string; quantity: number; properties: Record<string, string> }[] } {
  const properties: Record<string, string> = {
    [ATTRIBUTION_PROPERTY]: signAttribution(registryId, itemId),
  };
  if (giftFor) properties[GIFT_FOR_LABEL] = giftFor;
  if (shipToRegistrant) {
    properties["_rg_ship"] = "1";
    // Deliberately visible (no leading underscore): the guest sees it under
    // the item in the cart and at checkout, so a box ticked without reading
    // isn't a silent redirect. Names only, never the address.
    properties[SHIP_TO_LABEL] = shipToValue(shipToNames);
  }

  return { items: [{ id: variantId, quantity, properties }] };
}

/**
 * The `/cart/add.js` body for a chip-in toward a group gift or fund: one gift
 * card line, the same signed `_rg` token as any registry line, and Shopify's
 * recipient properties only when the couple opted in to receiving the cards
 * themselves. Never `_rg_ship`: a gift card has nothing to ship. SPIKE-C.md.
 */
export function contributionCartPayload(
  variantId: string,
  registryId: string,
  itemId: string,
  recipientProperties: Record<string, string> | null,
): { items: { id: string; quantity: number; properties: Record<string, string> }[] } {
  return {
    items: [
      {
        id: variantId,
        quantity: 1,
        properties: {
          [ATTRIBUTION_PROPERTY]: signAttribution(registryId, itemId),
          ...(recipientProperties ?? {}),
        },
      },
    ],
  };
}
