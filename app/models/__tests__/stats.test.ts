import { describe, it, expect, vi, beforeEach } from "vitest";

/** Daily counters: they must never break the page or webhook that bumps them. */

vi.mock("../../db.server", () => ({
  default: { $executeRaw: vi.fn() },
}));

import db from "../../db.server";
import { bumpStat, countStoreOrder, countView, isUpgradeCandidate } from "../stats.server";
import { STAT_METRICS } from "../../shared/stats";
import { renderOps } from "../../routes/ops";

const exec = db.$executeRaw as unknown as ReturnType<typeof vi.fn>;
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 Version/18.1 Mobile/15E148 Safari/604.1";

/** The interpolated values of the tagged-template call: id, shopId, day, metric, registryId, count, value. */
function values(call: unknown[]) {
  const [, id, shopId, day, metric, registryId, count, value] = call as [unknown, string, string, Date, string, string, number, number];
  return { id, shopId, day, metric, registryId, count, value };
}

beforeEach(() => {
  exec.mockReset();
  exec.mockResolvedValue(1);
});

describe("bumpStat", () => {
  it("adds to today's UTC row in one atomic upsert", async () => {
    await bumpStat("shop_1", STAT_METRICS.cartAdd, { registryId: "reg_1", count: 2, at: new Date("2026-11-02T22:00:00Z") });
    const v = values(exec.mock.calls[0]);
    expect(v).toMatchObject({ shopId: "shop_1", metric: "cart_add", registryId: "reg_1", count: 2, value: 0 });
    expect(v.day.toISOString()).toBe("2026-11-02T00:00:00.000Z");
    expect(String((exec.mock.calls[0][0] as TemplateStringsArray).join("?"))).toContain("ON CONFLICT");
  });

  it("swallows a database error instead of failing the caller", async () => {
    exec.mockRejectedValue(new Error("connection reset"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(bumpStat("shop_1", STAT_METRICS.registryView)).resolves.toBeUndefined();
    warn.mockRestore();
  });
});

describe("countView", () => {
  it("counts a person's GET", () => {
    countView(new Request("https://x.test/r/abc", { headers: { "user-agent": IPHONE } }), "shop_1", STAT_METRICS.registryView, "reg_1");
    expect(values(exec.mock.calls[0])).toMatchObject({ metric: "registry_view", registryId: "reg_1" });
  });

  it("skips bots, link previews and non-GET requests", () => {
    countView(new Request("https://x.test/r/abc", { headers: { "user-agent": "WhatsApp/2.23" } }), "shop_1", STAT_METRICS.registryView);
    countView(new Request("https://x.test/r/abc", { method: "HEAD", headers: { "user-agent": IPHONE } }), "shop_1", STAT_METRICS.registryView);
    expect(exec).not.toHaveBeenCalled();
  });
});

describe("countStoreOrder", () => {
  it("adds the order total on the order's own day", async () => {
    await countStoreOrder("shop_1", { total_price: "129.50", created_at: "2026-11-01T23:30:00-05:00" });
    const v = values(exec.mock.calls[0]);
    expect(v).toMatchObject({ metric: "store_order", count: 1, value: 129.5, registryId: "" });
    expect(v.day.toISOString()).toBe("2026-11-02T00:00:00.000Z");
  });

  it("still counts the order when the total or date is missing or junk", async () => {
    await countStoreOrder("shop_1", { total_price: "abc", created_at: "nope" });
    expect(values(exec.mock.calls[0])).toMatchObject({ count: 1, value: 0 });
  });
});

describe("isUpgradeCandidate", () => {
  const base = { plan: "free" as const, uninstalledAt: null, registryViews: 0, registrySales: 0, activeRegistries: 0 };
  it("flags a Free store once registries show real activity", () => {
    expect(isUpgradeCandidate(base)).toBe(false);
    expect(isUpgradeCandidate({ ...base, registrySales: 40 })).toBe(true);
    expect(isUpgradeCandidate({ ...base, registryViews: 50 })).toBe(true);
    expect(isUpgradeCandidate({ ...base, activeRegistries: 3 })).toBe(true);
  });
  it("never flags Pro or uninstalled stores", () => {
    expect(isUpgradeCandidate({ ...base, plan: "pro", registrySales: 40 })).toBe(false);
    expect(isUpgradeCandidate({ ...base, uninstalledAt: new Date(), registrySales: 40 })).toBe(false);
  });
});

describe("renderOps", () => {
  it("escapes store names, which merchants control", () => {
    const html = renderOps(
      [
        {
          domain: "evil.myshopify.com", name: "<script>alert(1)</script>", plan: "free", devStore: false,
          installedAt: new Date("2026-10-01"), uninstalledAt: null, currency: "CAD",
          activeRegistries: 3, registriesCreated: 1, registryViews: 80, createPageViews: 5, cartAdds: 2, externalClicks: 1,
          giftsFromStore: 1, registrySales: 50, newCustomers: 1, storeOrders: 10, storeSales: 1000,
          registrySharePercent: 5, lastRegistryAt: null, upgradeCandidate: true,
        },
      ],
      30,
    );
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("Nudge to Pro");
    expect(html).toContain("noindex");
  });
});
