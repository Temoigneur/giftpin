import { SITE_URL, holidayPromoOn } from "../marketing/config";

/** giftpin.app/sitemap.xml: the public marketing pages. */
export const MARKETING_PATHS = ["/", "/features", "/pricing", "/faq", "/gift-registry-app", "/wedding-registry", "/baby-registry", "/home-goods-registry", "/compare", "/setup", "/setup/customize", "/setup/pro", "/registry-guide", "/guest-guide", "/gift-cards", "/privacy"];

/** Seasonal pages, listed only while their promo runs (see holidayPromoOn). */
export const SEASONAL_PATHS = ["/holiday-wish-lists"];

export const loader = async () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...MARKETING_PATHS, ...(holidayPromoOn() ? SEASONAL_PATHS : [])].map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join("\n")}
</urlset>
`,
    { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } },
  );
