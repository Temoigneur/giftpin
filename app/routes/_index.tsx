import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

/**
 * Shopify always embeds the app at the bare domain root, regardless of where
 * the admin UI actually lives (`/app` here) — so root traffic has to be
 * forwarded there, preserving every query param (embedded, host, hmac,
 * session, id_token, shop, timestamp, locale) that authenticate.admin() in
 * app.tsx's loader needs to complete the handshake.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  throw redirect(`/app${url.search}`);
};

export default function Index() {
  return null;
}
