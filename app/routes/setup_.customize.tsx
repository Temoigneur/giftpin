import type { LoaderFunctionArgs } from "react-router";
import { setupCustomizeHtml } from "../marketing/guides";
import { renderFor } from "../marketing/layout";

/** Guide at giftpin.app/setup/customize. Resource route: no auth, no session. */
export const loader = ({ request }: LoaderFunctionArgs) => renderFor(request, () => setupCustomizeHtml());
