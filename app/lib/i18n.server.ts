import { AsyncLocalStorage } from "node:async_hooks";
import { setLocaleSource, toLocale, type Locale } from "../shared/i18n";

/**
 * Per-request language for the server. AsyncLocalStorage, not a module-level
 * variable: a proxy request awaits database and Shopify calls midway, so two
 * guests' renders interleave on one process, and a shared "current language"
 * would show one of them the other's.
 *
 * The store holds a box rather than the bare language so a request can narrow
 * it once it knows which registry it is about (see overrideLocale).
 */
const store = new AsyncLocalStorage<{ locale: Locale }>();

setLocaleSource(() => store.getStore()?.locale);

/** Run `fn` with `locale` active for everything it calls, awaited or not. */
export function withLocale<T>(locale: unknown, fn: () => T): T {
  return store.run({ locale: toLocale(locale) }, fn);
}

/**
 * Switch the rest of the current request to `locale`. A registry can have its
 * own language; the store's is only known up front. Does nothing outside a
 * withLocale() call, and nothing for a blank or unknown language.
 */
export function overrideLocale(locale: string | null | undefined): void {
  const box = store.getStore();
  if (box && locale) box.locale = toLocale(locale);
}
