import type { ActionFunctionArgs } from "react-router";
import { authenticateLifecycleWebhook } from "../lib/webhook-auth.server";
import db from "../db.server";
import { markUninstalled } from "../models/shop.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop } = await authenticateLifecycleWebhook(request);

  // Fires more than once, and can arrive after the app is already gone.
  await db.session.deleteMany({ where: { shop } });

  // Registries are NOT deleted here. A merchant who reinstalls next week
  // expects their customers' registries to still exist, and a wedding registry
  // outliving a billing lapse is the whole reason this category has low churn.
  // shop/redact is what actually erases data, and Shopify sends it 48 hours
  // after uninstall if the merchant doesn't come back.
  await markUninstalled(shop);

  return new Response();
};
