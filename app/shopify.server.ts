import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  BillingInterval,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

// Confirmed 22 Sep 2026 (Ben): Free (unlimited) + Pro at $9.99/mo, funded on
// the Free side by the disclosed affiliate commission. See
// app/routes/app.billing.tsx for the upgrade/cancel flow and
// app/routes/webhooks.app_subscriptions.update.tsx for how Shop.plan is kept
// in sync with Shopify's own billing state.
export const PRO_PLAN = "Pro";
export const PRO_PLAN_PRICE = 9.99;

// Real charges only in production. A dev/test store can never actually be
// charged, but `isTest` also skips a confusing "this shop can't be billed"
// error there — flip to "false" deliberately at the same time as the other
// go-live switches (see STATUS.md's deploy-time checklist).
export const BILLING_IS_TEST = process.env.BILLING_TEST_MODE !== "false";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.July26,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  billing: {
    [PRO_PLAN]: {
      lineItems: [
        {
          amount: PRO_PLAN_PRICE,
          currencyCode: "USD",
          interval: BillingInterval.Every30Days,
        },
      ],
    },
  },
  future: {
    expiringOfflineAccessTokens: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.July26;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
