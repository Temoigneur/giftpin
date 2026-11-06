import type { LoaderFunctionArgs } from "react-router";
import { giftRegistryAppHtml } from "../marketing/guides";
import { renderFor } from "../marketing/layout";

/** Search landing page at giftpin.app/gift-registry-app. Resource route: no auth, no session. */
export const loader = ({ request }: LoaderFunctionArgs) => renderFor(request, () => giftRegistryAppHtml());
