import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  BillingInterval,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import {
  GIFT_CARD_FEE_CAP,
  GIFT_CARD_FEE_TERMS,
  PRO_PLAN,
  PRO_PLAN_PRICE,
  PRO_TRIAL_DAYS,
} from "./shared/plans";

// Confirmed 22 Sep 2026 (Ben): Free (unlimited) + Pro at $9.99/mo, funded on
// the Free side by the disclosed affiliate commission. See
// app/routes/app.billing.tsx for the upgrade/cancel flow and
// app/routes/webhooks.app_subscriptions.update.tsx for how Shop.plan is kept
// in sync with Shopify's own billing state.
export { PRO_PLAN, PRO_PLAN_PRICE } from "./shared/plans";

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
      trialDays: PRO_TRIAL_DAYS,
      lineItems: [
        {
          amount: PRO_PLAN_PRICE,
          currencyCode: "USD",
          interval: BillingInterval.Every30Days,
        },
        // Gift card listing fee (app/models/gift-card-fee.server.ts). A
        // subscription made before this line existed has no usage line, and
        // its sales are simply never charged.
        {
          amount: GIFT_CARD_FEE_CAP,
          currencyCode: "USD",
          interval: BillingInterval.Usage,
          terms: GIFT_CARD_FEE_TERMS,
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

/**
 * authenticate.admin() throws a raw TypeError, which React Router turns into
 * a 500, when the `host` query param isn't a valid base64 admin host (the
 * App Store review's probes send e.g. host=9991062684009999999). A garbled
 * request is a 400, not a server error.
 */
const authenticateAdmin: typeof shopify.authenticate.admin = async (request) => {
  try {
    return await shopify.authenticate.admin(request);
  } catch (err) {
    if (isInvalidUrlError(err)) throw new Response("Bad Request", { status: 400 });
    throw err;
  }
};

function isInvalidUrlError(err: unknown): boolean {
  return err instanceof TypeError && (err as { code?: string }).code === "ERR_INVALID_URL";
}

export const authenticate = { ...shopify.authenticate, admin: authenticateAdmin };
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
