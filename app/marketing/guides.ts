import { esc, finalCta, icon, sitePage } from "./layout";
import { FOUNDING_OFFER, PRICE, PRO_NAME, TRIAL } from "./plans-copy";
import { GIFT_CARD_FEE_HOLD_DAYS, GIFT_CARD_FEE_PERCENT } from "../shared/plans";

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
 * Merchant setup guide at giftpin.app/setup. Every label in bold here is the
 * exact text of a button, heading or menu item in the app (app/routes/app.*)
 * or the Shopify admin, so a merchant can follow it literally. Update it
 * whenever those labels change.
 */
type Shot = { src: string; alt: string };
type Step = { title: string; items: string[]; img?: Shot | Shot[]; id?: string };
const shots = (img: Step["img"]) =>
  (img ? (Array.isArray(img) ? img : [img]) : [])
    .map((i) => `<img class="shot" src="${esc(i.src)}" alt="${esc(i.alt)}" loading="lazy">`)
    .join("");

const steps = (list: Step[]) =>
  `<div class="steps">${list
    .map(
      (st, i) => `<div class="card rise step"${st.id ? ` id="${esc(st.id)}"` : ""}>
  <span class="step-n">${i + 1}</span>
  <div><h3>${esc(st.title)}</h3><ol>${st.items.map((it) => `<li>${it}</li>`).join("")}</ol>${shots(st.img)}</div>
</div>`,
    )
    .join("")}</div>`;

// Items are trusted literals with inline <b> for UI labels; nothing here comes from a request.
const GET_STARTED: Step[] = [
  {
    title: "Install Giftpin",
    items: [
      "Open Giftpin on the Shopify App Store and click <b>Install</b>.",
      "Approve the permissions screen. Giftpin opens on its <b>Overview</b> page in your Shopify admin.",
    ],
  },
  {
    title: "Add Giftpin to your theme",
    items: [
      "On <b>Overview</b>, go to <b>Add Giftpin to your theme</b> and pick a theme. You can set up an unpublished copy first.",
      "Click <b>Add button to product pages</b>. The theme editor opens with the Add to registry button already added. Drag it where you want it, then press <b>Save</b>.",
      "Back in Giftpin, click <b>Add registry links</b>. This adds Create, Find and Manage registry links under your header. Press <b>Save</b> in the theme editor.",
      "Optional, for a favourites list: click <b>Add heart to product pages</b>. This opens the product page in the theme editor with a <b>Save for later</b> heart added. Press <b>Save</b>.",
      "Then click <b>Add saved items to the cart page</b>. This adds a <b>Saved items</b> list to your cart page, so shoppers can find what they hearted. Press <b>Save</b>.",
      "These two are not switched on automatically. Until you add them in the theme editor and press <b>Save</b>, shoppers won't see a heart. Hearts are kept in the shopper's own browser, with no account, so the list is empty on a new device.",
      "Prefer to place them by hand? In the theme editor, open the page, click <b>Add block</b> (or <b>Add section</b>), open the <b>Apps</b> group and choose <b>Save for later</b> or <b>Saved items</b>.",
      "Using a vintage (pre-Online Store 2.0) theme? The blocks won't work there, but your registry pages still do: add a menu item pointing to <b>/apps/registry</b> in <b>Online Store → Navigation</b>.",
    ],
    img: [
      { src: "/guides/m1-overview.png", alt: "Giftpin's Overview page with the Add Giftpin to your theme card, the Add button to product pages and Add registry links buttons" },
      { src: "/guides/m2-theme-editor.png", alt: "The Shopify theme editor with the Add to registry block selected on a product page" },
    ],
  },
  {
    title: "Check your registry pages",
    items: [
      "On <b>Overview</b>, under <b>Your registry pages</b>, click <b>Create a registry</b> to see the page your customers use.",
      "Create a test registry, add a product with the Add to registry button, and open the guest link to see what guests see.",
      "Every registry your customers create shows up under <b>Registries</b> in Giftpin's menu.",
    ],
    img: [
      { src: "/guides/m3-product-page.png", alt: "A storefront product page with the Add to registry button under Buy it now, and the Create, Find and Manage registry links above" },
      { src: "/guides/m7-registries.png", alt: "Giftpin's Registries page listing two wedding registries with their items and progress" },
    ],
  },
];

const SETTINGS: Step[] = [
  {
    title: "Choose your occasions",
    items: [
      "Open <b>Settings</b>. Under <b>Occasions</b>, tick the kinds of registry customers can create: weddings, baby showers, birthdays, graduations, housewarmings and more.",
    ],
    img: { src: "/guides/m5-occasions.png", alt: "Giftpin Settings showing the Occasions checklist and the Items from other stores choices" },
  },
  {
    title: "Decide on items from other stores",
    items: [
      "Under <b>Items from other stores</b>, choose <b>Allow (recommended)</b>, <b>Allow, but keep my products in the majority</b>, or <b>My products only</b>.",
      "Allowing them is what makes customers pick your registry as their main one. Giftpin suggests your closest matching product beside each outside item.",
    ],
  },
  {
    title: "Match your store's look",
    items: [
      "Under <b>Appearance</b>, set the <b>Button label</b> and <b>Accent colour</b>.",
      "The Add to registry button and registry links have their own settings in the theme editor: label, icon, colours, size and spacing.",
      "To let shoppers who keep their registry somewhere else use your button too, tick <b>Also offer Babylist</b> or <b>Also offer \"Another registry\"</b> (copies the product link for sites like Zola) in the button's settings. The button then asks which registry.",
      "With Pro, <b>Your branding</b> adds your logo, colours and font to registry pages and removes the Powered by Giftpin credit.",
    ],
    img: { src: "/guides/m6-appearance.png", alt: "Giftpin Settings Appearance section with the Button label and Accent colour fields" },
  },
  {
    title: "Set privacy",
    items: [
      "Under <b>Privacy</b>, choose whether to hide who gave what until the event date, and whether to turn on the public find-a-registry page. Only registries whose owners opt in are listed there.",
    ],
  },
];

const PRO_STEPS: Step[] = [
  {
    title: "Start Pro",
    items: [
      `Open <b>Plan</b> in Giftpin's menu and click <b>Upgrade to Pro</b>. You get a ${TRIAL}, then ${PRO_NAME} is ${PRICE}/month. <b>Cancel Pro</b> is on the same page.`,
    ],
  },
  {
    title: "Group gifts and funds",
    items: [
      "In your Shopify admin, go to <b>Products → Gift cards → Add a gift card product</b>, with a few amounts such as $25, $50 and $100.",
      "In <b>Settings → General → Order processing</b>, choose <b>Automatically fulfill only the gift cards</b>. Shopify only sends a gift card once its order is fulfilled.",
      "In Giftpin, open <b>Settings</b>. Under <b>Group gifts and funds</b>, pick that gift card and press <b>Save</b>. Guests can now chip in toward a big item or a cash fund.",
    ],
  },
  {
    id: "gift-cards",
    title: "Sell gift cards on giftpin.app",
    items: [
      "Set up the gift card in the step above first. The listing uses the same gift card, in amounts up to $500.",
      "In Giftpin, open <b>Settings</b>. Under <b>Sell gift cards on giftpin.app</b>, tick <b>List my gift cards on giftpin.app</b>, add <b>One line about your store</b>, and press <b>Save</b>.",
      "Your store now appears at <a href=\"/gift-cards\">giftpin.app/gift-cards</a>, under your country, and your registry pages get a <b>Rather give a gift card?</b> link. Shoppers buy your gift card at your own checkout, so you keep the money and any unspent balance. Gift cards sold this way show up in Giftpin's <b>Analytics</b>.",
      `Giftpin charges ${GIFT_CARD_FEE_PERCENT}% of each gift card sold this way, on your Shopify bill, ${GIFT_CARD_FEE_HOLD_DAYS} days after the sale so a refunded card is never charged. There's no fee during your free trial.`,
    ],
  },
  {
    title: "After-event discount and automatic emails",
    items: [
      "Under <b>After the event (Pro)</b>, turn on a one-time discount for your products still on the registry, and set the percentage and how long the code works.",
      "Under <b>Automatic emails (Pro)</b>, choose the guest reminder, the most-of-your-list-is-bought alert and the thank-you note reminder.",
    ],
  },
  {
    title: "In-store mode",
    items: [
      "Open <b>In-store</b> in Giftpin's menu to find a customer's registry or start one for them at the counter.",
      "To ring up registry gifts in Shopify POS, add the Giftpin tile: in your Shopify admin, open <b>Point of Sale</b>, then the POS editor, choose <b>Add tile → Embedded Apps</b> and pick Giftpin. Products must be published to the Point of Sale channel.",
    ],
  },
];

const SETUP_FAQ = [
  {
    q: "Where do I see my customers' registries?",
    a: "Open Registries in Giftpin's menu. Overview shows registry revenue, new customers and gifts given.",
  },
  {
    q: "Do registrants or guests need an account?",
    a: "No. Registrants get a private manage link by email, and guests only need the registry link.",
  },
  {
    q: "What happens to the theme blocks if I uninstall?",
    a: "Shopify removes both Giftpin blocks from your themes automatically.",
  },
  {
    q: "I'm stuck. Who do I contact?",
    a: "Email support@giftpin.app with your store's .myshopify.com address and what you were trying to do.",
  },
];

export function setupHtml(): string {
  const body = `
${hero(
  `${icon("list")} Setup guide`,
  `Set up Giftpin<br><span class="grad-text">in about ten minutes</span>`,
  "Everything a merchant needs, from install to your first registry. Bold text is exactly what you'll see on screen.",
)}
${section("Get started", "", steps(GET_STARTED))}
${section("Make it yours", "All in Giftpin's Settings page.", steps(SETTINGS), true)}
${section(`${PRO_NAME}`, "Optional extras for stores that want more.", steps(PRO_STEPS))}
${section("Common questions", "", faqList(SETUP_FAQ), true)}
${finalCta("Ready to give your customers a registry?")}
`;
  return sitePage({
    path: "/setup",
    nav: "guides",
    title: "Giftpin setup guide for Shopify merchants",
    description:
      "How to install Giftpin, add the registry button and links to your Shopify theme, choose occasions and settings, and turn on Pro features.",
    body,
    css: CSS,
    jsonLd: [faqLd(SETUP_FAQ)],
  });
}

/* ------------------------------------------------------------------ */

/**
 * Registry creator guide at giftpin.app/registry-guide: for the customer who
 * starts a registry on a store that uses Giftpin. Same rule as the setup
 * guide: bold text is the exact on-screen label (app/proxy/render/*.ts, the
 * theme blocks in extensions/registry-button, browser-extension/popup.html).
 * The store's own name appears where the page says "this store".
 */
const REG_START: Step[] = [
  {
    title: "Start your registry",
    items: [
      "On the store's website, click <b>Create a gift registry</b> (usually under the header or in the menu). You can also press <b>Add to registry</b> on any product, and you'll be asked to start one.",
      "Choose the occasion under <b>What's the occasion?</b>, then fill in <b>Registry name</b>, <b>When is it?</b>, <b>Your name</b> and <b>Your email</b>.",
      "Under <b>Where will your guests shop?</b>, pick your guests' country. Giftpin uses it to suggest stores for things this store doesn't sell.",
      "Optionally write <b>A note for your guests</b>, then click <b>Create my registry</b>.",
    ],
    img: { src: "/guides/r1-start.png", alt: "The Start a registry form with the occasion, registry name, date, name, email and country filled in" },
  },
  {
    title: "Keep your private link",
    items: [
      "Giftpin emails you a private link to manage your registry. You don't need an account or a password: that link is your way in, so keep the email. It works for 90 days.",
      "Lost it, or it stopped working? On the store's <b>Create a gift registry</b> page, under <b>Already have one?</b>, enter your email and click <b>Email me my link</b>.",
      "Never share this link. Anyone who has it can edit your registry. Guests get a different link (see Share it below).",
    ],
    img: { src: "/guides/r2-manage-link.png", alt: "The email Giftpin sends, with the Open my registry button" },
  },
];

const REG_ADD: Step[] = [
  {
    title: "Add this store's products",
    items: [
      "Browse the store and click <b>Add to registry</b> on any product page. You'll see <b>Added to your registry</b> and a <b>Back to your registry</b> link.",
      "Pressing it again on the same product asks how many you'd like in total, so nothing gets added twice by accident.",
      "Using a different phone or computer? Open your private link from the email there first, so the button knows which registry is yours.",
    ],
    img: { src: "/guides/r4-added.png", alt: "A product page after pressing Add to registry, showing Added to your registry and a Back to your registry link" },
  },
  {
    title: "Add gifts from any other website",
    items: [
      "On your registry, go to <b>Add items</b>, paste the product's address into <b>Product link</b> and click <b>Look it up</b>. Giftpin fills in the name, photo and price.",
      "Some big stores block this. If that happens, type the <b>Name</b> and <b>Price</b> yourself and click <b>Add to registry</b>.",
      "Giftpin may show something similar from this store. Click <b>Preview &amp; swap</b> to see it, or keep your original.",
    ],
    img: { src: "/guides/r5-paste-link.png", alt: "The Add items box with a Target link looked up, showing the photo, name and price it found" },
  },
  {
    title: "Or use the Chrome extension",
    items: [
      `On a computer, install <a href="https://chromewebstore.google.com/detail/giftpin-%E2%80%94-add-to-registry/hfmielpmefknpgpekhfehnfdlhiobdkk" target="_blank" rel="noopener">the Giftpin extension for Chrome</a>.`,
      "On your registry, under <b>Connect the browser extension</b>, click <b>Copy connection link</b>. Open the extension, paste it into <b>Manage link</b> and click <b>Connect</b>. You only do this once.",
      "Now, on any product page on any website, open the extension, choose the <b>Quantity</b> and click <b>Add to registry</b>.",
    ],
    img: { src: "/guides/r6-extension.png", alt: "The Giftpin extension on a Walmart product page, with the quantity and Add to registry button" },
  },
  {
    title: "Fine-tune your list",
    items: [
      "Under <b>Your list</b>, open any item to change <b>How many you'd like</b>, add a <b>Note for guests</b> (a size or colour, say) or pick a <b>Category</b>, then click <b>Update</b>.",
      "Not sure what to add? Your registry suggests ideas for your occasion.",
    ],
    img: { src: "/guides/r7-item.png", alt: "An item on the list opened for editing, with a note for guests, the quantity and the category" },
  },
];

const REG_SHARE: Step[] = [
  {
    title: "Share it with guests",
    items: [
      "At the top of your registry, click <b>Share with guests</b> and send the link by email, text message, WhatsApp or Facebook, or click <b>Copy link</b>.",
      "Guests see your gifts and what's still needed. They never see your email or address, and they don't need an account.",
    ],
    img: [
      { src: "/guides/r3-share.png", alt: "The share link with Copy link, Email, Text message, WhatsApp and Facebook buttons" },
      { src: "/guides/r10-guest-view.png", alt: "What guests see: the registry with a store item, a gift already taken care of, and an item from Walmart" },
    ],
  },
  {
    title: "Choose who can see it",
    items: [
      "At the bottom of your registry, click <b>Edit registry &amp; preferences</b>. Under <b>Registry settings</b>, use <b>Who can see this</b>: <b>Anyone with the link (recommended)</b>, <b>Anyone with the link and a password</b>, or <b>Listed publicly, so guests can search for it</b> on the store's <b>Find a gift registry</b> page.",
      "Click <b>Save changes</b>. The same section lets you change the name, occasion, date and note.",
    ],
    img: { src: "/guides/r9-privacy.png", alt: "The Who can see this menu with its three choices" },
  },
  {
    title: "Have gifts shipped to you",
    items: [
      "Right after you create your registry, we ask <b>Where should gifts go?</b> Tick the box and enter your shipping address, or skip it for now.",
      "To change it later, click <b>Edit registry &amp; preferences</b>, then under <b>Let guests ship gifts to me</b> tick the box, enter your address and click <b>Save</b>. Guests can then ship gifts from this store straight to you.",
      "Each guest decides when they add a gift to their cart: ship it to you, or send it to themselves. Guests never see your address.",
    ],
    img: { src: "/guides/r8-ship.png", alt: "The Let guests ship gifts to me section with the box ticked and a shipping address filled in" },
  },
];

const REG_FAQ = [
  {
    q: "How do guests avoid buying the same thing?",
    a: "Orders from this store update your registry automatically. For gifts from other websites, guests tap I bought this after buying, and the item shows as taken. Guests who change their mind can undo it for 24 hours.",
  },
  {
    q: "How do I know who gave me what?",
    a: "Your registry has a Who gave what list for your thank-you notes, and Giftpin emails you when someone buys a gift.",
  },
  {
    q: "Can guests chip in toward something big?",
    a: "If the store offers it, yes. Your registry can turn an item into a group gift, or hold a cash fund for a honeymoon or a house, paid as the store's gift cards.",
  },
  {
    q: "Can I delete my registry?",
    a: "Yes. Click Edit registry & preferences at the bottom of your registry, then Delete registry. This removes every item and the record of who bought what, and it can't be undone.",
  },
];

export function registryGuideHtml(): string {
  const body = `
${hero(
  `${icon("gift")} Registry guide`,
  `Create your gift registry<br><span class="grad-text">and share one link</span>`,
  "How to start a Giftpin registry, add gifts from this store and anywhere else, and share it with your guests. Bold text is exactly what you'll see on screen.",
)}
${section("Get started", "", steps(REG_START))}
${section("Add your gifts", "From this store, and from any other website.", steps(REG_ADD), true)}
${section("Share it", "", steps(REG_SHARE))}
${section("Common questions", "", faqList(REG_FAQ), true)}
`;
  return sitePage({
    path: "/registry-guide",
    nav: "guides",
    title: "How to create a gift registry with Giftpin",
    description:
      "How to start a Giftpin gift registry on a store, add gifts from that store and any other website, share it with guests and have gifts shipped to you.",
    body,
    css: CSS,
    jsonLd: [faqLd(REG_FAQ)],
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
.steps{max-width:860px; margin:0 auto; display:grid; gap:16px}
.step{display:flex; gap:18px; align-items:flex-start}
.step-n{flex:none; width:36px; height:36px; border-radius:50%; display:grid; place-items:center; font-weight:800; color:#fff; background:var(--accent)}
.step h3{margin:4px 0 8px}
.step ol{margin:0; padding-left:20px; display:grid; gap:6px}
.step b{font-weight:700}
.shot{display:block; max-width:100%; height:auto; margin-top:14px; border:1px solid var(--line); border-radius:12px}
`;
