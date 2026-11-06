import type { LoaderFunctionArgs } from "react-router";
import { featuresHtml } from "../marketing/features";
import { renderFor } from "../marketing/layout";

/** Public features page at giftpin.app/features. Resource route: no auth, no session. */
export const loader = ({ request }: LoaderFunctionArgs) => renderFor(request, () => featuresHtml());
