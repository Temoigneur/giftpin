import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { blindIndex, tryDecrypt } from "../lib/crypto.server";

/**
 * GDPR: the merchant is asking what we hold about one of their customers.
 *
 * Shopify requires the app to respond to the MERCHANT with the data; there is
 * no API to hand it back through. We log a structured record so it can be
 * actioned within the 30-day window.
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
    include: { registrants: true, items: true },
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
    }),
  );

  return new Response();
};
