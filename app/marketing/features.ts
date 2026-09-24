import { esc, finalCta, icon, sitePage } from "./layout";
import { PRICE, PRO_FEATURES, PRO_NAME, TRIAL, type Feature } from "./plans-copy";

/** giftpin.app/features: everything Giftpin does, by who it's for. */
export function featuresHtml(): string {
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
    <p class="eyebrow">${icon("sparkle")} Features</p>
    <h1>Every gift. Every store.<br><span class="grad-text">One registry.</span></h1>
    <p class="lede">Giftpin gives your customers a registry with no walls, gives their guests a page that's easy to shop, and gives you the first look at every gift.</p>
    <nav class="jump" aria-label="Jump to">
      <a href="#registrants">For registrants</a><a href="#guests">For guests</a><a href="#merchants">For your store</a><a href="#pro">${PRO_NAME}</a>
    </nav>
  </div>
</section>

${group(
  "registrants",
  `${icon("heart")} For registrants`,
  "The list they actually want.",
  "Couples, parents-to-be and birthday people shouldn't have to pick one store. With Giftpin they don't.",
  REGISTRANT,
)}
${group(
  "guests",
  `${icon("gift")} For guests`,
  "Shopping for them is a pleasure.",
  "One link, no account and no guesswork about what's already been bought.",
  GUESTS,
  true,
)}
${group(
  "merchants",
  `${icon("store")} For your store`,
  "Registry traffic is high-intent traffic. Keep it.",
  "Giftpin keeps your products in front of registrants and guests at every step, and gets the hard parts of checkout right.",
  MERCHANT,
)}

<section class="sec tint" id="pro">
  <div class="wrap">
    <div class="sec-head rise">
      <p class="eyebrow">${icon("sparkle")} ${PRO_NAME} · ${PRICE}/month</p>
      <h2>Grow registry revenue on autopilot.</h2>
      <p class="lede">Everything in Free, plus insight, your own branding, and follow-ups that bring registrants and guests back. Starts with a ${TRIAL}.</p>
    </div>
    <div class="grid-3">${PRO_FEATURES.map((f) => card(f, true)).join("")}</div>
    <p class="more rise"><a href="/pricing">Compare plans ${icon("arrow")}</a></p>
  </div>
</section>

${finalCta("Ready to give your store a registry with no walls?")}
`;

  return sitePage({
    path: "/features",
    nav: "features",
    title: "Giftpin features: gift registries for Shopify",
    description:
      "Everything Giftpin does: registries with gifts from any store, your matching products suggested, no duplicate gifts, correct credit through Shop Pay, Apple Pay and Google Pay, and Pro analytics, branding and automatic emails.",
    body,
    css: CSS,
  });
}

function card(f: Feature, pro = false): string {
  return `<div class="card rise">
  <span class="chip-ico">${icon(f.icon)}</span>
  <h3>${esc(f.title)}${pro ? '<span class="pro-tag">Pro</span>' : ""}</h3>
  ${f.detail ? `<p>${esc(f.detail)}</p>` : ""}
</div>`;
}

const REGISTRANT: Feature[] = [
  { icon: "globe", title: "Add gifts from any store", detail: "Paste a product link from almost any shop online and Giftpin fills in the photo, name and price." },
  { icon: "store", title: "Browse your store from the registry", detail: "Your catalog is one tap away while they build their list, and your Add to registry button works on every product page." },
  { icon: "bulb", title: "Ideas guides", detail: "Room-by-room ideas for weddings, and an ideas guide for every other occasion, from nursery basics to dorm essentials." },
  { icon: "heart", title: "Made for their occasion", detail: "Weddings, baby showers, birthdays, graduations, housewarmings, new pets, fundraisers and more." },
  { icon: "truck", title: "Gifts ship to their door", detail: "They save a shipping address once, and gifts bought from your store go straight to them. Guests never see it." },
  { icon: "list", title: "Who gave what", detail: "A thank-you list that fills itself in, downloadable as a spreadsheet." },
  { icon: "mail", title: "Hear about every gift", detail: "An email when someone buys something, and a private link to manage the registry. No account or password." },
  { icon: "link", title: "One link to share", detail: "Works in a text, a group chat, an invitation or a wedding website." },
  { icon: "sparkle", title: "Room for a personal note", detail: "A message for guests at the top of the registry, and artwork to match the occasion." },
];

const GUESTS: Feature[] = [
  { icon: "link", title: "One page, every gift", detail: "Everything on the registry in one place, wherever it's sold." },
  { icon: "shield", title: "No double gifts", detail: "The moment someone goes to buy, the registry shows Someone may be buying this. If they don't, it comes back." },
  { icon: "card", title: "Their favorite way to pay", detail: "Gifts from your store go through your checkout, including Shop Pay, Apple Pay, Google Pay and the Shop app." },
  { icon: "lock", title: "No account needed", detail: "Guests open the link and shop. Nothing to sign up for and nothing to install." },
  { icon: "chart", title: "See what's left at a glance", detail: "A progress bar and clear labels for what's available, possibly taken and already gifted." },
  { icon: "globe", title: "Straight to the right shop", detail: "Gifts from other stores link straight to the original product page." },
];

const MERCHANT: Feature[] = [
  { icon: "sparkle", title: "Your product, suggested first", detail: "When a registrant adds something from another shop, Giftpin searches your catalog and shows your closest match beside it, one tap to swap." },
  { icon: "card", title: "Credit that survives express checkout", detail: "Shop Pay, Apple Pay, Google Pay and the Shop app skip the cart. Giftpin still credits every gift to the right registry and item." },
  { icon: "puzzle", title: "Theme blocks, no code", detail: "An Add to registry button for product pages, plus create, find and manage registry links you can place anywhere in the theme editor." },
  { icon: "globe", title: "On your own domain", detail: "Registry pages live on your store's domain and link guests back to your products." },
  { icon: "heart", title: "You choose the occasions", detail: "Turn each occasion on or off for your store in Giftpin's settings." },
  { icon: "chart", title: "Overview dashboard", detail: "Registries, items and gifts at a glance, right in your Shopify admin." },
  { icon: "percent", title: "No fee on your sales", detail: "Free is free. Pro is a flat monthly price. Neither takes a cut of your own product sales." },
  { icon: "lock", title: "Read-only on your catalog", detail: "Giftpin never edits your products, prices or inventory." },
  { icon: "bolt", title: "Unlimited everything", detail: "Registries, items and guests, on both plans." },
];

const CSS = `
.jump{display:flex; flex-wrap:wrap; justify-content:center; gap:10px; margin-top:32px}
.jump a{color:#fff; text-decoration:none; font-weight:700; font-size:15px; padding:9px 18px; border-radius:99px; border:1px solid var(--night-line); background:rgba(255,255,255,.05)}
.jump a:hover{background:rgba(255,255,255,.12)}
.sec{scroll-margin-top:68px}
.more{margin-top:32px; text-align:center; font-weight:700}
.more a{display:inline-flex; align-items:center; gap:6px; text-decoration:none}
.more .i{width:18px; height:18px}
`;
