import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getShop } from "../models/shop.server";
import { customerPanel, orderPanel, productPanel } from "../models/admin-panel.server";

/**
 * Backend for the Shopify admin action extension (extensions/admin-registry).
 * The extension's fetch() of a relative URL goes to application_url with an
 * ID token as a Bearer header; authenticate.admin checks it, answers the CORS
 * preflight, and tells us which shop is asking.
 *
 *   GET /api/admin-panel?order=gid://shopify/Order/1
 *   GET /api/admin-panel?customer=gid://shopify/Customer/1
 *   GET /api/admin-panel?product=gid://shopify/Product/1
 *
 * Free on every plan: it only shows what the Registries page already does.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, cors } = await authenticate.admin(request);
  const shop = await getShop(session.shop);
  if (!shop || shop.uninstalledAt) {
    return cors(Response.json({ ok: false, error: "Giftpin isn't set up on this store." }, { status: 403 }));
  }

  const params = new URL(request.url).searchParams;
  const order = params.get("order");
  const customer = params.get("customer");
  const product = params.get("product");

  if (order) return cors(Response.json({ ok: true, ...(await orderPanel(shop.id, shop.domain, order)) }));
  if (customer) return cors(Response.json({ ok: true, ...(await customerPanel(shop.id, shop.domain, customer)) }));
  if (product) return cors(Response.json({ ok: true, ...(await productPanel(shop.id, shop.domain, product)) }));

  return cors(Response.json({ ok: false, error: "Bad request" }, { status: 400 }));
};
