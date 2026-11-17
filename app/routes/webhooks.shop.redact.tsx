import type { ActionFunctionArgs } from "react-router";
import { authenticateLifecycleWebhook } from "../lib/webhook-auth.server";
import db from "../db.server";
import { detachShopFromOtherRegistries } from "../models/store-group.server";
import { audit } from "../lib/audit.server";

/**
 * Sent 48 hours after uninstall. Everything for this shop goes.
 * Cascades take registries, items, claims, purchases and events with the Shop row.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop } = await authenticateLifecycleWebhook(request);

  // Registries homed on OTHER linked stores survive this store; detach it
  // from them first (store-group.server.ts), then the cascade takes the rest.
  const shopRow = await db.shop.findUnique({ where: { domain: shop }, select: { id: true } });
  const detached = shopRow ? await detachShopFromOtherRegistries(shopRow.id) : null;

  await db.shop.deleteMany({ where: { domain: shop } });
  await db.session.deleteMany({ where: { shop } });

  await audit({ shop, actor: "shopify:gdpr", action: "shop_erased", detail: detached ?? {} });

  console.log(`[gdpr] erased all data for ${shop}`);
  return new Response();
};
