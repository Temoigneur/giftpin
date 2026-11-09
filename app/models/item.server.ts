import db from "../db.server";
import { isGiftCategory } from "../shared/gift-categories";
import { fundState, type FundState } from "../shared/contributions";
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

  assertExternalAllowed(registry);

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

/** The merchant's "items from other stores" setting: off, capped, or open. */
function assertExternalAllowed(registry: {
  shop: Parameters<typeof settingsFor>[0] & { domain: string };
  items: { sourceType: string }[];
}) {
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
}

export interface AddLinkedInput {
  registryId: string;
  url: string;
  title: string;
  imageUrl?: string | null;
  price?: string | null;
  currency?: string | null;
  note?: string | null;
  storeMatch?: StoreMatchColumns | null;
}

/**
 * The manage page's paste box, after the registrant has seen (and maybe fixed)
 * the title, photo and price we read from the link. Stored the same way the
 * browser extension stores a product — as the registrant confirmed it — rather
 * than re-fetched by addExternalItem, because the page read is exactly what
 * fails for the big retailers (403s, app shells) and what the registrant just
 * corrected.
 *
 * A repeat link is reported, not silently bumped, same as the extension.
 */
export async function addLinkedItem(input: AddLinkedInput) {
  const registry = await db.registry.findUnique({
    where: { id: input.registryId },
    include: { shop: true, items: true },
  });
  if (!registry) throw new ItemError("Registry not found");

  assertExternalAllowed(registry);

  const title = input.title.trim();
  if (!title) throw new ItemError("Please give the item a name");

  const { url } = canonicalizeUrl(input.url);
  const existing = registry.items.find((i) => i.externalUrl === url);
  if (existing) return { duplicate: true as const, item: existing };

  const item = await addManualItem({
    registryId: registry.id,
    title,
    url,
    imageUrl: input.imageUrl && input.imageUrl.startsWith("https://") ? input.imageUrl : null,
    price: input.price ?? null,
    currency: input.currency ?? registry.shop.currency,
    note: input.note ?? null,
    storeMatch: input.storeMatch ?? null,
  });
  return { duplicate: false as const, item };
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
  /** A store match already found (the paste box looks before adding), so the job doesn't need to. */
  storeMatch?: StoreMatchColumns | null;
}

/** RegistryItem's store-match columns — see app/lib/store-match.server.ts. */
export interface StoreMatchColumns {
  storeMatchStatus: string;
  storeMatchProductGid: string | null;
  storeMatchVariantGid: string | null;
  storeMatchTitle: string;
  storeMatchHandle: string | null;
}

/**
 * An item the registrant adds by name from the manage page (the ideas guide's
 * experiences: a cooking class, a spa day), bought somewhere else. Counts as
 * an outside item, so the store's "items from other stores" setting (off or
 * capped) applies just as it does to a pasted link.
 */
export async function addNamedItem(input: AddManualInput) {
  const registry = await db.registry.findUnique({
    where: { id: input.registryId },
    include: { shop: true, items: true },
  });
  if (!registry) throw new ItemError("Registry not found");
  assertExternalAllowed(registry);
  return addManualItem(input);
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
        ...(input.storeMatch ?? {}),
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

// ---------------------------------------------------------------------------
// Group gifts and cash funds (Pro) — see SPIKE-C.md
//
// Guests chip in with gift cards from THIS store, so a group gift only makes
// sense on the store's own products: store credit can't buy an Amazon item.
// Everything else (honeymoon, house deposit, "something from elsewhere") is a
// fund. Pro gating is the caller's job (router.server.ts), since it needs the
// shop row.
// ---------------------------------------------------------------------------

export const MAX_FUND_GOAL = 10_000_000;

/**
 * Parses a goal typed by a registrant. Null when it isn't a usable amount.
 * Accepts "1500", "1,500", "1 500", "1.500,00", "1,500.50" and "¥150,000":
 * the last separator is the decimal point only when it is followed by one or
 * two digits (or the other separator comes before it); otherwise separators
 * are thousands marks. The old version stripped everything but digits and dots,
 * so "1,500" worked but anything over 100,000 (a normal yen goal) was refused.
 */
export function parseFundGoal(raw: unknown): string | null {
  const text = String(raw ?? "").replace(/[^0-9.,]/g, "");
  if (!text) return null;
  const lastDot = text.lastIndexOf(".");
  const lastComma = text.lastIndexOf(",");
  const lastSep = Math.max(lastDot, lastComma);
  let normalized = text.replace(/[.,]/g, "");
  if (lastSep >= 0) {
    const decimals = text.slice(lastSep + 1);
    const otherSepBefore = text.slice(0, lastSep).includes(lastDot > lastComma ? "," : ".");
    const sameSepRepeated = text.slice(0, lastSep).includes(text[lastSep]);
    if (decimals.length > 0 && decimals.length <= 2 && !sameSepRepeated) {
      normalized = `${text.slice(0, lastSep).replace(/[.,]/g, "")}.${decimals}`;
    } else if (otherSepBefore && decimals.length === 0) {
      normalized = text.replace(/[.,]/g, "");
    }
  }
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 1 || value > MAX_FUND_GOAL) return null;
  return value.toFixed(2);
}

export interface AddFundInput {
  registryId: string;
  title: string;
  goal: string;
  note?: string | null;
  currency?: string | null;
}

export async function addFundItem(input: AddFundInput) {
  const title = input.title.trim().slice(0, 300);
  if (!title) throw new ItemError("Give your fund a name");

  const item = await db.registryItem.create({
    data: {
      registryId: input.registryId,
      sourceType: "fund",
      snapshotTitle: title,
      snapshotCurrency: input.currency ?? null,
      fundGoal: input.goal,
      desiredQty: 1,
      note: input.note?.trim().slice(0, 500) || null,
      // Funds sit with the store's own items, above anything from elsewhere.
      priority: 1,
    },
  });

  await touchRegistry(input.registryId);
  await logEvent(input.registryId, "item_added", { sourceType: "fund" });
  return item;
}

/**
 * Turns group gifting on (goal) or off (null) for one item. A fund can't be
 * switched off, only re-targeted: without a goal it would be an item nobody
 * can buy.
 */
export async function setItemFundGoal(itemId: string, registryId: string, goal: string | null) {
  const item = await db.registryItem.findFirst({ where: { id: itemId, registryId } });
  if (!item) throw new ItemError("That item is no longer on this registry");
  if (item.sourceType !== "internal" && item.sourceType !== "fund") {
    throw new ItemError("Guests can only chip in toward this store's own products. Add a fund instead.");
  }
  if (item.sourceType === "fund" && goal === null) {
    throw new ItemError("A fund needs a goal. Remove it instead if you no longer want it.");
  }

  const updated = await db.registryItem.update({
    where: { id: itemId, registryId },
    data: { fundGoal: goal },
  });
  await touchRegistry(registryId);
  return updated;
}

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
  /**
   * Group gift or cash fund progress (Pro, SPIKE-C.md). Null when guests
   * can't chip in toward this item.
   */
  fund?: FundState | null;
  /** A cash fund: no product, contributions only. */
  isFund?: boolean;
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
  const fund = fundState(item.fundGoal, item.fundedAmount);

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
    // Bought outright OR fully funded. Either one means "don't buy this".
    fulfilled: item.purchasedQty >= item.desiredQty || fund?.complete === true,
    fund,
    isFund: item.sourceType === "fund",
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
