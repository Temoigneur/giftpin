import { GIFT_CARD_FEE_PERCENT } from "../shared/plans";
import { PRICE, PRO_NAME, TRIAL_DAYS } from "./plans-copy";

/**
 * Questions and answers for `/faq`, and the billing group reused on
 * `/pricing`. Answers are HTML. Every claim here should be true of what's on
 * main today (CLAUDE.md hard rule 1): if a feature changes, change it here.
 */
export type QA = { q: string; a: string };
export type FaqGroup = { id: string; title: string; items: QA[] };

export const BILLING_FAQ: QA[] = [
  {
    q: `How am I billed for ${PRO_NAME}?`,
    a: `<p>Through Shopify. The ${PRICE} monthly charge appears on your regular Shopify invoice, in US dollars. There's no separate card to add.</p>`,
  },
  {
    q: "How does the free trial work?",
    a: `<p>You get ${PRO_NAME} free for ${TRIAL_DAYS} days. Cancel before it ends and you won't be charged.</p>`,
  },
  {
    q: "Can I cancel or switch back to Free?",
    a: "<p>Yes, any time, from the Plan page inside the app. Your registries and their items stay exactly as they are.</p>",
  },
  {
    q: "How is the Free plan paid for?",
    a: "<p>When a guest buys a registry item from another website, Giftpin may earn a small affiliate commission from that retailer. It never changes the guest's price, it's disclosed on the registry page, and it never applies to purchases from your own store.</p>",
  },
  {
    q: "Does Giftpin take a cut of my sales?",
    a: `<p>Not on your products or registry gifts. Neither plan adds a fee to them. The one exception is optional: if you list your gift cards on giftpin.app with Pro, Giftpin charges ${GIFT_CARD_FEE_PERCENT}% of each gift card sold through the listing, on your Shopify bill, and nothing during your free trial.</p>`,
  },
  {
    q: "What is the giftpin.app gift card directory?",
    a: `<p>A page at <a href="/gift-cards">giftpin.app/gift-cards</a> where shoppers can buy gift cards from stores that use Giftpin. It's part of Pro. Shoppers pay at your own checkout for your own Shopify gift card, so you keep the money and any unspent balance. Giftpin never sells or holds gift card money. Giftpin charges ${GIFT_CARD_FEE_PERCENT}% of each gift card sold this way, with no fee during your free trial.</p>`,
  },
  {
    q: "Is there a limit on registries or guests?",
    a: "<p>No. Both plans include unlimited registries, items and guests.</p>",
  },
];

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "start",
    title: "Getting started",
    items: [
      {
        q: "What is Giftpin?",
        a: "<p>A gift registry app for Shopify stores. Your customers build a registry for a wedding, baby shower, birthday or any other occasion, add gifts from your store and from any other online shop, and share one link with their guests. Giftpin suggests your matching products beside everything added from elsewhere, so your store gets the first look at every gift.</p>",
      },
      {
        q: "How do customers start a registry?",
        a: "<p>From your store. Giftpin adds theme blocks you place with the theme editor: an <strong>Add to registry</strong> button for product pages, and <strong>Create</strong>, <strong>Find</strong> and <strong>Manage</strong> registry links you can put on any page. The registry pages themselves live on your own store's domain.</p>",
      },
      {
        q: "Can I move my registries from another registry app?",
        a: "<p>Yes, on both plans. Export your registries from your old app as a spreadsheet (CSV) and upload it in Giftpin under <strong>Registries &rarr; Import registries</strong>. You see what will be imported before anything is created. Items are matched to your products by SKU or barcode, and gifts that were already bought stay marked as bought.</p>",
      },
      {
        q: "Do I need to know how to code?",
        a: "<p>No. You add Giftpin's blocks in Shopify's theme editor, and everything else is set up from the Giftpin page in your Shopify admin.</p>",
      },
      {
        q: "Which occasions are supported?",
        a: "<p>Weddings, engagements, bridal and baby showers, baptisms, birthdays, bar and bat mitzvahs, quinceañeras, graduations, off to college, housewarmings, anniversaries, retirements, the holidays, new pets, fundraisers, corporate gifting and anything else. You choose which ones your store offers in Giftpin's settings.</p>",
      },
    ],
  },
  {
    id: "registrants",
    title: "Registrants and guests",
    items: [
      {
        q: "Do registrants or guests need an account?",
        a: "<p>No. The registrant gets a private link by email to manage their registry, and guests just open the shared link.</p>",
      },
      {
        q: "How do gifts from other stores work?",
        a: "<p>The registrant pastes a product link and Giftpin fills in the photo, name and price from that page. Guests buy those gifts on the original store's website, and Giftpin marks the gift as possibly taken while they do. Nothing from another store is added to your catalog, and you're never asked to fulfil it.</p>",
      },
      {
        q: "What if a shopper already has a registry somewhere else?",
        a: "<p>Your Add to registry button can still help. In the button's settings in the theme editor, tick <strong>Also offer Babylist</strong>, <strong>Also offer \"Another registry\"</strong>, or both. The button then asks <em>Which registry?</em> Babylist adds the product, with the variant the shopper picked, through Babylist's own add-to-Babylist script. <em>Another registry (copy link)</em> copies the product link so they can paste it into any registry that adds gifts from a link, or use that site's own button, like Add to Zola. Both are free on every plan. Giftpin isn't affiliated with Babylist or Zola, and it doesn't track purchases made from registries on other sites.</p>",
      },
      {
        q: "How does Giftpin stop two guests buying the same gift?",
        a: "<p>When a guest heads off to buy something, the registry immediately shows <em>Someone may be buying this</em>. If they don't go through with it, the gift becomes available again. For gifts from your store, the registry updates as soon as the order comes in.</p>",
      },
      {
        q: "Can gifts ship straight to the registrant?",
        a: "<p>Yes, for gifts bought from your store. When the registrant saves a shipping address, Giftpin puts it on the order so the gift goes straight to them. Guests never see the address.</p>",
      },
      {
        q: "Can registrants add gifts while they're in my store?",
        a: "<p>Yes, with Pro. On their registry page, the registrant taps <strong>Scan a barcode in the store</strong> and points their own phone at a product's barcode. Giftpin finds the product in your catalog and adds it in one tap. They can also type the number under the barcode. Your products need a barcode or SKU filled in in Shopify.</p>",
      },
      {
        q: "How do registrants know who gave what?",
        a: "<p>Their manage page keeps a who-gave-what list for thank-you notes, and they can download it as a spreadsheet. With Pro, Giftpin also emails them a thank-you reminder after the event.</p>",
      },
    ],
  },
  {
    id: "checkout",
    title: "Checkout and attribution",
    items: [
      {
        q: "Does it work with Shop Pay, Apple Pay and Google Pay?",
        a: "<p>Yes. Getting express checkouts right is the hardest part of a registry app, and it's what Giftpin was built around. Purchases through Shop Pay, Apple Pay, Google Pay, the Shop app and your regular checkout are all credited to the right registry and item.</p>",
      },
      {
        q: "Does Giftpin change anything in my store?",
        a: "<p>It reads your catalog to suggest matching products and to show your items on registries, and it can add the registrant's address to a registry order. It never edits your products, prices or inventory. If you turn on Pro's completion discount, it also creates the single-use discount codes.</p>",
      },
    ],
  },
  { id: "billing", title: "Plans and billing", items: BILLING_FAQ },
  {
    id: "privacy",
    title: "Privacy",
    items: [
      {
        q: "What does Giftpin do with customer data?",
        a: `<p>Only what running the registry needs, such as the registrant's name, email and, if they choose, a shipping address, plus which orders were registry gifts. Email addresses are never shown to guests. The full details are in our <a href="/privacy">privacy policy</a>.</p>`,
      },
      {
        q: "Does Giftpin earn a commission on gifts from other stores?",
        // Sovrn turned Giftpin down on 2 Oct 2026 (Skimlinks on 29 Sep), so no
        // network is named here. The disclosure stays: registry pages still say
        // outside links may earn a commission (see app/lib/affiliate.ts).
        a: `<p>Some links to other stores on a registry may earn Giftpin a small commission, at no extra cost to you. It doesn't change your price.</p>`,
      },
    ],
  },
];

export function faqList(items: QA[]): string {
  return `<div class="faq">${items
    .map((i) => `<details><summary>${i.q}</summary><div class="a">${i.a}</div></details>`)
    .join("")}</div>`;
}

/** schema.org FAQPage, so search results can show the answers. */
export function faqJsonLd(items: QA[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a.replace(/<[^>]+>/g, "") },
    })),
  };
}
