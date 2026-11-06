import type { LoaderFunctionArgs } from "react-router";
import { babyRegistryHtml } from "../marketing/guides";
import { renderFor } from "../marketing/layout";

/** Search landing page at giftpin.app/baby-registry. Resource route: no auth, no session. */
export const loader = ({ request }: LoaderFunctionArgs) => renderFor(request, () => babyRegistryHtml());
