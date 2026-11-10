import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate, PRO_PLAN, PRO_PLAN_PRICE, BILLING_IS_TEST } from "../shopify.server";
import { foundingOfferEligible, requireShop, setPlanFromSubscription } from "../models/shop.server";
import { FOUNDING_OFFER_ORIGINAL_TRIAL_DAYS, GIFT_CARD_FEE_CAP, GIFT_CARD_FEE_PERCENT, PRO_TRIAL_DAYS, foundingTrialDays } from "../shared/plans";
import { SUPPORT_EMAIL, supportMailto } from "../shared/support";
import { t as translate } from "../shared/i18n";
import { adminLocale } from "../lib/admin-locale.server";
import { useAdminT, type AdminT } from "../lib/use-admin-t";

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
  const { session, billing, admin } = await authenticate.admin(request);
  const shop = await requireShop(session.shop);

  // Display-only freshness check against Shopify's own record, in case a
  // webhook delivery was missed. Never trusted for a write — see above.
  // A partner development store can only take test charges (shop.devStore),
  // whatever BILLING_TEST_MODE says for real merchants.
  const isTest = BILLING_IS_TEST || shop.devStore;
  let liveSubscriptionName: string | null = null;
  try {
    const { appSubscriptions } = await billing.check({
      plans: [PRO_PLAN],
      isTest,
    });
    liveSubscriptionName = appSubscriptions[0]?.name ?? null;
  } catch (err) {
    console.error("[billing] check failed:", (err as Error).message);
  }

  return {
    shopDomain: session.shop,
    plan: shop.plan,
    price: PRO_PLAN_PRICE,
    isTest,
    liveSubscriptionName,
    founding:
      shop.plan !== "pro" && (await foundingOfferEligible(shop))
        ? { trialDays: foundingTrialDays(shop.installedAt, await primaryDomainHost(admin)) }
        : null,
  };
};

/**
 * The store's primary domain (e.g. "bergodesigns.ca"), used only to honour
 * the free year promised to the stores Ben emailed on 30 Oct 2026 (see
 * FOUNDING_YEAR_PROMISED_DOMAINS). Null if Shopify doesn't answer, which
 * falls back to the normal founding trial.
 */
async function primaryDomainHost(admin: { graphql: (query: string) => Promise<Response> }): Promise<string | null> {
  try {
    const res = await admin.graphql(`#graphql
      query FoundingPrimaryDomain { shop { primaryDomain { host } } }`);
    const json = (await res.json()) as { data?: { shop?: { primaryDomain?: { host?: string } } } };
    return json.data?.shop?.primaryDomain?.host ?? null;
  } catch (err) {
    console.error("[billing] primary domain lookup failed:", (err as Error).message);
    return null;
  }
}

/** "a year" or "6 months", in the merchant's language. */
function foundingPeriod(t: AdminT, trialDays: number): string {
  return trialDays >= FOUNDING_OFFER_ORIGINAL_TRIAL_DAYS ? t("admin.bill.periodYearA") : t("admin.bill.period6m");
}

/** What Pro adds, one bullet per feature. The same list shows on Pro and on Free. */
function ProFeatures({ t }: { t: AdminT }) {
  return (
    <s-unordered-list>
      <s-list-item>{t("admin.bill.f.analytics")}</s-list-item>
      <s-list-item>{t("admin.bill.f.report")}</s-list-item>
      <s-list-item>{t("admin.bill.f.branding")}</s-list-item>
      <s-list-item>{t("admin.bill.f.csv")}</s-list-item>
      <s-list-item>{t("admin.bill.f.discount")}</s-list-item>
      <s-list-item>{t("admin.bill.f.emails")}</s-list-item>
      <s-list-item>{t("admin.bill.f.inStore")}</s-list-item>
      <s-list-item>{t("admin.bill.f.giftCards", { pct: GIFT_CARD_FEE_PERCENT })}</s-list-item>
      <s-list-item>{t("admin.bill.f.support", { promise: t("admin.bill.promise").toLowerCase() })}</s-list-item>
    </s-unordered-list>
  );
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, billing, admin } = await authenticate.admin(request);
  const form = await request.formData();
  const intent = String(form.get("intent"));

  if (intent === "upgrade") {
    // Throws a redirect to Shopify's confirmation page (embedded-safe via
    // App Bridge) — this never returns normally. Founding-offer stores get
    // the same plan with a longer trial; eligibility is re-checked here
    // rather than trusted from the form.
    const shop = await requireShop(session.shop);
    // Dev stores bill in test mode only, so skip the trial there: it is the only
    // way to see a real usage charge (SPIKE-C.md F4) without waiting 14 days.
    const trialDays = shop.devStore
      ? 0
      : (await foundingOfferEligible(shop))
        ? foundingTrialDays(shop.installedAt, await primaryDomainHost(admin))
        : PRO_TRIAL_DAYS;
    return billing.request({ plan: PRO_PLAN, isTest: BILLING_IS_TEST || shop.devStore, trialDays });
  }

  if (intent === "cancel") {
    const shop = await requireShop(session.shop);
    if (shop.shopifyChargeId) {
      await billing.cancel({
        subscriptionId: shop.shopifyChargeId,
        isTest: BILLING_IS_TEST || shop.devStore,
        prorate: true,
      });
    }
    await setPlanFromSubscription(session.shop, "CANCELLED", null);
    return { ok: true };
  }

  return { ok: false, error: translate("admin.bill.unknownAction", undefined, adminLocale(request)) };
};

export default function Billing() {
  const { plan, price, isTest, liveSubscriptionName, shopDomain, founding } =
    useLoaderData<typeof loader>();
  const t = useAdminT();
  const fetcher = useFetcher<typeof action>();
  const busy = fetcher.state !== "idle";
  const isPro = plan === "pro";

  return (
    <s-page heading={t("admin.bill.page")}>
      <s-section heading={isPro ? t("admin.bill.onPro") : t("admin.bill.free")}>
        {isPro ? (
          <s-stack direction="block" gap="base">
            <s-paragraph>
              {t("admin.bill.priceMo", { price })}
              {liveSubscriptionName ? ` — ${liveSubscriptionName}` : ""}.
            </s-paragraph>
            <ProFeatures t={t} />
            <fetcher.Form method="post">
              <input type="hidden" name="intent" value="cancel" />
              <s-button type="submit" variant="secondary" {...(busy ? { loading: true } : {})}>
                {t("admin.bill.cancel")}
              </s-button>
            </fetcher.Form>
          </s-stack>
        ) : (
          <s-stack direction="block" gap="base">
            <s-paragraph>{t("admin.bill.freeText")}</s-paragraph>
            {founding && (
              <s-banner
                tone="success"
                heading={t("admin.bill.foundingHead", { period: foundingPeriod(t, founding.trialDays) })}
              >
                <s-paragraph>
                  {t("admin.bill.foundingText", {
                    period: foundingPeriod(t, founding.trialDays),
                    days: founding.trialDays,
                    price,
                  })}
                </s-paragraph>
              </s-banner>
            )}
            <s-paragraph>{t("admin.bill.proAdds", { price })}</s-paragraph>
            <ProFeatures t={t} />
            <s-banner tone="info" heading={t("admin.bill.limitHead")}>
              <s-paragraph>
                {t("admin.bill.limitText", { pct: GIFT_CARD_FEE_PERCENT, cap: GIFT_CARD_FEE_CAP })}
              </s-paragraph>
            </s-banner>
            <fetcher.Form method="post">
              <input type="hidden" name="intent" value="upgrade" />
              <s-button type="submit" {...(busy ? { loading: true } : {})}>
                {founding
                  ? t("admin.bill.startFree", { period: foundingPeriod(t, founding.trialDays) })
                  : t("admin.bill.upgrade", { price })}
              </s-button>
            </fetcher.Form>
          </s-stack>
        )}
        {isTest && (
          <s-paragraph>
            <s-text color="subdued">{t("admin.bill.testMode")}</s-text>
          </s-paragraph>
        )}
      </s-section>

      <s-section heading={isPro ? t("admin.bill.supportPro") : t("admin.bill.support")}>
        <s-stack direction="block" gap="base">
          <s-paragraph>
            {isPro
              ? t("admin.bill.supportProText", { email: SUPPORT_EMAIL, promise: t("admin.bill.promise") })
              : t("admin.bill.supportText", { email: SUPPORT_EMAIL, promise: t("admin.bill.promise").toLowerCase() })}
          </s-paragraph>
          <s-button href={supportMailto(shopDomain, isPro)} target="_blank" variant="secondary">
            {t("admin.bill.emailSupport")}
          </s-button>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
