import { isLocale, toLocale, type Locale } from "../shared/i18n";

/**
 * The language the merchant's admin pages render in: Shopify's own `locale`
 * query parameter on the embedded app URL (the merchant's admin language), else
 * the browser's Accept-Language, else English. This is separate from the
 * store's registry-page language (Settings): a French-Canadian merchant can run
 * an English storefront.
 *
 * Unverified live (CLAUDE.md hard rule 1): that Shopify keeps sending `locale`
 * on later in-app navigations. Accept-Language is the fallback for when it
 * doesn't.
 */
function supported(tag: string): Locale | null {
  const t = tag.trim();
  if (!t) return null;
  if (isLocale(t)) return t;
  const base = t.toLowerCase().split(/[-_]/)[0];
  if (base === "pt") return "pt-BR";
  if (base === "en") return "en";
  const l = toLocale(base);
  return l === "en" ? null : l;
}

export function adminLocale(request: Request): Locale {
  const url = new URL(request.url);
  const fromParam = supported(url.searchParams.get("locale") ?? "");
  if (fromParam) return fromParam;
  const header = request.headers.get("accept-language") ?? "";
  const tags = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = Number(params.find((p) => p.trim().startsWith("q="))?.split("=")[1] ?? 1);
      return { tag, q: Number.isFinite(q) ? q : 0 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of tags) {
    const found = supported(tag);
    if (found) return found;
    if (tag.toLowerCase().startsWith("en")) return "en";
  }
  return "en";
}
