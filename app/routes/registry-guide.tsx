import { registryGuideHtml } from "../marketing/guides";
import { htmlResponse } from "../marketing/layout";

/** Registry creator guide at giftpin.app/registry-guide. Resource route: no auth, no session. */
export const loader = async () => htmlResponse(registryGuideHtml());
