import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate, PRO_PLAN, PRO_PLAN_PRICE, BILLING_IS_TEST } from "../shopify.server";
import { foundingOfferEligible, requireShop, setPlanFromSubscription } from "../models/shop.server";
import { FOUNDING_OFFER_SLOTS, FOUNDING_OFFER_TRIAL_DAYS, PRO_TRIAL_DAYS } from "../shared/plans";
import { PRO_SUPPORT_PROMISE, SUPPORT_EMAIL, supportMailto } from "../shared/support";

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
    shopDomain: session.shop,
    plan: shop.plan,
    price: PRO_PLAN_PRICE,
    isTest: BILLING_IS_TEST,
    liveSubscriptionName,
    founding: shop.plan !== "pro" && (await foundingOfferEligible(shop)),
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, billing } = await authenticate.admin(request);
  const form = await request.formData();
  const intent = String(form.get("intent"));

  if (intent === "upgrade") {
    // Throws a redirect to Shopify's confirmation page (embedded-safe via
    // App Bridge) — this never returns normally. Founding-offer stores get
    // the same plan with a longer trial; eligibility is re-checked here
    // rather than trusted from the form.
    const shop = await requireShop(session.shop);
    const trialDays = (await foundingOfferEligible(shop)) ? FOUNDING_OFFER_TRIAL_DAYS : PRO_TRIAL_DAYS;
    return billing.request({ plan: PRO_PLAN, isTest: BILLING_IS_TEST, trialDays });
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
  const { plan, price, isTest, liveSubscriptionName, shopDomain, founding } =
    useLoaderData<typeof loader>();
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
              <s-list-item>Registry sales report: revenue, orders, new customers and average order by month</s-list-item>
              <s-list-item>Your logo, colours and font on registry pages, with the &quot;Powered by Giftpin&quot; credit removed</s-list-item>
              <s-list-item>CSV export of registries and purchases</s-list-item>
              <s-list-item>Completion discount: after the event, a one-time code for your products still on the registrant&apos;s list</s-list-item>
              <s-list-item>Automatic emails: a reminder to guests before the event, a &quot;most items gone&quot; alert and a thank-you reminder</s-list-item>
              <s-list-item>In-store mode: staff find or start a registry from Shopify POS or the admin</s-list-item>
              <s-list-item>Your gift cards on giftpin.app: shoppers buy them at your own checkout, and you keep every sale</s-list-item>
              <s-list-item>Priority support: {PRO_SUPPORT_PROMISE.toLowerCase()}</s-list-item>
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
            {founding && (
              <s-banner tone="success" heading="Founding store offer: Pro free for a year">
                <s-paragraph>
                  You&apos;re one of the first {FOUNDING_OFFER_SLOTS} stores to install Giftpin, so
                  Pro is free for your first year. Shopify will ask you to approve it. After the
                  year it&apos;s ${price}/mo unless you cancel, and you can cancel any time before
                  then at no charge.
                </s-paragraph>
              </s-banner>
            )}
            <s-paragraph>Pro (${price}/mo) adds:</s-paragraph>
            <s-unordered-list>
              <s-list-item>Analytics: registries created, items added and gifts bought over time</s-list-item>
              <s-list-item>Registry sales report: revenue, orders, new customers and average order by month</s-list-item>
              <s-list-item>Your logo, colours and font on registry pages, with the &quot;Powered by Giftpin&quot; credit removed</s-list-item>
              <s-list-item>CSV export of registries and purchases</s-list-item>
              <s-list-item>Completion discount: after the event, a one-time code for your products still on the registrant&apos;s list</s-list-item>
              <s-list-item>Automatic emails: a reminder to guests before the event, a &quot;most items gone&quot; alert and a thank-you reminder</s-list-item>
              <s-list-item>In-store mode: staff find or start a registry from Shopify POS or the admin</s-list-item>
              <s-list-item>Your gift cards on giftpin.app: shoppers buy them at your own checkout, and you keep every sale</s-list-item>
              <s-list-item>Priority support: {PRO_SUPPORT_PROMISE.toLowerCase()}</s-list-item>
            </s-unordered-list>
            <fetcher.Form method="post">
              <input type="hidden" name="intent" value="upgrade" />
              <s-button type="submit" {...(busy ? { loading: true } : {})}>
                {founding ? "Start my free year of Pro" : `Upgrade to Pro — $${price}/mo`}
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

      <s-section heading={isPro ? "Priority support" : "Support"}>
        <s-stack direction="block" gap="base">
          <s-paragraph>
            {isPro
              ? `Email ${SUPPORT_EMAIL} from the button below and your message is marked Pro. ${PRO_SUPPORT_PROMISE}.`
              : `Email ${SUPPORT_EMAIL} and we'll get back to you. Pro includes priority support: ${PRO_SUPPORT_PROMISE.toLowerCase()}.`}
          </s-paragraph>
          <s-button href={supportMailto(shopDomain, isPro)} target="_blank" variant="secondary">
            Email support
          </s-button>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
