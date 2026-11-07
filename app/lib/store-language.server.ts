import type { Locale } from "../shared/i18n";

/**
 * Best guess at a store's language from its billing country, used once, the
 * first time the merchant opens the app, to start every Giftpin page in that
 * language. The merchant can change it in Settings → Appearance.
 *
 * A country is only a guess (Canada, Switzerland and Belgium have several
 * languages), so those, and every English-speaking country, return null and
 * stay English. The exact answer is the store's primary locale, which needs the
 * `read_locales` scope (every merchant would have to approve it again), so that
 * is deferred.
 */
const BY_COUNTRY: Record<string, Locale> = {
  DE: "de", AT: "de", LI: "de",
  FR: "fr", MC: "fr", LU: "fr",
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", UY: "es", EC: "es", VE: "es",
  BO: "es", PY: "es", CR: "es", PA: "es", GT: "es", DO: "es", HN: "es", SV: "es", NI: "es", CU: "es",
  BR: "pt-BR", PT: "pt-BR",
  // India is left out on purpose (most Indian Shopify stores run in English), and so
  // are Hong Kong, Macau and Singapore (English or mixed).
  CN: "zh-CN",
  TW: "zh-TW",
  JP: "ja",
};

export function languageForCountry(country: string | null | undefined): Locale | null {
  return BY_COUNTRY[(country ?? "").toUpperCase()] ?? null;
}
