import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useSearchParams } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { isPro, requireShop, settingsFor } from "../models/shop.server";
import { dashboardStats } from "../models/dashboard.server";
import { checkThemeSupport, listThemes } from "../models/themes.server";
import type { ThemeSupport } from "../lib/theme-support";
import { SITE_URL } from "../marketing/config";
import { useAdminT } from "../lib/use-admin-t";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = await requireShop(session.shop);
  const stats = await dashboardStats(shop.id);

  // Theme picker: Shopify's onboarding guidance for app blocks asks us to let
  // the merchant pick a theme and tell them if it can't take app blocks
  // (vintage themes). null means we couldn't list themes (read_themes not
  // approved yet); the page then falls back to links into the live theme.
  const graphql = admin.graphql.bind(admin);
  const themes = await listThemes(graphql);
  const requested = new URL(request.url).searchParams.get("theme");
  const selectedTheme = themes?.find((t) => t.id === requested) ?? themes?.[0] ?? null;
  const themeSupport: ThemeSupport = selectedTheme ? await checkThemeSupport(graphql, selectedTheme.id) : "unknown";

  return {
    stats,
    settings: settingsFor(shop),
    pro: isPro(shop),
    shopDomain: session.shop,
    themes,
    selectedThemeId: selectedTheme?.id ?? null,
    themeSupport,
    apiKey: process.env.SHOPIFY_API_KEY ?? "",
    hasData: stats.registries.active > 0,
    // A fresh query string on these links so a stale cached response can never
    // be served for them (see the 23 Sep 2026 note in app.settings.tsx history).
    cacheBust: Date.now(),
  };
};

function money(amount: number, currency: string, intl: string): string {
  return new Intl.NumberFormat(intl, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Dashboard() {
  const { stats, hasData, shopDomain, cacheBust, settings, pro } = useLoaderData<typeof loader>();
  const t = useAdminT();

  // Where shoppers actually create and find registries. Shown at the top in
  // both states so the merchant can always get to (and preview) them.
  const registryLinks = (
    <s-section heading={t("admin.ov.pages")}>
      <s-paragraph>{t("admin.ov.pagesIntro")}</s-paragraph>
      <s-stack direction="inline" gap="base">
        <s-button href={`https://${shopDomain}/apps/registry?_=${cacheBust}`} target="_blank">
          {t("admin.ov.create")}
        </s-button>
        {settings.findARegistryEnabled && (
          <s-button href={`https://${shopDomain}/apps/registry/find?_=${cacheBust}`} target="_blank" variant="secondary">
            {t("admin.ov.find")}
          </s-button>
        )}
      </s-stack>
    </s-section>
  );

  const setupGuide = (
    <s-section slot="aside" heading={t("admin.ov.guide")}>
      <s-paragraph>{t("admin.ov.guideText")}</s-paragraph>
      <s-button href={`${SITE_URL}/setup`} target="_blank" variant="secondary">
        {t("admin.ov.guideBtn")}
      </s-button>
    </s-section>
  );

  if (!hasData) {
    return (
      <s-page heading={t("admin.ov.page")}>
        {registryLinks}
        <ThemeSetup />
        {setupGuide}

        <s-section slot="aside" heading={t("admin.ov.why")}>
          <s-paragraph>{t("admin.ov.whyText")}</s-paragraph>
        </s-section>
      </s-page>
    );
  }

  return (
    <s-page heading={t("admin.ov.page")}>
      {registryLinks}
      <ThemeSetup />
      <s-section heading={t("admin.ov.last12")}>
        <s-stack direction="inline" gap="large">
          <Stat label={t("admin.ov.revenue")} value={money(stats.registryRevenue, stats.currency, t.intl)} />
          <Stat label={t("admin.ov.newCustomers")} value={String(stats.newCustomers)} />
          <Stat label={t("admin.ov.gifts")} value={String(stats.giftsGiven)} />
          <Stat label={t("admin.ov.active")} value={String(stats.registries.active)} />
        </s-stack>
      </s-section>

      {/*
        The number that answers "why am I paying for an app that links to other
        stores?". It belongs on the main dashboard, not buried in a report.
      */}
      <s-section heading={t("admin.ov.share")}>
        <s-stack direction="block" gap="base">
          <s-heading>{stats.merchantSharePercent}%</s-heading>
          <s-paragraph>
            {t("admin.ov.shareText", {
              pct: stats.merchantSharePercent,
              internal: stats.internalItemCount,
              external: stats.externalItemCount,
            })}
          </s-paragraph>
          <s-paragraph>
            <s-text color="subdued">{t("admin.ov.shareNote")}</s-text>
          </s-paragraph>
        </s-stack>
      </s-section>

      {stats.topProducts.length > 0 && (
        <s-section heading={t("admin.ov.topProducts")}>
          <s-table>
            <s-table-header-row>
              <s-table-header>{t("admin.ov.colProduct")}</s-table-header>
              <s-table-header>{t("admin.ov.colOnRegs")}</s-table-header>
              <s-table-header>{t("admin.ov.colBought")}</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {stats.topProducts.map((product) => (
                <s-table-row key={product.title}>
                  <s-table-cell>{product.title}</s-table-cell>
                  <s-table-cell>{product.timesRegistered}</s-table-cell>
                  <s-table-cell>{product.timesBought}</s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        </s-section>
      )}

      {stats.topExternalDomains.length > 0 && (
        <s-section slot="aside" heading={t("admin.ov.competing")}>
          <s-paragraph>
            <s-text color="subdued">{t("admin.ov.competingText")}</s-text>
          </s-paragraph>
          <s-unordered-list>
            {stats.topExternalDomains.map((entry) => (
              <s-list-item key={entry.domain}>
                {entry.domain} &mdash; {entry.count}
              </s-list-item>
            ))}
          </s-unordered-list>
        </s-section>
      )}

      {setupGuide}

      <s-section slot="aside" heading={t("admin.ov.thisYear")}>
        <s-paragraph>
          {t("admin.ov.thisYearText", { created: stats.registries.createdThisPeriod, orders: stats.orders })}
        </s-paragraph>
        <s-stack direction="inline" gap="base">
          <s-button href="/app/registries" variant="secondary">
            {t("admin.ov.seeAll")}
          </s-button>
          <s-button href="/app/analytics" variant="secondary">
            {pro ? t("admin.ov.seeAnalytics") : t("admin.ov.analyticsPro")}
          </s-button>
        </s-stack>
      </s-section>
    </s-page>
  );
}

const ROLE_KEYS = {
  MAIN: "admin.role.live",
  UNPUBLISHED: "admin.role.unpublished",
  DEVELOPMENT: "admin.role.development",
} as const;

/**
 * Theme onboarding, following Shopify's guidance for app blocks: pick a theme,
 * say plainly if it can't take app blocks, then explain which templates each
 * block goes on and how to add, move, remove and configure it.
 *
 * Both of Giftpin's blocks are app blocks (no app embeds), so vintage themes
 * can't use them. The registry pages at /apps/registry work in any theme.
 */
function ThemeSetup() {
  const { shopDomain, apiKey, themes, selectedThemeId, themeSupport } = useLoaderData<typeof loader>();
  const t = useAdminT();
  const [searchParams, setSearchParams] = useSearchParams();

  const selected = themes?.find((theme) => theme.id === selectedThemeId) ?? null;
  const themeName = selected ? `“${selected.name}”` : t("admin.theme.yours");

  // Theme-editor deep links that open the right page with our block already
  // added, so the merchant only has to press Save. (Plain /editor opens the
  // home page and adds nothing.)
  const editor = `https://${shopDomain}/admin/themes/${selectedThemeId ?? "current"}/editor`;
  const addProductButtonUrl = `${editor}?template=product&addAppBlockId=${apiKey}/add-to-registry&target=mainSection`;
  // Registry links go in the header section group, so they show near the top
  // of every page. A new Apps section (newAppsSection) lands at the bottom of
  // the home page, where shoppers miss it.
  const addRegistryLinksUrl = `${editor}?template=index&addAppBlockId=${apiKey}/registry-links&target=sectionGroup:header`;

  // Save for later (heart) goes in the product's main section like the button.
  // Saved items is a standalone section, so it lands in a new Apps section on
  // the cart page, where a shopper looks for what they set aside.
  const addSaveButtonUrl = `${editor}?template=product&addAppBlockId=${apiKey}/save-for-later&target=mainSection`;
  const addSavedItemsUrl = `${editor}?template=cart&addAppBlockId=${apiKey}/saved-items&target=newAppsSection`;

  const vintage = themeSupport === "vintage";
  const productBlocked = vintage || themeSupport === "no-product-blocks";

  return (
    <s-section heading={t("admin.theme.title")}>
      {themes && themes.length > 0 && (
        <s-select
          label={t("admin.theme.label")}
          details={t("admin.theme.details")}
          value={selectedThemeId ?? ""}
          onChange={(event) => {
            const next = new URLSearchParams(searchParams);
            next.set("theme", event.currentTarget.value);
            setSearchParams(next);
          }}
        >
          {themes.map((theme) => (
            <s-option key={theme.id} value={theme.id}>
              {`${theme.name} (${theme.role in ROLE_KEYS ? t(ROLE_KEYS[theme.role as keyof typeof ROLE_KEYS]) : theme.role.toLowerCase()})`}
            </s-option>
          ))}
        </s-select>
      )}

      {vintage && (
        <s-banner tone="warning" heading={t("admin.theme.vintageHead", { name: themeName })}>
          <s-paragraph>{t("admin.theme.vintageText")}</s-paragraph>
        </s-banner>
      )}
      {themeSupport === "no-product-blocks" && (
        <s-banner tone="warning" heading={t("admin.theme.noBlocksHead", { name: themeName })}>
          <s-paragraph>{t("admin.theme.noBlocksText")}</s-paragraph>
        </s-banner>
      )}

      {!vintage && (
        <s-stack direction="block" gap="base">
          <s-paragraph>{t("admin.theme.intro")}</s-paragraph>

          <s-stack direction="block" gap="small-100">
            <s-heading>{t("admin.theme.btnTitle")}</s-heading>
            <s-paragraph>{t("admin.theme.btnText")}</s-paragraph>
            {!productBlocked && (
              <s-stack direction="inline" gap="base">
                <s-button href={addProductButtonUrl} target="_blank">
                  {t("admin.theme.btnAdd")}
                </s-button>
              </s-stack>
            )}
          </s-stack>

          <s-stack direction="block" gap="small-100">
            <s-heading>{t("admin.theme.linksTitle")}</s-heading>
            <s-paragraph>{t("admin.theme.linksText")}</s-paragraph>
            <s-stack direction="inline" gap="base">
              <s-button href={addRegistryLinksUrl} target="_blank" variant={productBlocked ? "primary" : "secondary"}>
                {t("admin.theme.linksAdd")}
              </s-button>
            </s-stack>
          </s-stack>

          <s-stack direction="block" gap="small-100">
            <s-heading>{t("admin.theme.heartTitle")}</s-heading>
            <s-paragraph>{t("admin.theme.heartText")}</s-paragraph>
            {!productBlocked && (
              <s-stack direction="inline" gap="base">
                <s-button href={addSaveButtonUrl} target="_blank" variant="secondary">
                  {t("admin.theme.heartAdd")}
                </s-button>
              </s-stack>
            )}
          </s-stack>

          <s-stack direction="block" gap="small-100">
            <s-heading>{t("admin.theme.savedTitle")}</s-heading>
            <s-paragraph>{t("admin.theme.savedText")}</s-paragraph>
            <s-stack direction="inline" gap="base">
              <s-button href={addSavedItemsUrl} target="_blank" variant="secondary">
                {t("admin.theme.savedAdd")}
              </s-button>
            </s-stack>
          </s-stack>

          <s-stack direction="block" gap="small-100">
            <s-heading>{t("admin.theme.editorTitle")}</s-heading>
            <s-unordered-list>
              <s-list-item>{t("admin.theme.editorAdd")}</s-list-item>
              <s-list-item>{t("admin.theme.editorMove")}</s-list-item>
              <s-list-item>{t("admin.theme.editorSettings")}</s-list-item>
              <s-list-item>{t("admin.theme.editorRemove")}</s-list-item>
            </s-unordered-list>
            <s-paragraph>
              <s-text color="subdued">{t("admin.theme.editorNote")}</s-text>
            </s-paragraph>
          </s-stack>
        </s-stack>
      )}
    </s-section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <s-stack direction="block" gap="small-100">
      <s-text color="subdued">{label}</s-text>
      <s-heading>{value}</s-heading>
    </s-stack>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
