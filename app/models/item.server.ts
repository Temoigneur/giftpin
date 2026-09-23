import db from "../db.server";
import { isGiftCategory } from "../shared/gift-categories";
import { touchRegistry, logEvent, itemUnitPrice, isUniqueViolation } from "./registry.server";
import { settingsFor } from "./shop.server";
import { enqueue } from "../lib/queue.server";
import { resolveUrl } from "../lib/resolver/index.server";
import { canonicalizeUrl } from "../lib/resolver/canonical";
import type { ItemSourceType, Prisma } from "@prisma/client";

/**
 * Registry items.
 *
 * Three shapes, and the differences matter all the way through the product:
 *
 *   internal    — the merchant's own catalog. Buyable in one tap, attributable
 *                 through the order webhook, live stock. The default, and
 *                 always sorted above everything else.
 *   shopify_ext — another Shopify store. Live price and stock, but an outbound
 *                 link: we cannot take money on another merchant's behalf.
 *   web/manual  — a snapshot from page metadata, or typed by hand. Outbound
 *                 link, no attribution, soft-claim to prevent duplicate gifts.
 */

export class ItemError extends Error {}

// ---------------------------------------------------------------------------
// Internal items — the merchant's own products
// ---------------------------------------------------------------------------

export interface AddInternalInput {
  registryId: string;
  productGid: string;
  variantGid: string;
  title: string;
  imageUrl?: string | null;
  price?: string | null;
  currency?: string | null;
  desiredQty?: number;
  note?: string | null;
}

export interface AddItemResult<T> {
  item: T;
  /**
   * True when this variant/URL was already on the registry. The caller no
   * longer bumps the quantity itself on a duplicate — see the note below —
   * it's up to the caller (addFromStoreAction / addExternalAction) to decide
   * whether to prompt the registrant for an explicit total.
   */
  duplicate: boolean;
}

export async function addInternalItem(
  input: AddInternalInput,
): Promise<AddItemResult<Awaited<ReturnType<typeof db.registryItem.create>>>> {
  const existing = await db.registryItem.findFirst({
    where: { registryId: input.registryId, variantGid: input.variantGid },
  });

  // Used to silently bump desiredQty here. That hid a real decision (the
  // event host actually wants two of these) behind the same click as an
  // accidental double-add, with no way to tell the difference or say how
  // many they actually want. Now a duplicate is reported back as-is, with no
  // write — the caller prompts the registrant for an explicit total instead
  // (see addFromStoreAction's confirmQty branch in app/proxy/router.server.ts).
  if (existing) {
    return { item: existing, duplicate: true };
  }

  // The findFirst above is just the fast path for the common case. The
  // `@@unique([registryId, variantGid])` constraint in schema.prisma (added
  // 19 Sep 2026) is what actually closes the race: two near-simultaneous
  // first-time adds can both pass the check above before either `create`
  // lands, but only one `create` can win at the database. The loser catches
  // the conflict here and reports the winner's row back as a duplicate,
  // exactly like the non-race path above — same client behavior either way.
  try {
    const item = await db.registryItem.create({
      data: {
        registryId: input.registryId,
        sourceType: "internal",
        productGid: input.productGid,
        variantGid: input.variantGid,
        snapshotTitle: input.title.slice(0, 300),
        snapshotImageUrl: input.imageUrl ?? null,
        snapshotPrice: input.price ?? null,
        snapshotCurrency: input.currency ?? null,
        desiredQty: clampQty(input.desiredQty ?? 1),
        note: input.note?.slice(0, 500) ?? null,
        // Internal items sort above external ones by default. The merchant's
        // catalog is the anchor of the registry, not one option among many.
        priority: 100,
      },
    });

    await touchRegistry(input.registryId);
    await logEvent(input.registryId, "item_added", { sourceType: "internal", variantGid: input.variantGid });
    return { item, duplicate: false };
  } catch (err) {
    if (isUniqueViolation(err)) {
      const winner = await db.registryItem.findFirst({
        where: { registryId: input.registryId, variantGid: input.variantGid },
      });
      if (winner) return { item: winner, duplicate: true };
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// External items — the URL paste path
// ---------------------------------------------------------------------------

export interface AddExternalInput {
  registryId: string;
  url: string;
  desiredQty?: number;
  note?: string | null;
}

/**
 * Adds a reference to a product on another site.
 *
 * The registrant pastes a link; we store the link plus whatever the page's own
 * published metadata says about it. Nothing is imported into the merchant's
 * catalog, and no affiliate parameters are added on the way out.
 */
export async function addExternalItem(input: AddExternalInput) {
  const registry = await db.registry.findUnique({
    where: { id: input.registryId },
    include: { shop: true, items: true },
  });
  if (!registry) throw new ItemError("Registry not found");

  const settings = settingsFor(registry.shop);

  if (settings.externalItems === "off") {
    throw new ItemError("This store only accepts items from its own collection");
  }

  if (settings.externalItems === "capped") {
    const external = registry.items.filter((i) => i.sourceType !== "internal").length;
    const projected = (external + 1) / (registry.items.length + 1);
    if (projected > settings.externalItemsCapPercent / 100) {
      throw new ItemError(
        `You can add a few more items from ${registry.shop.domain.replace(".myshopify.com", "")} first — this registry is mostly items from elsewhere.`,
      );
    }
  }

  const { url, domain } = canonicalizeUrl(input.url);

  const duplicate = await db.registryItem.findFirst({
    where: { registryId: input.registryId, externalUrl: url },
  });
  if (duplicate) {
    return incrementExternalQty(duplicate.id, input.registryId, input.desiredQty ?? 1);
  }

  const resolved = await resolveUrl(url);

  const source = await db.externalSource.findUnique({
    where: { id: resolved.externalSourceId },
  });

  // As in addInternalItem above: the findFirst is the fast path, and the
  // `@@unique([registryId, externalUrl])` constraint is what actually closes
  // the race. Here the loser falls back to the same increment path as an
  // ordinary duplicate, rather than reporting duplicate:true — this function
  // has always auto-incremented on a repeat URL (unlike addInternalItem,
  // which stopped doing that 19 Sep 2026), and a rare race is not a reason
  // to make that one case behave differently from every other repeat add.
  try {
    const item = await db.registryItem.create({
      data: {
        registryId: input.registryId,
        sourceType: source?.resolver === "shopify_public" ? "shopify_ext" : "web",
        externalSourceId: resolved.externalSourceId,
        externalUrl: url,
        // Provisional, so the item renders immediately rather than showing a
        // spinner while the resolver job runs.
        snapshotTitle: source?.title ?? prettyDomain(domain),
        snapshotImageUrl: source?.imageUrl ?? null,
        snapshotPrice: source?.price ?? null,
        snapshotCurrency: source?.currency ?? null,
        desiredQty: clampQty(input.desiredQty ?? 1),
        note: input.note?.slice(0, 500) ?? null,
        priority: 0,
      },
    });

    await touchRegistry(input.registryId);
    await logEvent(input.registryId, "item_added", { sourceType: "external", domain });
    // If the resolver has already read the page this can match straight away;
    // otherwise the resolver job queues the match when it finishes.
    await enqueue("match-store-item", { itemId: item.id });
    return item;
  } catch (err) {
    if (isUniqueViolation(err)) {
      const winner = await db.registryItem.findFirst({
        where: { registryId: input.registryId, externalUrl: url },
      });
      if (winner) return incrementExternalQty(winner.id, input.registryId, input.desiredQty ?? 1);
    }
    throw err;
  }
}

async function incrementExternalQty(itemId: string, registryId: string, addQty: number) {
  // `increment` compiles to an atomic `SET x = x + n` in the generated SQL,
  // so this is race-safe on its own — no separate read-then-write window to
  // worry about here, unlike the create path above.
  const item = await db.registryItem.update({
    where: { id: itemId },
    data: { desiredQty: { increment: clampQty(addQty) } },
  });
  await touchRegistry(registryId);
  return item;
}

export interface AddManualInput {
  registryId: string;
  title: string;
  url?: string | null;
  imageUrl?: string | null;
  price?: string | null;
  currency?: string | null;
  desiredQty?: number;
  note?: string | null;
}

/** The escape hatch when a URL won't resolve. Never a dead end for the registrant. */
export async function addManualItem(input: AddManualInput) {
  const url = input.url ? canonicalizeUrl(input.url).url : null;

  // This function never had a dedup check — nobody used to fat-finger the
  // same manual entry twice, so it wasn't worth one. The 19 Sep 2026
  // `@@unique([registryId, externalUrl])` constraint (added for the
  // addInternalItem/addExternalItem race, see above) now also covers manual
  // items that carry a URL, which means a manual entry that happens to
  // duplicate an existing item's link can hit that constraint here. Handle
  // it the same way addExternalItem handles a repeat URL — bump the
  // existing row — rather than letting a Prisma error reach the registrant.
  try {
    const item = await db.registryItem.create({
      data: {
        registryId: input.registryId,
        sourceType: "manual",
        externalUrl: url,
        snapshotTitle: input.title.slice(0, 300),
        snapshotImageUrl: input.imageUrl ?? null,
        snapshotPrice: input.price ?? null,
        snapshotCurrency: input.currency ?? null,
        desiredQty: clampQty(input.desiredQty ?? 1),
        note: input.note?.slice(0, 500) ?? null,
        priority: 0,
      },
    });

    await touchRegistry(input.registryId);
    await logEvent(input.registryId, "item_added", { sourceType: "manual" });
    await enqueue("match-store-item", { itemId: item.id });
    return item;
  } catch (err) {
    if (url && isUniqueViolation(err)) {
      const existing = await db.registryItem.findFirst({
        where: { registryId: input.registryId, externalUrl: url },
      });
      if (existing) return incrementExternalQty(existing.id, input.registryId, input.desiredQty ?? 1);
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Updates
// ---------------------------------------------------------------------------

/**
 * A narrow, explicit patch type rather than Prisma's UpdateInput. Prisma's
 * version would also accept `{ purchasedQty: ... }`, and purchased counts must
 * only ever move through the attribution and claim paths where they can be
 * reversed — never from a registrant editing their own list.
 */
export interface ItemPatch {
  desiredQty?: number;
  note?: string | null;
  priority?: number;
  /** A GIFT_CATEGORIES key, or null to clear. Unknown keys are ignored. */
  category?: string | null;
}

export async function updateItem(itemId: string, registryId: string, data: ItemPatch) {
  const patch: ItemPatch = {};
  if (data.desiredQty !== undefined) patch.desiredQty = clampQty(data.desiredQty);
  if (data.note !== undefined) patch.note = data.note?.slice(0, 500) ?? null;
  if (data.priority !== undefined) patch.priority = data.priority;
  if (data.category === null) patch.category = null;
  else if (data.category !== undefined && isGiftCategory(data.category)) patch.category = data.category;

  const item = await db.registryItem.update({
    where: { id: itemId, registryId },
    data: patch,
  });
  await touchRegistry(registryId);
  return item;
}

export async function removeItem(itemId: string, registryId: string) {
  const item = await db.registryItem.findFirst({
    where: { id: itemId, registryId },
    include: { purchases: { where: { voidedAt: null } } },
  });
  if (!item) throw new ItemError("Item not found");

  // Deleting an item that has been bought would erase a real purchase from the
  // merchant's ROI numbers and from the registrant's thank-you list.
  if (item.purchases.length > 0) {
    throw new ItemError(
      "Someone has already bought this. You can lower the quantity, but removing it would lose the record of who gave it.",
    );
  }

  await db.registryItem.delete({ where: { id: itemId } });
  await touchRegistry(registryId);
  await logEvent(registryId, "item_removed", { itemId });
}

// ---------------------------------------------------------------------------
// Display helpers — single source of truth for how an item renders
// ---------------------------------------------------------------------------

export interface DisplayItem {
  id: string;
  sourceType: ItemSourceType;
  title: string;
  imageUrl: string | null;
  price: number;
  currency: string | null;
  desiredQty: number;
  purchasedQty: number;
  claimedQty: number;
  remainingQty: number;
  note: string | null;
  /** GIFT_CATEGORIES key, or null when the registrant hasn't picked one. */
  category: string | null;
  /**
   * A similar product in the hosting store. "suggested" is for the registrant
   * only; guests only ever get "kept".
   */
  storeMatch: {
    status: "suggested" | "kept";
    /** "product": a similar product (title + handle). "search": a kind of product the store sells (title is the search word). */
    kind: "product" | "search";
    title: string;
    handle: string | null;
  } | null;
  /** Internal items only — what we add to the cart. */
  variantGid: string | null;
  /** Everything else — where the guest goes to buy it. */
  externalUrl: string | null;
  externalDomain: string | null;
  isExternal: boolean;
  /** True when the price is a snapshot rather than live. */
  isStale: boolean;
  availability: string;
  fulfilled: boolean;
}

type ItemForDisplay = Prisma.RegistryItemGetPayload<{
  include: { externalSource: true; claims: true };
}>;

export function toDisplayItem(item: ItemForDisplay, now = new Date()): DisplayItem {
  const source = item.externalSource;
  const isExternal = item.sourceType !== "internal";

  const activeClaims = (item.claims ?? []).filter(
    (c) => c.releasedAt === null && c.expiresAt > now,
  );
  const claimedQty = activeClaims.reduce((sum, c) => sum + c.qty, 0);

  const remaining = Math.max(0, item.desiredQty - item.purchasedQty - claimedQty);

  return {
    id: item.id,
    sourceType: item.sourceType,
    title: source?.title ?? item.snapshotTitle ?? "Untitled item",
    imageUrl: source?.imageUrl ?? item.snapshotImageUrl ?? null,
    price: itemUnitPrice(item),
    currency: source?.currency ?? item.snapshotCurrency ?? null,
    desiredQty: item.desiredQty,
    purchasedQty: item.purchasedQty,
    claimedQty,
    remainingQty: remaining,
    note: item.note,
    category: item.category && isGiftCategory(item.category) ? item.category : null,
    storeMatch:
      (item.storeMatchStatus === "suggested" || item.storeMatchStatus === "kept") &&
      item.storeMatchTitle &&
      item.sourceType !== "internal"
        ? {
            status: item.storeMatchStatus,
            kind: item.storeMatchProductGid && item.storeMatchHandle ? "product" : "search",
            title: item.storeMatchTitle,
            handle: item.storeMatchHandle,
          }
        : null,
    variantGid: item.variantGid,
    externalUrl: item.externalUrl,
    externalDomain: item.externalUrl ? safeDomain(item.externalUrl) : null,
    isExternal,
    // shopify_ext items refresh daily and carry live availability; a metadata
    // snapshot is only ever as good as the last weekly fetch.
    isStale: item.sourceType === "web" || item.sourceType === "manual",
    availability: source?.availability ?? "unknown",
    fulfilled: item.purchasedQty >= item.desiredQty,
  };
}

function clampQty(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(99, Math.max(1, Math.floor(value)));
}

function safeDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function prettyDomain(domain: string): string {
  const base = domain.replace(/^www\./, "").split(".")[0];
  return `Item from ${base.charAt(0).toUpperCase()}${base.slice(1)}`;
}
