import { AsyncLocalStorage } from "node:async_hooks";
import { setLocaleSource, toLocale, type Locale } from "../shared/i18n";

/**
 * Per-request language for the server. AsyncLocalStorage, not a module-level
 * variable: a proxy request awaits database and Shopify calls midway, so two
 * guests' renders interleave on one process, and a shared "current language"
 * would show one of them the other's.
 */
const store = new AsyncLocalStorage<Locale>();

setLocaleSource(() => store.getStore());

/** Run `fn` with `locale` active for everything it calls, awaited or not. */
export function withLocale<T>(locale: unknown, fn: () => T): T {
  return store.run(toLocale(locale), fn);
}
