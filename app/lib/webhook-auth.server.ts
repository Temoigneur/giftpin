import { authenticate } from "../shopify.server";

/**
 * authenticate.webhook() for topics that arrive after the app is gone
 * (app/uninstalled, shop/redact, customers/redact, customers/data_request).
 *
 * With expiringOfflineAccessTokens on, authenticate.webhook() first checks
 * the HMAC, then loads the shop's offline session and refreshes its token if
 * it has expired. After an uninstall that refresh can only fail, and the
 * library turns the failure into a thrown 500 — so Shopify saw a 500 on
 * every retry of these webhooks (Railway logs, 27 Sep 2026) and the handler
 * never ran. None of these handlers needs an Admin API client.
 *
 * The fallback only covers failures the library can raise *after* the HMAC
 * check has passed (see refresh-token.mjs in @shopify/shopify-app-react-router):
 * a bare 500 Response, or the InvalidJwtError / HttpResponseError it rethrows.
 * A 400/401/405 (bad HMAC, bad request, wrong method) is rethrown untouched.
 */
export async function authenticateLifecycleWebhook(request: Request) {
  const copy = request.clone();
  try {
    const { shop, payload } = await authenticate.webhook(request);
    return { shop, payload };
  } catch (err) {
    if (!isPostValidationRefreshFailure(err)) throw err;

    const shop = copy.headers.get("x-shopify-shop-domain");
    if (!shop) throw err;

    console.warn(`[webhooks] ${new URL(copy.url).pathname} for ${shop}: offline token refresh failed, handling without a session`);
    return { shop, payload: JSON.parse(await copy.text()) as unknown };
  }
}

export function isPostValidationRefreshFailure(err: unknown): boolean {
  if (err instanceof Response) return err.status === 500;
  const name = (err as { constructor?: { name?: string } })?.constructor?.name;
  return name === "InvalidJwtError" || name === "HttpResponseError";
}
