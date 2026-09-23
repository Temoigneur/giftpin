import { describe, it, expect, vi } from "vitest";

/**
 * The retention periods are published in the privacy policy, so a quiet change
 * to one of these numbers is a policy change. Keep this test in step with
 * section 7 of app/routes/privacy.tsx.
 */

vi.mock("../../db.server", () => ({
  default: {
    purchase: { count: vi.fn().mockResolvedValue(2), updateMany: vi.fn() },
    registry: { count: vi.fn().mockResolvedValue(1), updateMany: vi.fn(), findMany: vi.fn().mockResolvedValue([]) },
    claim: { count: vi.fn().mockResolvedValue(3), deleteMany: vi.fn() },
    registryEvent: { count: vi.fn().mockResolvedValue(4), deleteMany: vi.fn() },
    auditLog: { count: vi.fn().mockResolvedValue(5), deleteMany: vi.fn(), create: vi.fn() },
    session: { count: vi.fn().mockResolvedValue(6), deleteMany: vi.fn() },
    shop: { findMany: vi.fn().mockResolvedValue([]), delete: vi.fn() },
    processedWebhook: { deleteMany: vi.fn() },
  },
}));

vi.mock("../../shopify.server", () => ({ unauthenticated: { admin: vi.fn() } }));

import db from "../../db.server";
import { retentionCutoffs, purgeExpiredData } from "../retention.server";

const NOW = new Date("2026-09-23T12:00:00Z");
const DAY = 86_400_000;

describe("retentionCutoffs", () => {
  it("matches the periods in the privacy policy", () => {
    const c = retentionCutoffs(NOW);
    const days = (d: Date) => Math.round((NOW.getTime() - d.getTime()) / DAY);
    expect(days(c.buyerData)).toBe(365);
    expect(days(c.shippingAddress)).toBe(90);
    expect(days(c.registryEvent)).toBe(730);
    expect(days(c.registryInactiveWithEvent)).toBe(730);
    expect(days(c.registryInactiveNoEvent)).toBe(1095);
    expect(days(c.softDeleted)).toBe(30);
    expect(days(c.claims)).toBe(30);
    expect(days(c.auditLog)).toBe(365);
    expect(days(c.sessions)).toBe(7);
    expect(days(c.uninstalledShop)).toBe(30);
  });
});

describe("purgeExpiredData dry run", () => {
  it("counts but never writes", async () => {
    const summary = await purgeExpiredData(NOW, true);

    expect(summary.dryRun).toBe(true);
    expect(summary.buyerDataCleared).toBe(2);
    expect(summary.claimsDeleted).toBe(3);

    expect(db.purchase.updateMany).not.toHaveBeenCalled();
    expect(db.registry.updateMany).not.toHaveBeenCalled();
    expect(db.claim.deleteMany).not.toHaveBeenCalled();
    expect(db.registryEvent.deleteMany).not.toHaveBeenCalled();
    expect(db.session.deleteMany).not.toHaveBeenCalled();
    expect(db.shop.delete).not.toHaveBeenCalled();
  });
});
