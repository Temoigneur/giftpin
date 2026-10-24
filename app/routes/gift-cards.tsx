import { giftCardsHtml } from "../marketing/gift-cards";
import { htmlResponse } from "../marketing/layout";
import { listedGiftCardStores } from "../models/gift-card-sale.server";

/** giftpin.app/gift-cards: the gift card directory. Resource route: no auth, no session. */
export const loader = async () => {
  const stores = await listedGiftCardStores().catch((err) => {
    // The directory is a marketing page: an empty list beats a 500.
    console.error("[gift-cards] listing stores:", (err as Error).message);
    return [];
  });
  return htmlResponse(giftCardsHtml(stores));
};
