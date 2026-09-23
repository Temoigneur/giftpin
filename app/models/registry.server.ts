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
    registrants: true,
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

/** Registries a given email owns, across one shop. Used by "email me my link". */
export async function findByEmail(shopId: string, email: string) {
  return db.registry.findMany({
    where: {
      shopId,
      status: "active",
      registrants: { some: { emailHash: blindIndex(email) } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ---------------------------------------------------------------------------
// Magic links — the registrant's credential
// ---------------------------------------------------------------------------

export function mintManageToken(registryId: string): string {
  return signToken({ p: MANAGE_TOKEN_PURPOSE, r: registryId }, MANAGE_TOKEN_TTL);
}

export function readManageToken(token: string | null | undefined): string | null {
  const payload = verifyToken<{ p: string; r?: unknown }>(token, MANAGE_TOKEN_PURPOSE);
  return payload && typeof payload.r === "string" ? payload.r : null;
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

  if (readManageToken(token) === registryId) return registry;

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

    if (item.purchasedQty >= item.desiredQty) fulfilled++;
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
