import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * "New customers" counted every buyer as new, because the order webhook no
 * longer sends customer.orders_count (25 Sep 2026: one buyer, two orders, both
 * "new"). isFirstPurchase() now goes by when the customer record was created.
 */

const create = vi.fn();
vi.mock("../../db.server", () => ({
  default: {
    shop: { findUnique: vi.fn(async () => ({ id: "shop_1", currency: "CAD", settings: {} })) },
    registryItem: { findFirst: vi.fn(async () => ({ id: "item_1", registry: { id: "reg_1", eventDate: null, registrants: [], shipToRegistrant: false }, desiredQty: 1 })) },
    purchase: { findFirst: vi.fn() },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<void>) => fn({ purchase: { create }, registryItem: { update: vi.fn() } })),
  },
}));
vi.mock("../../shopify.server", () => ({ unauthenticated: { admin: vi.fn() } }));
vi.mock("../../lib/queue.server", () => ({ registerHandler: vi.fn() }));
vi.mock("../../lib/email.server", () => ({ sendEmail: vi.fn() }));
vi.mock("../../lib/audit.server", () => ({ audit: vi.fn() }));
vi.mock("../registry.server", async (orig) => ({
  ...(await orig<typeof import("../registry.server")>()),
  logEvent: vi.fn(),
  touchRegistry: vi.fn(async () => undefined),
}));

import db from "../../db.server";
import { attributeOrder, isFirstPurchase } from "../purchase.server";
import { signAttribution } from "../../lib/attribution";

const ORDER_AT = "2026-09-25T21:41:37-04:00";

describe("isFirstPurchase", () => {
  it("counts a buyer whose customer record was created with this order", () => {
    expect(isFirstPurchase({ created_at: ORDER_AT, customer: { id: 1, created_at: "2026-09-25T21:41:30-04:00" } })).toBe(true);
  });

  it("does not count a buyer whose record is older than a day", () => {
    expect(isFirstPurchase({ created_at: ORDER_AT, customer: { id: 1, created_at: "2026-09-20T10:00:00-04:00" } })).toBe(false);
  });

  it("uses orders_count when a payload still has it", () => {
    expect(isFirstPurchase({ created_at: ORDER_AT, customer: { id: 1, orders_count: 1, created_at: "2020-01-01T00:00:00Z" } })).toBe(true);
    expect(isFirstPurchase({ created_at: ORDER_AT, customer: { id: 1, orders_count: 3 } })).toBe(false);
  });

  it("does not count a buyer it can't tell about", () => {
    expect(isFirstPurchase({ created_at: ORDER_AT, customer: { id: 1 } })).toBe(false);
    expect(isFirstPurchase({ created_at: ORDER_AT, customer: null })).toBe(false);
    expect(isFirstPurchase({ created_at: ORDER_AT })).toBe(false);
  });
});

describe("attributeOrder new-customer flag", () => {
  // 25 Sep 2026: a fresh buyer's second order, two minutes after the first,
  // still has a brand-new customer record, so it must be ruled out another way.
  const payload = {
    id: 2,
    admin_graphql_api_id: "gid://shopify/Order/2",
    created_at: "2026-09-25T18:00:55-04:00",
    customer: { id: 42, created_at: "2026-09-25T17:58:10-04:00" },
    line_items: [{ id: 200, quantity: 1, price: "10.00", properties: [{ name: "_rg", value: signAttribution("reg_1", "item_1") }] }],
  };

  beforeEach(() => create.mockClear());

  it("counts a fresh buyer's first order as new", async () => {
    vi.mocked(db.purchase.findFirst).mockResolvedValue(null);
    await attributeOrder("shop.myshopify.com", payload);
    expect(create.mock.calls[0][0].data.isNewCustomer).toBe(true);
  });

  it("does not count their next order as new", async () => {
    vi.mocked(db.purchase.findFirst).mockResolvedValue({ id: "p_1" } as never);
    await attributeOrder("shop.myshopify.com", payload);
    expect(create.mock.calls[0][0].data.isNewCustomer).toBe(false);
    expect(vi.mocked(db.purchase.findFirst).mock.calls[0][0]?.where).toEqual({
      buyerCustomerId: "42",
      orderId: { not: "gid://shopify/Order/2" },
    });
  });
});
