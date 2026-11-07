import { currentLocale, type Locale } from "../i18n";
import { de } from "./de";
import { es } from "./es";
import { fr } from "./fr";
import { ptBR } from "./pt-BR";
import { hi } from "./hi";
import { zhCN } from "./zh-CN";
import { zhTW } from "./zh-TW";
import { ja } from "./ja";

const IDEA_COPY: Record<Exclude<Locale, "en">, Record<string, string>> = { fr, es, de, "pt-BR": ptBR, hi, "zh-CN": zhCN, "zh-TW": zhTW, ja };

/**
 * An ideas-guide string (group, subgroup, item, title or intro) in the page's
 * language. The English text is the key; anything not translated stays English.
 */
export function ideaText(english: string, locale: Locale = currentLocale()): string {
  if (locale === "en") return english;
  return IDEA_COPY[locale][english] ?? english;
}

export { IDEA_COPY };
