import { setupHtml } from "../marketing/guides";
import { htmlResponse } from "../marketing/layout";

/** Merchant setup guide at giftpin.app/setup. Resource route: no auth, no session. */
export const loader = async () => htmlResponse(setupHtml());
