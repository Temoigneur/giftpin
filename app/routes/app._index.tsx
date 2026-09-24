import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { isPro, requireShop, settingsFor } from "../models/shop.server";
import { dashboardStats } from "../models/dashboard.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await requireShop(session.shop);
  const stats = await dashboardStats(shop.id);

  return {
    stats,
    settings: settingsFor(shop),
    pro: isPro(shop),
    shopDomain: session.shop,
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
  const { stats, hasData, shopDomain, apiKey, cacheBust, settings, pro } = useLoaderData<typeof loader>();

  // Theme-editor deep links that open the right page with our block already
  // added, so the merchant only has to press Save. (Plain /editor opens the
  // home page and adds nothing.)
  const editor = `https://${shopDomain}/admin/themes/current/editor`;
  const addProductButtonUrl = `${editor}?template=product&addAppBlockId=${apiKey}/add-to-registry&target=mainSection`;
  // Registry links go in the header section group, so they show near the top
  // of every page. A new Apps section (newAppsSection) lands at the bottom of
  // the home page, where shoppers miss it.
  const addRegistryLinksUrl = `${editor}?template=index&addAppBlockId=${apiKey}/registry-links&target=sectionGroup:header`;

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
      <s-paragraph>
        <s-text color="subdued">
          To put registries in front of shoppers, add these two things to your theme. Each button opens the theme
          editor with the block already added: check where it landed, drag it where you want it, then press Save.
        </s-text>
      </s-paragraph>
      <s-stack direction="inline" gap="base">
        <s-button href={addProductButtonUrl} target="_blank" variant="secondary">
          Show the registry button on product pages
        </s-button>
        <s-button href={addRegistryLinksUrl} target="_blank" variant="secondary">
          Add registry links to your store
        </s-button>
      </s-stack>
    </s-section>
  );

  if (!hasData) {
    return (
      <s-page heading="Gift registry">
        {registryLinks}
        <s-section heading="You're three minutes from your first registry">
          <s-paragraph>
            Two things to do, then customers can start building registries from your products.
          </s-paragraph>
          <s-ordered-list>
            <s-list-item>
              Add the <s-text>Add to registry</s-text> button to your product pages (the button below opens
              your product template with it already added: press Save).
            </s-list-item>
            <s-list-item>
              Add the <s-text>Registry links</s-text> block (the second button below adds it under your
              header, so it shows at the top of every page; drag it elsewhere if you prefer), so customers
              can start a registry.
            </s-list-item>
          </s-ordered-list>
          <s-stack direction="inline" gap="base">
            <s-button href={addProductButtonUrl} target="_blank">
              Add button to product pages
            </s-button>
            <s-button href={addRegistryLinksUrl} target="_blank" variant="secondary">
              Add registry links
            </s-button>
            <s-button href="/app/settings" variant="secondary">
              Settings
            </s-button>
          </s-stack>
        </s-section>

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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <s-stack direction="block" gap="small-100">
      <s-text color="subdued">{label}</s-text>
      <s-heading>{value}</s-heading>
    </s-stack>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
