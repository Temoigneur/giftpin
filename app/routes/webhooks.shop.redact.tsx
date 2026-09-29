import type { ActionFunctionArgs } from "react-router";
import { authenticateLifecycleWebhook } from "../lib/webhook-auth.server";
import db from "../db.server";
import { audit } from "../lib/audit.server";

/**
 * Sent 48 hours after uninstall. Everything for this shop goes.
 * Cascades take registries, items, claims, purchases and events with the Shop row.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop } = await authenticateLifecycleWebhook(request);

  await db.shop.deleteMany({ where: { domain: shop } });
  await db.session.deleteMany({ where: { shop } });

  await audit({ shop, actor: "shopify:gdpr", action: "shop_erased" });

  console.log(`[gdpr] erased all data for ${shop}`);
  return new Response();
};
