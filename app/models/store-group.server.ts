import crypto from "node:crypto";
import db from "../db.server";
import { sha256 } from "../lib/crypto.server";
import { audit } from "../lib/audit.server";
import { isPro } from "./shop.server";

/**
 * Linked stores (multi-store registries).
 *
 * A merchant with several Shopify stores, each with Giftpin installed, links
 * them into one group. Then:
 *
 *   - every store in the group serves every registry homed in the group
 *     (guest page at /apps/registry/g/<registry id>, manage page as usual),
 *   - a registry can hold products from any store in the group
 *     (RegistryItem.sourceShopId), and
 *   - each product is bought on the store that sells it, where the usual `_rg`
 *     line property credits the registry (see attributeOrder).
 *
 * A registry still has one home shop (Registry.shopId). The home decides
 * billing, default settings and what happens on uninstall; the registrant
 * never needs to know which store it is.
 *
 * Linking: a one-time code made in one store's admin and entered in the
 * other's. Only someone with admin access to both stores can finish it, which
 * is our proof that one merchant controls both. The code is shown once and
 * only its hash is stored.
 */

export const LINK_CODE_TTL_MS = 24 * 60 * 60 * 1000;
export const MAX_GROUP_STORES = 5;
/** Failed redemptions allowed per store per hour before we stop checking codes. */
export const MAX_FAILED_REDEEMS_PER_HOUR = 5;

// Crockford base32 without the look-alikes (no I, L, O, U).
const CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** `GP-XXXX-XXXX-XXXX`: 60 random bits, easy to read out over the phone. */
export function generateLinkCode(): string {
  const bytes = crypto.randomBytes(12);
  let raw = "";
  for (let i = 0; i < 12; i++) raw += CODE_ALPHABET[bytes[i] % 32];
  return `GP-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

/** Forgiving about case, spaces, dashes and look-alike letters. */
export function normalizeLinkCode(input: string): string | null {
  const cleaned = input
    .toUpperCase()
    .replace(/[\s-]/g, "")
    .replace(/^GP/, "")
    .replace(/[IL]/g, "1")
    .replace(/O/g, "0");
  if (!/^[0-9A-HJKMNP-TV-Z]{12}$/.test(cleaned)) return null;
  return `GP-${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
}

function hashCode(code: string): string {
  return sha256(`giftpin-link:${code}`);
}

export interface LinkedShop {
  id: string;
  domain: string;
  name: string | null;
  currency: string;
  plan: "free" | "pro";
}

const linkedShopSelect = { id: true, domain: true, name: true, currency: true, plan: true } as const;

/**
 * The installed stores in `shopId`'s group, this one included, oldest member
 * first. A store in no group gets an empty list. Uninstalled stores are left
 * out: their app proxy is gone and their API token no longer works.
 */
export async function groupShops(shopId: string): Promise<LinkedShop[]> {
  const me = await db.storeGroupMember.findUnique({ where: { shopId }, select: { groupId: true } });
  if (!me) return [];
  const members = await db.storeGroupMember.findMany({
    where: { groupId: me.groupId, shop: { uninstalledAt: null } },
    orderBy: { joinedAt: "asc" },
    select: { shop: { select: linkedShopSelect } },
  });
  return members.map((m) => m.shop as LinkedShop);
}

/** Ids of every store `shopId` may act for: itself plus its installed group members. */
export async function groupShopIds(shopId: string): Promise<string[]> {
  const shops = await groupShops(shopId);
  return shops.length ? shops.map((s) => s.id) : [shopId];
}

/** True when `a` and `b` are the same store, or installed members of one group. */
export async function sameGroup(a: string, b: string): Promise<boolean> {
  if (a === b) return true;
  const rows = await db.storeGroupMember.findMany({
    where: { shopId: { in: [a, b] }, shop: { uninstalledAt: null } },
    select: { shopId: true, groupId: true },
  });
  return rows.length === 2 && rows[0].groupId === rows[1].groupId;
}

/**
 * The store that sells an internal item: its linked source store, or the
 * registry's own. The one place this rule lives.
 */
export function itemShopId(item: { sourceShopId?: string | null }, registryShopId: string): string {
  return item.sourceShopId ?? registryShopId;
}

/**
 * What to store in RegistryItem.sourceShopId for a product from `sellingShopId`
 * added to a registry homed on `registryShopId`. Null for the registry's own
 * store, so same-store rows look exactly as they always have.
 */
export function sourceShopIdFor(sellingShopId: string, registryShopId: string): string | null {
  return sellingShopId === registryShopId ? null : sellingShopId;
}

/**
 * Whether a registry homed on `homeShop` may take products from another
 * linked store. Multi-store is a Pro feature, and one Pro store covers its
 * whole group (Ben, 17 Nov 2026): the home store, or any installed store
 * linked to it, being on Pro is enough.
 */
export function canHoldLinkedProducts(homeShop: { plan: string }, group: { plan: string }[] = []): boolean {
  return [homeShop, ...group].some((s) => isPro(s as { plan: "free" | "pro" }));
}

// ---------------------------------------------------------------------------
// Linking
// ---------------------------------------------------------------------------

export type CreateCodeResult =
  | { ok: true; code: string; expiresAt: Date }
  | { ok: false; error: "not_pro" | "group_full" | "unknown_shop" };

/**
 * A new one-time link code for `shopId`. Any unused code it made before stops
 * working, so there's only ever one live code per store.
 */
export async function createLinkCode(shopId: string, now = new Date()): Promise<CreateCodeResult> {
  const shop = await db.shop.findUnique({ where: { id: shopId }, select: { id: true, domain: true, plan: true } });
  if (!shop) return { ok: false, error: "unknown_shop" };
  if (!isPro(shop)) return { ok: false, error: "not_pro" };
  const members = await groupShops(shopId);
  if (members.length >= MAX_GROUP_STORES) return { ok: false, error: "group_full" };

  const code = generateLinkCode();
  const expiresAt = new Date(now.getTime() + LINK_CODE_TTL_MS);
  await db.$transaction([
    db.storeLinkCode.updateMany({ where: { shopId, usedAt: null }, data: { expiresAt: now } }),
    db.storeLinkCode.create({ data: { codeHash: hashCode(code), shopId, expiresAt } }),
  ]);
  await audit({ shop: shop.domain, actor: "merchant", action: "link_code_created" });
  return { ok: true, code, expiresAt };
}

export type RedeemError =
  | "bad_code"
  | "own_code"
  | "already_linked"
  | "other_in_group"
  | "group_full"
  | "dev_mismatch"
  | "too_many_tries"
  | "unknown_shop";

export type RedeemResult = { ok: true; linkedWith: LinkedShop } | { ok: false; error: RedeemError };

/**
 * Store `shopId` enters a code made by another store. On success both stores
 * are in one group: the code maker's existing group, or a new one.
 */
export async function redeemLinkCode(shopId: string, input: string, now = new Date()): Promise<RedeemResult> {
  const shop = await db.shop.findUnique({
    where: { id: shopId },
    select: { id: true, domain: true, devStore: true },
  });
  if (!shop) return { ok: false, error: "unknown_shop" };

  const since = new Date(now.getTime() - 60 * 60 * 1000);
  const fails = await db.auditLog.count({
    where: { shop: shop.domain, action: "link_code_failed", at: { gte: since } },
  });
  if (fails >= MAX_FAILED_REDEEMS_PER_HOUR) return { ok: false, error: "too_many_tries" };

  const fail = async (error: RedeemError): Promise<RedeemResult> => {
    await audit({ shop: shop.domain, actor: "merchant", action: "link_code_failed", detail: { error } });
    return { ok: false, error };
  };

  const code = normalizeLinkCode(input);
  const row = code
    ? await db.storeLinkCode.findUnique({ where: { codeHash: hashCode(code) } })
    : null;
  if (!row || row.usedAt || row.expiresAt <= now) return fail("bad_code");
  if (row.shopId === shopId) return fail("own_code");

  const maker = await db.shop.findUnique({
    where: { id: row.shopId },
    select: { ...linkedShopSelect, devStore: true, uninstalledAt: true },
  });
  if (!maker || maker.uninstalledAt) return fail("bad_code");
  // Test charges and real ones must never mix in one group.
  if (maker.devStore !== shop.devStore) return fail("dev_mismatch");

  const [mine, theirs] = await Promise.all([
    db.storeGroupMember.findUnique({ where: { shopId }, select: { groupId: true } }),
    db.storeGroupMember.findUnique({ where: { shopId: maker.id }, select: { groupId: true } }),
  ]);
  if (mine && theirs && mine.groupId === theirs.groupId) return fail("already_linked");
  // Merging two groups is a support conversation, not a code.
  if (mine) return fail("other_in_group");
  if (theirs) {
    const count = await db.storeGroupMember.count({ where: { groupId: theirs.groupId } });
    if (count >= MAX_GROUP_STORES) return fail("group_full");
  }

  await db.$transaction(async (tx) => {
    // Re-checked inside the transaction so one code can't be spent twice.
    const { count } = await tx.storeLinkCode.updateMany({
      where: { id: row.id, usedAt: null },
      data: { usedAt: now, usedBy: shopId },
    });
    if (count === 0) throw new LinkRace();
    const groupId =
      theirs?.groupId ??
      (await tx.storeGroup.create({ data: { members: { create: { shopId: maker.id } } } })).id;
    await tx.storeGroupMember.create({ data: { groupId, shopId } });
  }).catch((err) => {
    if (err instanceof LinkRace) return null;
    throw err;
  });

  const linked = await db.storeGroupMember.findUnique({ where: { shopId }, select: { groupId: true } });
  if (!linked) return fail("bad_code");

  await audit({ shop: shop.domain, actor: "merchant", action: "store_linked", subject: maker.domain });
  await audit({ shop: maker.domain, actor: "merchant", action: "store_linked", subject: shop.domain });
  return {
    ok: true,
    linkedWith: { id: maker.id, domain: maker.domain, name: maker.name, currency: maker.currency, plan: maker.plan },
  };
}

class LinkRace extends Error {}

/**
 * `shopId` leaves its group. Takes effect at once. Nothing on any registry is
 * deleted: items from the store that left stay on the list (shown as "from
 * <store>" with a search link and "I bought this"), keep their bought counts,
 * and come back to life if the stores link again.
 */
export async function leaveGroup(shopId: string, actor = "merchant"): Promise<boolean> {
  const me = await db.storeGroupMember.findUnique({
    where: { shopId },
    select: { groupId: true, shop: { select: { domain: true } } },
  });
  if (!me) return false;
  const others = await db.storeGroupMember.findMany({
    where: { groupId: me.groupId, shopId: { not: shopId } },
    select: { shopId: true, shop: { select: { domain: true } } },
  });

  await db.$transaction(async (tx) => {
    await tx.storeGroupMember.delete({ where: { shopId } });
    // A group of one is no group.
    if (others.length <= 1) await tx.storeGroup.delete({ where: { id: me.groupId } });
  });

  await audit({ shop: me.shop.domain, actor, action: "store_unlinked" });
  for (const o of others) {
    await audit({ shop: o.shop.domain, actor, action: "store_unlinked", subject: me.shop.domain });
  }
  return true;
}

// ---------------------------------------------------------------------------
// shop/redact for a store that sold into other stores' registries
// ---------------------------------------------------------------------------

/**
 * Before a store's data is erased (shop/redact, 48h after uninstall), detach
 * it from registries homed on OTHER stores, which must survive:
 *
 *   - its products on those registries become plain manual items (title,
 *     photo and price kept, bought counts kept, no product ids), because a
 *     variant id from a deleted store means nothing to anyone, and
 *   - the buyer details on purchases made through it are erased: they are
 *     that store's customers' data.
 *
 * Its own registries go with the Shop row's cascade, as before.
 */
export async function detachShopFromOtherRegistries(shopId: string): Promise<{ items: number; purchases: number }> {
  const items = await db.registryItem.updateMany({
    where: { sourceShopId: shopId, registry: { shopId: { not: shopId } } },
    data: {
      sourceType: "manual",
      sourceShopId: null,
      productGid: null,
      variantGid: null,
      storeMatchStatus: null,
    },
  });
  const purchases = await db.purchase.updateMany({
    where: { shopId, item: { registry: { shopId: { not: shopId } } } },
    data: { buyerName: null, buyerEmailEnc: null, buyerCustomerId: null, buyerMessage: null, shopId: null },
  });
  await db.storeGroupMember.deleteMany({ where: { shopId } });
  await db.storeGroup.deleteMany({ where: { members: { none: {} } } });
  return { items: items.count, purchases: purchases.count };
}

/**
 * Prisma `where` for purchases a store took: sales on its own registries
 * (Purchase.shopId null) plus sales it made into linked stores' registries
 * (Purchase.shopId = this store). Customer ids are per store, so GDPR
 * requests and refunds must follow the selling store, not the registry's.
 */
export function purchasesSoldByWhere(shopDomain: string, shopId: string | null) {
  return {
    OR: [
      { shopId: null, item: { registry: { shop: { domain: shopDomain } } } },
      ...(shopId ? [{ shopId }] : []),
    ],
  };
}

/**
 * Prisma `where` for the money a store's own dashboard counts: sales it took,
 * on its own registries or into a linked store's. A linked store's sale into
 * this store's registry is that store's revenue (and maybe another currency),
 * so it's left out here.
 */
export function salesTakenByWhere(shopId: string) {
  return {
    OR: [{ shopId: null, item: { registry: { shopId } } }, { shopId }],
  };
}
