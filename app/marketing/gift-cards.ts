import { esc, icon, sitePage } from "./layout";
import { PRO_NAME } from "./plans-copy";
import { GIFT_CARD_FEE_PERCENT } from "../shared/plans";
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

export const GIFT_CARD_FAQ = [
  {
    q: "Who sells the gift card?",
    a: "The store does. You pay at that store's own checkout, and the store emails the gift card. It can only be spent at that store.",
  },
  {
    q: "Can I send it straight to someone?",
    a: "Yes. Tick \"Email it straight to someone\" and add their email. Use the store's regular Check out button for that, because Shopify sends the card to the buyer when you pay with Shop Pay.",
  },
  {
    q: "How do I list my store here?",
    a: `Install Giftpin on your Shopify store, add a gift card product, and in Giftpin Settings tick "List my gift cards on giftpin.app". It's part of ${PRO_NAME}, with a ${GIFT_CARD_FEE_PERCENT}% fee on gift cards sold this way (none during your free trial). The money and any unspent balance stay with you.`,
  },
];

function storeCard(store: DirectoryStore): string {
  const href = `https://${store.domain}/apps/registry/gift-card?src=directory`;
  const amounts = store.amounts.map((a) => formatGiftCardAmount(a.amount, store.currency)).join(" · ");
  return `<div class="card gc-store rise">
  <span class="chip-ico">${icon("gift")}</span>
  <h3>${esc(store.name)}</h3>
  ${store.blurb ? `<p>${esc(store.blurb)}</p>` : ""}
  <p class="gc-amounts">${esc(amounts)}</p>
  <a class="btn dark" href="${esc(href)}" rel="noopener">Buy a gift card</a>
</div>`;
}

/**
 * Stores under their country's name, countries A to Z, stores A to Z within
 * each. A store whose country isn't known yet (it fills in the next time the
 * merchant opens Giftpin) goes under "Other countries", last.
 */
export function groupByCountry(stores: DirectoryStore[]): { heading: string; stores: DirectoryStore[] }[] {
  const groups = new Map<string, DirectoryStore[]>();
  for (const store of stores) {
    const heading = countryName(store.country) ?? "Other countries";
    groups.set(heading, [...(groups.get(heading) ?? []), store]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a === "Other countries" ? 1 : b === "Other countries" ? -1 : a.localeCompare(b)))
    .map(([heading, list]) => ({ heading, stores: [...list].sort((x, y) => x.name.localeCompare(y.name)) }));
}

export function giftCardsHtml(stores: DirectoryStore[]): string {
  const list = stores.length
    ? groupByCountry(stores)
        .map(
          (group) =>
            `<h2 class="gc-country rise">${esc(group.heading)}</h2><div class="grid-3">${group.stores.map(storeCard).join("")}</div>`,
        )
        .join("")
    : `<div class="card gc-empty rise"><h3>No stores listed yet</h3><p>Check back soon. Run a Shopify store? You could be the first.</p></div>`;

  const body = `
<section class="hero page-hero">
  <div class="wrap">
    <p class="eyebrow">${icon("gift")} Gift cards</p>
    <h1>Gift cards from<br><span class="grad-text">independent stores.</span></h1>
    <p class="lede">Pick a store, choose an amount up to ${formatGiftCardAmount(MAX_LISTED_GIFT_CARD, "USD")}, and pay at the store's own checkout. The store emails the gift card, to you or straight to the person you're giving it to.</p>
  </div>
</section>
<section class="sec">
  <div class="wrap">${list}</div>
</section>
<section class="sec tint">
  <div class="wrap">
    <div class="sec-head rise"><h2>Questions</h2></div>
    <div class="qa">${GIFT_CARD_FAQ.map((i) => `<details class="rise"><summary>${esc(i.q)}</summary><p>${esc(i.a)}</p></details>`).join("")}</div>
    <p class="gc-merchant rise">Run a Shopify store? <a href="/setup#gift-cards">See how to list your gift cards</a>.</p>
  </div>
</section>
`;

  return sitePage({
    path: "/gift-cards",
    nav: "guides",
    title: "Gift cards from independent Shopify stores | Giftpin",
    description:
      "Buy a gift card from an independent store that uses Giftpin. Pick an amount, pay at the store's own checkout, and send the card by email.",
    body,
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
