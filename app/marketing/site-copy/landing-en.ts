import type { Item, QA } from "./en";

/**
 * The search landing pages (wedding, compare, gift registry app, baby, home
 * goods, holiday) and the gift card directory, in English. Source of truth:
 * landing-fr.ts, -es.ts, -de.ts and -pt-BR.ts must have the same shape
 * (TypeScript and site-copy.test.ts check it). Everything here is plain text
 * (the page escapes it), except where a comment says HTML. Prices, trial days
 * and the gift card fee are {placeholders}: {pro} {price} {trial} {fee} {max}.
 * Not a `.server` file (CLAUDE.md hard rule 2).
 */
export type Sec = { title: string; lede: string; cards: Item[] };
export type Page = {
  title: string;
  description: string;
  eyebrow: string;
  h1a: string;
  h1b: string;
  lede: string;
  sections: Sec[];
  faq: QA[];
  finalCta: string;
};
export type LandingCopy = {
  faqTitle: string;
  wedding: Page;
  compare: Page & {
    table: { aria: string; colCatalog: string; colGiftpin: string; rows: { label: string; catalogOnly: string; giftpin: string }[]; note: string };
  };
  app: Page;
  baby: Page;
  home: Page;
  holiday: Page;
  giftCards: {
    title: string;
    description: string;
    eyebrow: string;
    h1a: string;
    h1b: string;
    lede: string;
    emptyH: string;
    emptyP: string;
    buy: string;
    otherCountries: string;
    questions: string;
    merchantLine: string; // HTML
    faq: QA[];
  };
};

export const landingEn: LandingCopy = {
  faqTitle: "Questions merchants ask",

  wedding: {
    title: "Universal wedding registry app for Shopify stores | Giftpin",
    description:
      "Offer couples a universal wedding registry on your Shopify store: gifts from any shop on one list, your products suggested first, no duplicate gifts, and credit through Shop Pay, Apple Pay and Google Pay.",
    eyebrow: "Wedding registries for Shopify",
    h1a: "A universal wedding registry",
    h1b: "that starts in your store.",
    lede: "Couples want one registry for everything: the dinnerware from you, the stand mixer from somewhere else, the honeymoon luggage from a third shop. Giftpin gives them that, on your store's domain, with your products suggested first.",
    sections: [
      {
        title: "Why couples choose a universal registry",
        lede: "Most couples register in more than one place. A registry limited to one catalog sends them to build a second list somewhere else.",
        cards: [
          { title: "Every gift on one list", detail: "Couples paste a link from almost any online shop and Giftpin fills in the photo, name and price." },
          { title: "One link for guests", detail: "For the wedding website, the invitation or the group chat. No account, nothing to install." },
          { title: "Room-by-room ideas", detail: "A wedding ideas guide helps couples fill their registry, with your products one tap away." },
        ],
      },
      {
        title: "Why it's good for your store",
        lede: "Wedding guests arrive ready to buy. Giftpin keeps them on your products.",
        cards: [
          { title: "Your product, suggested first", detail: "When a couple adds something from another shop, Giftpin shows your closest match beside it, one tap to swap." },
          { title: "Credit through express checkout", detail: "Shop Pay, Apple Pay, Google Pay and the Shop app skip the cart. Giftpin still credits every gift to the right registry." },
          { title: "Gifts ship to the couple", detail: "Guests can send store gifts straight to the couple's saved address, which guests never see." },
        ],
      },
      {
        title: "No duplicate wedding gifts",
        lede: "",
        cards: [
          { title: "Held while a guest buys", detail: "The registry shows Someone may be buying this, and frees the gift again if they don't go through with it." },
          { title: "Clear progress", detail: "Guests see what's available, possibly taken and already gifted at a glance." },
          { title: "Thank-you list included", detail: "The couple gets a who-gave-what list, downloadable as a spreadsheet." },
        ],
      },
    ],
    faq: [
      { q: "What is a universal wedding registry?", a: "One registry where a couple can add gifts from any online store, instead of a separate list at every shop. Guests get a single link for everything." },
      { q: "Can a Shopify store offer a universal wedding registry?", a: "Yes. With Giftpin, couples start their registry on your store, add your products and gifts from anywhere else, and share one link. Your matching products are suggested beside everything added from other shops." },
      { q: "How are duplicate wedding gifts avoided?", a: "When a guest goes to buy a gift, the registry shows Someone may be buying this. Orders from your store update the registry automatically, including Shop Pay, Apple Pay and Google Pay orders." },
    ],
    finalCta: "Give your couples a registry with no walls.",
  },

  compare: {
    title: "Choosing a gift registry app for Shopify: Giftpin vs catalog-only apps",
    description:
      "How Giftpin compares with registry apps limited to your own catalog: gifts from any store, your products suggested first, credit through Shop Pay and express checkouts, and no accounts for guests.",
    eyebrow: "Choosing a registry app",
    h1a: "Giftpin vs catalog-only",
    h1b: "registry apps",
    lede: "Many Shopify registry apps only let customers add your own products. That's simple, but it's not how people register. Here's what changes when the registry can hold everything.",
    sections: [{ title: "Side by side", lede: "", cards: [] }],
    table: {
      aria: "Comparison",
      colCatalog: "Catalog-only registry apps",
      colGiftpin: "Giftpin",
      rows: [
        { label: "Gifts from other stores", catalogOnly: "Usually not: your catalog only", giftpin: "Yes, pasted from almost any online shop" },
        { label: "Your products when a gift comes from elsewhere", catalogOnly: "The couple leaves to register somewhere else", giftpin: "Your closest match suggested beside it" },
        { label: "Credit for Shop Pay, Apple Pay and Google Pay orders", catalogOnly: "Varies", giftpin: "Yes, every gift credited to the right item" },
        { label: "Duplicate-gift protection for gifts bought elsewhere", catalogOnly: "Not applicable", giftpin: "Held while a guest buys" },
        { label: "Shoppers whose registry is on another site", catalogOnly: "Usually not served", giftpin: "Your button can add to Babylist, or copy the link for any registry that takes one" },
        { label: "Registry pages on your own domain", catalogOnly: "Varies", giftpin: "Yes" },
        { label: "Accounts for registrants and guests", catalogOnly: "Often required", giftpin: "Not needed" },
      ],
      note: '"Catalog-only" describes registry apps that only let registrants add the store\'s own products. Features differ from app to app, so check each listing.',
    },
    faq: [
      { q: "What should I look for in a Shopify registry app?", a: "Whether couples can add gifts from other stores, whether express checkouts like Shop Pay are credited to the right registry, how duplicate gifts are prevented, and whether the pricing takes a cut of your sales." },
      { q: "Doesn't letting registrants add other stores' products lose me sales?", a: "Registrants who can't add everything tend to build a second registry elsewhere and send guests there. Giftpin keeps the whole list on your store and suggests your matching product beside each outside gift." },
      { q: "What does Giftpin cost?", a: "Free covers unlimited registries, items and guests. {pro} is {price} a month with a {trial}. Neither plan takes a cut of your product sales." },
    ],
    finalCta: "See what a registry with no walls does for your store.",
  },

  app: {
    title: "Gift registry app for Shopify stores | Giftpin",
    description:
      "Giftpin is a gift registry app for Shopify that brings new customers to your store: registries on your own domain, gifts from any shop on one list, your products suggested first, and no duplicate gifts.",
    eyebrow: "Gift registry app for Shopify",
    h1a: "A gift registry for your store",
    h1b: "that brings in new customers.",
    lede: "Every registry your customers share sends their friends and family to your store. Giftpin gives them one list for every gift, keeps your products front and centre, and stops duplicate gifts.",
    sections: [
      {
        title: "How a registry wins you customers",
        lede: "A registrant shares one link. Everyone who opens it lands on your store, ready to buy.",
        cards: [
          { title: "One link, many guests", detail: "Registrants share their registry in a text, an invitation or a wedding website. Each guest is a shopper you didn't pay to reach." },
          { title: "On your own domain", detail: "Registry pages live on your store and link guests straight to your products and your checkout." },
          { title: "Registrants come back", detail: "With {pro}, registrants get a single-use completion discount after their event for your products still on their list." },
        ],
      },
      {
        title: "Built for how people really register",
        lede: "Registrants want everything on one list. Giftpin lets them have it, and puts your catalog first.",
        cards: [
          { title: "Gifts from any store", detail: "Registrants paste a link from almost any online shop, or add it with the Giftpin Chrome extension." },
          { title: "Your product, suggested first", detail: "When a gift comes from another shop, Giftpin shows your closest match beside it, one tap to swap." },
          { title: "No duplicate gifts", detail: "The registry shows Someone may be buying this while a guest checks out, and frees the gift if they don't." },
        ],
      },
      {
        title: "Set up in minutes",
        lede: "",
        cards: [
          { title: "Theme blocks, no code", detail: "Add the Add to registry button and registry links in the theme editor." },
          { title: "Every checkout credited", detail: "Shop Pay, Apple Pay, Google Pay and the Shop app orders are credited to the right registry item." },
          { title: "Your occasions", detail: "Turn weddings, baby showers, birthdays and more on or off for your store." },
        ],
      },
    ],
    faq: [
      { q: "What does a gift registry app do for a Shopify store?", a: "It lets customers build a list of gifts they want for an occasion and share one link with friends and family. Guests buy from your store, and most of them are new customers." },
      { q: "Which occasions does Giftpin support?", a: "Weddings, baby showers, birthdays, graduations, housewarmings, holidays, new pets and more. You choose which ones your store offers in Giftpin's settings." },
      { q: "Do I need to edit my theme code?", a: "No. Giftpin adds an Add to registry button and registry links as theme blocks you place in the theme editor, and registry pages live on your store's own domain." },
      { q: "What does it cost?", a: "Free covers unlimited registries, items and guests. {pro} is {price} a month with a {trial}. Neither plan takes a cut of your product sales." },
    ],
    finalCta: "Turn every registry into new customers.",
  },

  baby: {
    title: "Baby registry app for Shopify stores | Giftpin",
    description:
      "Offer parents-to-be a baby registry on your Shopify store: gifts from any shop on one list, your products suggested first, gifts shipped to the parents, and no duplicate gifts.",
    eyebrow: "Baby registries for Shopify",
    h1a: "A baby registry",
    h1b: "that starts in your store.",
    lede: "Parents-to-be need a lot, from a crib to sleep sacks, and they rarely find it all in one shop. Giftpin lets them build one baby registry with your products and anything else they need, then share a single link.",
    sections: [
      {
        title: "Why parents choose it",
        lede: "",
        cards: [
          { title: "Everything baby needs, one list", detail: "Parents paste a link from almost any online shop and Giftpin fills in the photo, name and price." },
          { title: "Ideas by what baby needs", detail: "A baby registry ideas guide covers sleep, feeding, bath time and more." },
          { title: "Gifts ship to their door", detail: "Guests can send gifts from your store straight to the parents' saved address." },
        ],
      },
      {
        title: "Why it's good for your store",
        lede: "Baby shower guests are often family who buy more than one gift. Giftpin keeps them on your products.",
        cards: [
          { title: "Your product, suggested first", detail: "When parents add something from another shop, Giftpin shows your closest match beside it, one tap to swap." },
          { title: "No duplicate gifts", detail: "The registry shows Someone may be buying this while a guest checks out." },
          { title: "Thank-you list included", detail: "Parents get a who-gave-what list, downloadable as a spreadsheet." },
          { title: "Already on Babylist? Still welcome", detail: "Your Add to registry button can ask Which registry? and add your product to the parents' Babylist registry, so they shop with you either way." },
          { title: "No sold-out surprises", detail: "Products you've sold out of are marked on registries, or hidden until they're back in stock." },
          { title: "Switching registry apps?", detail: "Import registries from your old app's spreadsheet. Gifts already bought stay bought." },
        ],
      },
    ],
    faq: [
      { q: "Can my Shopify store offer a baby registry?", a: "Yes. With Giftpin, parents-to-be start a baby registry on your store, add your products and anything else they need from other shops, and share one link with family and friends." },
      { q: "Can gifts ship straight to the parents?", a: "Yes. Parents save a shipping address once, and guests can send gifts from your store straight to them. Guests never see the address." },
      { q: "What about parents who already have a Babylist registry?", a: "Your Add to registry button can offer it. Turn on Also offer Babylist in the button's settings and shoppers get a choice: your store's registry, or their own Babylist registry, added through Babylist's add-to-Babylist script. Giftpin isn't affiliated with Babylist and doesn't track purchases made from Babylist registries." },
      { q: "Does Giftpin help parents decide what to add?", a: "Yes. A baby registry ideas guide lists what a new baby needs, from sleep and feeding to bath time, with your products one tap away." },
    ],
    finalCta: "Give parents-to-be one registry for everything.",
  },

  home: {
    title: "Wedding registry app for home goods and kitchen stores | Giftpin",
    description:
      "Offer wedding and housewarming registries on your Shopify home goods or kitchen store: couples add your products first, anything else from other shops, and guests buy from you.",
    eyebrow: "Registries for home goods stores",
    h1a: "A wedding registry for your",
    h1b: "kitchen and home store.",
    lede: "Couples register for the things you sell: cookware, dinnerware, linens, decor. Giftpin lets them build that registry on your store, so their guests shop with you.",
    sections: [
      {
        title: "Why home goods stores fit",
        lede: "Wedding and housewarming registries are mostly home goods. Today couples build them somewhere else.",
        cards: [
          { title: "One link, many guests", detail: "Every registry sends a couple's friends and family to your store, ready to buy." },
          { title: "On your own domain", detail: "Registry pages live on your store and link guests to your products and your checkout." },
          { title: "No duplicate gifts", detail: "The registry shows Someone may be buying this while a guest checks out." },
        ],
      },
      {
        title: "Your products come first",
        lede: "Couples can still add what you don't carry, and you stay at the top of the list.",
        cards: [
          { title: "Your closest match, suggested", detail: "When a couple adds an item from another store, Giftpin shows your nearest product beside it." },
          { title: "A complete registry", detail: "Couples keep everything on one list, so they have no reason to leave for a bigger registry." },
          { title: "No theme code", detail: "Add the Add to registry button and registry links as theme blocks in the theme editor." },
        ],
      },
    ],
    faq: [
      { q: "Can a home goods or kitchen store offer wedding registries on Shopify?", a: "Yes. With Giftpin, couples start a wedding or housewarming registry on your store, add your cookware, linens and tableware, and share one link with their guests." },
      { q: "What if a couple wants something I don't carry?", a: "They can add it from another store, so the registry stays complete. Giftpin shows your closest match beside it, one tap to swap, so your products come first." },
      { q: "Do guests need an account?", a: "No. Guests open the link, see what's already taken and check out on your store." },
      { q: "What does it cost?", a: "Free covers unlimited registries, items and guests. {pro} is {price} a month with a {trial}. Neither plan takes a cut of your product sales." },
    ],
    finalCta: "Give couples a registry that starts in your store.",
  },

  holiday: {
    title: "Holiday wish lists for Shopify gift and home stores | Giftpin",
    description:
      "Let shoppers make a shareable Christmas or holiday wish list on your Shopify store. Family buys from one link, gifts are marked as bought so nobody doubles up, and the sales come to you.",
    eyebrow: "Holiday wish lists",
    h1a: "Christmas lists that send",
    h1b: "family to your store.",
    lede: "Let shoppers make a holiday wish list on your store and share one link with the whole family. Every gift is marked as it's bought, so nobody doubles up, and the shopping happens at your checkout.",
    sections: [
      {
        title: "Why it works for gift and home stores",
        lede: "Holiday lists get passed around to parents, grandparents, aunts and friends. Each one is a reason to visit your store.",
        cards: [
          { title: "One link for the whole family", detail: "Shoppers share their list by text, WhatsApp or email. Family opens it on any phone, with nothing to sign up for." },
          { title: "No duplicate gifts", detail: "While someone checks out, the list shows Someone may be buying this. Once it's bought, it's marked as taken." },
          { title: "Your products first", detail: "The list lives on your store's domain and your products sit at the top, buyable in one tap." },
        ],
      },
      {
        title: "Set up in minutes",
        lede: "No theme code. If you already use Giftpin for registries, it's one tick.",
        cards: [
          { title: "Tick Wish list", detail: "In Giftpin, open Settings and tick Wish list under Occasions. It has no event date, so it suits Christmas, Hanukkah, Diwali or any time of year." },
          { title: "Add the button", detail: "The Add to registry button goes on your product pages as a theme block, so shoppers add your products as they browse." },
          { title: "Room for everything", detail: "Allow items from other stores and the list stays complete, with your closest match suggested beside each one." },
        ],
      },
      {
        title: "Ready before your holiday code freeze",
        lede: "Many stores stop changing their theme ahead of Black Friday. Turning on wish lists is an app setting plus a theme block, so it's worth doing now, before the rush.",
        cards: [],
      },
    ],
    faq: [
      { q: "Is this a save-for-later wishlist button?", a: "No. Giftpin wish lists are made to be shared: a shopper builds a list, sends one link to family and friends, and gifts are marked as they're bought. If you want a heart button for saving products to buy yourself later, a dedicated wishlist app is a better fit." },
      { q: "How do I turn on wish lists?", a: "In Giftpin, open Settings, tick Wish list under Occasions and save. It's off until you switch it on. Shoppers then pick Wish list when they start a list, and it has no event date to fill in." },
      { q: "Can a list include things from other stores?", a: "Yes, if you allow items from other stores in Settings. Your own products stay at the top of the list, and Giftpin suggests your closest match beside anything added from elsewhere." },
      { q: "Do family members need an account?", a: "No. They open the link, see what's already taken and buy from your store with your normal checkout, including Shop Pay." },
      { q: "What does it cost?", a: "Wish lists are on the free plan, with unlimited lists, items and guests. {pro} is {price} a month with a {trial}. Neither plan takes a cut of your product sales." },
    ],
    finalCta: "Give shoppers a holiday list that starts in your store.",
  },

  giftCards: {
    title: "Gift cards from independent Shopify stores | Giftpin",
    description: "Buy a gift card from an independent store that uses Giftpin. Pick an amount, pay at the store's own checkout, and send the card by email.",
    eyebrow: "Gift cards",
    h1a: "Gift cards from",
    h1b: "independent stores.",
    lede: "Pick a store, choose an amount up to {max}, and pay at the store's own checkout. The store emails the gift card, to you or straight to the person you're giving it to.",
    emptyH: "No stores listed yet",
    emptyP: "Check back soon. Run a Shopify store? You could be the first.",
    buy: "Buy a gift card",
    otherCountries: "Other countries",
    questions: "Questions",
    merchantLine: 'Run a Shopify store? <a href="/setup#gift-cards">See how to list your gift cards</a>.',
    faq: [
      { q: "Who sells the gift card?", a: "The store does. You pay at that store's own checkout, and the store emails the gift card. It can only be spent at that store." },
      { q: "Can I send it straight to someone?", a: 'Yes. Tick "Email it straight to someone" and add their email. Use the store\'s regular Check out button for that, because Shopify sends the card to the buyer when you pay with Shop Pay.' },
      { q: "How do I list my store here?", a: 'Install Giftpin on your Shopify store, add a gift card product, and in Giftpin Settings tick "List my gift cards on giftpin.app". It\'s part of {pro}, with a {fee}% fee on gift cards sold this way (none during your free trial). The money and any unspent balance stay with you.' },
    ],
  },
};
