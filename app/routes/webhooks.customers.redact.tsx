import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { blindIndex } from "../lib/crypto.server";
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

  // Buyer details on someone else's registry are personal data too.
  if (email) {
    await db.purchase.updateMany({
      where: {
        item: { registry: { shop: { domain: shop } } },
        buyerEmailEnc: { not: null },
      },
      data: { buyerName: null, buyerEmailEnc: null, buyerMessage: null },
    });
  }

  console.log(`[gdpr] redacted ${registries.length} registries for ${shop}`);
  return new Response();
};
