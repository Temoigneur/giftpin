/**
 * Translations for the pages and emails guests and registrants see.
 *
 * Deliberately not a library. The guest pages are hand-built HTML strings
 * under a 50KB budget with no React (see app/proxy/render/layout.ts), so a
 * React i18n library would buy nothing there. This is a typed dictionary per
 * language plus `t()`.
 *
 * Isomorphic on purpose (CLAUDE.md hard rule 2): no Node imports here, so the
 * admin UI can use it too. Which language is active comes from a pluggable
 * source. On the server, app/lib/i18n.server.ts plugs in an
 * AsyncLocalStorage, so each request carries its own language. A plain
 * module-level "current language" would leak between concurrent guests.
 * Without a source (tests, the browser) it's English.
 *
 * Message syntax: `{name}` is replaced by vars.name. Keys ending in `_one` /
 * `_other` are plural pairs, picked by `tn()` with Intl.PluralRules. Text is
 * returned raw: callers escape it exactly as they escaped the English literal
 * it replaced. A message whose key ends in `Html` contains markup and its vars
 * must already be escaped.
 */

import { en, type Messages } from "./en";
import { fr } from "./fr";
import { es } from "./es";
import { de } from "./de";
import { ptBR } from "./pt-BR";

export type MessageKey = keyof Messages;

export const LOCALES = ["en", "fr", "es", "de", "pt-BR"] as const;
export type Locale = (typeof LOCALES)[number];

/** Each language in its own name, for the Settings picker. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  "pt-BR": "Português (Brasil)",
};

const DICTIONARIES: Record<Locale, Messages> = { en, fr, es, de, "pt-BR": ptBR };

/** BCP 47 tag for Intl. English keeps the en-CA formats the app always used. */
const INTL_TAGS: Record<Locale, string> = { en: "en-CA", fr: "fr-CA", es: "es", de: "de-DE", "pt-BR": "pt-BR" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Anything unknown (old settings, a typo, a missing value) is English. */
export function toLocale(value: unknown): Locale {
  if (isLocale(value)) return value;
  // "fr-CA", "es-MX", "pt" and friends map to the closest language we have.
  if (typeof value === "string") {
    const base = value.toLowerCase().split(/[-_]/)[0];
    if (base === "pt") return "pt-BR";
    if (isLocale(base)) return base;
  }
  return "en";
}

let source: () => Locale | undefined = () => undefined;

/** Called once by app/lib/i18n.server.ts. */
export function setLocaleSource(fn: () => Locale | undefined): void {
  source = fn;
}

export function hasMessage(key: string): key is MessageKey {
  return key in en;
}

export function currentLocale(): Locale {
  return source() ?? "en";
}

export function intlTag(locale: Locale = currentLocale()): string {
  return INTL_TAGS[locale];
}

type Vars = Record<string, string | number>;

function fill(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : whole,
  );
}

function lookup(key: MessageKey, locale: Locale): string {
  return DICTIONARIES[locale][key] ?? en[key];
}

/** The message for `key` in the active language, with `{vars}` filled in. */
export function t(key: MessageKey, vars?: Vars, locale: Locale = currentLocale()): string {
  return fill(lookup(key, locale), vars);
}

type PluralBase = {
  [K in MessageKey]: K extends `${infer B}_one` ? (`${B}_other` extends MessageKey ? B : never) : never;
}[MessageKey];

/** Plural pair `${base}_one` / `${base}_other`. `{n}` is the count. */
export function tn(base: PluralBase, n: number, vars?: Vars, locale: Locale = currentLocale()): string {
  const form = new Intl.PluralRules(intlTag(locale)).select(n) === "one" ? "one" : "other";
  return t(`${base}_${form}` as MessageKey, { n, ...vars }, locale);
}

type NounBase = {
  [K in MessageKey]: K extends `${infer B}.registry` ? (`${B}.wishlist` extends MessageKey ? B : never) : never;
}[MessageKey];

/**
 * Picks `${base}.registry` or `${base}.wishlist`. Written out in full per noun
 * instead of splicing a noun into one sentence, because the article and gender
 * around it change from language to language.
 */
export function tNoun(
  base: NounBase,
  eventType: string | null | undefined,
  vars?: Vars,
  locale: Locale = currentLocale(),
): string {
  return t(`${base}.${eventType === "wishlist" ? "wishlist" : "registry"}` as MessageKey, vars, locale);
}

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/**
 * `t()` for a message that contains markup (an `...Html` key): string `vars`
 * are HTML-escaped, `raw` ones are trusted markup the caller already built.
 */
export function th(key: MessageKey, vars: Vars = {}, raw: Vars = {}, locale: Locale = currentLocale()): string {
  const safe: Vars = {};
  for (const [k, v] of Object.entries(vars)) safe[k] = typeof v === "string" ? v.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]) : v;
  return t(key, { ...safe, ...raw }, locale);
}

/** "registry" or "wish list" in the active language, for `{noun}` slots. */
export function listNounText(eventType: string | null | undefined, locale: Locale = currentLocale()): string {
  return t(eventType === "wishlist" ? "noun.wishlist" : "noun.registry", undefined, locale);
}

/** Long date, e.g. "June 14, 2027" / "14 juin 2027". Dates are stored as UTC midnight. */
export function formatLongDate(date: Date, locale: Locale = currentLocale()): string {
  return new Intl.DateTimeFormat(intlTag(locale), { dateStyle: "long", timeZone: "UTC" }).format(date);
}

export function formatMediumDate(date: Date, locale: Locale = currentLocale()): string {
  return new Intl.DateTimeFormat(intlTag(locale), { dateStyle: "medium", timeZone: "UTC" }).format(date);
}

/** Currency in the active language's format ("$50" / "50 $" / "50 €"). */
export function formatCurrency(
  amount: number,
  currency: string,
  options: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {},
  locale: Locale = currentLocale(),
): string {
  return new Intl.NumberFormat(intlTag(locale), { style: "currency", currency, ...options }).format(amount);
}

export const __testables = { DICTIONARIES };
