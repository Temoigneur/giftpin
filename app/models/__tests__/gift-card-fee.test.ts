import { describe, it, expect, vi, beforeEach } from "vitest";

/** Giftpin's 2% fee on gift cards sold through the giftpin.app listing. */

vi.mock("../../db.server", () => ({
  default: { giftCardSale: { findMany: vi.fn(), update: vi.fn() } },
}));
vi.mock("../../shopify.server", () => ({ unauthenticated: { admin: vi.fn() } }));

import db from "../../db.server";
import { chargeGiftCardFees, decideFee, feeFor, fxRate, readSubscription, type FeeDeps } from "../gift-card-fee.server";

const DAY = 86_400_000;
const NOW = new Date("2026-12-01T12:00:00Z");
const sub = (overrides: Partial<{ usageLineItemId: string | null; createdAt: Date; trialDays: number }> = {}) => ({
  usageLineItemId: "gid://shopify/AppSubscriptionLineItem/9?v=1&index=1",
  usageCurrency: "USD",
  createdAt: new Date(NOW.getTime() - 100 * DAY),
  trialDays: 14,
  ...overrides,
});

describe("decideFee", () => {
  const sale = { amount: 100, createdAt: new Date(NOW.getTime() - 20 * DAY), voided: false };
  const shop = { pro: true, uninstalled: false };

  it("charges 2% after the trial", () => {
    expect(decideFee(sale, shop, sub())).toEqual({ status: "charge", fee: 2 });
  });

  it("never charges a refunded card", () => {
    expect(decideFee({ ...sale, voided: true }, shop, sub()).status).toBe("waived_voided");
  });

  it("waives sales made during a free trial, which covers a founding store's free year", () => {
    const founding = sub({ createdAt: new Date(NOW.getTime() - 200 * DAY), trialDays: 365 });
    expect(decideFee(sale, shop, founding).status).toBe("waived_trial");
  });

  it("waives when there is nothing to bill", () => {
    expect(decideFee(sale, { pro: false, uninstalled: false }, sub()).status).toBe("waived_not_pro");
    expect(decideFee(sale, { pro: true, uninstalled: true }, sub()).status).toBe("waived_not_pro");
    expect(decideFee(sale, shop, null).status).toBe("waived_not_pro");
    expect(decideFee(sale, shop, sub({ usageLineItemId: null })).status).toBe("waived_no_usage_line");
  });

  it("rounds the fee to the cent", () => {
    expect(feeFor(25)).toBe(0.5);
    expect(feeFor(33.33)).toBe(0.67);
  });
});

describe("readSubscription", () => {
  it("finds the Pro subscription's usage line", () => {
    const info = readSubscription({
      data: {
        currentAppInstallation: {
          activeSubscriptions: [
            {
              name: "Pro",
              createdAt: "2026-10-01T00:00:00Z",
              trialDays: 14,
              lineItems: [
                { id: "li_1", plan: { pricingDetails: { __typename: "AppRecurringPricing" } } },
                { id: "li_2", plan: { pricingDetails: { __typename: "AppUsagePricing", cappedAmount: { currencyCode: "USD" } } } },
              ],
            },
          ],
        },
      },
    });
    expect(info).toMatchObject({ usageLineItemId: "li_2", usageCurrency: "USD", trialDays: 14 });
  });

  it("reports no usage line on an older subscription, and null with no Pro", () => {
    expect(
      readSubscription({ data: { currentAppInstallation: { activeSubscriptions: [{ name: "Pro", lineItems: [] }] } } })
        ?.usageLineItemId,
    ).toBeNull();
    expect(readSubscription({ data: { currentAppInstallation: { activeSubscriptions: [] } } })).toBeNull();
  });
});

describe("fxRate", () => {
  it("is 1 for the same currency and reads the ECB rate otherwise", async () => {
    expect(await fxRate("USD", "USD")).toBe(1);
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ rates: { USD: 0.7145 } })));
    expect(await fxRate("CAD", "USD", fetchImpl as never)).toBe(0.7145);
  });

  it("throws rather than guessing", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 500 }));
    await expect(fxRate("CAD", "USD", fetchImpl as never)).rejects.toThrow();
  });
});

describe("chargeGiftCardFees", () => {
  const shopRow = { id: "shop_1", domain: "maple.myshopify.com", plan: "pro", uninstalledAt: null, devStore: false };
  const saleRow = {
    id: "sale_1",
    amount: "100.00",
    currency: "CAD",
    orderId: "gid://shopify/Order/1",
    orderName: "#1001",
    createdAt: new Date(NOW.getTime() - 20 * DAY),
    voidedAt: null,
    shop: shopRow,
  };

  const subscriptionsBody = {
    data: {
      currentAppInstallation: {
        activeSubscriptions: [
          {
            name: "Pro",
            createdAt: new Date(NOW.getTime() - 100 * DAY).toISOString(),
            trialDays: 14,
            lineItems: [{ id: "li_usage", plan: { pricingDetails: { __typename: "AppUsagePricing", cappedAmount: { currencyCode: "USD" } } } }],
          },
        ],
      },
    },
  };

  let calls: { query: string; variables?: Record<string, unknown> }[];
  let usageResponse: unknown;
  const deps: FeeDeps = {
    graphqlFor: async () => async (query, options) => {
      calls.push({ query, variables: options?.variables });
      const body = query.includes("appUsageRecordCreate") ? usageResponse : subscriptionsBody;
      return new Response(JSON.stringify(body));
    },
    rate: async () => 0.75,
  };

  beforeEach(() => {
    calls = [];
    usageResponse = { data: { appUsageRecordCreate: { appUsageRecord: { id: "gid://shopify/AppUsageRecord/5" }, userErrors: [] } } };
    vi.mocked(db.giftCardSale.findMany).mockReset().mockResolvedValue([saleRow] as never);
    vi.mocked(db.giftCardSale.update).mockReset().mockResolvedValue({} as never);
  });

  it("bills 2% converted to USD, keyed by the sale so a retry can't bill twice", async () => {
    expect(await chargeGiftCardFees({ now: NOW }, deps)).toEqual({ charged: 1, waived: 0, failed: 0 });
    const usage = calls.find((c) => c.query.includes("appUsageRecordCreate"))!;
    expect(usage.variables).toMatchObject({
      lineItemId: "li_usage",
      price: { amount: "1.50", currencyCode: "USD" },
      key: "sale_1",
    });
    expect(db.giftCardSale.update).toHaveBeenCalledWith({
      where: { id: "sale_1" },
      data: expect.objectContaining({ feeStatus: "charged", feeAmount: "1.50", feeCurrency: "USD", usageRecordId: "gid://shopify/AppUsageRecord/5" }),
    });
  });

  it("only looks at sales past the refund hold, or on dev stores", async () => {
    await chargeGiftCardFees({ now: NOW }, deps);
    const where = vi.mocked(db.giftCardSale.findMany).mock.calls[0][0]!.where as { OR: unknown[] };
    expect(where.OR).toEqual([{ createdAt: { lte: new Date(NOW.getTime() - 14 * DAY) } }, { shop: { devStore: true } }]);
  });

  it("leaves a refused charge to retry tomorrow", async () => {
    usageResponse = { data: { appUsageRecordCreate: { appUsageRecord: null, userErrors: [{ message: "Failed to create usage charge" }] } } };
    expect(await chargeGiftCardFees({ now: NOW }, deps)).toEqual({ charged: 0, waived: 0, failed: 1 });
    expect(db.giftCardSale.update).toHaveBeenCalledWith({ where: { id: "sale_1" }, data: { feeCheckedAt: NOW } });
  });

  it("marks a voided sale without asking Shopify anything", async () => {
    vi.mocked(db.giftCardSale.findMany).mockResolvedValue([{ ...saleRow, voidedAt: new Date() }] as never);
    await chargeGiftCardFees({ now: NOW }, deps);
    expect(calls).toHaveLength(0);
    expect(db.giftCardSale.update).toHaveBeenCalledWith({
      where: { id: "sale_1" },
      data: { feeStatus: "waived_voided", feeCheckedAt: NOW },
    });
  });
});
