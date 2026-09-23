import crypto from "node:crypto";

/**
 * App proxy request handling.
 *
 * Four things about app proxy that shape every guest-facing route:
 *
 * 1. Cookies are stripped in BOTH directions. Shopify removes `Cookie` on the
 *    way in and `Set-Cookie` on the way out, because the app is served from
 *    the shop's domain. There is no session. Registrant identity is carried by
 *    a signed, expiring token in the URL (see crypto.server.ts) or by
 *    `logged_in_customer_id` for signed-in customers.
 *
 * 2. Every request must have its HMAC verified. The signature proves the
 *    request came from Shopify untampered — it does NOT prove the caller is
 *    authorised to touch the registry they named. Check both.
 *
 * 3. Merchants can change the prefix and subpath in their admin. Never
 *    hardcode `/apps/registry`; build public links from `path_prefix`.
 *
 * 4. `Content-Type: application/liquid` makes Shopify render the response in
 *    the shop's theme context. We ship plain HTML with merchant brand tokens
 *    instead — see app/proxy/render/layout.ts for why.
 */

export interface ProxyContext {
  shop: string;
  /** Path after the proxy mount point, e.g. "r/abc123". Never starts with "/". */
  path: string;
  /** Shopify customer ID if one is logged in, else null. Do not trust beyond identity. */
  loggedInCustomerId: string | null;
  /** The merchant's configured public prefix, e.g. "/apps/registry". */
  pathPrefix: string;
  query: URLSearchParams;
}

/** Requests older than this are rejected even with a valid signature. */
const MAX_TIMESTAMP_SKEW_SECONDS = 60 * 60;

/**
 * Recomputes Shopify's app proxy signature.
 *
 * Params are rendered `key=value` (repeated keys comma-joined), sorted, then
 * concatenated with no separator — not the usual `&`-joined query string.
 */
export function computeProxySignature(query: URLSearchParams, secret: string): string {
  const grouped = new Map<string, string[]>();
  for (const [key, value] of query.entries()) {
    if (key === "signature") continue;
    const existing = grouped.get(key);
    if (existing) existing.push(value);
    else grouped.set(key, [value]);
  }

  const serialized = Array.from(grouped.entries())
    .map(([key, values]) => `${key}=${values.join(",")}`)
    .sort()
    .join("");

  return crypto.createHmac("sha256", secret).update(serialized).digest("hex");
}

export class ProxyAuthError extends Error {}

/**
 * Verifies an app proxy request and returns its context.
 * Throws ProxyAuthError on anything suspicious — callers should turn that into
 * a 401 with no detail, because this endpoint is on the public internet.
 */
export function authenticateProxyRequest(request: Request): ProxyContext {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret) throw new ProxyAuthError("SHOPIFY_API_SECRET is not configured");

  const url = new URL(request.url);
  const query = url.searchParams;

  const signature = query.get("signature");
  if (!signature) throw new ProxyAuthError("Missing signature");

  const expected = computeProxySignature(query, secret);
  const a = Buffer.from(signature, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new ProxyAuthError("Bad signature");
  }

  const timestamp = Number(query.get("timestamp"));
  if (!Number.isFinite(timestamp)) throw new ProxyAuthError("Missing timestamp");
  if (Math.abs(Date.now() / 1000 - timestamp) > MAX_TIMESTAMP_SKEW_SECONDS) {
    throw new ProxyAuthError("Stale request");
  }

  const shop = query.get("shop");
  if (!shop || !/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop)) {
    throw new ProxyAuthError("Missing or malformed shop");
  }

  // Our route is mounted at /proxy; everything after it is ours to route on.
  const path = url.pathname.replace(/^\/proxy\/?/, "").replace(/^\/+/, "");

  const loggedIn = query.get("logged_in_customer_id");

  return {
    shop,
    path,
    loggedInCustomerId: loggedIn && loggedIn.length > 0 ? loggedIn : null,
    pathPrefix: query.get("path_prefix") || "/apps/registry",
    query,
  };
}

/**
 * Builds a link to one of our own pages on the merchant's domain.
 * Always goes through `path_prefix` — merchants can rename it.
 */
export function proxyUrl(ctx: ProxyContext, subpath: string, params?: Record<string, string>): string {
  const clean = subpath.replace(/^\/+/, "");
  const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
  return `${ctx.pathPrefix.replace(/\/+$/, "")}/${clean}${qs}`;
}

/** Absolute equivalent, for emails and share links. */
export function absoluteProxyUrl(
  shopDomain: string,
  pathPrefix: string,
  subpath: string,
  params?: Record<string, string>,
): string {
  const clean = subpath.replace(/^\/+/, "");
  const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
  return `https://${shopDomain}${pathPrefix.replace(/\/+$/, "")}/${clean}${qs}`;
}

/**
 * Opaque, non-identifying guest handle used to let a returning guest release
 * their own soft claim. Deliberately not stable across days — we do not want a
 * durable identifier for anonymous visitors.
 */
export function guestFingerprint(request: Request, itemId: string): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const ua = request.headers.get("user-agent") ?? "";
  const day = Math.floor(Date.now() / 86_400_000);
  return crypto
    .createHmac("sha256", process.env.SIGNING_KEY || "dev")
    .update(`${ip}|${ua}|${itemId}|${day}`)
    .digest("base64url")
    .slice(0, 32);
}

/**
 * Response headers for every public guest page.
 *
 * `noindex` is on the response itself, not just robots.txt or the sitemap —
 * the AAA app's failure was registrant emails turning up in Google.
 * Referrer-Policy keeps the merchant's domain out of the retailer's logs when
 * a guest follows an outbound link.
 */
export function guestPageHeaders(indexable: boolean, extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  headers.set("Content-Type", "text/html; charset=utf-8");
  headers.set("X-Robots-Tag", indexable ? "index, follow" : "noindex, nofollow, noarchive");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Content-Type-Options", "nosniff");
  // Shopify strips Set-Cookie anyway; make the intent explicit for reviewers.
  headers.set("Cache-Control", "no-store");
  return headers;
}
