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

/* ------------------------------------------------------------------ */

/**
 * Merchant setup guide at giftpin.app/setup. Every label in bold here is the
 * exact text of a button, heading or menu item in the app (app/routes/app.*)
 * or the Shopify admin, so a merchant can follow it literally. Update it
 * whenever those labels change.
 */
type Step = { title: string; items: string[] };

const steps = (list: Step[]) =>
  `<div class="steps">${list
    .map(
      (st, i) => `<div class="card rise step">
  <span class="step-n">${i + 1}</span>
  <div><h3>${esc(st.title)}</h3><ol>${st.items.map((it) => `<li>${it}</li>`).join("")}</ol></div>
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
      "Using a vintage (pre-Online Store 2.0) theme? The blocks won't work there, but your registry pages still do: add a menu item pointing to <b>/apps/registry</b> in <b>Online Store → Navigation</b>.",
    ],
  },
  {
    title: "Check your registry pages",
    items: [
      "On <b>Overview</b>, under <b>Your registry pages</b>, click <b>Create a registry</b> to see the page your customers use.",
      "Create a test registry, add a product with the Add to registry button, and open the guest link to see what guests see.",
    ],
  },
];

const SETTINGS: Step[] = [
  {
    title: "Choose your occasions",
    items: [
      "Open <b>Settings</b>. Under <b>Occasions</b>, tick the kinds of registry customers can create: weddings, baby showers, birthdays, graduations, housewarmings and more.",
    ],
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
      "With Pro, <b>Your branding</b> adds your logo, colours and font to registry pages and removes the Powered by Giftpin credit.",
    ],
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
`;
