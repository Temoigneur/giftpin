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
    shop: {
      update: vi.fn(),
      updateMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import db from "../../db.server";
import {
  foundingOfferEligible,
  isPro,
  markUninstalled,
  planFromSubscriptionStatus,
  requireShop,
  setPlanFromSubscription,
  upsertShop,
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

describe("requireShop", () => {
  const domain = "new-shop.myshopify.com";
  const uniqueViolation = Object.assign(new Error("Unique constraint failed"), { code: "P2002" });

  it("returns the existing row", async () => {
    vi.mocked(db.shop.findUnique).mockResolvedValueOnce({ domain } as never);
    await expect(requireShop(domain)).resolves.toEqual({ domain });
    expect(db.shop.create).not.toHaveBeenCalled();
  });

  // First open after install: app.tsx's upsert and the page loader run in
  // parallel, so the page can arrive before the row exists. That was a 500.
  it("creates the row instead of throwing when it doesn't exist yet", async () => {
    vi.mocked(db.shop.findUnique).mockResolvedValueOnce(null);
    vi.mocked(db.shop.create).mockResolvedValueOnce({ domain, plan: "free" } as never);
    await expect(requireShop(domain)).resolves.toEqual({ domain, plan: "free" });
    expect(db.shop.create).toHaveBeenCalledWith({ data: { domain } });
  });

  it("returns the winner's row when it loses the create race", async () => {
    vi.mocked(db.shop.findUnique)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ domain, name: "Winner" } as never);
    vi.mocked(db.shop.create).mockRejectedValueOnce(uniqueViolation);
    await expect(requireShop(domain)).resolves.toEqual({ domain, name: "Winner" });
  });

  it("rethrows anything that isn't a unique violation", async () => {
    vi.mocked(db.shop.findUnique).mockResolvedValueOnce(null);
    vi.mocked(db.shop.create).mockRejectedValueOnce(new Error("db down"));
    await expect(requireShop(domain)).rejects.toThrow("db down");
  });
});

describe("upsertShop", () => {
  it("retries once when a parallel create wins the insert", async () => {
    const uniqueViolation = Object.assign(new Error("Unique constraint failed"), { code: "P2002" });
    vi.mocked(db.shop.upsert)
      .mockRejectedValueOnce(uniqueViolation)
      .mockResolvedValueOnce({ domain: "s.myshopify.com" } as never);
    await expect(upsertShop("s.myshopify.com", { name: "S" })).resolves.toEqual({ domain: "s.myshopify.com" });
    expect(db.shop.upsert).toHaveBeenCalledTimes(2);
  });
});

describe("foundingOfferEligible", () => {
  const start = new Date("2026-10-23T04:00:00Z");
  const mockedCount = vi.mocked(db.shop.count);

  it("leaves out stores installed before the offer started, without querying", async () => {
    mockedCount.mockClear();
    expect(await foundingOfferEligible({ installedAt: new Date(start.getTime() - 1) })).toBe(false);
    expect(mockedCount).not.toHaveBeenCalled();
  });

  it("gives the first ten stores installed since the start a slot", async () => {
    mockedCount.mockResolvedValueOnce(9);
    expect(await foundingOfferEligible({ installedAt: start })).toBe(true);
    expect(mockedCount).toHaveBeenLastCalledWith({
      where: { installedAt: { gte: start, lt: start } },
    });
  });

  it("doesn't give the eleventh store a slot", async () => {
    mockedCount.mockResolvedValueOnce(10);
    expect(await foundingOfferEligible({ installedAt: new Date(start.getTime() + 1000) })).toBe(
      false,
    );
  });
});
