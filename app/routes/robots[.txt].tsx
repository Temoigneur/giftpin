import { SITE_URL } from "../marketing/config";

/** giftpin.app/robots.txt: index the marketing pages, not the app or the store proxy. */
export const loader = async () =>
  new Response(
    `User-agent: *\nAllow: /\nDisallow: /app\nDisallow: /auth\nDisallow: /proxy\nDisallow: /webhooks\nDisallow: /export\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } },
  );
