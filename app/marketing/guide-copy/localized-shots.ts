import type { Locale } from "../../shared/i18n";

/**
 * Guide screenshots that have a version captured in the reader's own language, as file names
 * (e.g. "p21-nav-apps.png"). The file lives at /guides/<locale>/<name> beside the English one at
 * /guides/<name>. Anything not listed falls back to the English file, so a language can ship one
 * screenshot at a time. A test checks this list against the files on disk.
 */
export const LOCALIZED_SHOTS: Partial<Record<Locale, readonly string[]>> = {
  es: ["p21-nav-apps.png", "p21-nav-giftpin.png", "p21-nav-overview-click.png"],
};

/** The screenshot to show: the locale's own file when there is one, else the English file. */
export function localizedShot(src: string, locale: Locale): string {
  if (locale === "en") return src;
  const m = /^\/guides\/([^/]+)$/.exec(src);
  if (!m) return src;
  return LOCALIZED_SHOTS[locale]?.includes(m[1]) ? `/guides/${locale}/${m[1]}` : src;
}
