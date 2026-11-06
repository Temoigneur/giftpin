import db from "../db.server";
import { touchRegistry, logEvent } from "./registry.server";
import { registerHandler } from "../lib/queue.server";
import { signToken, verifyToken } from "../lib/crypto.server";
import { UNDO_WINDOW_SECONDS } from "../shared/undo";

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
  return Number.isFinite(configured) && configured > 0 ? configured : 2;
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

/**
 * A guest says they bought a STORE item some other way (in person, say). There
 * is no hold to convert, so this records one unit directly. Online orders are
 * never counted here; the order webhook does that. If a guest taps this and
 * also orders online the item over-counts, which errs toward "looks bought"
 * rather than inviting a duplicate gift.
 */
export async function confirmBoughtElsewhere(
  itemId: string,
  details?: { buyerName?: string | null; buyerMessage?: string | null },
) {
  const result = await db.$transaction(async (tx) => {
    const item = await tx.registryItem.findUnique({ where: { id: itemId } });
    if (!item || item.sourceType !== "internal" || item.purchasedQty >= item.desiredQty) return null;

    const purchase = await tx.purchase.create({
      data: {
        itemId,
        source: "external",
        qty: 1,
        buyerName: details?.buyerName?.slice(0, 120) ?? null,
        buyerMessage: details?.buyerMessage?.slice(0, 1000) ?? null,
      },
    });
    await tx.registryItem.update({ where: { id: itemId }, data: { purchasedQty: { increment: 1 } } });
    return { purchase, registryId: item.registryId };
  });
  if (!result) return null;

  await touchRegistry(result.registryId);
  await logEvent(result.registryId, "purchased", { itemId, source: "external", qty: 1 });
  return result.purchase;
}

// ---------------------------------------------------------------------------
// Undo — a guest who tapped "I bought this" by mistake
//
// Only the browser that made the mark holds the undo token, and only for a
// day, so one guest can never un-mark another's real purchase. Order-webhook
// purchases (source "online") are never undoable from here; refunds do that.
// ---------------------------------------------------------------------------

const UNDO_PURPOSE = "undo-bought";

export function mintUndoToken(purchaseId: string): string {
  return signToken({ p: UNDO_PURPOSE, u: purchaseId }, UNDO_WINDOW_SECONDS);
}

export function readUndoToken(token: string | null | undefined): string | null {
  const payload = verifyToken<{ p: string; u?: unknown }>(token, UNDO_PURPOSE);
  return payload && typeof payload.u === "string" ? payload.u : null;
}

/** Voids a guest-confirmed purchase. Returns false if there was nothing to undo. */
export async function undoGuestPurchase(purchaseId: string): Promise<boolean> {
  const purchase = await db.purchase.findUnique({
    where: { id: purchaseId },
    include: { item: { select: { registryId: true } } },
  });
  if (!purchase || purchase.source !== "external" || purchase.voidedAt) return false;

  const undone = await db.$transaction(async (tx) => {
    // Re-checking voidedAt inside the transaction stops a double tap from
    // decrementing twice.
    const { count } = await tx.purchase.updateMany({
      where: { id: purchase.id, voidedAt: null },
      data: { voidedAt: new Date() },
    });
    if (count === 0) return false;

    const item = await tx.registryItem.findUnique({
      where: { id: purchase.itemId },
      select: { purchasedQty: true },
    });
    if (item) {
      await tx.registryItem.update({
        where: { id: purchase.itemId },
        data: { purchasedQty: Math.max(0, item.purchasedQty - purchase.qty) },
      });
    }
    return true;
  });
  if (!undone) return false;

  await touchRegistry(purchase.item.registryId);
  await logEvent(purchase.item.registryId, "purchase_undone", {
    itemId: purchase.itemId,
    qty: purchase.qty,
    source: "external",
  });
  return true;
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
