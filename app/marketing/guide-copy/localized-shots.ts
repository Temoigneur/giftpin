import type { Locale } from "../../shared/i18n";

/**
 * Guide screenshots that have a version captured in the reader's own language, as file names
 * (e.g. "p21-nav-apps.png"). The file lives at /guides/<locale>/<name> beside the English one at
 * /guides/<name>. Anything not listed falls back to the English file, so a language can ship one
 * screenshot at a time. A test checks this list against the files on disk.
 */
export const LOCALIZED_SHOTS: Partial<Record<Locale, readonly string[]>> = {
  es: [
    "c6-import.png",
    "m11-settings-gift-card.png",
    "m5-occasions.png",
    "m6-appearance.png",
    "p12-nav-plan.png",
    "p12-plan-free.png",
    "p13-overview-theme.png",
    "p14-gift-card-path.png",
    "p14-import-path.png",
    "p14-order-processing-path.png",
    "p18-theme-block-path.png",
    "p19-cart-block-path.png",
    "p2-after-event.png",
    "p20-menu-item-path.png",
    "p21-nav-apps.png",
    "p21-nav-giftpin.png",
    "p21-nav-overview-click.png",
    "p3-emails.png",
    "p3-nav-settings.png",
    "p3-run-now.png",
    "p4-nav-promotions.png",
    "p4-new-promotion.png",
    "p5-discounts-list.png",
    "p5-nav-discounts.png",
    "p6-analytics.png",
    "p6-nav-analytics.png",
    "p7-export-csv.png",
    "p7-nav-registries.png",
    "p8-instore.png",
    "p8-nav-instore.png",
    "p9-add-tile.png",
    "p9-edit-pos.png",
    "p9-pos-menu.png",
    "p9-product-row.png",
    "p9-product-save.png",
    "p9-products.png",
    "p9-publish-dialog.png",
    "p9-publishing.png",
    "p9-settings-back.png",
    "p9-settings-channels.png",
    "p9-settings.png",
  ],
};

/** The screenshot to show: the locale's own file when there is one, else the English file. */
export function localizedShot(src: string, locale: Locale): string {
  if (locale === "en") return src;
  const m = /^\/guides\/([^/]+)$/.exec(src);
  if (!m) return src;
  return LOCALIZED_SHOTS[locale]?.includes(m[1]) ? `/guides/${locale}/${m[1]}` : src;
}
