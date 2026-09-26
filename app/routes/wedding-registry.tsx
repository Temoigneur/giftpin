import { weddingRegistryHtml } from "../marketing/guides";
import { htmlResponse } from "../marketing/layout";

/** Search landing page at giftpin.app/wedding-registry. Resource route: no auth, no session. */
export const loader = async () => htmlResponse(weddingRegistryHtml());
