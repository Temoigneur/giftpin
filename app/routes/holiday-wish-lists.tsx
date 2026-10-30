import { holidayWishListsHtml } from "../marketing/guides";
import { htmlResponse } from "../marketing/layout";

/** Seasonal landing page at giftpin.app/holiday-wish-lists (see holidayPromoOn). Resource route: no auth, no session. */
export const loader = async () => htmlResponse(holidayWishListsHtml());
