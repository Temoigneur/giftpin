import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { homeHtml } from "../marketing/home";
import { renderFor } from "../marketing/layout";

/**
 * Root route, two jobs:
 *
 * 1. Shopify always embeds the app at the bare domain root, regardless of
 *    where the admin UI actually lives (`/app` here) — so requests carrying
 *    Shopify's handshake params (shop, host, embedded, hmac, id_token,
 *    session, timestamp) are forwarded to `/app`, preserving every query
 *    param that authenticate.admin() in app.tsx's loader needs.
 * 2. Everything else (a person typing giftpin.app into a browser) gets the
 *    public marketing home page (`app/marketing/home.ts`): static HTML, no
 *    auth, no session.
 */
const SHOPIFY_PARAMS = [
  "shop",
  "host",
  "embedded",
  "hmac",
  "id_token",
  "session",
  "timestamp",
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  if (SHOPIFY_PARAMS.some((p) => url.searchParams.has(p))) {
    throw redirect(`/app${url.search}`);
  }
  return renderFor(request, () => homeHtml());
};

// Deliberately no default export: a route module without one is a *resource
// route*, so the Response above is sent as-is instead of being wrapped as
// loader data for React to render (which produced a blank page).
