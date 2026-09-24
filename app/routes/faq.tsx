import { faqHtml } from "../marketing/faq";
import { htmlResponse } from "../marketing/layout";

/** Public FAQ page at giftpin.app/faq. Resource route: no auth, no session. */
export const loader = async () => htmlResponse(faqHtml());
