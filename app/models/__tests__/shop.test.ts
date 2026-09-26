import { describe, it, expect, vi } from "vitest";

/**
 * Billing plan logic — see app/routes/app.billing.tsx and
 * app/routes/webhooks.app_subscriptions.update.tsx. The mapping from a
 * Shopify subscription status to our cached plan is the one piece of this
 * that's pure and worth pinning down with a test; db.server is mocked so
 * this stays a fast unit test with no real database.
 */

vi.mock("../../db.server", () => ({
  default: {
    shop: { update: vi.fn(), updateMany: vi.fn() },
  },
}));

import db from "../../db.server";
import {
  isPro,
  markUninstalled,
  planFromSubscriptionStatus,
  setPlanFromSubscription,
} from "../shop.server";

const mockedUpdate = vi.mocked(db.shop.update);

describe("planFromSubscriptionStatus", () => {
  it("maps ACTIVE to pro", () => {
    expect(planFromSubscriptionStatus("ACTIVE")).toBe("pro");
  });

  it("maps everything else to free", () => {
    // CANCELLED, EXPIRED, FROZEN, PENDING, DECLINED per Shopify's
    // AppSubscriptionStatus enum — none of these should leave a shop
    // billed-for-nothing on Pro.
    for (const status of ["CANCELLED", "EXPIRED", "FROZEN", "PENDING", "DECLINED", "", "SOMETHING_UNKNOWN"]) {
      expect(planFromSubscriptionStatus(status)).toBe("free");
    }
  });
});

describe("isPro", () => {
  it("is true only for the pro plan", () => {
    expect(isPro({ plan: "pro" } as never)).toBe(true);
    expect(isPro({ plan: "free" } as never)).toBe(false);
  });
});

describe("setPlanFromSubscription", () => {
  it("stores the charge id when the subscription is active", async () => {
    mockedUpdate.mockResolvedValueOnce({} as never);
    await setPlanFromSubscription("shop.myshopify.com", "ACTIVE", "gid://shopify/AppSubscription/1");

    expect(mockedUpdate).toHaveBeenCalledWith({
      where: { domain: "shop.myshopify.com" },
      data: expect.objectContaining({
        plan: "pro",
        shopifyChargeId: "gid://shopify/AppSubscription/1",
      }),
    });
  });

  it("clears the charge id when the subscription is no longer active", async () => {
    // A stale id here is exactly what would let a later billing.cancel()
    // call target a subscription that isn't the shop's current one.
    mockedUpdate.mockResolvedValueOnce({} as never);
    await setPlanFromSubscription("shop.myshopify.com", "CANCELLED", "gid://shopify/AppSubscription/1");

    expect(mockedUpdate).toHaveBeenCalledWith({
      where: { domain: "shop.myshopify.com" },
      data: expect.objectContaining({ plan: "free", shopifyChargeId: null }),
    });
  });
});

describe("markUninstalled", () => {
  it("drops the cached plan so a reinstall starts on Free with no stale charge id", async () => {
    const mockedUpdateMany = vi.mocked(db.shop.updateMany);
    mockedUpdateMany.mockClear();
    await markUninstalled("a.myshopify.com");
    const data = mockedUpdateMany.mock.calls[0][0].data as Record<string, unknown>;
    expect(data.plan).toBe("free");
    expect(data.shopifyChargeId).toBeNull();
    expect(data.uninstalledAt).toBeInstanceOf(Date);
  });
});
