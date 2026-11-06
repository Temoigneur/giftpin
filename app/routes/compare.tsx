import type { LoaderFunctionArgs } from "react-router";
import { compareHtml } from "../marketing/guides";
import { renderFor } from "../marketing/layout";

/** Search landing page at giftpin.app/compare. Resource route: no auth, no session. */
export const loader = ({ request }: LoaderFunctionArgs) => renderFor(request, () => compareHtml());
