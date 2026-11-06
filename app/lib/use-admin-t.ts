import { useMemo } from "react";
import { useRouteLoaderData } from "react-router";
import { hasMessage, intlTag, t, tn, toLocale, type Locale, type MessageKey } from "../shared/i18n";

/**
 * Translation for the merchant admin. The language comes from the /app layout
 * route's loader (see adminLocale), not from a global, so server render and
 * browser hydration agree and concurrent requests can't mix languages.
 */
export function useAdminLocale(): Locale {
  const data = useRouteLoaderData("routes/app") as { locale?: string } | undefined;
  return toLocale(data?.locale);
}

type Vars = Record<string, string | number>;
type PluralBase = Parameters<typeof tn>[0];

export type AdminT = ((key: MessageKey, vars?: Vars) => string) & {
  locale: Locale;
  intl: string;
  /** Plural by count: `t.n("admin.reg.item", 3)` picks `_one` / `_other`. */
  n: (base: PluralBase, n: number, vars?: Vars) => string;
  /** An occasion's name ("Wedding"), or "Registry" if it isn't one we know. */
  event: (value: string) => string;
};

export function useAdminT(): AdminT {
  const locale = useAdminLocale();
  return useMemo(
    () =>
      Object.assign((key: MessageKey, vars?: Vars) => t(key, vars, locale), {
        locale,
        intl: intlTag(locale),
        n: (base: PluralBase, n: number, vars?: Vars) => tn(base, n, vars, locale),
        event: (value: string) => {
          const key = `event.${value}`;
          return hasMessage(key) ? t(key, undefined, locale) : t("event.fallback", undefined, locale);
        },
      }),
    [locale],
  );
}

const LINK_MARK = "\u0001";

/**
 * A sentence that contains a link ("Perks show on Giftpin Pro. {link} to turn
 * them on.") is translated as one string, then cut around the link so the JSX
 * can put an <s-link> in the gap: `const [a, b] = splitAtLink(t(key))`.
 */
export function splitAtLink(t: AdminT, key: MessageKey, vars?: Record<string, string | number>): [string, string] {
  const [before = "", after = ""] = t(key, { ...vars, link: LINK_MARK }).split(LINK_MARK);
  return [before, after];
}
