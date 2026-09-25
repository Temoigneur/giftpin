import { describe, it, expect, vi } from "vitest";

/**
 * "New customers" counted every buyer as new, because the order webhook no
 * longer sends customer.orders_count (25 Sep 2026: one buyer, two orders, both
 * "new"). isFirstPurchase() now goes by when the customer record was created.
 */

vi.mock("../../db.server", () => ({ default: {} }));
vi.mock("../../shopify.server", () => ({ unauthenticated: { admin: vi.fn() } }));
vi.mock("../../lib/queue.server", () => ({ registerHandler: vi.fn() }));
vi.mock("../../lib/email.server", () => ({ sendEmail: vi.fn() }));
vi.mock("../../lib/audit.server", () => ({ audit: vi.fn() }));

import { isFirstPurchase } from "../purchase.server";

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
