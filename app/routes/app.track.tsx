import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getShop } from "../models/shop.server";
import { bumpStat } from "../models/stats.server";
import { adminSectionOf } from "../shared/stats";

/**
 * POST /app/track: the embedded admin reports which section a merchant opened
 * (app.tsx sends one on every page change). Counted per store per day as
 * `admin_view_<section>` for Giftpin's /ops view. Only the section name is
 * kept: no staff member, no URL beyond the section, no time of day.
 *
 * A plain fetch with the App Bridge session token rather than a React Router
 * fetcher, because a fetcher's action makes every loader on the page run
 * again (including app.tsx's Shopify query) for a count nobody sees.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  let path = "";
  try {
    const body = (await request.json()) as { path?: unknown };
    path = typeof body.path === "string" ? body.path : "";
  } catch {
    // An empty or broken body still counts nothing.
  }
  if (path) {
    const shop = await getShop(session.shop);
    if (shop) void bumpStat(shop.id, `admin_view_${adminSectionOf(path)}`);
  }
  return new Response(null, { status: 204 });
};
