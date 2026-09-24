import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { blindIndex } from "../lib/crypto.server";
import { audit } from "../lib/audit.server";
import { deleteRegistry } from "../models/registry.server";

/**
 * GDPR: erase everything we hold about this customer.
 *
 * Same code path as the registrant's own "delete my registry" button — the
 * deletion path is a first-class feature, not a compliance bolt-on.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);

  const body = payload as { customer?: { id?: number | string; email?: string } };
  const email = body.customer?.email;
  const customerId = body.customer?.id ? String(body.customer.id) : null;

  const registries = await db.registry.findMany({
    where: {
      shop: { domain: shop },
      OR: [
        ...(customerId ? [{ customerId }] : []),
        ...(email ? [{ registrants: { some: { emailHash: blindIndex(email) } } }] : []),
      ],
    },
    select: { id: true },
  });

  for (const registry of registries) {
    await deleteRegistry(registry.id);
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
    detail: { registriesDeleted: registries.length, purchasesScrubbed: buyerRecords, guestReminders },
  });

  console.log(`[gdpr] redacted ${registries.length} registries, ${buyerRecords} purchases for ${shop}`);
  return new Response();
};
