import type { LoaderFunctionArgs } from "react-router";
import { faqHtml } from "../marketing/faq";
import { renderFor } from "../marketing/layout";

/** Public FAQ page at giftpin.app/faq. Resource route: no auth, no session. */
export const loader = ({ request }: LoaderFunctionArgs) => renderFor(request, () => faqHtml());
