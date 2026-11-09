import type { LoaderFunctionArgs } from "react-router";
import { guestGuideHtml } from "../marketing/guides";
import { renderFor } from "../marketing/layout";

/** Guide at giftpin.app/guest-guide. Resource route: no auth, no session. */
export const loader = ({ request }: LoaderFunctionArgs) => renderFor(request, () => guestGuideHtml());
