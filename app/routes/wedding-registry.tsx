import type { LoaderFunctionArgs } from "react-router";
import { weddingRegistryHtml } from "../marketing/guides";
import { renderFor } from "../marketing/layout";

/** Search landing page at giftpin.app/wedding-registry. Resource route: no auth, no session. */
export const loader = ({ request }: LoaderFunctionArgs) => renderFor(request, () => weddingRegistryHtml());
