import type { LoaderFunctionArgs } from "react-router";
import { renderFor } from "../marketing/layout";
import { pricingHtml } from "../marketing/pricing";

/**
 * Public pricing page at giftpin.app/pricing, the URL for the Shopify
 * listing's "more pricing information" field. Resource route (no default
 * export), same as `_index.tsx`: no auth, no session. Content lives in
 * `app/marketing/pricing.ts`; price, trial and plan name come from
 * `app/shared/plans.ts`, the same constants billing uses.
 */
export const loader = ({ request }: LoaderFunctionArgs) => renderFor(request, () => pricingHtml());

export { pricingHtml };
