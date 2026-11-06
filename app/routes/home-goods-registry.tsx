import type { LoaderFunctionArgs } from "react-router";
import { homeGoodsRegistryHtml } from "../marketing/guides";
import { renderFor } from "../marketing/layout";

/** Search landing page at giftpin.app/home-goods-registry. Resource route: no auth, no session. */
export const loader = ({ request }: LoaderFunctionArgs) => renderFor(request, () => homeGoodsRegistryHtml());
