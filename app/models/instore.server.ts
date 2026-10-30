import db from "../db.server";
import { blindIndex } from "../lib/crypto.server";
import { absoluteProxyUrl } from "../lib/proxy.server";
import { cartAddPayload } from "../lib/attribution";
import { sendEmail } from "../lib/email.server";
import { normalizeCountry } from "../shared/retailers";
import { EVENT_TYPES } from "../shared/settings";
import { createRegistry, logEvent, mintManageToken, registryWithItems } from "./registry.server";
import { queueFlowTrigger } from "./flow.server";
import { toDisplayItem, type DisplayItem } from "./item.server";

/**
 * In-store registry mode (Pro): shop staff finding or creating a registry
 * for a customer standing at the counter, from Shopify POS
 * (extensions/pos-registry, via app/routes/api.pos.tsx) or the app admin
 * (app/routes/app.in-store.tsx).
 *
 * Staff are the merchant, so they see what the admin Registries page already
 * shows (names, occasion, progress) and can find password-protected and
 * unlisted registries. They never see a registrant's email address: search by
 * email goes through the same blind index as "email me my link".
 */

/** The app proxy's default mount; see shopify.app.toml [app_proxy]. */
const PROXY_PREFIX = "/apps/registry";
const SEARCH_LIMIT = 20;

export type StaffSearch =
  | { kind: "empty" }
  | { kind: "email"; email: string }
  | { kind: "text"; text: string };

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 254;
}

/**
 * What the staff member typed. A pasted registry link is reduced to its slug,
 * so "https://shop.com/apps/registry/r/abc123" finds registry abc123.
 */
export function parseStaffQuery(raw: string | null | undefined): StaffSearch {
  const value = String(raw ?? "").trim().slice(0, 200);
  if (!value) return { kind: "empty" };
  if (isEmail(value)) return { kind: "email", email: value.toLowerCase() };
  const link = value.match(/\/r\/([A-Za-z0-9_-]+)/);
  return { kind: "text", text: link ? link[1] : value };
}

export interface StaffRegistrySummary {
  id: string;
  slug: string;
  title: string;
  names: string;
  eventType: string;
  eventDate: string | null;
  itemsLeft: number;
  wanted: number;
  bought: number;
}

export async function searchRegistriesForStaff(shopId: string, raw: string | null | undefined) {
  const query = parseStaffQuery(raw);
  if (query.kind === "empty") return [];

  const where =
    query.kind === "email"
      ? { registrants: { some: { emailHash: blindIndex(query.email) } } }
      : {
          OR: [
            { slug: query.text },
            { title: { contains: query.text, mode: "insensitive" as const } },
            { registrants: { some: { name: { contains: query.text, mode: "insensitive" as const } } } },
          ],
        };

  const rows = await db.registry.findMany({
    where: { shopId, status: "active", ...where },
    include: {
      registrants: { select: { name: true } },
      items: { select: { desiredQty: true, purchasedQty: true } },
    },
    // Upcoming events first; a customer at the counter is almost always
    // shopping for something soon.
    orderBy: [{ eventDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    take: SEARCH_LIMIT,
  });

  return rows.map((registry): StaffRegistrySummary => {
    const wanted = registry.items.reduce((sum, i) => sum + i.desiredQty, 0);
    const bought = registry.items.reduce((sum, i) => sum + Math.min(i.purchasedQty, i.desiredQty), 0);
    return {
      id: registry.id,
      slug: registry.slug,
      title: registry.title,
      names: registry.registrants.map((r) => r.name).join(" & "),
      eventType: registry.eventType,
      eventDate: registry.eventDate ? registry.eventDate.toISOString().slice(0, 10) : null,
      itemsLeft: registry.items.filter((i) => i.purchasedQty < i.desiredQty).length,
      wanted,
      bought,
    };
  });
}

export interface StaffItem {
  id: string;
  title: string;
  imageUrl: string | null;
  price: number;
  currency: string | null;
  desiredQty: number;
  purchasedQty: number;
  /** Held by a guest who clicked through to buy elsewhere. Counts as taken. */
  claimedQty: number;
  remainingQty: number;
  /** True for the merchant's own products: POS can ring these up. */
  sellable: boolean;
  /** Numeric ProductVariant id, for POS `cart.addLineItem`. */
  variantId: number | null;
  /** Where an item from another store lives, for staff to mention to the customer. */
  externalDomain: string | null;
}

export function toStaffItem(item: DisplayItem): StaffItem {
  const numeric = item.variantGid ? Number(item.variantGid.split("/").pop()) : NaN;
  const variantId = Number.isSafeInteger(numeric) && numeric > 0 ? numeric : null;
  return {
    id: item.id,
    title: item.title,
    imageUrl: item.imageUrl,
    price: item.price,
    currency: item.currency,
    desiredQty: item.desiredQty,
    purchasedQty: item.purchasedQty,
    claimedQty: item.claimedQty,
    // toDisplayItem already subtracts live holds, so a held item reads as
    // taken here too (CLAUDE.md hard rule #5).
    remainingQty: item.remainingQty,
    sellable: item.sourceType === "internal" && variantId !== null && item.remainingQty > 0,
    variantId,
    externalDomain: item.externalDomain,
  };
}

export async function registryForStaff(shopId: string, registryId: string) {
  const registry = await db.registry.findFirst({
    where: { id: registryId, shopId, status: "active" },
    ...registryWithItems,
  });
  if (!registry) return null;

  const items = registry.items.map((item) => toStaffItem(toDisplayItem(item)));
  // Still-wanted items first, then the rest, so staff see what can be bought.
  items.sort((a, b) => Number(b.remainingQty > 0) - Number(a.remainingQty > 0));

  return {
    id: registry.id,
    slug: registry.slug,
    title: registry.title,
    names: registry.registrants.map((r) => r.name).join(" & "),
    eventType: registry.eventType,
    eventDate: registry.eventDate ? registry.eventDate.toISOString().slice(0, 10) : null,
    message: registry.message,
    publicUrl: absoluteProxyUrl(registry.shop.domain, PROXY_PREFIX, `r/${registry.slug}`),
    items,
  };
}

export type StaffRegistryDetail = NonNullable<Awaited<ReturnType<typeof registryForStaff>>>;

/**
 * The line item properties POS attaches when staff ring up a registry item:
 * the same signed `_rg` token the online store uses (app/lib/attribution.ts),
 * minted by the same function. No `_rg_ship`: an in-store purchase leaves with
 * the customer.
 *
 * NOT YET VERIFIED LIVE (CLAUDE.md hard rule #1): that a POS order's
 * orders/create webhook carries line item properties the way an online
 * order's does. Until a real POS sale confirms it, treat POS attribution as
 * unproven. See SPIKE-A.md.
 */
export async function posLineProperties(shopId: string, itemId: string) {
  const item = await db.registryItem.findFirst({
    where: { id: itemId, sourceType: "internal", registry: { shopId, status: "active" } },
    select: { id: true, registryId: true, variantGid: true },
  });
  if (!item?.variantGid) return null;

  const variantId = item.variantGid.split("/").pop() ?? "";
  const [line] = cartAddPayload(variantId, 1, item.registryId, item.id, false).items;
  return { variantId: Number(variantId), properties: line.properties };
}

export interface StaffCreateInput {
  eventType?: unknown;
  title?: unknown;
  eventDate?: unknown;
  registrantName?: unknown;
  registrantEmail?: unknown;
  country?: unknown;
}

export type StaffCreateResult =
  | { ok: true; registryId: string; slug: string; title: string; publicUrl: string }
  | { ok: false; error: string };

/**
 * Creates a registry on the customer's behalf and emails them their manage
 * link, exactly as if they had signed up online. Staff never get the manage
 * link themselves: it is the registrant's credential.
 */
export async function createRegistryInStore(
  shop: { id: string; domain: string },
  input: StaffCreateInput,
  via: "pos" | "admin",
): Promise<StaffCreateResult> {
  const title = String(input.title ?? "").trim();
  const registrantName = String(input.registrantName ?? "").trim();
  const email = String(input.registrantEmail ?? "").trim();
  const eventDate = String(input.eventDate ?? "").trim();
  const eventType = String(input.eventType ?? "");

  if (!title || !registrantName || !isEmail(email)) {
    return { ok: false, error: "Enter the customer's name, a registry name and a valid email address." };
  }
  if (eventDate && !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    return { ok: false, error: "Enter the event date as YYYY-MM-DD." };
  }

  const registry = await createRegistry({
    shopId: shop.id,
    eventType: EVENT_TYPES.some((t) => t.value === eventType) ? eventType : "other",
    eventDate: eventDate ? new Date(`${eventDate}T00:00:00Z`) : null,
    title,
    registrantName,
    registrantEmail: email,
    country: input.country ? normalizeCountry(input.country) : null,
  });

  await logEvent(registry.id, "created_in_store", { via });
  await queueFlowTrigger(registry.id, "registryCreated");

  await sendEmail("registry-link", email, {
    registryTitle: registry.title,
    url: absoluteProxyUrl(shop.domain, PROXY_PREFIX, "manage", { t: mintManageToken(registry.id) }),
  });

  return {
    ok: true,
    registryId: registry.id,
    slug: registry.slug,
    title: registry.title,
    publicUrl: absoluteProxyUrl(shop.domain, PROXY_PREFIX, `r/${registry.slug}`),
  };
}
