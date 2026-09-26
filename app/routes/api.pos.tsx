import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getShop, isPro } from "../models/shop.server";
import {
  createRegistryInStore,
  posLineProperties,
  registryForStaff,
  searchRegistriesForStaff,
} from "../models/instore.server";

/**
 * Backend for the Shopify POS extension (extensions/pos-registry). POS sends
 * its session token as a Bearer header; authenticate.pos validates it, answers
 * the CORS preflight, and tells us which shop is asking.
 *
 *   GET  /api/pos?q=...          search registries
 *   GET  /api/pos?id=...         one registry with its items
 *   POST /api/pos {intent: "line", itemId}     signed `_rg` properties for the cart
 *   POST /api/pos {intent: "create", ...}      start a registry for a customer
 */

async function proShop(dest: unknown) {
  const domain = typeof dest === "string" ? dest.replace(/^https:\/\//, "") : "";
  const shop = domain ? await getShop(domain) : null;
  return shop && !shop.uninstalledAt && isPro(shop) ? shop : null;
}

const LOCKED = { ok: false, locked: true, error: "In-store mode is part of Giftpin Pro." } as const;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { sessionToken, cors } = await authenticate.pos(request);
  const shop = await proShop(sessionToken.dest);
  if (!shop) return cors(Response.json(LOCKED, { status: 403 }));

  const params = new URL(request.url).searchParams;
  const id = params.get("id");
  if (id) {
    const registry = await registryForStaff(shop.id, id);
    return cors(
      registry
        ? Response.json({ ok: true, registry })
        : Response.json({ ok: false, error: "That registry is no longer available." }, { status: 404 }),
    );
  }

  return cors(Response.json({ ok: true, results: await searchRegistriesForStaff(shop.id, params.get("q")) }));
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { sessionToken, cors } = await authenticate.pos(request);
  const shop = await proShop(sessionToken.dest);
  if (!shop) return cors(Response.json(LOCKED, { status: 403 }));

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return cors(Response.json({ ok: false, error: "Bad request" }, { status: 400 }));
  }

  if (body.intent === "line") {
    const line = await posLineProperties(shop.id, String(body.itemId ?? ""));
    return cors(
      line
        ? Response.json({ ok: true, ...line })
        : Response.json({ ok: false, error: "That item is no longer on this registry." }, { status: 404 }),
    );
  }

  if (body.intent === "create") {
    const result = await createRegistryInStore(shop, body, "pos");
    return cors(Response.json(result, { status: result.ok ? 200 : 400 }));
  }

  return cors(Response.json({ ok: false, error: "Unknown request" }, { status: 400 }));
};
