import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate, PRO_PLAN, PRO_PLAN_PRICE, BILLING_IS_TEST } from "../shopify.server";
import { requireShop, setPlanFromSubscription } from "../models/shop.server";

/**
 * Merchant-facing upgrade/cancel page. Pricing (Free unlimited + Pro
 * $9.99/mo) confirmed by Ben 22 Sep 2026.
 *
 * Shop.plan (the column everything else reads) is NOT written here on
 * upgrade — Shopify only tells us the charge is real via the
 * APP_SUBSCRIPTIONS_UPDATE webhook, so that's the source of truth. This page
 * only writes on cancel, where billing.cancel() already gives us a
 * synchronous success/failure and there's no reason to make the merchant
 * wait on webhook delivery to see it reflected.
 */

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, billing } = await authenticate.admin(request);
  const shop = await requireShop(session.shop);

  // Display-only freshness check against Shopify's own record, in case a
  // webhook delivery was missed. Never trusted for a write — see above.
  let liveSubscriptionName: string | null = null;
  try {
    const { appSubscriptions } = await billing.check({
      plans: [PRO_PLAN],
      isTest: BILLING_IS_TEST,
    });
    liveSubscriptionName = appSubscriptions[0]?.name ?? null;
  } catch (err) {
    console.error("[billing] check failed:", (err as Error).message);
  }

  return {
    plan: shop.plan,
    price: PRO_PLAN_PRICE,
    isTest: BILLING_IS_TEST,
    liveSubscriptionName,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, billing } = await authenticate.admin(request);
  const form = await request.formData();
  const intent = String(form.get("intent"));

  if (intent === "upgrade") {
    // Throws a redirect to Shopify's confirmation page (embedded-safe via
    // App Bridge) — this never returns normally.
    return billing.request({ plan: PRO_PLAN, isTest: BILLING_IS_TEST });
  }

  if (intent === "cancel") {
    const shop = await requireShop(session.shop);
    if (shop.shopifyChargeId) {
      await billing.cancel({
        subscriptionId: shop.shopifyChargeId,
        isTest: BILLING_IS_TEST,
        prorate: true,
      });
    }
    await setPlanFromSubscription(session.shop, "CANCELLED", null);
    return { ok: true };
  }

  return { ok: false, error: "Unknown action" };
};

export default function Billing() {
  const { plan, price, isTest, liveSubscriptionName } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const busy = fetcher.state !== "idle";
  const isPro = plan === "pro";

  return (
    <s-page heading="Plan">
      <s-section heading={isPro ? "You're on Pro" : "Free"}>
        {isPro ? (
          <s-stack direction="block" gap="base">
            <s-paragraph>
              ${price}/mo{liveSubscriptionName ? ` — ${liveSubscriptionName}` : ""}.
            </s-paragraph>
            <s-unordered-list>
              <s-list-item>Analytics: registries created, items added and gifts bought over time</s-list-item>
              <s-list-item>In-store mode: staff find or start a registry from Shopify POS or the admin</s-list-item>
              <s-list-item>Priority support</s-list-item>
              <s-list-item>The &quot;Powered by Giftpin&quot; credit removed from your registry pages</s-list-item>
            </s-unordered-list>
            <fetcher.Form method="post">
              <input type="hidden" name="intent" value="cancel" />
              <s-button type="submit" variant="secondary" {...(busy ? { loading: true } : {})}>
                Cancel Pro
              </s-button>
            </fetcher.Form>
          </s-stack>
        ) : (
          <s-stack direction="block" gap="base">
            <s-paragraph>
              Unlimited registries, funded by the disclosed affiliate commission on external-store
              purchases — never billed to you.
            </s-paragraph>
            <s-paragraph>Pro (${price}/mo) adds:</s-paragraph>
            <s-unordered-list>
              <s-list-item>Analytics: registries created, items added and gifts bought over time</s-list-item>
              <s-list-item>In-store mode: staff find or start a registry from Shopify POS or the admin</s-list-item>
              <s-list-item>Priority support</s-list-item>
              <s-list-item>Remove the &quot;Powered by Giftpin&quot; credit from your registry pages</s-list-item>
            </s-unordered-list>
            <fetcher.Form method="post">
              <input type="hidden" name="intent" value="upgrade" />
              <s-button type="submit" {...(busy ? { loading: true } : {})}>
                Upgrade to Pro — ${price}/mo
              </s-button>
            </fetcher.Form>
          </s-stack>
        )}
        {isTest && (
          <s-paragraph>
            <s-text color="subdued">Test mode — no card will actually be charged.</s-text>
          </s-paragraph>
        )}
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
