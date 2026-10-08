import { homeGoodsRegistryHtml } from "../marketing/guides";
import { htmlResponse } from "../marketing/layout";

/** Search landing page at giftpin.app/home-goods-registry. Resource route: no auth, no session. */
export const loader = async () => htmlResponse(homeGoodsRegistryHtml());
