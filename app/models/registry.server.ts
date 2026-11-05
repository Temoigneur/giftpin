import db from "../db.server";
import {
  encrypt,
  tryDecrypt,
  blindIndex,
  randomSlug,
  signToken,
  verifyToken,
  hashPassword,
  verifyPassword,
} from "../lib/crypto.server";
import { cache, registryCacheKey } from "../lib/cache.server";
import { fundState } from "../shared/contributions";
import type { Prisma, RegistryPrivacy } from "@prisma/client";

/**
 * Registries.
 *
 * Note the absence of accounts. App proxy strips cookies, so there is no
 * session to hang a login on, and forcing customer-account creation on someone
 * who just wants a gift list is how you lose them at step one. Instead the
 * registrant gets a signed magic link, and that link IS the credential.
 */

const MANAGE_TOKEN_PURPOSE = "manage";
// 90 days, and every manage-page visit hands the browser a fresh one, so an
// owner who keeps coming back never gets locked out.
const MANAGE_TOKEN_TTL = 90 * 24 * 3600;

export const registryWithItems = {
  include: {
    items: {
      include: { externalSource: true, purchases: true, claims: true },
      orderBy: [{ priority: "desc" as const }, { createdAt: "asc" as const }],
    },
    // Owner first: several callers read registrants[0] as the owner.
    registrants: { orderBy: { createdAt: "asc" as const } },
    shop: true,
  },
} satisfies Prisma.RegistryDefaultArgs;

export type RegistryWithItems = Prisma.RegistryGetPayload<typeof registryWithItems>;

// ---------------------------------------------------------------------------
// Creation
// ---------------------------------------------------------------------------

export interface CreateRegistryInput {
  shopId: string;
  customerId?: string | null;
  eventType: string;
  eventDate?: Date | null;
  title: string;
  message?: string | null;
  registrantName: string;
  registrantEmail: string;
  privacy?: RegistryPrivacy;
  password?: string | null;
  country?: string | null;
}

export async function createRegistry(input: CreateRegistryInput) {
  // Retry on the vanishingly unlikely slug collision rather than pretending it
  // can't happen — the unique index is on (shopId, slug).
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = randomSlug();
    try {
      return await db.registry.create({
        data: {
          shopId: input.shopId,
          customerId: input.customerId ?? null,
          slug,
          eventType: input.eventType,
          eventDate: input.eventDate ?? null,
          title: input.title.slice(0, 200),
          message: input.message?.slice(0, 2000) ?? null,
          privacy: input.privacy ?? "unlisted",
          country: input.country ?? null,
          passwordHash: input.password ? hashPassword(input.password) : null,
          registrants: {
            create: {
              name: input.registrantName.slice(0, 120),
              emailEnc: encrypt(input.registrantEmail.trim().toLowerCase()),
              emailHash: blindIndex(input.registrantEmail),
              role: "owner",
            },
          },
          events: { create: { type: "created", payload: { eventType: input.eventType } } },
        },
        ...registryWithItems,
      });
    } catch (err) {
      if (isUniqueViolation(err) && attempt < 4) continue;
      throw err;
    }
  }
  throw new Error("Could not allocate a registry slug");
}

export function isUniqueViolation(err: unknown): boolean {
  return (err as { code?: string })?.code === "P2002";
}

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

export async function findBySlug(shopDomain: string, slug: string) {
  return db.registry.findFirst({
    where: { slug, status: "active", shop: { domain: shopDomain } },
    ...registryWithItems,
  });
}

export async function findById(registryId: string) {
  return db.registry.findUnique({ where: { id: registryId }, ...registryWithItems });
}

/**
 * Cheap version check for the guest page's "new gift added" banner (see
 * registryVersionAction in router.server.ts). No items/registrants joined —
 * this gets polled every ~20s by every open guest tab, so it stays a single
 * indexed lookup rather than the full `registryWithItems` include.
 */
export async function findVersionBySlug(
  shopDomain: string,
  slug: string,
): Promise<{ id: string; version: number } | null> {
  return db.registry.findFirst({
    where: { slug, status: "active", shop: { domain: shopDomain } },
    select: { id: true, version: true },
  });
}

/**
 * Registries a given email owns or is the partner on, across one shop. Used by
 * "email me my link". `registrants` holds only the matching registrant, so the
 * caller can mint the right kind of link (see mintManageToken).
 */
export async function findByEmail(shopId: string, email: string) {
  const emailHash = blindIndex(email);
  return db.registry.findMany({
    where: {
      shopId,
      status: "active",
      registrants: { some: { emailHash } },
    },
    include: { registrants: { where: { emailHash }, select: { id: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });
}

// ---------------------------------------------------------------------------
// Magic links — the registrant's credential
// ---------------------------------------------------------------------------

/**
 * The owner's link carries only the registry id. A partner's link also carries
 * their Registrant id (`g`), so removing the partner shuts their link off:
 * authorizeManage() refuses a `g` that's no longer on the registry.
 */
export function mintManageToken(registryId: string, partnerId?: string | null): string {
  return signToken(
    { p: MANAGE_TOKEN_PURPOSE, r: registryId, ...(partnerId ? { g: partnerId } : {}) },
    MANAGE_TOKEN_TTL,
  );
}

export function readManageToken(token: string | null | undefined): string | null {
  return readManageGrant(token)?.registryId ?? null;
}

export function readManageGrant(
  token: string | null | undefined,
): { registryId: string; partnerId: string | null } | null {
  const payload = verifyToken<{ p: string; r?: unknown; g?: unknown }>(token, MANAGE_TOKEN_PURPOSE);
  if (!payload || typeof payload.r !== "string") return null;
  return { registryId: payload.r, partnerId: typeof payload.g === "string" ? payload.g : null };
}

/**
 * The link to hand a registrant for this registry: the owner's kind for the
 * owner, a revocable one for a partner.
 */
export function manageTokenFor(registryId: string, registrant: { id: string; role: string }): string {
  return mintManageToken(registryId, registrant.role === "co" ? registrant.id : null);
}

// ---------------------------------------------------------------------------
// "My registries": every registry one email holds at one store
//
// Still no accounts table. The email IS the account: Registrant.emailHash
// already groups every registry (owner or partner) a person holds at a store,
// so a new registry created with the same email joins the list on its own and
// existing registries need no migration.
//
// The credential is a signed account token (shop + email hash) that is only
// ever handed out by email, the same root of trust as a manage link. A manage
// link is NOT enough to get one: owners forward manage links (to a parent, a
// planner), and that must not open their other registries too.
// ---------------------------------------------------------------------------

const ACCOUNT_TOKEN_PURPOSE = "account";
const ACCOUNT_TOKEN_TTL = MANAGE_TOKEN_TTL;

export function mintAccountToken(shopId: string, emailHash: string): string {
  return signToken({ p: ACCOUNT_TOKEN_PURPOSE, s: shopId, h: emailHash }, ACCOUNT_TOKEN_TTL);
}

/** The email hash the token stands for, or null if it's bad, expired or for another store. */
export function readAccountToken(token: string | null | undefined, shopId: string): string | null {
  const payload = verifyToken<{ p: string; s?: unknown; h?: unknown }>(token, ACCOUNT_TOKEN_PURPOSE);
  if (!payload || payload.s !== shopId || typeof payload.h !== "string" || !payload.h) return null;
  return payload.h;
}

export interface AccountRegistry {
  id: string;
  title: string;
  eventType: string;
  eventDate: Date | null;
  /** The holder's own manage token for it: an owner link, or their revocable partner link. */
  token: string;
  partner: boolean;
}

/**
 * Every active registry at this store held by the email behind `emailHash`
 * (as owner or partner), plus any owned by the signed-in store customer.
 * Newest first, capped so a runaway list can't blow up the page.
 */
export async function listAccountRegistries(
  shopId: string,
  emailHash: string | null,
  customerId: string | null,
): Promise<AccountRegistry[]> {
  const or: Prisma.RegistryWhereInput[] = [];
  if (emailHash) or.push({ registrants: { some: { emailHash } } });
  if (customerId) or.push({ customerId: String(customerId) });
  if (or.length === 0) return [];

  const rows = await db.registry.findMany({
    where: { shopId, status: "active", OR: or },
    select: {
      id: true,
      title: true,
      eventType: true,
      eventDate: true,
      customerId: true,
      registrants: emailHash ? { where: { emailHash }, select: { id: true, role: true } } : false,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return rows.map((row) => {
    const mine = (row as { registrants?: { id: string; role: string }[] }).registrants ?? [];
    // Owner beats partner if somehow both: the owner link can't be revoked from under them.
    const holder = mine.find((r) => r.role === "owner") ?? mine[0] ?? null;
    const ownedAsCustomer = customerId !== null && row.customerId !== null && String(row.customerId) === String(customerId);
    const asPartner = holder?.role === "co" && !ownedAsCustomer;
    return {
      id: row.id,
      title: row.title,
      eventType: row.eventType,
      eventDate: row.eventDate,
      token: asPartner && holder ? manageTokenFor(row.id, holder) : mintManageToken(row.id),
      partner: asPartner,
    };
  });
}

/** Name + email to prefill "Start another registry" with. Null if the email holds nothing here. */
export async function accountProfile(shopId: string, emailHash: string): Promise<{ name: string; email: string } | null> {
  const registrant = await db.registrant.findFirst({
    where: { emailHash, registry: { shopId } },
    orderBy: { createdAt: "desc" },
    select: { name: true, emailEnc: true },
  });
  const email = registrant ? tryDecrypt(registrant.emailEnc) : null;
  return registrant && email ? { name: registrant.name, email } : null;
}

/**
 * A fresh token with the same holder as `token` (owner or partner). The manage
 * page hands one out on every visit; re-minting an owner token here would let a
 * removed partner keep access.
 */
export function renewManageToken(token: string | null | undefined, registryId: string): string {
  const grant = readManageGrant(token);
  return mintManageToken(registryId, grant?.registryId === registryId ? grant.partnerId : null);
}

/**
 * Authorises a management request.
 *
 * Two accepted credentials:
 *   - a valid magic-link token for this registry, or
 *   - a logged-in Shopify customer whose id matches the registry's owner.
 *
 * The app proxy HMAC is NOT one of them. It proves Shopify sent the request
 * untampered; it says nothing about who the caller is.
 */
export async function authorizeManage(
  registryId: string,
  token: string | null,
  loggedInCustomerId: string | null,
): Promise<RegistryWithItems | null> {
  const registry = await findById(registryId);
  if (!registry || registry.status !== "active") return null;

  const grant = readManageGrant(token);
  if (grant?.registryId === registryId) {
    if (!grant.partnerId) return registry;
    // A partner's link works only while they're still on the registry.
    if (registry.registrants.some((r) => r.id === grant.partnerId && r.role === "co")) return registry;
    return null;
  }

  if (
    loggedInCustomerId &&
    registry.customerId &&
    String(registry.customerId) === String(loggedInCustomerId)
  ) {
    return registry;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Partner (co-registrant)
//
// A registry has one owner and at most one partner. There are no accounts, so
// the partner gets the same kind of magic link the owner has, and can do
// everything the owner can. "Email me my link" finds them too (findByEmail
// matches any registrant), so they can get back in on their own.
// ---------------------------------------------------------------------------

export type AddPartnerResult =
  | { ok: true; partner: { id: string; name: string } }
  | { ok: false; error: "has_partner" | "is_owner" };

export async function addPartner(
  registryId: string,
  input: { name: string; email: string },
): Promise<AddPartnerResult> {
  const emailHash = blindIndex(input.email);
  const existing = await db.registrant.findMany({
    where: { registryId },
    select: { role: true, emailHash: true },
  });
  if (existing.some((r) => r.role === "co")) return { ok: false, error: "has_partner" };
  if (existing.some((r) => r.emailHash === emailHash)) return { ok: false, error: "is_owner" };

  const partner = await db.registrant.create({
    data: {
      registryId,
      name: input.name.slice(0, 120),
      emailEnc: encrypt(input.email.trim().toLowerCase()),
      emailHash,
      role: "co",
    },
    select: { id: true, name: true },
  });
  // The guest page shows the registrants' names.
  await touchRegistry(registryId);
  return { ok: true, partner };
}

export async function removePartner(registryId: string): Promise<number> {
  const { count } = await db.registrant.deleteMany({ where: { registryId, role: "co" } });
  if (count) await touchRegistry(registryId);
  return count;
}

/** The registrant who created the registry. Falls back to the first one. */
export function ownerOf<T extends { role: string }>(registrants: T[]): T | undefined {
  return registrants.find((r) => r.role === "owner") ?? registrants[0];
}

// ---------------------------------------------------------------------------
// Mutation + cache invalidation
// ---------------------------------------------------------------------------

/**
 * Every write to a registry goes through here.
 *
 * Bumping `version` is what invalidates the guest page: cache keys embed the
 * version, so the old key is simply never read again and ages out on its own.
 * No key hunting, no chance of serving a stale item count after a purchase.
 */
export async function touchRegistry(registryId: string): Promise<number> {
  const updated = await db.registry.update({
    where: { id: registryId },
    data: { version: { increment: 1 } },
    select: { version: true },
  });

  // Best effort: drop the previous key so memory doesn't hold a dead render.
  await cache()
    .del(registryCacheKey(registryId, updated.version - 1))
    .catch(() => {});

  return updated.version;
}

export async function logEvent(registryId: string, type: string, payload: object = {}) {
  await db.registryEvent.create({ data: { registryId, type, payload } });
}

export async function updateRegistry(
  registryId: string,
  data: Prisma.RegistryUpdateInput,
) {
  const updated = await db.registry.update({ where: { id: registryId }, data });
  await touchRegistry(registryId);
  return updated;
}

export async function setShippingAddress(registryId: string, address: object | null) {
  return updateRegistry(registryId, {
    shippingAddressEnc: address ? encrypt(JSON.stringify(address)) : null,
    shipToRegistrant: address !== null,
  });
}

export function readShippingAddress(registry: { shippingAddressEnc: string | null }): Record<string, string> | null {
  const decrypted = tryDecrypt(registry.shippingAddressEnc);
  if (!decrypted) return null;
  try {
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

export function registrantEmail(registrant: { emailEnc: string }): string | null {
  return tryDecrypt(registrant.emailEnc);
}

export function checkRegistryPassword(
  registry: { privacy: RegistryPrivacy; passwordHash: string | null },
  attempt: string | null,
): boolean {
  if (registry.privacy !== "password") return true;
  if (!registry.passwordHash || !attempt) return false;
  return verifyPassword(attempt, registry.passwordHash);
}

/**
 * Hard delete, registrant-initiated. Cascades take items, claims, purchases
 * and events. Shipping addresses and emails go with the rows.
 *
 * This is a first-class path, not an afterthought — see architecture-decisions
 * §8. The same function backs the customers/redact webhook.
 */
export async function deleteRegistry(registryId: string) {
  const registry = await db.registry.findUnique({
    where: { id: registryId },
    select: { version: true },
  });
  await db.registry.delete({ where: { id: registryId } });
  if (registry) {
    await cache().del(registryCacheKey(registryId, registry.version)).catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// Derived views
// ---------------------------------------------------------------------------

export interface RegistryProgress {
  totalItems: number;
  fulfilledItems: number;
  internalItems: number;
  externalItems: number;
  /** Share of registry VALUE that is the merchant's own products, 0-100. */
  merchantSharePercent: number;
}

export function progressFor(registry: RegistryWithItems): RegistryProgress {
  let internalValue = 0;
  let externalValue = 0;
  let fulfilled = 0;
  let internal = 0;
  let external = 0;

  for (const item of registry.items) {
    const unit = itemUnitPrice(item);
    const value = unit * item.desiredQty;

    if (item.sourceType === "internal") {
      internal++;
      internalValue += value;
    } else {
      external++;
      externalValue += value;
    }

    if (item.purchasedQty >= item.desiredQty || isFullyFunded(item)) fulfilled++;
  }

  const total = internalValue + externalValue;

  return {
    totalItems: registry.items.length,
    fulfilledItems: fulfilled,
    internalItems: internal,
    externalItems: external,
    merchantSharePercent: total > 0 ? Math.round((internalValue / total) * 100) : 100,
  };
}

/** A group gift or fund whose chip-ins have reached the goal (SPIKE-C.md). */
function isFullyFunded(item: { fundGoal?: unknown; fundedAmount?: unknown }): boolean {
  return fundState(item.fundGoal, item.fundedAmount)?.complete === true;
}

export function itemUnitPrice(item: {
  snapshotPrice: unknown;
  externalSource?: { price: unknown } | null;
}): number {
  // ExternalSource is the fresher of the two for external items; the snapshot
  // covers internal and manual items, and external items whose resolve job
  // hasn't landed yet.
  const raw = item.externalSource?.price ?? item.snapshotPrice ?? null;
  if (raw === null || raw === undefined) return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}
