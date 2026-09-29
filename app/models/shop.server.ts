import db from "../db.server";
import type { Shop } from "@prisma/client";
import { mergeSettings, type ShopSettings } from "../shared/settings";

/**
 * Shop record and merchant settings.
 *
 * The settings SHAPE lives in app/shared/settings.ts because the admin UI
 * renders it in the browser; only the database access lives here.
 */

export { SHOP_SETTINGS_DEFAULTS, EVENT_TYPES, eventTypeLabel } from "../shared/settings";
export type { ShopSettings } from "../shared/settings";

export function settingsFor(shop: Pick<Shop, "settings">): ShopSettings {
  return mergeSettings((shop.settings ?? {}) as Partial<ShopSettings>);
}

/** Idempotent: called on install and on every admin load. */
export async function upsertShop(
  domain: string,
  data?: Partial<Pick<Shop, "name" | "currency" | "moneyFormat">>,
) {
  const clean = Object.fromEntries(
    Object.entries(data ?? {}).filter(([, value]) => value !== undefined && value !== null),
  );

  const upsert = () =>
    db.shop.upsert({
      where: { domain },
      create: { domain, ...clean },
      update: { ...clean, uninstalledAt: null },
    });

  try {
    return await upsert();
  } catch (err) {
    // Two requests creating the row at once (see requireShop): the loser's
    // insert hits the unique domain. The row exists now, so the retry updates.
    if (isUniqueViolation(err)) return upsert();
    throw err;
  }
}

export async function getShop(domain: string) {
  return db.shop.findUnique({ where: { domain } });
}

/**
 * The Shop row for an authenticated admin request, created if it isn't
 * there yet.
 *
 * React Router runs the app.tsx layout loader (which upserts the row) and
 * the page's own loader in parallel, so on the very first open after an
 * install the page loader can get here before the row exists. That used to
 * throw "Shop … is not installed" and show the merchant a 500 — the App
 * Store reviewer hit exactly this on 27 Sep 2026. Only call this after
 * authenticate.admin(), which proves the shop has installed the app.
 */
export async function requireShop(domain: string) {
  const shop = await getShop(domain);
  if (shop) return shop;

  try {
    return await db.shop.create({ data: { domain } });
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;
    const winner = await getShop(domain);
    if (!winner) throw err;
    return winner;
  }
}

function isUniqueViolation(err: unknown): boolean {
  return (err as { code?: string })?.code === "P2002";
}

export async function updateSettings(domain: string, patch: Partial<ShopSettings>) {
  const shop = await requireShop(domain);
  const next = { ...settingsFor(shop), ...patch };
  return db.shop.update({
    where: { domain },
    data: { settings: next as unknown as object },
  });
}

export async function markUninstalled(domain: string) {
  // Shopify cancels the app subscription on uninstall, and the matching
  // APP_SUBSCRIPTIONS_UPDATE webhook can't be relied on to reach an app
  // that's already gone. Drop the cached plan here, or a reinstall comes
  // back as "pro" with no live charge: Pro for free, and a Cancel button
  // pointed at a subscription Shopify no longer has (App Store req. 1.2.2).
  await db.shop.updateMany({
    where: { domain },
    data: {
      uninstalledAt: new Date(),
      plan: "free",
      shopifyChargeId: null,
      planUpdatedAt: new Date(),
    },
  });
}

// ---------------------------------------------------------------------------
// Billing — see app/routes/app.billing.tsx and
// app/routes/webhooks.app_subscriptions.update.tsx
// ---------------------------------------------------------------------------

export function isPro(shop: Pick<Shop, "plan">): boolean {
  return shop.plan === "pro";
}

/**
 * Maps a Shopify APP_SUBSCRIPTIONS_UPDATE webhook's `status` to our cached
 * plan. Pure and exported on its own so it's testable without a live
 * webhook payload — see CLAUDE.md hard rule #1: the exact payload shape
 * (particularly whether it's nested under `app_subscription`) is written
 * from the 2026-07 REST admin docs and has NOT been verified against a real
 * delivery yet. Confirm against a real payload the first time a test
 * subscription actually fires this webhook, and update this comment.
 */
export function planFromSubscriptionStatus(status: string): "free" | "pro" {
  return status === "ACTIVE" ? "pro" : "free";
}

/** Idempotent — called from the APP_SUBSCRIPTIONS_UPDATE webhook. */
export async function setPlanFromSubscription(
  domain: string,
  status: string,
  shopifyChargeId: string | null,
) {
  const plan = planFromSubscriptionStatus(status);
  return db.shop.update({
    where: { domain },
    data: {
      plan,
      // Only an active subscription is worth remembering the id of — a
      // cancelled/expired one shouldn't leave a stale id billing.cancel()
      // could be pointed at later.
      shopifyChargeId: plan === "pro" ? shopifyChargeId : null,
      planUpdatedAt: new Date(),
    },
  });
}
