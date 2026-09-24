import db from "../db.server";
import { registerHandler } from "../lib/queue.server";
import { sendEmail } from "../lib/email.server";
import { audit } from "../lib/audit.server";
import { signToken, verifyToken, encrypt, blindIndex, tryDecrypt } from "../lib/crypto.server";
import { absoluteProxyUrl } from "../lib/proxy.server";
import {
  completionDiscountCode,
  createCompletionDiscount,
} from "../lib/discounts.server";
import { unauthenticated } from "../shopify.server";
import { settingsFor, isPro, type ShopSettings } from "./shop.server";
import { logEvent, mintManageToken, registrantEmail } from "./registry.server";

/**
 * Pro automations: one daily job (scheduled in queue.server.ts) that sends
 * the lifecycle emails and issues the registry completion discount.
 *
 *   Guest reminder       2 to 14 days before the event, to guests who opted in
 *                        on the registry page, plus a nudge to the registrant
 *   Most items gone      once 75% of the list is bought (3+ items), to the registrant
 *   Thank-you reminder   2 to 21 days after the event, if any gift was bought
 *   Completion discount  3 to 30 days after the event, a single-use code for
 *                        the merchant's products still on the list
 *
 * Each fires at most once per registry. The RegistryEvent log is the record of
 * what already went out (marker types below), so nothing here needs its own
 * columns. The windows are wide on purpose: a day the worker was down just
 * means it goes out the next day.
 *
 * Free shops get none of this; the check is at send time, so a shop that
 * lapses stops getting it immediately.
 */

const DAY = 86_400_000;

export const AUTOMATION_MARKERS = {
  guestReminder: "auto_event_reminder_sent",
  mostGone: "auto_most_gone_sent",
  thankYou: "auto_thank_you_sent",
  completionDiscount: "completion_discount_issued",
} as const;

export type AutomationKind = keyof typeof AUTOMATION_MARKERS;

const WINDOWS = {
  guestReminder: { minDaysBefore: 2, maxDaysBefore: 14 },
  thankYou: { minDaysAfter: 2, maxDaysAfter: 21 },
  completionDiscount: { minDaysAfter: 3, maxDaysAfter: 30 },
  mostGone: { minItems: 3, share: 0.75 },
} as const;

/** How far after the event a registry can still need something from this job. */
const LOOKBACK_DAYS = WINDOWS.completionDiscount.maxDaysAfter;

export interface PlannerRegistry {
  eventDate: Date | null;
  items: {
    sourceType: string;
    productGid: string | null;
    desiredQty: number;
    purchasedQty: number;
    purchases: { voidedAt: Date | null }[];
  }[];
  /** Marker event types already logged for this registry. */
  sent: string[];
  guestRemindersPending: number;
}

/** Whole days from `now` until the event; negative once it has passed. */
export function daysUntil(eventDate: Date, now: Date): number {
  const startOf = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.round((startOf(eventDate) - startOf(now)) / DAY);
}

/** The merchant's own products still wanted — what the completion discount covers. */
export function remainingProductGids(items: PlannerRegistry["items"]): string[] {
  const gids = new Set<string>();
  for (const item of items) {
    if (item.sourceType === "internal" && item.productGid && item.purchasedQty < item.desiredQty) {
      gids.add(item.productGid);
    }
  }
  return [...gids];
}

/**
 * Pure: which automations are due for one registry today. Everything with a
 * side effect lives in runRegistryAutomations below.
 */
export function dueAutomations(
  registry: PlannerRegistry,
  settings: ShopSettings,
  now: Date,
): AutomationKind[] {
  const due: AutomationKind[] = [];
  const sent = new Set(registry.sent);
  const notSent = (kind: AutomationKind) => !sent.has(AUTOMATION_MARKERS[kind]);
  const days = registry.eventDate ? daysUntil(registry.eventDate, now) : null;

  if (
    settings.guestEventReminderEmails &&
    days !== null &&
    days >= WINDOWS.guestReminder.minDaysBefore &&
    days <= WINDOWS.guestReminder.maxDaysBefore &&
    notSent("guestReminder")
  ) {
    due.push("guestReminder");
  }

  const total = registry.items.length;
  const fulfilled = registry.items.filter((i) => i.purchasedQty >= i.desiredQty).length;
  if (
    settings.mostGoneAlertEmails &&
    (days === null || days >= 0) &&
    total >= WINDOWS.mostGone.minItems &&
    fulfilled / total >= WINDOWS.mostGone.share &&
    notSent("mostGone")
  ) {
    due.push("mostGone");
  }

  const hasGift = registry.items.some((i) => i.purchases.some((p) => p.voidedAt === null));
  if (
    settings.thankYouReminderEmails &&
    days !== null &&
    -days >= WINDOWS.thankYou.minDaysAfter &&
    -days <= WINDOWS.thankYou.maxDaysAfter &&
    hasGift &&
    notSent("thankYou")
  ) {
    due.push("thankYou");
  }

  if (
    settings.completionDiscountEnabled &&
    days !== null &&
    -days >= WINDOWS.completionDiscount.minDaysAfter &&
    -days <= WINDOWS.completionDiscount.maxDaysAfter &&
    remainingProductGids(registry.items).length > 0 &&
    notSent("completionDiscount")
  ) {
    due.push("completionDiscount");
  }

  return due;
}

// ---------------------------------------------------------------------------
// Guest opt-in (registry page → POST /remind)
// ---------------------------------------------------------------------------

const UNSUBSCRIBE_PURPOSE = "guest-unsub";

export function mintGuestUnsubscribeToken(reminderId: string): string {
  // No expiry: an unsubscribe link has to keep working.
  return signToken({ p: UNSUBSCRIBE_PURPOSE, g: reminderId });
}

export function readGuestUnsubscribeToken(token: string | null | undefined): string | null {
  const payload = verifyToken<{ p: string; g: string }>(token, UNSUBSCRIBE_PURPOSE);
  return typeof payload?.g === "string" ? payload.g : null;
}

/** Idempotent: a second sign-up with the same email is a no-op. */
export async function addGuestReminder(registryId: string, email: string): Promise<void> {
  const emailHash = blindIndex(email);
  await db.guestReminder.upsert({
    where: { registryId_emailHash: { registryId, emailHash } },
    create: { registryId, emailHash, emailEnc: encrypt(email.trim()) },
    update: {},
  });
}

export async function removeGuestReminder(reminderId: string): Promise<void> {
  await db.guestReminder.deleteMany({ where: { id: reminderId } });
}

/** Whether the registry page should offer the "remind me" sign-up. */
export function offersGuestReminder(
  shop: { plan: string; settings: unknown },
  eventDate: Date | null,
  now: Date = new Date(),
): boolean {
  if (!isPro(shop as { plan: "free" | "pro" })) return false;
  if (!settingsFor(shop as { settings: object }).guestEventReminderEmails) return false;
  return eventDate !== null && daysUntil(eventDate, now) > WINDOWS.guestReminder.minDaysBefore;
}

// ---------------------------------------------------------------------------
// The daily job
// ---------------------------------------------------------------------------

const BATCH = 200;
const PROXY_PREFIX = "/apps/registry";

const registryInclude = {
  items: {
    select: {
      sourceType: true,
      productGid: true,
      desiredQty: true,
      purchasedQty: true,
      snapshotTitle: true,
      purchases: { select: { voidedAt: true, buyerName: true, qty: true } },
    },
  },
  registrants: { select: { emailEnc: true, role: true }, orderBy: { createdAt: "asc" as const } },
  shop: true,
  events: {
    where: { type: { in: Object.values(AUTOMATION_MARKERS) } },
    select: { type: true },
  },
  guestReminders: { where: { sentAt: null }, select: { id: true, emailEnc: true } },
};

export interface AutomationSummary {
  registriesChecked: number;
  sent: Record<AutomationKind, number>;
  failed: number;
}

export async function runRegistryAutomations(now: Date = new Date()): Promise<AutomationSummary> {
  const summary: AutomationSummary = {
    registriesChecked: 0,
    sent: { guestReminder: 0, mostGone: 0, thankYou: 0, completionDiscount: 0 },
    failed: 0,
  };

  const where = {
    status: "active" as const,
    shop: { plan: "pro" as const, uninstalledAt: null },
    OR: [
      {
        eventDate: {
          gte: new Date(now.getTime() - (LOOKBACK_DAYS + 1) * DAY),
          lte: new Date(now.getTime() + (WINDOWS.guestReminder.maxDaysBefore + 1) * DAY),
        },
      },
      // Undated registries can only need the "most items gone" alert, which a
      // purchase triggers — and a purchase bumps updatedAt (touchRegistry).
      { eventDate: null, updatedAt: { gte: new Date(now.getTime() - 2 * DAY) } },
      // Dated registries further out, same reasoning.
      { eventDate: { gt: now }, updatedAt: { gte: new Date(now.getTime() - 2 * DAY) } },
    ],
  };

  let cursor: string | undefined;
  for (;;) {
    const batch = await db.registry.findMany({
      where,
      include: registryInclude,
      orderBy: { id: "asc" },
      take: BATCH,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
    if (batch.length === 0) break;
    cursor = batch[batch.length - 1].id;

    for (const registry of batch) {
      summary.registriesChecked++;
      const settings = settingsFor(registry.shop);
      const due = dueAutomations(
        {
          eventDate: registry.eventDate,
          items: registry.items,
          sent: registry.events.map((e) => e.type),
          guestRemindersPending: registry.guestReminders.length,
        },
        settings,
        now,
      );

      for (const kind of due) {
        try {
          const done = await runOne(kind, registry, settings, now);
          if (done) summary.sent[kind]++;
        } catch (err) {
          summary.failed++;
          console.error(`[automations] ${kind} for ${registry.id} failed:`, (err as Error).message);
        }
      }
    }

    if (batch.length < BATCH) break;
  }

  console.log(`[automations] ${JSON.stringify(summary)}`);
  return summary;
}

type AutomationRegistry = Awaited<
  ReturnType<typeof db.registry.findMany<{ include: typeof registryInclude }>>
>[number];

async function runOne(
  kind: AutomationKind,
  registry: AutomationRegistry,
  settings: ShopSettings,
  now: Date,
): Promise<boolean> {
  switch (kind) {
    case "guestReminder":
      return sendGuestReminders(registry, now);
    case "mostGone":
      return sendMostGone(registry);
    case "thankYou":
      return sendThankYouReminder(registry);
    case "completionDiscount":
      return issueCompletionDiscount(registry, settings, now);
  }
}

function manageUrl(registry: AutomationRegistry): string {
  return absoluteProxyUrl(registry.shop.domain, PROXY_PREFIX, "manage", {
    t: mintManageToken(registry.id),
  });
}

function shopName(registry: AutomationRegistry): string {
  return registry.shop.name ?? registry.shop.domain.replace(".myshopify.com", "");
}

async function ownerEmail(registry: AutomationRegistry, purpose: string): Promise<string | null> {
  const owner = registry.registrants.find((r) => r.role === "owner") ?? registry.registrants[0];
  const email = owner ? registrantEmail(owner) : null;
  if (!email) return null;
  await audit({
    shop: registry.shop.domain,
    actor: "system:automations",
    action: "registrant_email_decrypted",
    subject: registry.id,
    detail: { purpose },
  });
  return email;
}

function remainingCount(registry: AutomationRegistry): number {
  return registry.items.filter((i) => i.purchasedQty < i.desiredQty).length;
}

async function sendGuestReminders(registry: AutomationRegistry, now: Date): Promise<boolean> {
  const days = registry.eventDate ? daysUntil(registry.eventDate, now) : 0;
  const remaining = remainingCount(registry);
  const url = absoluteProxyUrl(registry.shop.domain, PROXY_PREFIX, `r/${registry.slug}`);

  if (registry.guestReminders.length > 0) {
    await audit({
      shop: registry.shop.domain,
      actor: "system:automations",
      action: "guest_reminder_emails_decrypted",
      subject: registry.id,
      detail: { count: registry.guestReminders.length },
    });
  }

  for (const guest of registry.guestReminders) {
    const email = tryDecrypt(guest.emailEnc);
    if (email) {
      await sendEmail("guest-event-reminder", email, {
        registryTitle: registry.title,
        shopName: shopName(registry),
        days,
        remaining,
        url,
        unsubscribeUrl: absoluteProxyUrl(registry.shop.domain, PROXY_PREFIX, "unsubscribe", {
          u: mintGuestUnsubscribeToken(guest.id),
        }),
      });
    }
    await db.guestReminder.update({ where: { id: guest.id }, data: { sentAt: now } });
  }

  // The registrant gets the existing "your event is coming up" nudge too, but
  // only when there's something left to share the link about.
  if (remaining > 0) {
    const email = await ownerEmail(registry, "event_reminder");
    if (email) {
      await sendEmail("event-reminder", email, {
        registryTitle: registry.title,
        remaining,
        url: manageUrl(registry),
      });
    }
  }

  await logEvent(registry.id, AUTOMATION_MARKERS.guestReminder, {
    guests: registry.guestReminders.length,
    days,
  });
  return true;
}

async function sendMostGone(registry: AutomationRegistry): Promise<boolean> {
  const email = await ownerEmail(registry, "most_gone_alert");
  const total = registry.items.length;
  const fulfilled = total - remainingCount(registry);
  if (email) {
    await sendEmail("most-gone", email, {
      registryTitle: registry.title,
      fulfilled,
      total,
      url: manageUrl(registry),
    });
  }
  await logEvent(registry.id, AUTOMATION_MARKERS.mostGone, { fulfilled, total, emailed: !!email });
  return !!email;
}

async function sendThankYouReminder(registry: AutomationRegistry): Promise<boolean> {
  const email = await ownerEmail(registry, "thank_you_reminder");

  const gifts: { item: string; from: string }[] = [];
  for (const item of registry.items) {
    for (const p of item.purchases) {
      if (p.voidedAt) continue;
      gifts.push({ item: item.snapshotTitle ?? "A gift", from: p.buyerName ?? "Someone who didn't leave a name" });
    }
  }

  if (email) {
    const token = mintManageToken(registry.id);
    await sendEmail("thank-you-reminder", email, {
      registryTitle: registry.title,
      gifts: gifts.slice(0, 40),
      moreCount: Math.max(0, gifts.length - 40),
      csvUrl: absoluteProxyUrl(registry.shop.domain, PROXY_PREFIX, "thank-you.csv", { t: token }),
      url: absoluteProxyUrl(registry.shop.domain, PROXY_PREFIX, "manage", { t: token }),
    });
  }
  await logEvent(registry.id, AUTOMATION_MARKERS.thankYou, { gifts: gifts.length, emailed: !!email });
  return !!email;
}

async function issueCompletionDiscount(
  registry: AutomationRegistry,
  settings: ShopSettings,
  now: Date,
): Promise<boolean> {
  const email = await ownerEmail(registry, "completion_discount");
  // Nobody to give the code to: don't create one.
  if (!email) {
    await logEvent(registry.id, AUTOMATION_MARKERS.completionDiscount, { skipped: "no_email" });
    return false;
  }

  const productGids = remainingProductGids(registry.items);
  const code = completionDiscountCode();
  const endsAt = new Date(now.getTime() + settings.completionDiscountValidDays * DAY);

  const { admin } = await unauthenticated.admin(registry.shop.domain);
  let result;
  try {
    result = await createCompletionDiscount((query, options) => admin.graphql(query, options), {
      code,
      registryTitle: registry.title,
      percent: settings.completionDiscountPercent,
      productGids,
      startsAt: now,
      endsAt,
    });
  } catch (err) {
    result = { ok: false as const, reason: (err as Error).message };
  }

  if (!result.ok) {
    // Not marked as issued, so tomorrow's run tries again until the window
    // closes. Most likely cause: the shop hasn't approved write_discounts yet.
    await logEvent(registry.id, "completion_discount_failed", { reason: result.reason });
    throw new Error(result.reason);
  }

  await logEvent(registry.id, AUTOMATION_MARKERS.completionDiscount, {
    code,
    discountId: result.discountId,
    percent: settings.completionDiscountPercent,
    products: productGids.length,
    endsAt: endsAt.toISOString(),
  });

  await sendEmail("completion-discount", email, {
    registryTitle: registry.title,
    shopName: shopName(registry),
    code,
    percent: settings.completionDiscountPercent,
    remaining: registry.items.filter(
      (i) => i.sourceType === "internal" && i.productGid && i.purchasedQty < i.desiredQty,
    ).length,
    endsOn: endsAt.toISOString().slice(0, 10),
    url: manageUrl(registry),
  });
  return true;
}

registerHandler("registry-automations", async () => {
  await runRegistryAutomations();
});

export const __testables = { WINDOWS };
