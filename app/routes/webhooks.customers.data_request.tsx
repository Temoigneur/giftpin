import type { ActionFunctionArgs } from "react-router";
import { authenticateLifecycleWebhook } from "../lib/webhook-auth.server";
import db from "../db.server";
import { purchasesSoldByWhere } from "../models/store-group.server";
import { blindIndex, tryDecrypt } from "../lib/crypto.server";
import { audit } from "../lib/audit.server";

/**
 * GDPR: the merchant is asking what we hold about one of their customers.
 *
 * Shopify requires the app to respond to the MERCHANT with the data; there is
 * no API to hand it back through. We log a structured record so it can be
 * actioned within the 30-day window.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticateLifecycleWebhook(request);

  const body = payload as { customer?: { id?: number | string; email?: string } };
  const email = body.customer?.email;
  const customerId = body.customer?.id ? String(body.customer.id) : null;
  const shopRow = await db.shop.findUnique({ where: { domain: shop }, select: { id: true } });

  const registries = await db.registry.findMany({
    where: {
      shop: { domain: shop },
      OR: [
        ...(customerId ? [{ customerId }] : []),
        ...(email ? [{ registrants: { some: { emailHash: blindIndex(email) } } }] : []),
      ],
    },
    include: { registrants: true, items: true },
  });

  // Gifts this customer bought for other people's registries (buyer name only).
  const purchases = customerId
    ? await db.purchase.findMany({
        // Including gifts sold into a linked store's registry (Purchase.shopId).
        where: { buyerCustomerId: customerId, ...purchasesSoldByWhere(shop, shopRow?.id ?? null) },
        select: { orderName: true, buyerName: true, qty: true, amount: true, currency: true, createdAt: true },
      })
    : [];

  await audit({
    shop,
    actor: "shopify:gdpr",
    action: "customer_data_exported",
    subject: customerId,
    detail: { registries: registries.length, purchases: purchases.length },
  });

  console.log(
    JSON.stringify({
      type: "gdpr_data_request",
      shop,
      customerId,
      respondBy: new Date(Date.now() + 30 * 86_400_000).toISOString(),
      registries: registries.map((r) => ({
        id: r.id,
        title: r.title,
        eventType: r.eventType,
        createdAt: r.createdAt,
        itemCount: r.items.length,
        registrants: r.registrants.map((p) => ({ name: p.name, email: tryDecrypt(p.emailEnc) })),
      })),
      purchasesAsBuyer: purchases,
    }),
  );

  return new Response();
};
