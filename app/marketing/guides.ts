import { esc, finalCta, icon, sitePage } from "./layout";
import { PRICE, PRO_NAME, TRIAL } from "./plans-copy";

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

const section = (title: string, lede: string, inner: string, tint = false) => `
<section class="sec${tint ? " tint" : ""}">
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

const WEDDING_FAQ = [
  {
    q: "What is a universal wedding registry?",
    a: "One registry where a couple can add gifts from any online store, instead of a separate list at every shop. Guests get a single link for everything.",
  },
  {
    q: "Can a Shopify store offer a universal wedding registry?",
    a: "Yes. With Giftpin, couples start their registry on your store, add your products and gifts from anywhere else, and share one link. Your matching products are suggested beside everything added from other shops.",
  },
  {
    q: "How are duplicate wedding gifts avoided?",
    a: "When a guest goes to buy a gift, the registry shows Someone may be buying this. Orders from your store update the registry automatically, including Shop Pay, Apple Pay and Google Pay orders.",
  },
];

export function weddingRegistryHtml(): string {
  const body = `
${hero(
  `${icon("heart")} Wedding registries for Shopify`,
  `A universal wedding registry<br><span class="grad-text">that starts in your store.</span>`,
  "Couples want one registry for everything: the dinnerware from you, the stand mixer from somewhere else, the honeymoon luggage from a third shop. Giftpin gives them that, on your store's domain, with your products suggested first.",
)}
${section(
  "Why couples choose a universal registry",
  "Most couples register in more than one place. A registry limited to one catalog sends them to build a second list somewhere else.",
  cards([
    { icon: "globe", title: "Every gift on one list", detail: "Couples paste a link from almost any online shop and Giftpin fills in the photo, name and price." },
    { icon: "link", title: "One link for guests", detail: "For the wedding website, the invitation or the group chat. No account, nothing to install." },
    { icon: "bulb", title: "Room-by-room ideas", detail: "A wedding ideas guide helps couples fill their registry, with your products one tap away." },
  ]),
)}
${section(
  "Why it's good for your store",
  "Wedding guests arrive ready to buy. Giftpin keeps them on your products.",
  cards([
    { icon: "sparkle", title: "Your product, suggested first", detail: "When a couple adds something from another shop, Giftpin shows your closest match beside it, one tap to swap." },
    { icon: "card", title: "Credit through express checkout", detail: "Shop Pay, Apple Pay, Google Pay and the Shop app skip the cart. Giftpin still credits every gift to the right registry." },
    { icon: "truck", title: "Gifts ship to the couple", detail: "Guests can send store gifts straight to the couple's saved address, which guests never see." },
  ]),
  true,
)}
${section(
  "No duplicate wedding gifts",
  "",
  cards([
    { icon: "shield", title: "Held while a guest buys", detail: "The registry shows Someone may be buying this, and frees the gift again if they don't go through with it." },
    { icon: "chart", title: "Clear progress", detail: "Guests see what's available, possibly taken and already gifted at a glance." },
    { icon: "list", title: "Thank-you list included", detail: "The couple gets a who-gave-what list, downloadable as a spreadsheet." },
  ]),
)}
${section("Questions merchants ask", "", faqList(WEDDING_FAQ), true)}
${finalCta("Give your couples a registry with no walls.")}
`;
  return sitePage({
    path: "/wedding-registry",
    nav: "guides",
    title: "Universal wedding registry app for Shopify stores | Giftpin",
    description:
      "Offer couples a universal wedding registry on your Shopify store: gifts from any shop on one list, your products suggested first, no duplicate gifts, and credit through Shop Pay, Apple Pay and Google Pay.",
    body,
    css: CSS,
    jsonLd: [faqLd(WEDDING_FAQ)],
  });
}

/* ------------------------------------------------------------------ */

type Row = { label: string; catalogOnly: string; giftpin: string };

const ROWS: Row[] = [
  { label: "Gifts from other stores", catalogOnly: "Usually not: your catalog only", giftpin: "Yes, pasted from almost any online shop" },
  { label: "Your products when a gift comes from elsewhere", catalogOnly: "The couple leaves to register somewhere else", giftpin: "Your closest match suggested beside it" },
  { label: "Credit for Shop Pay, Apple Pay and Google Pay orders", catalogOnly: "Varies", giftpin: "Yes, every gift credited to the right item" },
  { label: "Duplicate-gift protection for gifts bought elsewhere", catalogOnly: "Not applicable", giftpin: "Held while a guest buys" },
  { label: "Registry pages on your own domain", catalogOnly: "Varies", giftpin: "Yes" },
  { label: "Accounts for registrants and guests", catalogOnly: "Often required", giftpin: "Not needed" },
];

const COMPARE_FAQ = [
  {
    q: "What should I look for in a Shopify registry app?",
    a: "Whether couples can add gifts from other stores, whether express checkouts like Shop Pay are credited to the right registry, how duplicate gifts are prevented, and whether the pricing takes a cut of your sales.",
  },
  {
    q: "Doesn't letting registrants add other stores' products lose me sales?",
    a: "Registrants who can't add everything tend to build a second registry elsewhere and send guests there. Giftpin keeps the whole list on your store and suggests your matching product beside each outside gift.",
  },
  {
    q: "What does Giftpin cost?",
    a: `Free covers unlimited registries, items and guests. ${PRO_NAME} is ${PRICE} a month with a ${TRIAL}. Neither plan takes a cut of your product sales.`,
  },
];

export function compareHtml(): string {
  const table = `<div class="cmp rise" role="region" aria-label="Comparison" tabindex="0"><table>
<thead><tr><th scope="col"></th><th scope="col">Catalog-only registry apps</th><th scope="col">Giftpin</th></tr></thead>
<tbody>${ROWS.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.catalogOnly)}</td><td>${esc(r.giftpin)}</td></tr>`).join("")}</tbody>
</table></div>
<p class="fine-note rise">"Catalog-only" describes registry apps that only let registrants add the store's own products. Features differ from app to app, so check each listing.</p>`;

  const body = `
${hero(
  `${icon("list")} Choosing a registry app`,
  `Giftpin vs catalog-only<br><span class="grad-text">registry apps</span>`,
  "Many Shopify registry apps only let customers add your own products. That's simple, but it's not how people register. Here's what changes when the registry can hold everything.",
)}
${section("Side by side", "", table)}
${section("Questions merchants ask", "", faqList(COMPARE_FAQ), true)}
${finalCta("See what a registry with no walls does for your store.")}
`;
  return sitePage({
    path: "/compare",
    nav: "guides",
    title: "Choosing a gift registry app for Shopify: Giftpin vs catalog-only apps",
    description:
      "How Giftpin compares with registry apps limited to your own catalog: gifts from any store, your products suggested first, credit through Shop Pay and express checkouts, and no accounts for guests.",
    body,
    css: CSS,
    jsonLd: [faqLd(COMPARE_FAQ)],
  });
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
`;
