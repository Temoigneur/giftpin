import db from "../db.server";
import { registerHandler } from "../lib/queue.server";
import { audit } from "../lib/audit.server";
import { pruneProcessedWebhooks } from "../lib/webhooks.server";
import { deleteRegistry } from "./registry.server";

/**
 * Data retention.
 *
 * One daily job (scheduled in queue.server.ts) that enforces the periods
 * published in the privacy policy (app/routes/privacy.tsx, section 7). If you
 * change a number here, change the policy in the same commit.
 *
 *   Buyer name / message / customer id on a purchase   12 months after the event
 *                                                      (12 months after purchase
 *                                                      if the registry has no date)
 *   Registrant shipping address                         90 days after the event
 *   Registry (with items, registrants, purchases)       24 months after the event
 *                                                      and no activity for 24 months;
 *                                                      36 months of no activity when
 *                                                      there is no event date
 *   Registries marked "deleted"                         30 days
 *   Claims (soft holds on outside items)                30 days after they end
 *   Event log                                           24 months
 *   Audit log                                           12 months
 *   Webhook de-duplication ids                          7 days
 *   Expired online sessions                             7 days
 *   Shop data if uninstalled and shop/redact never came 30 days
 *
 * Set RETENTION_DRY_RUN=1 to log what would be removed without changing anything.
 */

const DAY = 86_400_000;

export interface RetentionCutoffs {
  buyerData: Date;
  shippingAddress: Date;
  registryEvent: Date;
  registryInactiveWithEvent: Date;
  registryInactiveNoEvent: Date;
  softDeleted: Date;
  claims: Date;
  auditLog: Date;
  sessions: Date;
  uninstalledShop: Date;
}

export function retentionCutoffs(now: Date = new Date()): RetentionCutoffs {
  const ago = (days: number) => new Date(now.getTime() - days * DAY);
  return {
    buyerData: ago(365),
    shippingAddress: ago(90),
    registryEvent: ago(365 * 2),
    registryInactiveWithEvent: ago(365 * 2),
    registryInactiveNoEvent: ago(365 * 3),
    softDeleted: ago(30),
    claims: ago(30),
    auditLog: ago(365),
    sessions: ago(7),
    uninstalledShop: ago(30),
  };
}

export interface RetentionSummary {
  dryRun: boolean;
  buyerDataCleared: number;
  shippingAddressesCleared: number;
  registriesDeleted: number;
  claimsDeleted: number;
  eventsDeleted: number;
  auditRowsDeleted: number;
  webhookIdsDeleted: number;
  sessionsDeleted: number;
  shopsDeleted: number;
}

const REGISTRY_BATCH = 500;

export async function purgeExpiredData(
  now: Date = new Date(),
  dryRun: boolean = process.env.RETENTION_DRY_RUN === "1",
): Promise<RetentionSummary> {
  const c = retentionCutoffs(now);
  const summary: RetentionSummary = {
    dryRun,
    buyerDataCleared: 0,
    shippingAddressesCleared: 0,
    registriesDeleted: 0,
    claimsDeleted: 0,
    eventsDeleted: 0,
    auditRowsDeleted: 0,
    webhookIdsDeleted: 0,
    sessionsDeleted: 0,
    shopsDeleted: 0,
  };

  // Each step is independent: one failing must not stop the others.
  const step = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (err) {
      console.error(`[retention] ${name} failed:`, (err as Error).message);
    }
  };

  await step("buyer data", async () => {
    const where = {
      AND: [
        {
          OR: [
            { buyerName: { not: null } },
            { buyerMessage: { not: null } },
            { buyerEmailEnc: { not: null } },
            { buyerCustomerId: { not: null } },
          ],
        },
        {
          OR: [
            { item: { registry: { eventDate: { lt: c.buyerData } } } },
            { createdAt: { lt: c.buyerData }, item: { registry: { eventDate: null } } },
          ],
        },
      ],
    };
    if (dryRun) {
      summary.buyerDataCleared = await db.purchase.count({ where });
      return;
    }
    const res = await db.purchase.updateMany({
      where,
      data: { buyerName: null, buyerMessage: null, buyerEmailEnc: null, buyerCustomerId: null },
    });
    summary.buyerDataCleared = res.count;
  });

  await step("shipping addresses", async () => {
    const where = { shippingAddressEnc: { not: null }, eventDate: { lt: c.shippingAddress } };
    if (dryRun) {
      summary.shippingAddressesCleared = await db.registry.count({ where });
      return;
    }
    const res = await db.registry.updateMany({
      where,
      data: { shippingAddressEnc: null, shipToRegistrant: false },
    });
    summary.shippingAddressesCleared = res.count;
  });

  await step("registries", async () => {
    const where = {
      OR: [
        { eventDate: { lt: c.registryInactiveWithEvent }, updatedAt: { lt: c.registryInactiveWithEvent } },
        { eventDate: null, updatedAt: { lt: c.registryInactiveNoEvent } },
        { status: "deleted" as const, updatedAt: { lt: c.softDeleted } },
      ],
    };
    const rows = await db.registry.findMany({ where, select: { id: true }, take: REGISTRY_BATCH });
    summary.registriesDeleted = rows.length;
    if (dryRun) return;
    for (const row of rows) {
      await deleteRegistry(row.id);
    }
  });

  await step("claims", async () => {
    const where = { OR: [{ releasedAt: { lt: c.claims } }, { expiresAt: { lt: c.claims } }] };
    if (dryRun) {
      summary.claimsDeleted = await db.claim.count({ where });
      return;
    }
    summary.claimsDeleted = (await db.claim.deleteMany({ where })).count;
  });

  await step("event log", async () => {
    const where = { createdAt: { lt: c.registryEvent } };
    if (dryRun) {
      summary.eventsDeleted = await db.registryEvent.count({ where });
      return;
    }
    summary.eventsDeleted = (await db.registryEvent.deleteMany({ where })).count;
  });

  await step("audit log", async () => {
    const where = { at: { lt: c.auditLog } };
    if (dryRun) {
      summary.auditRowsDeleted = await db.auditLog.count({ where });
      return;
    }
    summary.auditRowsDeleted = (await db.auditLog.deleteMany({ where })).count;
  });

  await step("webhook ids", async () => {
    if (dryRun) return;
    summary.webhookIdsDeleted = await pruneProcessedWebhooks(7);
  });

  await step("sessions", async () => {
    const where = { isOnline: true, expires: { lt: c.sessions } };
    if (dryRun) {
      summary.sessionsDeleted = await db.session.count({ where });
      return;
    }
    summary.sessionsDeleted = (await db.session.deleteMany({ where })).count;
  });

  await step("uninstalled shops", async () => {
    const shops = await db.shop.findMany({
      where: { uninstalledAt: { lt: c.uninstalledShop } },
      select: { id: true, domain: true },
    });
    summary.shopsDeleted = shops.length;
    if (dryRun) return;
    for (const shop of shops) {
      // Cascades take registries, items, claims, purchases and events.
      await db.shop.delete({ where: { id: shop.id } });
      await db.session.deleteMany({ where: { shop: shop.domain } });
    }
  });

  console.log(`[retention] ${dryRun ? "DRY RUN " : ""}${JSON.stringify(summary)}`);
  await audit({
    actor: "system:retention",
    action: dryRun ? "retention_dry_run" : "retention_purge",
    detail: { ...summary },
  });

  return summary;
}

registerHandler("purge-expired-data", async () => {
  await purgeExpiredData();
});
