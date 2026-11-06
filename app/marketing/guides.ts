import { esc, finalCta, icon, sitePage, siteLocale } from "./layout";
import { FOUNDING_OFFER, PRICE, PRO_NAME, TRIAL } from "./plans-copy";
import { GIFT_CARD_FEE_HOLD_DAYS, GIFT_CARD_FEE_PERCENT, PRO_TRIAL_DAYS } from "../shared/plans";
import { GUIDE_COPY, type Shot, type Step } from "./guide-copy";
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
  { label: "Shoppers whose registry is on another site", catalogOnly: "Usually not served", giftpin: "Your button can add to Babylist, or copy the link for any registry that takes one" },
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

/* ------------------------------------------------------------------ */

const APP_FAQ = [
  {
    q: "What does a gift registry app do for a Shopify store?",
    a: "It lets customers build a list of gifts they want for an occasion and share one link with friends and family. Guests buy from your store, and most of them are new customers.",
  },
  {
    q: "Which occasions does Giftpin support?",
    a: "Weddings, baby showers, birthdays, graduations, housewarmings, holidays, new pets and more. You choose which ones your store offers in Giftpin's settings.",
  },
  {
    q: "Do I need to edit my theme code?",
    a: "No. Giftpin adds an Add to registry button and registry links as theme blocks you place in the theme editor, and registry pages live on your store's own domain.",
  },
  {
    q: "What does it cost?",
    a: `Free covers unlimited registries, items and guests. ${PRO_NAME} is ${PRICE} a month with a ${TRIAL}. Neither plan takes a cut of your product sales.`,
  },
];

export function giftRegistryAppHtml(): string {
  const body = `
${hero(
  `${icon("gift")} Gift registry app for Shopify`,
  `A gift registry for your store<br><span class="grad-text">that brings in new customers.</span>`,
  "Every registry your customers share sends their friends and family to your store. Giftpin gives them one list for every gift, keeps your products front and centre, and stops duplicate gifts.",
)}
${section(
  "How a registry wins you customers",
  "A registrant shares one link. Everyone who opens it lands on your store, ready to buy.",
  cards([
    { icon: "link", title: "One link, many guests", detail: "Registrants share their registry in a text, an invitation or a wedding website. Each guest is a shopper you didn't pay to reach." },
    { icon: "store", title: "On your own domain", detail: "Registry pages live on your store and link guests straight to your products and your checkout." },
    { icon: "mail", title: "Registrants come back", detail: `With ${PRO_NAME}, registrants get a single-use completion discount after their event for your products still on their list.` },
  ]),
)}
${section(
  "Built for how people really register",
  "Registrants want everything on one list. Giftpin lets them have it, and puts your catalog first.",
  cards([
    { icon: "globe", title: "Gifts from any store", detail: "Registrants paste a link from almost any online shop, or add it with the Giftpin Chrome extension." },
    { icon: "sparkle", title: "Your product, suggested first", detail: "When a gift comes from another shop, Giftpin shows your closest match beside it, one tap to swap." },
    { icon: "shield", title: "No duplicate gifts", detail: "The registry shows Someone may be buying this while a guest checks out, and frees the gift if they don't." },
  ]),
  true,
)}
${section(
  "Set up in minutes",
  "",
  cards([
    { icon: "puzzle", title: "Theme blocks, no code", detail: "Add the Add to registry button and registry links in the theme editor." },
    { icon: "card", title: "Every checkout credited", detail: "Shop Pay, Apple Pay, Google Pay and the Shop app orders are credited to the right registry item." },
    { icon: "heart", title: "Your occasions", detail: "Turn weddings, baby showers, birthdays and more on or off for your store." },
  ]),
)}
${section("Questions merchants ask", "", faqList(APP_FAQ), true)}
${finalCta("Turn every registry into new customers.")}
`;
  return sitePage({
    path: "/gift-registry-app",
    nav: "guides",
    title: "Gift registry app for Shopify stores | Giftpin",
    description:
      "Giftpin is a gift registry app for Shopify that brings new customers to your store: registries on your own domain, gifts from any shop on one list, your products suggested first, and no duplicate gifts.",
    body,
    css: CSS,
    jsonLd: [faqLd(APP_FAQ)],
  });
}

/* ------------------------------------------------------------------ */

const BABY_FAQ = [
  {
    q: "Can my Shopify store offer a baby registry?",
    a: "Yes. With Giftpin, parents-to-be start a baby registry on your store, add your products and anything else they need from other shops, and share one link with family and friends.",
  },
  {
    q: "Can gifts ship straight to the parents?",
    a: "Yes. Parents save a shipping address once, and guests can send gifts from your store straight to them. Guests never see the address.",
  },
  {
    q: "What about parents who already have a Babylist registry?",
    a: "Your Add to registry button can offer it. Turn on Also offer Babylist in the button's settings and shoppers get a choice: your store's registry, or their own Babylist registry, added through Babylist's add-to-Babylist script. Giftpin isn't affiliated with Babylist and doesn't track purchases made from Babylist registries.",
  },
  {
    q: "Does Giftpin help parents decide what to add?",
    a: "Yes. A baby registry ideas guide lists what a new baby needs, from sleep and feeding to bath time, with your products one tap away.",
  },
];

export function babyRegistryHtml(): string {
  const body = `
${hero(
  `${icon("heart")} Baby registries for Shopify`,
  `A baby registry<br><span class="grad-text">that starts in your store.</span>`,
  "Parents-to-be need a lot, from a crib to sleep sacks, and they rarely find it all in one shop. Giftpin lets them build one baby registry with your products and anything else they need, then share a single link.",
)}
${section(
  "Why parents choose it",
  "",
  cards([
    { icon: "globe", title: "Everything baby needs, one list", detail: "Parents paste a link from almost any online shop and Giftpin fills in the photo, name and price." },
    { icon: "bulb", title: "Ideas by what baby needs", detail: "A baby registry ideas guide covers sleep, feeding, bath time and more." },
    { icon: "truck", title: "Gifts ship to their door", detail: "Guests can send gifts from your store straight to the parents' saved address." },
  ]),
)}
${section(
  "Why it's good for your store",
  "Baby shower guests are often family who buy more than one gift. Giftpin keeps them on your products.",
  cards([
    { icon: "sparkle", title: "Your product, suggested first", detail: "When parents add something from another shop, Giftpin shows your closest match beside it, one tap to swap." },
    { icon: "shield", title: "No duplicate gifts", detail: "The registry shows Someone may be buying this while a guest checks out." },
    { icon: "list", title: "Thank-you list included", detail: "Parents get a who-gave-what list, downloadable as a spreadsheet." },
    { icon: "link", title: "Already on Babylist? Still welcome", detail: "Your Add to registry button can ask Which registry? and add your product to the parents' Babylist registry, so they shop with you either way." },
    { icon: "box", title: "No sold-out surprises", detail: "Products you've sold out of are marked on registries, or hidden until they're back in stock." },
    { icon: "upload", title: "Switching registry apps?", detail: "Import registries from your old app's spreadsheet. Gifts already bought stay bought." },
  ]),
  true,
)}
${section("Questions merchants ask", "", faqList(BABY_FAQ))}
${finalCta("Give parents-to-be one registry for everything.")}
`;
  return sitePage({
    path: "/baby-registry",
    nav: "guides",
    title: "Baby registry app for Shopify stores | Giftpin",
    description:
      "Offer parents-to-be a baby registry on your Shopify store: gifts from any shop on one list, your products suggested first, gifts shipped to the parents, and no duplicate gifts.",
    body,
    css: CSS,
    jsonLd: [faqLd(BABY_FAQ)],
  });
}

/* ------------------------------------------------------------------ */

const HOME_FAQ = [
  {
    q: "Can a home goods or kitchen store offer wedding registries on Shopify?",
    a: "Yes. With Giftpin, couples start a wedding or housewarming registry on your store, add your cookware, linens and tableware, and share one link with their guests.",
  },
  {
    q: "What if a couple wants something I don't carry?",
    a: "They can add it from another store, so the registry stays complete. Giftpin shows your closest match beside it, one tap to swap, so your products come first.",
  },
  {
    q: "Do guests need an account?",
    a: "No. Guests open the link, see what's already taken and check out on your store.",
  },
  {
    q: "What does it cost?",
    a: `Free covers unlimited registries, items and guests. ${PRO_NAME} is ${PRICE} a month with a ${TRIAL}. Neither plan takes a cut of your product sales.`,
  },
];

export function homeGoodsRegistryHtml(): string {
  const body = `
${hero(
  `${icon("store")} Registries for home goods stores`,
  `A wedding registry for your<br><span class="grad-text">kitchen and home store.</span>`,
  "Couples register for the things you sell: cookware, dinnerware, linens, decor. Giftpin lets them build that registry on your store, so their guests shop with you.",
)}
${section(
  "Why home goods stores fit",
  "Wedding and housewarming registries are mostly home goods. Today couples build them somewhere else.",
  cards([
    { icon: "link", title: "One link, many guests", detail: "Every registry sends a couple's friends and family to your store, ready to buy." },
    { icon: "store", title: "On your own domain", detail: "Registry pages live on your store and link guests to your products and your checkout." },
    { icon: "shield", title: "No duplicate gifts", detail: "The registry shows Someone may be buying this while a guest checks out." },
  ]),
)}
${section(
  "Your products come first",
  "Couples can still add what you don't carry, and you stay at the top of the list.",
  cards([
    { icon: "sparkle", title: "Your closest match, suggested", detail: "When a couple adds an item from another store, Giftpin shows your nearest product beside it." },
    { icon: "globe", title: "A complete registry", detail: "Couples keep everything on one list, so they have no reason to leave for a bigger registry." },
    { icon: "puzzle", title: "No theme code", detail: "Add the Add to registry button and registry links as theme blocks in the theme editor." },
  ]),
  true,
)}
${section("Questions merchants ask", "", faqList(HOME_FAQ))}
${finalCta("Give couples a registry that starts in your store.")}
`;
  return sitePage({
    path: "/home-goods-registry",
    nav: "guides",
    title: "Wedding registry app for home goods and kitchen stores | Giftpin",
    description:
      "Offer wedding and housewarming registries on your Shopify home goods or kitchen store: couples add your products first, anything else from other shops, and guests buy from you.",
    body,
    css: CSS,
    jsonLd: [faqLd(HOME_FAQ)],
  });
}

/* ------------------------------------------------------------------ */

/**
 * Seasonal page at giftpin.app/holiday-wish-lists (29 Oct 2026), for gift
 * and home stores ahead of the holiday rush. The angle is a shareable list so
 * family doesn't buy duplicates, built on the date-less Wish list occasion
 * (off until the merchant ticks it in Settings → Occasions). It is not a
 * save-for-later heart button, and the copy says so. The home banner and
 * footer link switch off on their own: see holidayPromoOn() in config.ts.
 */
const HOLIDAY_FAQ = [
  {
    q: "Is this a save-for-later wishlist button?",
    a: "No. Giftpin wish lists are made to be shared: a shopper builds a list, sends one link to family and friends, and gifts are marked as they're bought. If you want a heart button for saving products to buy yourself later, a dedicated wishlist app is a better fit.",
  },
  {
    q: "How do I turn on wish lists?",
    a: "In Giftpin, open Settings, tick Wish list under Occasions and save. It's off until you switch it on. Shoppers then pick Wish list when they start a list, and it has no event date to fill in.",
  },
  {
    q: "Can a list include things from other stores?",
    a: "Yes, if you allow items from other stores in Settings. Your own products stay at the top of the list, and Giftpin suggests your closest match beside anything added from elsewhere.",
  },
  {
    q: "Do family members need an account?",
    a: "No. They open the link, see what's already taken and buy from your store with your normal checkout, including Shop Pay.",
  },
  {
    q: "What does it cost?",
    a: `Wish lists are on the free plan, with unlimited lists, items and guests. ${PRO_NAME} is ${PRICE} a month with a ${TRIAL}. Neither plan takes a cut of your product sales.`,
  },
];

export function holidayWishListsHtml(): string {
  const body = `
<section class="hero page-hero">
  <div class="wrap">
    <p class="eyebrow">${icon("gift")} Holiday wish lists</p>
    <h1>Christmas lists that send<br><span class="grad-text">family to your store.</span></h1>
    <p class="lede">Let shoppers make a holiday wish list on your store and share one link with the whole family. Every gift is marked as it's bought, so nobody doubles up, and the shopping happens at your checkout.</p>
    ${FOUNDING_OFFER ? `<p class="founding">${icon("star")} ${esc(FOUNDING_OFFER)}</p>` : ""}
  </div>
</section>
${section(
  "Why it works for gift and home stores",
  "Holiday lists get passed around to parents, grandparents, aunts and friends. Each one is a reason to visit your store.",
  cards([
    { icon: "link", title: "One link for the whole family", detail: "Shoppers share their list by text, WhatsApp or email. Family opens it on any phone, with nothing to sign up for." },
    { icon: "shield", title: "No duplicate gifts", detail: "While someone checks out, the list shows Someone may be buying this. Once it's bought, it's marked as taken." },
    { icon: "store", title: "Your products first", detail: "The list lives on your store's domain and your products sit at the top, buyable in one tap." },
  ]),
)}
${section(
  "Set up in minutes",
  "No theme code. If you already use Giftpin for registries, it's one tick.",
  cards([
    { icon: "check", title: "Tick Wish list", detail: "In Giftpin, open Settings and tick Wish list under Occasions. It has no event date, so it suits Christmas, Hanukkah, Diwali or any time of year." },
    { icon: "gift", title: "Add the button", detail: "The Add to registry button goes on your product pages as a theme block, so shoppers add your products as they browse." },
    { icon: "globe", title: "Room for everything", detail: "Allow items from other stores and the list stays complete, with your closest match suggested beside each one." },
  ]),
  true,
)}
${section(
  "Ready before your holiday code freeze",
  "Many stores stop changing their theme ahead of Black Friday. Turning on wish lists is an app setting plus a theme block, so it's worth doing now, before the rush.",
  "",
)}
${section("Questions merchants ask", "", faqList(HOLIDAY_FAQ))}
${finalCta("Give shoppers a holiday list that starts in your store.")}
`;
  return sitePage({
    path: "/holiday-wish-lists",
    nav: "guides",
    title: "Holiday wish lists for Shopify gift and home stores | Giftpin",
    description:
      "Let shoppers make a shareable Christmas or holiday wish list on your Shopify store. Family buys from one link, gifts are marked as bought so nobody doubles up, and the sales come to you.",
    body,
    css: CSS,
    jsonLd: [faqLd(HOLIDAY_FAQ)],
  });
}

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

function guideHtml(kind: "setup" | "registry", locale: Locale): string {
  const copy = GUIDE_COPY[locale];
  const eng = GUIDE_COPY.en;
  const doc = copy[kind];
  const engDoc = eng[kind];
  const path = kind === "setup" ? "/setup" : "/registry-guide";
  const notes = [copy.ui.shotsNote, kind === "setup" ? copy.ui.shopifyNote : ""].filter(Boolean);
  const body = `
${hero(`${icon(kind === "setup" ? "list" : "gift")} ${esc(doc.eyebrow)}`, doc.h1, doc.lede)}
${notes.length ? `<div class="wrap"><p class="fine-note">${notes.map(esc).join(" ")}</p></div>` : ""}
${doc.sections
  .map((sec, i) => section(sec.title, sec.lede ?? "", guideSteps(sec.steps, engDoc.sections[i].steps, locale), sec.tint))
  .join("\n")}
${section(doc.faqTitle, "", faqList(doc.faq), !doc.sections[doc.sections.length - 1].tint)}
${kind === "setup" ? finalCta(copy.ui.finalCta) : ""}
`;
  return sitePage({
    path,
    nav: "guides",
    title: doc.metaTitle,
    description: doc.description,
    body,
    css: CSS,
    jsonLd: [faqLd(doc.faq)],
    lang: locale,
    query: locale === "en" ? "" : `?lang=${locale}`,
    alternates: [
      ...LOCALES.map((l) => ({ lang: l, href: `${SITE_URL}${path}${l === "en" ? "" : `?lang=${l}`}` })),
      { lang: "x-default", href: `${SITE_URL}${path}` },
    ],
  });
}

/** Merchant setup guide at giftpin.app/setup. */
export function setupHtml(locale: Locale = siteLocale()): string {
  return guideHtml("setup", locale);
}

/** Registry creator guide at giftpin.app/registry-guide. */
export function registryGuideHtml(locale: Locale = siteLocale()): string {
  return guideHtml("registry", locale);
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
.shot{display:block; max-width:100%; height:auto; margin-top:14px; border:1px solid var(--line); border-radius:12px}
`;
