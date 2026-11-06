import type { LoaderFunctionArgs } from "react-router";
import { setupHtml } from "../marketing/guides";
import { renderFor } from "../marketing/layout";

/** Merchant setup guide at giftpin.app/setup. Resource route: no auth, no session. */
export const loader = ({ request }: LoaderFunctionArgs) => renderFor(request, () => setupHtml());
