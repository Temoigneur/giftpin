import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { handleProxyRequest } from "../proxy/router.server";

/**
 * Every customer-facing surface, behind one route.
 *
 * An app gets exactly ONE app proxy route, so `/apps/registry/*` on the
 * merchant's domain lands here and we dispatch internally. This is a resource
 * route — no React component, no hydration — because the guest page is
 * hand-rendered HTML. See app/proxy/render/layout.ts for why.
 */

export const loader = async ({ request }: LoaderFunctionArgs) => handleProxyRequest(request);

export const action = async ({ request }: ActionFunctionArgs) => handleProxyRequest(request);
