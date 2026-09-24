import { describe, it, expect, vi } from "vitest";

vi.mock("../../db.server", () => ({ default: {} }));

import { buildReport, bucketsFor, buildMonthlySales, parseRange, type AnalyticsRows } from "../analytics.server";

const NOW = new Date("2026-09-24T15:00:00Z");
const at = (iso: string) => new Date(iso);

function rows(partial: Partial<AnalyticsRows>): AnalyticsRows {
  return { registries: [], items: [], purchases: [], ...partial };
}

function purchase(createdAt: string, source: string, qty = 1, extra: Partial<AnalyticsRows["purchases"][number]> = {}) {
  return { createdAt: at(createdAt), source, qty, amount: "25.00", isNewCustomer: false, orderId: null, ...extra };
}

describe("parseRange", () => {
  it("accepts the three ranges and defaults to 90", () => {
    expect(parseRange("30")).toBe(30);
    expect(parseRange("365")).toBe(365);
    expect(parseRange(null)).toBe(90);
    expect(parseRange("7")).toBe(90);
    expect(parseRange("abc")).toBe(90);
  });
});

describe("bucketsFor", () => {
  it("30 days is 30 daily buckets ending today (UTC)", () => {
    const { starts, granularity, previousStart } = bucketsFor(30, NOW);
    expect(granularity).toBe("day");
    expect(starts).toHaveLength(30);
    expect(starts[29].toISOString()).toBe("2026-09-24T00:00:00.000Z");
    expect(starts[0].toISOString()).toBe("2026-08-26T00:00:00.000Z");
    expect(previousStart.toISOString()).toBe("2026-07-27T00:00:00.000Z");
  });

  it("90 days is 13 weekly buckets, the last one containing today", () => {
    const { starts, granularity } = bucketsFor(90, NOW);
    expect(granularity).toBe("week");
    expect(starts).toHaveLength(13);
    const last = starts[12].getTime();
    expect(NOW.getTime()).toBeGreaterThanOrEqual(last);
    expect(NOW.getTime()).toBeLessThan(last + 7 * 86_400_000);
  });

  it("365 days is 12 calendar months ending with this one", () => {
    const { starts, granularity, previousStart } = bucketsFor(365, NOW);
    expect(granularity).toBe("month");
    expect(starts).toHaveLength(12);
    expect(starts[0].toISOString()).toBe("2025-10-01T00:00:00.000Z");
    expect(starts[11].toISOString()).toBe("2026-09-01T00:00:00.000Z");
    expect(previousStart.toISOString()).toBe("2024-10-01T00:00:00.000Z");
  });
});

describe("buildReport", () => {
  it("counts registries, items and gifts into the right buckets", () => {
    const report = buildReport(
      rows({
        registries: [
          { createdAt: at("2026-09-24T01:00:00Z"), eventType: "wedding" },
          { createdAt: at("2026-09-23T23:59:00Z"), eventType: "baby" },
          { createdAt: at("2026-08-26T00:00:00Z"), eventType: "wedding" },
        ],
        items: [
          { createdAt: at("2026-09-24T02:00:00Z"), payload: { sourceType: "internal" } },
          { createdAt: at("2026-09-24T03:00:00Z"), payload: { sourceType: "external", domain: "amazon.com" } },
        ],
        purchases: [purchase("2026-09-20T12:00:00Z", "online", 2)],
      }),
      30,
      "CAD",
      NOW,
    );

    expect(report.totals.registriesCreated).toBe(3);
    expect(report.series[29].registries).toBe(1);
    expect(report.series[28].registries).toBe(1);
    expect(report.series[0].registries).toBe(1);
    expect(report.totals.itemsAdded).toBe(2);
    expect(report.totals.itemsAddedInternal).toBe(1);
    expect(report.series[29].items).toBe(2);
    expect(report.totals.giftsCredited).toBe(2);
    expect(report.series[25].gifts).toBe(2);
    expect(report.currency).toBe("CAD");
    expect(report.registriesByEventType).toEqual([
      { eventType: "wedding", count: 2 },
      { eventType: "baby", count: 1 },
    ]);
  });

  it("puts the window before the period into `previous`, not the series", () => {
    const report = buildReport(
      rows({
        registries: [
          { createdAt: at("2026-08-10T00:00:00Z"), eventType: "wedding" },
          // Older than the previous window: ignored entirely.
          { createdAt: at("2026-01-01T00:00:00Z"), eventType: "wedding" },
        ],
        purchases: [purchase("2026-08-10T00:00:00Z", "online", 1, { isNewCustomer: true, orderId: "o1" })],
      }),
      30,
      "USD",
      NOW,
    );

    expect(report.totals.registriesCreated).toBe(0);
    expect(report.previous.registriesCreated).toBe(1);
    expect(report.previous.giftsCredited).toBe(1);
    expect(report.previous.revenue).toBe(25);
    expect(report.previous.newCustomers).toBe(1);
    expect(report.series.every((b) => b.registries === 0 && b.gifts === 0)).toBe(true);
    expect(report.registriesByEventType).toEqual([]);
  });

  it("splits gifts by source and counts revenue and new customers only for in-store purchases", () => {
    const report = buildReport(
      rows({
        purchases: [
          purchase("2026-09-20T00:00:00Z", "online", 1, { isNewCustomer: true, orderId: "o1" }),
          purchase("2026-09-20T00:00:00Z", "online", 1, { isNewCustomer: true, orderId: "o1" }),
          purchase("2026-09-21T00:00:00Z", "pos", 1),
          purchase("2026-09-21T00:00:00Z", "external", 3, { amount: "999.00" }),
          purchase("2026-09-22T00:00:00Z", "manual", 1, { amount: null }),
        ],
      }),
      30,
      "USD",
      NOW,
    );

    expect(report.giftsBySource).toEqual({ store: 3, elsewhere: 3, markedByRegistrant: 1 });
    expect(report.totals.giftsCredited).toBe(7);
    expect(report.totals.revenue).toBe(75);
    // Two lines on one order are one new customer.
    expect(report.totals.newCustomers).toBe(1);
  });

  it("buckets by calendar month for the 12-month range", () => {
    const report = buildReport(
      rows({
        registries: [
          { createdAt: at("2025-10-01T00:00:00Z"), eventType: "wedding" },
          { createdAt: at("2026-09-01T00:00:00Z"), eventType: "wedding" },
          { createdAt: at("2026-08-31T23:59:59Z"), eventType: "wedding" },
        ],
      }),
      365,
      "USD",
      NOW,
    );
    expect(report.series.map((b) => b.registries)).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1]);
  });

  it("ignores rows timestamped after now", () => {
    const report = buildReport(
      rows({ registries: [{ createdAt: at("2026-09-25T00:00:00Z"), eventType: "wedding" }] }),
      30,
      "USD",
      NOW,
    );
    expect(report.totals.registriesCreated).toBe(0);
  });
});

describe("buildMonthlySales", () => {
  const sale = (createdAt: string, extra: Record<string, unknown> = {}) => ({
    id: `p_${Math.random()}`,
    createdAt: at(createdAt),
    source: "online",
    amount: "25.00",
    isNewCustomer: false,
    orderId: "gid://shopify/Order/1",
    ...extra,
  });

  it("is 12 calendar months ending with this one, oldest first, zeros included", () => {
    const months = buildMonthlySales([], NOW);
    expect(months).toHaveLength(12);
    expect(months[0].month).toBe("2025-10-01T00:00:00.000Z");
    expect(months[11].month).toBe("2026-09-01T00:00:00.000Z");
    expect(months[11]).toMatchObject({ revenue: 0, orders: 0, newCustomers: 0, averageOrder: 0 });
  });

  it("counts distinct orders, new-customer orders once, and averages revenue per order", () => {
    const months = buildMonthlySales(
      [
        // Two gift lines on one order from a new customer.
        sale("2026-09-02T10:00:00Z", { orderId: "o1", amount: "40.00", isNewCustomer: true }),
        sale("2026-09-02T10:00:00Z", { orderId: "o1", amount: "20.00", isNewCustomer: true }),
        sale("2026-09-10T10:00:00Z", { orderId: "o2", amount: "30.00" }),
        sale("2026-08-31T23:59:59Z", { orderId: "o3", amount: "10.50" }),
      ],
      NOW,
    );
    expect(months[11]).toMatchObject({ revenue: 90, orders: 2, newCustomers: 1, averageOrder: 45 });
    expect(months[10]).toMatchObject({ revenue: 10.5, orders: 1, averageOrder: 10.5 });
  });

  it("leaves out gifts that earned the store nothing, and anything outside the 12 months", () => {
    const months = buildMonthlySales(
      [
        sale("2026-09-05T00:00:00Z", { source: "external", orderId: null }),
        sale("2026-09-05T00:00:00Z", { source: "manual", orderId: null }),
        sale("2025-09-30T23:59:59Z", { orderId: "old" }),
        sale("2026-09-25T00:00:00Z", { orderId: "future" }),
      ],
      NOW,
    );
    expect(months.reduce((n, m) => n + m.orders, 0)).toBe(0);
  });

  it("treats a purchase with no order id as its own order", () => {
    const months = buildMonthlySales(
      [sale("2026-09-05T00:00:00Z", { source: "pos", orderId: null }), sale("2026-09-06T00:00:00Z", { source: "pos", orderId: null })],
      NOW,
    );
    expect(months[11].orders).toBe(2);
  });
});
