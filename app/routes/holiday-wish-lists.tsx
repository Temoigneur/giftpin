import type { LoaderFunctionArgs } from "react-router";
import { holidayWishListsHtml } from "../marketing/guides";
import { renderFor } from "../marketing/layout";

/** Seasonal landing page at giftpin.app/holiday-wish-lists (see holidayPromoOn). Resource route: no auth, no session. */
export const loader = ({ request }: LoaderFunctionArgs) => renderFor(request, () => holidayWishListsHtml());
