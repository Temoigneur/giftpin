import { GIFT_CARD_FEE_PERCENT } from "../shared/plans";
import { esc, finalCta, icon, localeMeta, siteLocale, sitePage } from "./layout";
import { PRICE, PRO_NAME, proFeatures, siteVars, type Feature } from "./plans-copy";
import { SITE_COPY, fill } from "./site-copy";

// Icons are not language-specific, so they live here; the words live in site-copy/.
const REGISTRANT_ICONS = ["globe", "store", "bulb", "heart", "truck", "list", "mail", "link", "sparkle"];
const GUEST_ICONS = ["link", "shield", "card", "lock", "chart", "globe", "box"];
const MERCHANT_ICONS = ["sparkle", "card", "link", "puzzle", "globe", "heart", "chart", "percent", "lock", "bolt", "upload"];

const withIcons = (icons: string[], items: { title: string; detail: string }[], vars: Record<string, string | number>): Feature[] =>
  items.map((f, i) => ({ icon: icons[i], title: fill(f.title, vars), detail: fill(f.detail, vars) }));

/** giftpin.app/features: everything Giftpin does, by who it's for. Synchronous (CLAUDE.md hard rule 9). */
export function featuresHtml(): string {
  const loc = siteLocale();
  const k = SITE_COPY[loc].features;
  const vars = { ...siteVars(loc), fee: GIFT_CARD_FEE_PERCENT };
  const q = loc === "en" ? "" : `?lang=${loc}`;

  const card = (f: Feature, pro = false) => `<div class="card rise">
  <span class="chip-ico">${icon(f.icon)}</span>
  <h3>${esc(f.title)}${pro ? `<span class="pro-tag">${k.proTag}</span>` : ""}</h3>
  ${f.detail ? `<p>${esc(f.detail)}</p>` : ""}
</div>`;

  const group = (id: string, eyebrow: string, title: string, lede: string, items: Feature[], tint = false) => `
<section class="sec${tint ? " tint" : ""}" id="${id}">
  <div class="wrap">
    <div class="sec-head rise">
      <p class="eyebrow">${eyebrow}</p>
      <h2>${title}</h2>
      <p class="lede">${lede}</p>
    </div>
    <div class="grid-3">${items.map((f) => card(f)).join("")}</div>
  </div>
</section>`;

  const body = `
<section class="hero page-hero">
  <div class="wrap">
    <p class="eyebrow">${icon("sparkle")} ${k.eyebrow}</p>
    <h1>${k.h1a}<br><span class="grad-text">${k.h1b}</span></h1>
    <p class="lede">${k.lede}</p>
    <nav class="jump" aria-label="${esc(k.jumpLabel)}">
      <a href="#registrants">${k.jumpRegistrants}</a><a href="#guests">${k.jumpGuests}</a><a href="#merchants">${k.jumpMerchants}</a><a href="#pro">${PRO_NAME}</a>
    </nav>
  </div>
</section>

${group("registrants", `${icon("heart")} ${k.regEyebrow}`, k.regH2, k.regLede, withIcons(REGISTRANT_ICONS, k.registrants, vars))}
${group("guests", `${icon("gift")} ${k.guestEyebrow}`, k.guestH2, k.guestLede, withIcons(GUEST_ICONS, k.guests, vars), true)}
${group("merchants", `${icon("store")} ${k.merchEyebrow}`, k.merchH2, k.merchLede, withIcons(MERCHANT_ICONS, k.merchants, vars))}

<section class="sec tint" id="pro">
  <div class="wrap">
    <div class="sec-head rise">
      <p class="eyebrow">${icon("sparkle")} ${PRO_NAME} · ${PRICE}${loc === "en" ? "/month" : ` ${SITE_COPY[loc].home.perMonth}`}</p>
      <h2>${k.proH2}</h2>
      <p class="lede">${fill(k.proLede, vars)}</p>
    </div>
    <div class="grid-3">${proFeatures(loc).map((f) => card(f, true)).join("")}</div>
    <p class="more rise"><a href="/pricing${q}">${k.comparePlans} ${icon("arrow")}</a></p>
  </div>
</section>

${finalCta(k.finalCta)}
`;

  return sitePage({
    path: "/features",
    nav: "features",
    title: k.title,
    description: k.description,
    body,
    css: CSS,
    ...localeMeta("/features"),
  });
}

const CSS = `
.jump{display:flex; flex-wrap:wrap; justify-content:center; gap:10px; margin-top:32px}
.jump a{color:var(--band-ink); text-decoration:none; font-weight:700; font-size:15px; padding:9px 18px; border-radius:99px; border:1px solid var(--band-line); background:var(--band-chip)}
.jump a:hover{border-color:var(--accent)}
.sec{scroll-margin-top:68px}
.more{margin-top:32px; text-align:center; font-weight:700}
.more a{display:inline-flex; align-items:center; gap:6px; text-decoration:none}
.more .i{width:18px; height:18px}
`;
