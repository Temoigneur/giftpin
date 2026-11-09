/**
 * Language links for the foot of guest pages (Settings → Show a language menu).
 *
 * Plain links to the same page with ?lang=xx, so they work without JavaScript
 * and without the page builders knowing about them: the proxy router adds the
 * row to the finished HTML. Pure functions, no server imports (the router
 * does the I/O).
 */

import { LOCALES, LOCALE_NAMES, type Locale } from "../shared/i18n";

/** Params Shopify adds to every proxied request, or that we set ourselves. Never copied into a link. */
const DROP = new Set(["shop", "timestamp", "signature", "path_prefix", "logged_in_customer_id", "lang"]);

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The row, or "" when there's no </footer> to put it in. */
export function languageMenuHtml(opts: { pathPrefix: string; path: string; query: URLSearchParams; current: Locale; label: string }): string {
  const keep = new URLSearchParams();
  for (const [k, v] of opts.query) if (!DROP.has(k)) keep.append(k, v);
  const base = `${opts.pathPrefix.replace(/\/$/, "")}/${opts.path}`.replace(/\/$/, "") || "/";
  const links = LOCALES.map((l) => {
    const q = new URLSearchParams(keep);
    q.set("lang", l);
    const name = esc(LOCALE_NAMES[l]);
    return l === opts.current
      ? `<b lang="${l}">${name}</b>`
      : `<a href="${esc(`${base}?${q.toString()}`)}" lang="${l}" hreflang="${l}">${name}</a>`;
  }).join(" · ");
  return `<p class="lang-links" style="margin:10px 0 0;font-size:13px;line-height:1.9" aria-label="${esc(opts.label)}">${links}</p>`;
}

/** Puts the row just inside the page footer. Pages without one are left alone. */
export function withLanguageMenu(html: string, menu: string): string {
  const at = html.lastIndexOf("</footer>");
  return at === -1 || !menu ? html : html.slice(0, at) + menu + "\n" + html.slice(at);
}
