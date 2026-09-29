import { SITE_URL } from "../marketing/config";

/** giftpin.app/sitemap.xml: the public marketing pages. */
export const MARKETING_PATHS = ["/", "/features", "/pricing", "/faq", "/wedding-registry", "/compare", "/setup", "/privacy"];

export const loader = async () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${MARKETING_PATHS.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join("\n")}
</urlset>
`,
    { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } },
  );
