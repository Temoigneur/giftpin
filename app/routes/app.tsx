import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";

import { authenticate } from "../shopify.server";
import { upsertShop } from "../models/shop.server";

const SHOP_QUERY = `#graphql
  query giftpinShopInfo {
    shop {
      name
      currencyCode
      currencyFormats { moneyFormat }
    }
  }`;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);

  // Keep our Shop row in step on every admin load. Cheap, and it means an
  // install that half-failed repairs itself the first time the merchant opens
  // the app rather than staying broken until someone notices.
  let name: string | undefined;
  let currency: string | undefined;
  let moneyFormat: string | undefined;

  try {
    const response = await admin.graphql(SHOP_QUERY);
    const body = (await response.json()) as {
      data?: { shop?: { name?: string; currencyCode?: string; currencyFormats?: { moneyFormat?: string } } };
    };
    name = body.data?.shop?.name;
    currency = body.data?.shop?.currencyCode;
    moneyFormat = body.data?.shop?.currencyFormats?.moneyFormat;
  } catch (err) {
    console.error("[app] could not read shop info:", (err as Error).message);
  }

  await upsertShop(session.shop, { name, currency, moneyFormat });

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <s-app-nav>
        <s-link href="/app">Overview</s-link>
        <s-link href="/app/registries">Registries</s-link>
        <s-link href="/app/settings">Settings</s-link>
        <s-link href="/app/billing">Plan</s-link>
      </s-app-nav>
      <Outlet />
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
