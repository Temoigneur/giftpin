import type { LoaderFunctionArgs } from "react-router";
import { setupProHtml } from "../marketing/guides";
import { renderFor } from "../marketing/layout";

/** Guide at giftpin.app/setup/pro. Resource route: no auth, no session. */
export const loader = ({ request }: LoaderFunctionArgs) => renderFor(request, () => setupProHtml());
