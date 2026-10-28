import type { ActionFunctionArgs } from "react-router";
import { authenticateLifecycleWebhook } from "../lib/webhook-auth.server";
import db from "../db.server";
import { blindIndex } from "../lib/crypto.server";
import { audit } from "../lib/audit.server";
import { deleteRegistry, touchRegistry } from "../models/registry.server";

/**
 * GDPR: erase everything we hold about this customer.
 *
 * Same code path as the registrant's own "delete my registry" button — the
 * deletion path is a first-class feature, not a compliance bolt-on.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticateLifecycleWebhook(request);

  const body = payload as { customer?: { id?: number | string; email?: string } };
  const email = body.customer?.email;
  const customerId = body.customer?.id ? String(body.customer.id) : null;

  // Registries this customer owns go entirely. Being someone else's partner
  // only takes their own Registrant row: erasing a partner must never delete
  // the owner's registry.
  const registries = await db.registry.findMany({
    where: {
      shop: { domain: shop },
      OR: [
        ...(customerId ? [{ customerId }] : []),
        ...(email ? [{ registrants: { some: { emailHash: blindIndex(email), role: "owner" as const } } }] : []),
      ],
    },
    select: { id: true },
  });

  for (const registry of registries) {
    await deleteRegistry(registry.id);
  }

  let partnerRecords = 0;
  if (email) {
    const partners = await db.registrant.findMany({
      where: { emailHash: blindIndex(email), role: "co", registry: { shop: { domain: shop } } },
      select: { id: true, registryId: true },
    });
    for (const partner of partners) {
      await db.registrant.delete({ where: { id: partner.id } });
      // The guest page shows the registrants' names.
      await touchRegistry(partner.registryId).catch(() => {});
    }
    partnerRecords = partners.length;
  }

  // Buyer details on someone else's registry are personal data too. Purchases
  // record the buyer's Shopify customer id, so erase exactly this customer's —
  // never every buyer in the shop.
  let buyerRecords = 0;
  if (customerId) {
    const res = await db.purchase.updateMany({
      where: {
        buyerCustomerId: customerId,
        item: { registry: { shop: { domain: shop } } },
      },
      data: { buyerName: null, buyerEmailEnc: null, buyerMessage: null, buyerCustomerId: null },
    });
    buyerRecords = res.count;
  }

  // Guests who signed up for a pre-event reminder (Pro) are matched by email.
  let guestReminders = 0;
  if (email) {
    const res = await db.guestReminder.deleteMany({
      where: { emailHash: blindIndex(email), registry: { shop: { domain: shop } } },
    });
    guestReminders = res.count;
  }

  await audit({
    shop,
    actor: "shopify:gdpr",
    action: "customer_redacted",
    subject: customerId,
    detail: { registriesDeleted: registries.length, partnerRecords, purchasesScrubbed: buyerRecords, guestReminders },
  });

  console.log(`[gdpr] redacted ${registries.length} registries, ${buyerRecords} purchases for ${shop}`);
  return new Response();
};
