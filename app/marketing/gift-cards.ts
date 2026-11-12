import type { Locale } from "../shared/i18n";
import { esc, icon, localeMeta, siteLocale, sitePage } from "./layout";
import { siteVars } from "./plans-copy";
import { LANDING_COPY, fill } from "./site-copy";
import { countryName, formatGiftCardAmount, MAX_LISTED_GIFT_CARD } from "../shared/gift-card-listing";

/**
 * giftpin.app/gift-cards: the gift card directory. Two readers: a shopper
 * picking a store's gift card, and a merchant wondering how to be listed.
 *
 * Every link goes to the store's own /apps/registry/gift-card page, and the
 * shopper pays at that store's checkout. Giftpin never sells a card itself
 * or holds the money, and the copy must never suggest otherwise (no "Giftpin
 * card", nothing redeemable at more than one store).
 *
 * Takes plain data so it stays testable and free of server imports
 * (CLAUDE.md hard rule 2); the route reads the stores.
 */

export interface DirectoryStore {
  domain: string;
  name: string;
  country?: string | null;
  blurb: string;
  currency: string;
  amounts: { amount: number }[];
}

function storeCard(store: DirectoryStore, buy: string): string {
  const href = `https://${store.domain}/apps/registry/gift-card?src=directory`;
  const amounts = store.amounts.map((a) => formatGiftCardAmount(a.amount, store.currency)).join(" · ");
  return `<div class="card gc-store rise">
  <span class="chip-ico">${icon("gift")}</span>
  <h3>${esc(store.name)}</h3>
  ${store.blurb ? `<p>${esc(store.blurb)}</p>` : ""}
  <p class="gc-amounts">${esc(amounts)}</p>
  <a class="btn dark" href="${esc(href)}" rel="noopener" data-store="${esc(store.domain)}">${esc(buy)}</a>
</div>`;
}

/**
 * Stores under their country's name, countries A to Z, stores A to Z within
 * each. A store whose country isn't known yet (it fills in the next time the
 * merchant opens Giftpin) goes under "Other countries", last.
 */
export function groupByCountry(stores: DirectoryStore[], locale: Locale = "en"): { heading: string; stores: DirectoryStore[] }[] {
  const other = LANDING_COPY[locale].giftCards.otherCountries;
  const groups = new Map<string, DirectoryStore[]>();
  for (const store of stores) {
    const heading = countryName(store.country, locale) ?? other;
    groups.set(heading, [...(groups.get(heading) ?? []), store]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a === other ? 1 : b === other ? -1 : a.localeCompare(b, locale)))
    .map(([heading, list]) => ({ heading, stores: [...list].sort((x, y) => x.name.localeCompare(y.name, locale)) }));
}

export function giftCardsHtml(stores: DirectoryStore[]): string {
  const loc = siteLocale();
  const k = LANDING_COPY[loc].giftCards;
  const vars = siteVars(loc);
  const list = stores.length
    ? groupByCountry(stores, loc)
        .map(
          (group) =>
            `<h2 class="gc-country rise">${esc(group.heading)}</h2><div class="grid-3">${group.stores.map((st) => storeCard(st, k.buy)).join("")}</div>`,
        )
        .join("")
    : `<div class="card gc-empty rise"><h3>${esc(k.emptyH)}</h3><p>${esc(k.emptyP)}</p></div>`;

  const body = `
<section class="hero page-hero">
  <div class="wrap">
    <p class="eyebrow">${icon("gift")} ${esc(k.eyebrow)}</p>
    <h1>${k.h1a}<br><span class="grad-text">${k.h1b}</span></h1>
    <p class="lede">${esc(fill(k.lede, { max: formatGiftCardAmount(MAX_LISTED_GIFT_CARD, "USD") }))}</p>
  </div>
</section>
<section class="sec">
  <div class="wrap">${list}</div>
</section>
<section class="sec tint">
  <div class="wrap">
    <div class="sec-head rise"><h2>${esc(k.questions)}</h2></div>
    <div class="qa">${k.faq.map((i) => `<details class="rise"><summary>${esc(fill(i.q, vars))}</summary><p>${esc(fill(i.a, vars))}</p></details>`).join("")}</div>
    <p class="gc-merchant rise">${loc === "en" ? k.merchantLine : k.merchantLine.replace('href="/setup#gift-cards"', `href="/setup?lang=${loc}#gift-cards"`)}</p>
  </div>
</section>
`;

  return sitePage({
    path: "/gift-cards",
    nav: "guides",
    title: k.title,
    description: k.description,
    body,
    ...localeMeta("/gift-cards"),
    css: `
.gc-store{display:flex; flex-direction:column; gap:10px}
.gc-store .btn{margin-top:auto; align-self:flex-start}
.gc-amounts{color:var(--ink-soft); font-weight:600}
.gc-empty{max-width:640px; margin:0 auto; text-align:center}
.gc-country{font-size:22px; margin:36px 0 16px}
.gc-country:first-child{margin-top:0}
.qa{max-width:760px; margin:0 auto; display:grid; gap:12px}
.qa details{background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:16px 20px}
.qa summary{font-weight:700; cursor:pointer}
.qa p{margin:10px 0 0}
.gc-merchant{text-align:center; margin-top:28px}
`,
  });
}
