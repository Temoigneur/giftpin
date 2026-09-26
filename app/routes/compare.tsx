import { compareHtml } from "../marketing/guides";
import { htmlResponse } from "../marketing/layout";

/** Search landing page at giftpin.app/compare. Resource route: no auth, no session. */
export const loader = async () => htmlResponse(compareHtml());
