import db from "../db.server";
import { touchRegistry, logEvent } from "./registry.server";
import { registerHandler } from "../lib/queue.server";
import { signToken, verifyToken } from "../lib/crypto.server";

/**
 * Soft claims — EXTERNAL ITEMS ONLY.
 *
 * Note the asymmetry, because it is the whole design:
 *
 *   Internal items need no reservation. The orders/create webhook is ground
 *   truth, it arrives within seconds, and holding stock we can't confirm just
 *   annoys guests. (The original brief's "don't reserve in MVP" guidance was
 *   written before external items existed and applies only here.)
 *
 *   External items need one, because nothing will ever tell us. A guest clicks
 *   through to Best Buy and vanishes into someone else's checkout. Without a
 *   hold, the next guest buys the same thing — and preventing exactly that is
 *   the entire reason a registry exists.
 *
 * So: click-through places a short hold, we ask the guest afterwards, and an
 * unanswered hold expires rather than blocking the item forever.
 */

const CLAIM_PURPOSE = "claim";

function holdHours(): number {
  const configured = Number(process.env.CLAIM_HOLD_HOURS);
  return Number.isFinite(configured) && configured > 0 ? configured : 48;
}

export interface ClaimResult {
  claimId: string;
  /** Signed token that lets the guest confirm or release without an account. */
  token: string;
  expiresAt: Date;
}

/**
 * Places a hold when a guest clicks through to an external retailer.
 * Returns null when there is nothing left to claim — the caller should still
 * send the guest to the retailer, just without a hold.
 */
export async function placeClaim(
  itemId: string,
  registryId: string,
  guestFingerprint: string,
  qty = 1,
): Promise<ClaimResult | null> {
  const now = new Date();

  const item = await db.registryItem.findFirst({
    where: { id: itemId, registryId },
    include: { claims: { where: { releasedAt: null, expiresAt: { gt: now } } } },
  });
  if (!item || item.sourceType === "internal" || item.sourceType === "fund") return null;

  const claimed = item.claims.reduce((sum, c) => sum + c.qty, 0);
  const available = item.desiredQty - item.purchasedQty - claimed;
  if (available < 1) return null;

  // A guest who clicks twice extends their own hold rather than stacking two.
  const own = item.claims.find((c) => c.guestFingerprint === guestFingerprint);
  const expiresAt = new Date(now.getTime() + holdHours() * 3600 * 1000);

  const claim = own
    ? await db.claim.update({ where: { id: own.id }, data: { expiresAt } })
    : await db.claim.create({
        data: {
          itemId,
          qty: Math.min(qty, available),
          guestFingerprint,
          expiresAt,
        },
      });

  await touchRegistry(registryId);
  await logEvent(registryId, "claimed", { itemId, qty: claim.qty });

  return {
    claimId: claim.id,
    token: signToken({ p: CLAIM_PURPOSE, c: claim.id }, holdHours() * 3600 + 7 * 24 * 3600),
    expiresAt,
  };
}

export function readClaimToken(token: string | null | undefined): string | null {
  const payload = verifyToken<{ p: string; c?: unknown }>(token, CLAIM_PURPOSE);
  return payload && typeof payload.c === "string" ? payload.c : null;
}

/** Guest said yes. Converts the hold into a purchase record. */
export async function confirmClaim(
  claimId: string,
  details?: { buyerName?: string | null; buyerMessage?: string | null },
) {
  const claim = await db.claim.findUnique({
    where: { id: claimId },
    include: { item: { include: { registry: true } } },
  });
  if (!claim || claim.releasedAt) return null;

  const purchase = await db.$transaction(async (tx) => {
    await tx.claim.update({ where: { id: claim.id }, data: { releasedAt: new Date() } });

    const created = await tx.purchase.create({
      data: {
        itemId: claim.itemId,
        source: "external",
        qty: claim.qty,
        buyerName: details?.buyerName?.slice(0, 120) ?? null,
        buyerMessage: details?.buyerMessage?.slice(0, 1000) ?? null,
      },
    });

    await tx.registryItem.update({
      where: { id: claim.itemId },
      data: { purchasedQty: { increment: claim.qty } },
    });

    return created;
  });

  await touchRegistry(claim.item.registryId);
  await logEvent(claim.item.registryId, "purchased", {
    itemId: claim.itemId,
    source: "external",
    qty: claim.qty,
  });

  return purchase;
}

/** Guest said no, or changed their mind. Puts the item straight back. */
export async function releaseClaim(claimId: string) {
  const claim = await db.claim.findUnique({
    where: { id: claimId },
    include: { item: true },
  });
  if (!claim || claim.releasedAt) return;

  await db.claim.update({ where: { id: claimId }, data: { releasedAt: new Date() } });
  await touchRegistry(claim.item.registryId);
}

// ---------------------------------------------------------------------------
// Reaper — runs every 15 minutes
// ---------------------------------------------------------------------------

registerHandler("reap-claims", async () => {
  const now = new Date();

  const expired = await db.claim.findMany({
    where: { releasedAt: null, expiresAt: { lt: now } },
    include: { item: { select: { registryId: true } } },
    take: 500,
  });

  if (expired.length === 0) return;

  await db.claim.updateMany({
    where: { id: { in: expired.map((c) => c.id) } },
    data: { releasedAt: now },
  });

  // Bump each affected registry once, not once per claim.
  const registryIds = new Set<string>(expired.map((c) => c.item.registryId));
  for (const registryId of registryIds) {
    await touchRegistry(registryId).catch(() => {});
  }

  console.log(`[reap-claims] released ${expired.length} expired holds`);
});
