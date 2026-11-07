import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";

import { authenticate } from "../shopify.server";
import { settingsFor, updateSettings, upsertShop } from "../models/shop.server";
import { languageForCountry } from "../lib/store-language.server";
import { adminLocale } from "../lib/admin-locale.server";
import { useAdminT } from "../lib/use-admin-t";

const SHOP_QUERY = `#graphql
  query giftpinShopInfo {
    shop {
      name
      currencyCode
      currencyFormats { moneyFormat }
      billingAddress { countryCodeV2 }
      plan { partnerDevelopment }
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
  let country: string | undefined;
  let devStore: boolean | undefined;

  try {
    const response = await admin.graphql(SHOP_QUERY);
    const body = (await response.json()) as {
      data?: {
        shop?: {
          name?: string;
          currencyCode?: string;
          currencyFormats?: { moneyFormat?: string };
          billingAddress?: { countryCodeV2?: string | null } | null;
          plan?: { partnerDevelopment?: boolean } | null;
        };
      };
    };
    name = body.data?.shop?.name;
    currency = body.data?.shop?.currencyCode;
    moneyFormat = body.data?.shop?.currencyFormats?.moneyFormat;
    country = body.data?.shop?.billingAddress?.countryCodeV2 ?? undefined;
    devStore = body.data?.shop?.plan?.partnerDevelopment;
  } catch (err) {
    console.error("[app] could not read shop info:", (err as Error).message);
  }

  let shop = await upsertShop(session.shop, { name, currency, moneyFormat, country, devStore });

  // First open: no language has ever been saved, so start in the store's likely
  // language. Once Settings has been saved the key exists and this never runs.
  const saved = (shop.settings ?? {}) as { language?: string };
  if (saved.language === undefined) {
    const guess = languageForCountry(shop.country);
    if (guess) shop = await updateSettings(session.shop, { language: guess });
  }

  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    locale: adminLocale(request, settingsFor(shop).language),
  };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();
  const t = useAdminT();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <s-app-nav>
        <s-link href="/app">{t("admin.nav.overview")}</s-link>
        <s-link href="/app/registries">{t("admin.nav.registries")}</s-link>
        <s-link href="/app/promotions">{t("admin.nav.promotions")}</s-link>
        <s-link href="/app/analytics">{t("admin.nav.analytics")}</s-link>
        <s-link href="/app/in-store">{t("admin.nav.inStore")}</s-link>
        <s-link href="/app/settings">{t("admin.nav.settings")}</s-link>
        <s-link href="/app/billing">{t("admin.nav.plan")}</s-link>
      </s-app-nav>
      <Outlet />
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
