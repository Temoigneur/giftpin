import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../db.server", () => ({
  default: {
    registry: { findMany: vi.fn() },
    registryEvent: { create: vi.fn() },
    guestReminder: { update: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() },
    auditLog: { create: vi.fn() },
  },
}));
vi.mock("../../shopify.server", () => ({ unauthenticated: { admin: vi.fn() } }));
vi.mock("../../lib/queue.server", () => ({ registerHandler: vi.fn(), enqueue: vi.fn() }));

import db from "../../db.server";
import { enqueue } from "../../lib/queue.server";
import { unauthenticated } from "../../shopify.server";
import { encrypt } from "../../lib/crypto.server";
import { SHOP_SETTINGS_DEFAULTS, type ShopSettings } from "../../shared/settings";
import {
  AUTOMATION_MARKERS,
  daysUntil,
  dueAutomations,
  mintGuestUnsubscribeToken,
  offersGuestReminder,
  readGuestUnsubscribeToken,
  remainingProductGids,
  runRegistryAutomations,
  type PlannerRegistry,
} from "../automations.server";
import { completionDiscountInput } from "../../lib/discounts.server";

const NOW = new Date("2026-09-24T15:00:00Z");
const DAY = 86_400_000;
const at = (days: number) => new Date(Date.UTC(2026, 8, 24) + days * DAY);

const settings: ShopSettings = { ...SHOP_SETTINGS_DEFAULTS, completionDiscountEnabled: true };

function item(over: Partial<PlannerRegistry["items"][number]> = {}): PlannerRegistry["items"][number] {
  return {
    sourceType: "internal",
    productGid: "gid://shopify/Product/1",
    desiredQty: 1,
    purchasedQty: 0,
    purchases: [],
    ...over,
  };
}

const bought = (over: Partial<PlannerRegistry["items"][number]> = {}) =>
  item({ purchasedQty: 1, purchases: [{ voidedAt: null }], ...over });

function registry(over: Partial<PlannerRegistry> = {}): PlannerRegistry {
  return { eventDate: null, items: [], sent: [], guestRemindersPending: 0, ...over };
}

describe("daysUntil", () => {
  it("counts calendar days in UTC, ignoring the time of day", () => {
    expect(daysUntil(at(14), NOW)).toBe(14);
    expect(daysUntil(at(0), NOW)).toBe(0);
    expect(daysUntil(at(-3), NOW)).toBe(-3);
  });
});

describe("dueAutomations", () => {
  it("sends the guest reminder inside the two-week window only", () => {
    expect(dueAutomations(registry({ eventDate: at(14) }), settings, NOW)).toContain("guestReminder");
    expect(dueAutomations(registry({ eventDate: at(2) }), settings, NOW)).toContain("guestReminder");
    expect(dueAutomations(registry({ eventDate: at(15) }), settings, NOW)).not.toContain("guestReminder");
    expect(dueAutomations(registry({ eventDate: at(1) }), settings, NOW)).not.toContain("guestReminder");
  });

  it("never sends the same automation twice", () => {
    const r = registry({ eventDate: at(10), sent: [AUTOMATION_MARKERS.guestReminder] });
    expect(dueAutomations(r, settings, NOW)).not.toContain("guestReminder");
  });

  it("respects the merchant's switches", () => {
    const off = { ...settings, guestEventReminderEmails: false };
    expect(dueAutomations(registry({ eventDate: at(10) }), off, NOW)).not.toContain("guestReminder");
  });

  it("alerts when three quarters of a list of 3+ items is bought", () => {
    const three = registry({ items: [bought(), bought(), bought(), item()] });
    expect(dueAutomations(three, settings, NOW)).toContain("mostGone");
    const half = registry({ items: [bought(), bought(), item(), item()] });
    expect(dueAutomations(half, settings, NOW)).not.toContain("mostGone");
    const tiny = registry({ items: [bought(), bought()] });
    expect(dueAutomations(tiny, settings, NOW)).not.toContain("mostGone");
  });

  it("doesn't send the most-gone alert after the event", () => {
    const r = registry({ eventDate: at(-1), items: [bought(), bought(), bought()] });
    expect(dueAutomations(r, settings, NOW)).not.toContain("mostGone");
  });

  it("sends the thank-you reminder after the event only if a gift was bought", () => {
    expect(dueAutomations(registry({ eventDate: at(-2), items: [bought()] }), settings, NOW)).toContain("thankYou");
    expect(dueAutomations(registry({ eventDate: at(-1), items: [bought()] }), settings, NOW)).not.toContain("thankYou");
    expect(dueAutomations(registry({ eventDate: at(-5), items: [item()] }), settings, NOW)).not.toContain("thankYou");
    const voided = item({ purchases: [{ voidedAt: NOW }] });
    expect(dueAutomations(registry({ eventDate: at(-5), items: [voided] }), settings, NOW)).not.toContain("thankYou");
  });

  it("issues the completion discount 3 to 30 days after, when store products remain", () => {
    const r = (days: number, items = [item()]) => registry({ eventDate: at(days), items });
    expect(dueAutomations(r(-3), settings, NOW)).toContain("completionDiscount");
    expect(dueAutomations(r(-30), settings, NOW)).toContain("completionDiscount");
    expect(dueAutomations(r(-2), settings, NOW)).not.toContain("completionDiscount");
    expect(dueAutomations(r(-31), settings, NOW)).not.toContain("completionDiscount");
    // Only external items left: nothing for the merchant's code to cover.
    expect(
      dueAutomations(r(-5, [bought(), item({ sourceType: "web", productGid: null })]), settings, NOW),
    ).not.toContain("completionDiscount");
  });

  it("keeps the completion discount off unless the merchant turned it on", () => {
    const r = registry({ eventDate: at(-5), items: [item()] });
    expect(dueAutomations(r, SHOP_SETTINGS_DEFAULTS, NOW)).not.toContain("completionDiscount");
  });
});

describe("remainingProductGids", () => {
  it("lists each unbought store product once", () => {
    expect(
      remainingProductGids([
        item({ productGid: "gid://shopify/Product/1" }),
        item({ productGid: "gid://shopify/Product/1" }),
        bought({ productGid: "gid://shopify/Product/2" }),
        item({ sourceType: "manual", productGid: null }),
      ]),
    ).toEqual(["gid://shopify/Product/1"]);
  });
});

describe("guest reminder sign-up", () => {
  const pro = { plan: "pro", settings: {} };
  it("is offered on Pro, with a date more than two days out", () => {
    expect(offersGuestReminder(pro, at(20), NOW)).toBe(true);
    expect(offersGuestReminder(pro, at(2), NOW)).toBe(false);
    expect(offersGuestReminder(pro, null, NOW)).toBe(false);
    expect(offersGuestReminder({ plan: "free", settings: {} }, at(20), NOW)).toBe(false);
    expect(offersGuestReminder({ plan: "pro", settings: { guestEventReminderEmails: false } }, at(20), NOW)).toBe(false);
  });

  it("round-trips the unsubscribe token and rejects others", () => {
    expect(readGuestUnsubscribeToken(mintGuestUnsubscribeToken("gr_1"))).toBe("gr_1");
    expect(readGuestUnsubscribeToken("nonsense")).toBeNull();
  });
});

describe("completionDiscountInput", () => {
  it("builds a single-use percentage code limited to the given products", () => {
    const input = completionDiscountInput({
      code: "THANKS-ABC",
      registryTitle: "Sam & Alex",
      percent: 15,
      productGids: ["gid://shopify/Product/1"],
      startsAt: NOW,
      endsAt: at(60),
    }) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(input.code).toBe("THANKS-ABC");
    expect(input.usageLimit).toBe(1);
    expect(input.customerGets.value.percentage).toBeCloseTo(0.15);
    expect(input.customerGets.items.products.productsToAdd).toEqual(["gid://shopify/Product/1"]);
    expect(input.customerSelection).toBeUndefined();
  });
});

describe("runRegistryAutomations", () => {
  beforeEach(() => vi.clearAllMocks());

  function dbRegistry(over: Record<string, unknown> = {}) {
    return {
      id: "reg_1",
      slug: "abc",
      title: "Sam & Alex",
      eventDate: at(-5),
      shop: { domain: "demo.myshopify.com", name: "Demo", plan: "pro", settings: { completionDiscountEnabled: true } },
      registrants: [{ emailEnc: encrypt("sam@example.com"), role: "owner" }],
      items: [
        { ...bought(), snapshotTitle: "Toaster", purchases: [{ voidedAt: null, buyerName: "Taylor", qty: 1 }] },
        { ...item({ productGid: "gid://shopify/Product/9" }), snapshotTitle: "Kettle" },
      ],
      events: [],
      guestReminders: [],
      ...over,
    };
  }

  it("creates the discount, records it, and emails the code", async () => {
    vi.mocked(db.registry.findMany).mockResolvedValueOnce([dbRegistry()] as never);
    const graphql = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { discountCodeBasicCreate: { codeDiscountNode: { id: "gid://d/1" }, userErrors: [] } } })),
    );
    vi.mocked(unauthenticated.admin).mockResolvedValue({ admin: { graphql } } as never);

    const summary = await runRegistryAutomations(NOW);

    expect(summary.sent.completionDiscount).toBe(1);
    expect(summary.sent.thankYou).toBe(1);
    const variables = graphql.mock.calls[0][1].variables.input;
    expect(variables.customerGets.items.products.productsToAdd).toEqual(["gid://shopify/Product/9"]);

    const types = vi.mocked(db.registryEvent.create).mock.calls.map((c) => c[0].data.type);
    expect(types).toContain(AUTOMATION_MARKERS.completionDiscount);
    const templates = vi.mocked(enqueue).mock.calls.map((c) => (c[1] as { template: string }).template);
    expect(templates).toEqual(expect.arrayContaining(["completion-discount", "thank-you-reminder"]));
  });

  it("doesn't mark the discount issued when Shopify refuses it", async () => {
    vi.mocked(db.registry.findMany).mockResolvedValueOnce([dbRegistry()] as never);
    const graphql = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { discountCodeBasicCreate: { codeDiscountNode: null, userErrors: [{ message: "Access denied" }] } } })),
    );
    vi.mocked(unauthenticated.admin).mockResolvedValue({ admin: { graphql } } as never);

    const summary = await runRegistryAutomations(NOW);

    expect(summary.sent.completionDiscount).toBe(0);
    expect(summary.failed).toBe(1);
    const types = vi.mocked(db.registryEvent.create).mock.calls.map((c) => c[0].data.type);
    expect(types).not.toContain(AUTOMATION_MARKERS.completionDiscount);
    expect(types).toContain("completion_discount_failed");
    const templates = vi.mocked(enqueue).mock.calls.map((c) => (c[1] as { template: string }).template);
    expect(templates).not.toContain("completion-discount");
  });

  it("emails opted-in guests with an unsubscribe link and marks them sent", async () => {
    vi.mocked(db.registry.findMany).mockResolvedValueOnce([
      dbRegistry({
        eventDate: at(14),
        guestReminders: [{ id: "gr_1", emailEnc: encrypt("guest@example.com") }],
      }),
    ] as never);

    const summary = await runRegistryAutomations(NOW);

    expect(summary.sent.guestReminder).toBe(1);
    const guestMail = vi
      .mocked(enqueue)
      .mock.calls.map((c) => c[1] as { template: string; to: string; data: { unsubscribeUrl: string } })
      .find((p) => p.template === "guest-event-reminder");
    expect(guestMail?.to).toBe("guest@example.com");
    expect(guestMail?.data.unsubscribeUrl).toContain("/apps/registry/unsubscribe?u=");
    expect(db.guestReminder.update).toHaveBeenCalledWith({ where: { id: "gr_1" }, data: { sentAt: NOW } });
  });

  it("only looks at Pro shops", async () => {
    vi.mocked(db.registry.findMany).mockResolvedValueOnce([] as never);
    await runRegistryAutomations(NOW);
    const where = vi.mocked(db.registry.findMany).mock.calls[0][0]!.where as { shop: { plan: string } };
    expect(where.shop.plan).toBe("pro");
  });

  it("can be limited to one shop for the Settings page's Run now", async () => {
    vi.mocked(db.registry.findMany).mockResolvedValueOnce([] as never);
    await runRegistryAutomations(NOW, "demo.myshopify.com");
    const where = vi.mocked(db.registry.findMany).mock.calls[0][0]!.where as { shop: { domain: string } };
    expect(where.shop.domain).toBe("demo.myshopify.com");
  });
});
