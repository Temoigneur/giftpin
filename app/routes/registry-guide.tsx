import type { LoaderFunctionArgs } from "react-router";
import { registryGuideHtml } from "../marketing/guides";
import { renderFor } from "../marketing/layout";

/** Registry creator guide at giftpin.app/registry-guide. Resource route: no auth, no session. */
export const loader = ({ request }: LoaderFunctionArgs) => renderFor(request, () => registryGuideHtml());
