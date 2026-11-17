import type { Step } from "./types";

/**
 * The Pro guide's "Linked stores" steps (built 17 Nov 2026). English only for
 * now: derive.ts adds them to the English Pro guide alone, and the shape test
 * in guides-i18n.test.ts skips these ids until they are translated.
 * Screenshots are wired in derive.ts from SHOTS (shots.ts).
 */
export const LINKED_STEP_IDS = ["linked-stores", "linked-registrants", "linked-guests", "linked-results", "linked-unlink"] as const;

export const LINKED_STEPS: Step[] = [
  {
    id: "linked-stores",
    title: "Link your other stores",
    items: [
      "Run more than one Shopify store? Link them, and one registry can hold products from all of them. Guests can open it on any of your stores, and every gift is counted on the store that sold it. Install Giftpin on each store first. Up to 5 stores can be linked.",
      "Linking needs Pro on one of your stores, and that one Pro plan covers every store linked to it. On your Pro store, open <b>{{admin.nav.settings}}</b> in Giftpin, scroll to <b>{{admin.linked.heading}}</b> and click <b>{{admin.linked.create}}</b>. Copy the code. It works once, for 24 hours.",
      "On your other store, open Giftpin's <b>{{admin.nav.settings}}</b>, scroll to <b>{{admin.linked.heading}}</b>, paste the code into <b>{{admin.linked.enterLabel}}</b> and click <b>{{admin.linked.link}}</b>. Both stores now list each other.",
      "Linking shares gift titles, buyer first names and amounts between your stores. No emails, addresses or customer accounts are shared.",
    ],
  },
  {
    id: "linked-registrants",
    title: "What registrants see",
    items: [
      "Registrants open their registry on any of your stores with the link Giftpin emailed them. A banner on their manage page names your stores, and <b>{{manage.linked.alsoOn}}</b> opens the same registry on each one.",
      "On each store, they add products with that store's own <b>Add to registry</b> button, as usual.",
      "Cash funds and group gifts stay on the store where the registry started.",
    ],
  },
  {
    id: "linked-guests",
    title: "What guests see",
    items: [
      "A registry page lists every store its gifts come from. A gift from another of your stores has a <b>Buy at</b> button instead of Add to cart.",
      "<b>Buy at</b> opens the same registry on that store, at that gift. The guest checks out there, and the gift is marked bought on the registry, through Shop Pay too. Each store shows its own prices, in its own currency.",
    ],
  },
  {
    id: "linked-results",
    title: "See sales across your stores",
    items: [
      "Open <b>{{admin.nav.analytics}}</b>. <b>{{admin.an.group.head}}</b> shows each store's registry sales, gifts sold, registry views, cart adds and <b>{{admin.an.group.colArrivals}}</b>, for the last 30 days. Sales stay in each store's own currency.",
      "<b>{{admin.nav.plan}}</b> shows the same totals in <b>{{admin.bill.group.head}}</b>.",
    ],
  },
  {
    id: "linked-unlink",
    title: "Unlink a store",
    items: [
      "In that store's Giftpin <b>{{admin.nav.settings}}</b>, under <b>{{admin.linked.heading}}</b>, click <b>{{admin.linked.unlink}}</b>, then <b>{{admin.linked.unlinkSure}}</b>.",
      "Its products stay on your other stores' registries. Guests see <b>Find it at</b> that store and <b>{{guest.item.iBought}}</b> instead, and gifts already in a cart are still counted. Link again at any time with a new code; the products go back to <b>Buy at</b>.",
    ],
  },
];
