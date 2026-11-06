import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useSearchParams } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { isPro, requireShop, settingsFor } from "../models/shop.server";
import { dashboardStats } from "../models/dashboard.server";
import { checkThemeSupport, listThemes } from "../models/themes.server";
import type { ThemeSupport } from "../lib/theme-support";
import { SITE_URL } from "../marketing/config";

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

function money(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Dashboard() {
  const { stats, hasData, shopDomain, cacheBust, settings, pro } = useLoaderData<typeof loader>();

  // Where shoppers actually create and find registries. Shown at the top in
  // both states so the merchant can always get to (and preview) them.
  const registryLinks = (
    <s-section heading="Your registry pages">
      <s-paragraph>
        Shoppers create their registries on your storefront, not here. Preview the pages they see:
      </s-paragraph>
      <s-stack direction="inline" gap="base">
        <s-button href={`https://${shopDomain}/apps/registry?_=${cacheBust}`} target="_blank">
          Create a registry
        </s-button>
        {settings.findARegistryEnabled && (
          <s-button href={`https://${shopDomain}/apps/registry/find?_=${cacheBust}`} target="_blank" variant="secondary">
            Find a registry
          </s-button>
        )}
      </s-stack>
    </s-section>
  );

  const setupGuide = (
    <s-section slot="aside" heading="Setup guide">
      <s-paragraph>
        Step-by-step help with your theme, settings and Pro features, using the same button names you see here.
      </s-paragraph>
      <s-button href={`${SITE_URL}/setup`} target="_blank" variant="secondary">
        Open the setup guide
      </s-button>
    </s-section>
  );

  if (!hasData) {
    return (
      <s-page heading="Gift registry">
        {registryLinks}
        <ThemeSetup />
        {setupGuide}

        <s-section slot="aside" heading="Why registries pay for themselves">
          <s-paragraph>
            A single registry link goes out to 20&ndash;100 guests, most of whom have never bought
            from you. Once registries are live, this page shows exactly how much of your revenue
            came from them.
          </s-paragraph>
        </s-section>
      </s-page>
    );
  }

  return (
    <s-page heading="Gift registry">
      {registryLinks}
      <ThemeSetup />
      <s-section heading="Last 12 months">
        <s-stack direction="inline" gap="large">
          <Stat label="Registry revenue" value={money(stats.registryRevenue, stats.currency)} />
          <Stat label="New customers" value={String(stats.newCustomers)} />
          <Stat label="Gifts given" value={String(stats.giftsGiven)} />
          <Stat label="Active registries" value={String(stats.registries.active)} />
        </s-stack>
      </s-section>

      {/*
        The number that answers "why am I paying for an app that links to other
        stores?". It belongs on the main dashboard, not buried in a report.
      */}
      <s-section heading="Your share of registry value">
        <s-stack direction="block" gap="base">
          <s-heading>{stats.merchantSharePercent}%</s-heading>
          <s-paragraph>
            {stats.merchantSharePercent}% of everything on your customers&apos; registries is your
            products &mdash; {stats.internalItemCount} items, against {stats.externalItemCount} from
            elsewhere.
          </s-paragraph>
          <s-paragraph>
            <s-text color="subdued">
              Couples register where they can put everything in one list. Letting them do that here
              is why these lists are on your site instead of somewhere else. When a guest buys
              elsewhere, Giftpin may earn a small, disclosed commission &mdash; it&apos;s never billed
              to you, and never applies to your own products.
            </s-text>
          </s-paragraph>
        </s-stack>
      </s-section>

      {stats.topProducts.length > 0 && (
        <s-section heading="Most registered products">
          <s-table>
            <s-table-header-row>
              <s-table-header>Product</s-table-header>
              <s-table-header>On registries</s-table-header>
              <s-table-header>Bought</s-table-header>
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
        <s-section slot="aside" heading="What you're competing with">
          <s-paragraph>
            <s-text color="subdued">
              Where your customers are adding items from. Products you stock that show up here are
              worth merchandising.
            </s-text>
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

      <s-section slot="aside" heading="This year">
        <s-paragraph>
          {stats.registries.createdThisPeriod} registries created, across {stats.orders} orders.
        </s-paragraph>
        <s-stack direction="inline" gap="base">
          <s-button href="/app/registries" variant="secondary">
            See all registries
          </s-button>
          <s-button href="/app/analytics" variant="secondary">
            {pro ? "See analytics" : "Analytics (Pro)"}
          </s-button>
        </s-stack>
      </s-section>
    </s-page>
  );
}

const ROLE_LABELS: Record<string, string> = {
  MAIN: "live",
  UNPUBLISHED: "not published",
  DEVELOPMENT: "development",
};

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
  const [searchParams, setSearchParams] = useSearchParams();

  const selected = themes?.find((t) => t.id === selectedThemeId) ?? null;
  const themeName = selected ? `“${selected.name}”` : "Your theme";

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
    <s-section heading="Add Giftpin to your theme">
      {themes && themes.length > 0 && (
        <s-select
          label="Theme"
          details="Pick the theme you want to set up. You can do this on an unpublished copy first."
          value={selectedThemeId ?? ""}
          onChange={(event) => {
            const next = new URLSearchParams(searchParams);
            next.set("theme", event.currentTarget.value);
            setSearchParams(next);
          }}
        >
          {themes.map((theme) => (
            <s-option key={theme.id} value={theme.id}>
              {`${theme.name} (${ROLE_LABELS[theme.role] ?? theme.role.toLowerCase()})`}
            </s-option>
          ))}
        </s-select>
      )}

      {vintage && (
        <s-banner tone="warning" heading={`${themeName} isn't supported`}>
          <s-paragraph>
            This is a vintage theme, and Giftpin&apos;s blocks only work in Online Store 2.0 themes (like
            Dawn, or any theme from the Shopify Theme Store). Your registry pages still work in this theme: to
            link to them, add a menu item pointing to /apps/registry in Online Store, Navigation.
          </s-paragraph>
        </s-banner>
      )}
      {themeSupport === "no-product-blocks" && (
        <s-banner tone="warning" heading={`${themeName} can't show the button on product pages`}>
          <s-paragraph>
            This theme&apos;s product page doesn&apos;t accept app blocks, so the Add to registry button
            can&apos;t go there. Registry links still work anywhere else. Ask the theme&apos;s developer about
            app block support, or use an Online Store 2.0 theme like Dawn.
          </s-paragraph>
        </s-banner>
      )}

      {!vintage && (
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Giftpin has four blocks. Each button opens the theme editor with the block already added: check where
            it landed, drag it where you want it, then press Save.
          </s-paragraph>

          <s-stack direction="block" gap="small-100">
            <s-heading>Add to registry button</s-heading>
            <s-paragraph>
              Goes on product pages only. Shoppers use it to add that product to their registry.
            </s-paragraph>
            {!productBlocked && (
              <s-stack direction="inline" gap="base">
                <s-button href={addProductButtonUrl} target="_blank">
                  Add button to product pages
                </s-button>
              </s-stack>
            )}
          </s-stack>

          <s-stack direction="block" gap="small-100">
            <s-heading>Registry links</s-heading>
            <s-paragraph>
              Create, Find and Manage registry links. Works on any page. The button adds it under your header, so
              it shows at the top of every page.
            </s-paragraph>
            <s-stack direction="inline" gap="base">
              <s-button href={addRegistryLinksUrl} target="_blank" variant={productBlocked ? "primary" : "secondary"}>
                Add registry links
              </s-button>
            </s-stack>
          </s-stack>

          <s-stack direction="block" gap="small-100">
            <s-heading>Save for later heart</s-heading>
            <s-paragraph>
              A heart on product pages. Shoppers keep products they like in their own browser, with no account.
            </s-paragraph>
            {!productBlocked && (
              <s-stack direction="inline" gap="base">
                <s-button href={addSaveButtonUrl} target="_blank" variant="secondary">
                  Add heart to product pages
                </s-button>
              </s-stack>
            )}
          </s-stack>

          <s-stack direction="block" gap="small-100">
            <s-heading>Saved items</s-heading>
            <s-paragraph>
              Shows what a shopper has hearted. The button adds it to the cart page; you can also add it to any
              other page by hand.
            </s-paragraph>
            <s-stack direction="inline" gap="base">
              <s-button href={addSavedItemsUrl} target="_blank" variant="secondary">
                Add saved items to the cart page
              </s-button>
            </s-stack>
          </s-stack>

          <s-stack direction="block" gap="small-100">
            <s-heading>In the theme editor</s-heading>
            <s-unordered-list>
              <s-list-item>
                Add by hand: open the page from the menu at the top, select Add block in a section (or Add section,
                then the Apps tab), and choose the Giftpin block.
              </s-list-item>
              <s-list-item>Move: drag the block by its handle in the left sidebar, then press Save.</s-list-item>
              <s-list-item>Change its settings: select the block in the sidebar. The settings open on the right.</s-list-item>
              <s-list-item>Remove: select the block, choose Remove block at the bottom of its settings, then press Save.</s-list-item>
            </s-unordered-list>
            <s-paragraph>
              <s-text color="subdued">
                Button settings: label, gift icon, colour, corner radius and spacing. Registry links settings: heading,
                link text, which links show, buttons or text links, size, alignment, layout, colours and spacing. If you
                uninstall Giftpin, Shopify removes both blocks from your themes automatically.
              </s-text>
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
