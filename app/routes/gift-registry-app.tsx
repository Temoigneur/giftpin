import { giftRegistryAppHtml } from "../marketing/guides";
import { htmlResponse } from "../marketing/layout";

/** Search landing page at giftpin.app/gift-registry-app. Resource route: no auth, no session. */
export const loader = async () => htmlResponse(giftRegistryAppHtml());
