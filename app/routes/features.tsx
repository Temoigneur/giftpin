import { featuresHtml } from "../marketing/features";
import { htmlResponse } from "../marketing/layout";

/** Public features page at giftpin.app/features. Resource route: no auth, no session. */
export const loader = async () => htmlResponse(featuresHtml());
