import { esc, finalCta, icon, localeMeta, sitePage, siteLocale } from "./layout";
import { PRICE, PRO_NAME, foundingOffer, siteVars } from "./plans-copy";
import { LANDING_COPY, fill } from "./site-copy";
import { GIFT_CARD_FEE_HOLD_DAYS, GIFT_CARD_FEE_PERCENT, PRO_TRIAL_DAYS } from "../shared/plans";
import { GUIDE_COPY, type Shot, type Step } from "./guide-copy";
import { DOCS_UI } from "./guide-copy/docs-ui";
import { LOCALES, t, type Locale, type MessageKey } from "../shared/i18n";
import { SITE_URL } from "./config";

/**
 * Search landing pages: each answers one thing a merchant types into Google
 * ("universal wedding registry Shopify", "best registry app for Shopify").
 * Linked from the footer and listed in sitemap.xml. Every claim here must
 * match a shipped feature, same rule as the rest of the site.
 */

type Point = { icon: string; title: string; detail: string };

const cards = (points: Point[]) =>
  `<div class="grid-3">${points
    .map(
      (p) => `<div class="card rise">
  <span class="chip-ico">${icon(p.icon)}</span>
  <h3>${esc(p.title)}</h3>
  <p>${esc(p.detail)}</p>
</div>`,
    )
    .join("")}</div>`;

const hero = (eyebrow: string, title: string, lede: string) => `
<section class="hero page-hero">
  <div class="wrap">
    <p class="eyebrow">${eyebrow}</p>
    <h1>${title}</h1>
    <p class="lede">${lede}</p>
  </div>
</section>`;

const section = (title: string, lede: string, inner: string, tint = false, id = "") => `
<section class="sec${tint ? " tint" : ""}"${id ? ` id="${id}"` : ""}>
  <div class="wrap">
    <div class="sec-head rise">
      <h2>${title}</h2>
      ${lede ? `<p class="lede">${lede}</p>` : ""}
    </div>
    ${inner}
  </div>
</section>`;

const faqLd = (items: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
});

const faqList = (items: { q: string; a: string }[]) =>
  `<div class="qa">${items.map((i) => `<details class="rise"><summary>${esc(i.q)}</summary><p>${esc(i.a)}</p></details>`).join("")}</div>`;

/* ------------------------------------------------------------------ */

/**
 * The six search landing pages. Their words live in
 * site-copy/landing-<language>.ts (English is the source); this is layout and
 * icons. Prices and the trial are placeholders filled from the billing
 * constants. Holiday page (29 Oct 2026): for gift and home stores ahead of
 * the rush, built on the date-less Wish list occasion (off until the merchant
 * ticks it in Settings → Occasions). It is not a save-for-later heart button,
 * and the copy says so. The home banner and footer link switch off on their
 * own: see holidayPromoOn() in config.ts. Synchronous (CLAUDE.md hard rule 9).
 */
type PageKey = "wedding" | "compare" | "app" | "baby" | "home" | "holiday";
type Spec = {
  path: string;
  key: PageKey;
  heroIcon: string;
  /** Icons for each card, per section. */
  icons: string[][];
  tints: boolean[];
  faqTint: boolean;
  /** Extra HTML inside the hero, after the lede. */
  founding?: boolean;
  /** Replaces the first section's cards (the comparison table). */
  inner?: (html: string) => string;
};

function landing(spec: Spec): string {
  const loc = siteLocale();
  const k = LANDING_COPY[loc];
  const p = k[spec.key];
  const vars = siteVars(loc);
  const fv = (s: string) => fill(s, vars);
  const founding = spec.founding ? foundingOffer(loc) : "";
  const faq = p.faq.map((i) => ({ q: fv(i.q), a: fv(i.a) }));

  const sections = p.sections
    .map((sec, i) => {
      const inner =
        spec.key === "compare" && i === 0
          ? compareTable(LANDING_COPY[loc].compare.table)
          : sec.cards.length
            ? cards(sec.cards.map((c, n) => ({ icon: spec.icons[i][n], title: fv(c.title), detail: fv(c.detail) })))
            : "";
      return section(sec.title, sec.lede, inner, spec.tints[i]);
    })
    .join("\n");

  const body = `
<section class="hero page-hero">
  <div class="wrap">
    <p class="eyebrow">${icon(spec.heroIcon)} ${p.eyebrow}</p>
    <h1>${p.h1a}<br><span class="grad-text">${p.h1b}</span></h1>
    <p class="lede">${p.lede}</p>
    ${founding ? `<p class="founding">${icon("star")} ${esc(founding)}</p>` : ""}
  </div>
</section>
${sections}
${section(k.faqTitle, "", faqList(faq), spec.faqTint)}
${finalCta(p.finalCta)}
`;
  return sitePage({
    path: spec.path,
    nav: "guides",
    title: p.title,
    description: p.description,
    body,
    css: CSS,
    ...localeMeta(spec.path),
    jsonLd: [faqLd(faq)],
  });
}

function compareTable(t: { aria: string; colCatalog: string; colGiftpin: string; rows: { label: string; catalogOnly: string; giftpin: string }[]; note: string }): string {
  return `<div class="cmp rise" role="region" aria-label="${esc(t.aria)}" tabindex="0"><table>
<thead><tr><th scope="col"></th><th scope="col">${esc(t.colCatalog)}</th><th scope="col">${esc(t.colGiftpin)}</th></tr></thead>
<tbody>${t.rows.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.catalogOnly)}</td><td>${esc(r.giftpin)}</td></tr>`).join("")}</tbody>
</table></div>
<p class="fine-note rise">${esc(t.note)}</p>`;
}

export const weddingRegistryHtml = () =>
  landing({ path: "/wedding-registry", key: "wedding", heroIcon: "heart", icons: [["globe", "link", "bulb"], ["sparkle", "card", "truck"], ["shield", "chart", "list"]], tints: [false, true, false], faqTint: true });

export const compareHtml = () => landing({ path: "/compare", key: "compare", heroIcon: "list", icons: [[]], tints: [false], faqTint: true });

export const giftRegistryAppHtml = () =>
  landing({ path: "/gift-registry-app", key: "app", heroIcon: "gift", icons: [["link", "store", "mail"], ["globe", "sparkle", "shield"], ["puzzle", "card", "heart"]], tints: [false, true, false], faqTint: true });

export const babyRegistryHtml = () =>
  landing({ path: "/baby-registry", key: "baby", heroIcon: "heart", icons: [["globe", "bulb", "truck"], ["sparkle", "shield", "list", "link", "box", "upload"]], tints: [false, true], faqTint: false });

export const homeGoodsRegistryHtml = () =>
  landing({ path: "/home-goods-registry", key: "home", heroIcon: "store", icons: [["link", "store", "shield"], ["sparkle", "globe", "puzzle"]], tints: [false, true], faqTint: false });

export const holidayWishListsHtml = () =>
  landing({ path: "/holiday-wish-lists", key: "holiday", heroIcon: "gift", icons: [["link", "shield", "store"], ["check", "gift", "globe"], []], tints: [false, true, false], faqTint: false, founding: true });

/**
 * The setup guide (giftpin.app/setup) and registry guide (/registry-guide).
 * Their words live in guide-copy/<language>.ts. Every bold label in them is
 * either a `{{key}}` that is filled from the app's own dictionaries (so it is
 * always the exact on-screen text in that language) or a Shopify screen name.
 * Update the copy whenever the app's labels or button positions change.
 */
const GUIDE_VARS: Record<string, string> = {
  trialDays: String(PRO_TRIAL_DAYS),
  proName: PRO_NAME,
  price: PRICE,
  feePct: String(GIFT_CARD_FEE_PERCENT),
  holdDays: String(GIFT_CARD_FEE_HOLD_DAYS),
};

// Items are trusted literals from guide-copy; nothing here comes from a request.
const fillLabels = (html: string, locale: Locale) =>
  html.replace(/\{\{([^}]+)\}\}/g, (_m, key: string) =>
    key in GUIDE_VARS ? esc(GUIDE_VARS[key]) : esc(t(key as MessageKey, undefined, locale)),
  );

const guideShots = (list: Shot[]) =>
  list.map((i) => `<img class="shot" src="${esc(i.src)}" alt="${esc(i.alt)}" loading="lazy">`).join("");

function guideSteps(list: Step[], english: Step[], locale: Locale): string {
  return `<div class="steps">${list
    .map((st, i) => {
      const base = english[i]?.img;
      const imgs = base ? (Array.isArray(base) ? base : [base]) : [];
      const shown = locale === "en" ? imgs : imgs.map((im, n) => ({ src: im.src, alt: st.alts?.[n] ?? im.alt }));
      return `<div class="card rise step"${st.id ? ` id="${esc(st.id)}"` : ""}>
  <span class="step-n">${i + 1}</span>
  <div><h3>${esc(st.title)}</h3><ol>${st.items.map((it) => `<li>${fillLabels(it, locale)}</li>`).join("")}</ol>${guideShots(shown)}</div>
</div>`;
    })
    .join("")}</div>`;
}

type GuideKind = "setup" | "customize" | "pro" | "registry" | "guest";
const GUIDE_PAGES: Record<GuideKind, { path: string; nav: "setup" | "guides"; icon: string; cta: boolean }> = {
  setup: { path: "/setup", nav: "setup", icon: "list", cta: true },
  customize: { path: "/setup/customize", nav: "setup", icon: "puzzle", cta: true },
  pro: { path: "/setup/pro", nav: "setup", icon: "star", cta: true },
  registry: { path: "/registry-guide", nav: "guides", icon: "gift", cta: false },
  guest: { path: "/guest-guide", nav: "guides", icon: "heart", cta: false },
};

const ORDER: GuideKind[] = ["setup", "customize", "pro", "registry", "guest"];
const AUDIENCE: Record<GuideKind, "forMerchant" | "forRegistrant" | "forGuest"> = {
  setup: "forMerchant",
  customize: "forMerchant",
  pro: "forMerchant",
  registry: "forRegistrant",
  guest: "forGuest",
};

/** The menu on every guide: jump to any guide, grouped by who it is for, and (below it) to any section of this page. */
function docsMenu(kind: GuideKind, locale: Locale, sections: { title: string }[]): string {
  const ui = DOCS_UI[locale];
  const q = locale === "en" ? "" : `?lang=${locale}`;
  const link = (k: GuideKind) =>
    `<a href="${GUIDE_PAGES[k].path}${q}"${k === kind ? ' aria-current="page"' : ""}>${esc(ui.links[ORDER.indexOf(k)])}</a>`;
  const toc = sections.length > 1 ? `<p class="dm-toc"><b>${esc(ui.onPage)}</b>${sections.map((sec, i) => `<a href="#s${i + 1}">${esc(sec.title)}</a>`).join("")}</p>` : "";
  return `<div class="wrap"><nav class="docs-menu" aria-label="${esc(ui.menu)}">
  <div><b>${esc(ui.merchants)}</b>${ORDER.slice(0, 3).map(link).join("")}</div>
  <div><b>${esc(ui.customers)}</b>${ORDER.slice(3).map(link).join("")}</div>
  ${toc}
</nav></div>`;
}

function guideHtml(kind: GuideKind, locale: Locale): string {
  const copy = GUIDE_COPY[locale];
  const eng = GUIDE_COPY.en;
  const doc = copy[kind];
  const engDoc = eng[kind];
  const page = GUIDE_PAGES[kind];
  const path = page.path;
  const merchant = page.nav === "setup";
  const notes = [copy.ui.shotsNote, merchant ? copy.ui.shopifyNote : ""].filter(Boolean);
  const body = `
${hero(`${icon(page.icon)} ${esc(doc.eyebrow)} <span class="aud aud-${merchant ? "m" : "c"}">${esc(DOCS_UI[locale][AUDIENCE[kind]])}</span>`, doc.h1, doc.lede)}
${docsMenu(kind, locale, doc.sections)}
${notes.length ? `<div class="wrap"><p class="fine-note">${notes.map(esc).join(" ")}</p></div>` : ""}
${doc.sections
  .map((sec, i) => section(sec.title, sec.lede ?? "", guideSteps(sec.steps, engDoc.sections[i].steps, locale), sec.tint, `s${i + 1}`))
  .join("\n")}
${doc.faq.length ? section(doc.faqTitle, "", faqList(doc.faq), !doc.sections[doc.sections.length - 1].tint) : ""}
${page.cta ? finalCta(copy.ui.finalCta) : ""}
`;
  return sitePage({
    path,
    nav: page.nav,
    title: doc.metaTitle,
    description: doc.description,
    body,
    css: CSS,
    jsonLd: doc.faq.length ? [faqLd(doc.faq)] : [],
    lang: locale,
    query: locale === "en" ? "" : `?lang=${locale}`,
    alternates: [
      ...LOCALES.map((l) => ({ lang: l, href: `${SITE_URL}${path}${l === "en" ? "" : `?lang=${l}`}` })),
      { lang: "x-default", href: `${SITE_URL}${path}` },
    ],
  });
}

/** Merchant setup guide at giftpin.app/setup: install, theme, Save buttons, and a hub to the other guides. */
export function setupHtml(locale: Locale = siteLocale()): string {
  return guideHtml("setup", locale);
}

/** Merchant customize guide at giftpin.app/setup/customize. */
export function setupCustomizeHtml(locale: Locale = siteLocale()): string {
  return guideHtml("customize", locale);
}

/** Merchant Pro guide at giftpin.app/setup/pro. */
export function setupProHtml(locale: Locale = siteLocale()): string {
  return guideHtml("pro", locale);
}

/** Registry creator guide at giftpin.app/registry-guide. */
export function registryGuideHtml(locale: Locale = siteLocale()): string {
  return guideHtml("registry", locale);
}

/** Guest guide at giftpin.app/guest-guide. */
export function guestGuideHtml(locale: Locale = siteLocale()): string {
  return guideHtml("guest", locale);
}

const CSS = `
.qa{max-width:760px; margin:0 auto; display:grid; gap:12px}
.qa details{background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:16px 20px}
.qa summary{font-weight:700; cursor:pointer}
.qa p{margin:10px 0 0}
.cmp{overflow-x:auto; max-width:900px; margin:0 auto}
.cmp table{width:100%; border-collapse:collapse; font-size:15px}
.cmp th,.cmp td{text-align:left; padding:12px 14px; border-bottom:1px solid var(--line); vertical-align:top}
.cmp thead th{font-size:14px; text-transform:uppercase; letter-spacing:.04em}
.cmp td:last-child{font-weight:700}
.fine-note{max-width:900px; margin:16px auto 0; font-size:14px; opacity:.75}
.steps{max-width:860px; margin:0 auto; display:grid; gap:16px}
.step{display:flex; gap:18px; align-items:flex-start}
.step-n{flex:none; width:36px; height:36px; border-radius:50%; display:grid; place-items:center; font-weight:800; color:#fff; background:var(--accent)}
.step h3{margin:4px 0 8px}
.step ol{margin:0; padding-left:20px; display:grid; gap:6px}
.step b{font-weight:700}
.aud{display:inline-block; margin-left:8px; padding:2px 10px; border-radius:999px; font-size:13px; font-weight:700; letter-spacing:0; text-transform:none; border:1px solid var(--accent); color:var(--accent)}
.aud-m{background:var(--accent); color:#fff}
.docs-menu{max-width:860px; margin:20px auto 0; padding:14px 18px; border:1px solid var(--line); border-radius:14px; background:var(--surface); display:grid; gap:10px; font-size:15px}
.docs-menu div,.dm-toc{display:flex; flex-wrap:wrap; gap:6px 10px; align-items:center; margin:0}
.docs-menu b{flex:none; min-width:210px}
.docs-menu a{padding:4px 12px; border-radius:999px; border:1px solid var(--line); text-decoration:none; color:inherit}
.docs-menu a[aria-current="page"]{background:var(--accent); border-color:var(--accent); color:#fff}
.dm-toc{border-top:1px solid var(--line); padding-top:10px}
.dm-toc a{border:0; padding:4px 2px; text-decoration:underline}
.sec[id]{scroll-margin-top:80px}
.shot{display:block; max-width:100%; height:auto; margin-top:14px; border:1px solid var(--line); border-radius:12px}
`;
