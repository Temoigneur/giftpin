import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useSearchParams } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { isPro, requireShop } from "../models/shop.server";
import {
  analyticsReport,
  monthlySales,
  parseRange,
  type AnalyticsBucket,
  type Granularity,
  type MonthlySales,
} from "../models/analytics.server";
import { exportUrl } from "../models/export.server";
import { giftCardSalesSummary } from "../models/gift-card-sale.server";
import { eventTypeLabel } from "../shared/settings";
import { GIFT_CARD_FEE_HOLD_DAYS, GIFT_CARD_FEE_PERCENT } from "../shared/plans";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await requireShop(session.shop);

  // Pro only. Free shops get the pitch and no queries.
  if (!isPro(shop)) return { locked: true as const };

  const range = parseRange(new URL(request.url).searchParams.get("range"));
  const giftCardsSince = new Date(Date.now() - range * 86_400_000);
  const [report, sales, giftCards] = await Promise.all([
    analyticsReport(shop.id, range),
    monthlySales(shop.id),
    giftCardSalesSummary(shop.id, giftCardsSince, shop.currency),
  ]);
  return { locked: false as const, report, sales, giftCards, salesCsvUrl: exportUrl(shop.id, "sales") };
};

const RANGE_LABELS: Record<number, string> = { 30: "Last 30 days", 90: "Last 90 days", 365: "Last 12 months" };

function money(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function money2(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);
}

function change(current: number, previous: number): string {
  if (previous === 0) return current === 0 ? "No change" : "New this period";
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return "No change";
  return `${pct > 0 ? "+" : ""}${pct}% vs previous period`;
}

function bucketLabel(iso: string, granularity: Granularity): string {
  const d = new Date(iso);
  if (granularity === "month") return d.toLocaleDateString("en-CA", { month: "short", year: "2-digit", timeZone: "UTC" });
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: "UTC" });
}

export default function Analytics() {
  const data = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  if (data.locked) {
    return (
      <s-page heading="Analytics">
        <s-section heading="Analytics is part of Pro">
          <s-paragraph>
            See how your registries are growing: registries created, items added, and gifts bought, week by
            week, with how much of it came through your store.
          </s-paragraph>
          <s-button href="/app/billing">See Pro</s-button>
        </s-section>
      </s-page>
    );
  }

  const { report, sales, giftCards, salesCsvUrl } = data;
  const { totals, previous } = report;
  const internalShare = totals.itemsAdded > 0 ? Math.round((totals.itemsAddedInternal / totals.itemsAdded) * 100) : 0;
  const range = String(report.range);

  return (
    <s-page heading="Analytics">
      <s-section>
        <s-stack direction="inline" gap="base">
          {Object.entries(RANGE_LABELS).map(([value, label]) => (
            <s-button
              key={value}
              variant={value === range ? "primary" : "secondary"}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("range", value);
                setSearchParams(next);
              }}
            >
              {label}
            </s-button>
          ))}
        </s-stack>
      </s-section>

      <s-section heading={RANGE_LABELS[report.range]}>
        <s-stack direction="inline" gap="large">
          <Stat label="Registries created" value={String(totals.registriesCreated)} note={change(totals.registriesCreated, previous.registriesCreated)} />
          <Stat label="Items added" value={String(totals.itemsAdded)} note={change(totals.itemsAdded, previous.itemsAdded)} />
          <Stat label="Gifts credited" value={String(totals.giftsCredited)} note={change(totals.giftsCredited, previous.giftsCredited)} />
          <Stat label="Registry revenue" value={money(totals.revenue, report.currency)} note={change(totals.revenue, previous.revenue)} />
          <Stat label="New customers" value={String(totals.newCustomers)} note={change(totals.newCustomers, previous.newCustomers)} />
        </s-stack>
      </s-section>

      <SalesReport sales={sales} currency={report.currency} csvUrl={salesCsvUrl} />

      <s-section heading="Registries created">
        <BarChart series={report.series} metric="registries" granularity={report.granularity} />
      </s-section>

      <s-section heading="Items added">
        <s-stack direction="block" gap="base">
          <BarChart series={report.series} metric="items" granularity={report.granularity} />
          {totals.itemsAdded > 0 && (
            <s-paragraph>
              <s-text color="subdued">
                {internalShare}% of items added were your products ({totals.itemsAddedInternal} of {totals.itemsAdded}).
              </s-text>
            </s-paragraph>
          )}
        </s-stack>
      </s-section>

      <s-section heading="Gifts credited">
        <BarChart series={report.series} metric="gifts" granularity={report.granularity} />
      </s-section>

      <s-section slot="aside" heading="Where gifts were bought">
        <s-unordered-list>
          <s-list-item>Your store: {report.giftsBySource.store}</s-list-item>
          <s-list-item>Other stores (guest confirmed): {report.giftsBySource.elsewhere}</s-list-item>
          <s-list-item>Marked by the registrant: {report.giftsBySource.markedByRegistrant}</s-list-item>
        </s-unordered-list>
        <s-paragraph>
          <s-text color="subdued">Refunded and cancelled purchases are not counted.</s-text>
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading="Gift cards sold through giftpin.app">
        <s-paragraph>
          {giftCards.count} {giftCards.count === 1 ? "gift card" : "gift cards"}, {money2(giftCards.total, giftCards.currency)}
        </s-paragraph>
        <s-paragraph>
          <s-text color="subdued">
            From your listing at giftpin.app/gift-cards and the gift card link on your registry pages. Turn it on in
            Settings. Refunded cards are not counted.
          </s-text>
        </s-paragraph>
        <s-paragraph>
          <s-text color="subdued">
            Giftpin fee charged: {money2(giftCards.feesCharged, "USD")} ({GIFT_CARD_FEE_PERCENT}% of each card, billed by Shopify
            {" "}after a {GIFT_CARD_FEE_HOLD_DAYS}-day refund window, and never during your free trial).
          </s-text>
        </s-paragraph>
      </s-section>

      {report.registriesByEventType.length > 0 && (
        <s-section slot="aside" heading="Registries by occasion">
          <s-unordered-list>
            {report.registriesByEventType.map((entry) => (
              <s-list-item key={entry.eventType}>
                {eventTypeLabel(entry.eventType)}: {entry.count}
              </s-list-item>
            ))}
          </s-unordered-list>
        </s-section>
      )}

      <s-section slot="aside">
        <s-paragraph>
          <s-text color="subdued">Days are counted in UTC.</s-text>
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

/**
 * Registry-driven sales, calendar month by calendar month, always the last 12
 * months whatever range is picked above: it's the report a merchant takes to
 * their accountant or compares with Shopify's own, so it shouldn't move when
 * the chart range does.
 */
function SalesReport({ sales, currency, csvUrl }: { sales: MonthlySales[]; currency: string; csvUrl: string }) {
  const rows = [...sales].reverse();
  const total = sales.reduce(
    (t, m) => ({ revenue: t.revenue + m.revenue, orders: t.orders + m.orders, newCustomers: t.newCustomers + m.newCustomers }),
    { revenue: 0, orders: 0, newCustomers: 0 },
  );
  const cents = (n: number) =>
    new Intl.NumberFormat("en-CA", { style: "currency", currency, minimumFractionDigits: 2 }).format(n);

  return (
    <s-section heading="Registry sales by month">
      <s-stack direction="block" gap="base">
        <s-paragraph>
          <s-text color="subdued">
            Orders in your store that included a registry gift. Revenue is the registry gifts at the
            price on the order, before order discounts, so the average is registry spend per order.
            Refunded and cancelled gifts are left out.
          </s-text>
        </s-paragraph>
        <s-table>
          <s-table-header-row>
            <s-table-header>Month</s-table-header>
            <s-table-header format="currency">Revenue</s-table-header>
            <s-table-header format="numeric">Orders</s-table-header>
            <s-table-header format="numeric">New customers</s-table-header>
            <s-table-header format="currency">Average order</s-table-header>
          </s-table-header-row>
          <s-table-body>
            {rows.map((m) => (
              <s-table-row key={m.month}>
                <s-table-cell>
                  {new Date(m.month).toLocaleDateString("en-CA", { month: "long", year: "numeric", timeZone: "UTC" })}
                </s-table-cell>
                <s-table-cell>{cents(m.revenue)}</s-table-cell>
                <s-table-cell>{m.orders}</s-table-cell>
                <s-table-cell>{m.newCustomers}</s-table-cell>
                <s-table-cell>{m.orders > 0 ? cents(m.averageOrder) : "—"}</s-table-cell>
              </s-table-row>
            ))}
            <s-table-row>
              <s-table-cell>
                <s-text type="strong">12 months</s-text>
              </s-table-cell>
              <s-table-cell>
                <s-text type="strong">{cents(total.revenue)}</s-text>
              </s-table-cell>
              <s-table-cell>
                <s-text type="strong">{total.orders}</s-text>
              </s-table-cell>
              <s-table-cell>
                <s-text type="strong">{total.newCustomers}</s-text>
              </s-table-cell>
              <s-table-cell>
                <s-text type="strong">{total.orders > 0 ? cents(total.revenue / total.orders) : "—"}</s-text>
              </s-table-cell>
            </s-table-row>
          </s-table-body>
        </s-table>
        <s-stack direction="inline" gap="base">
          <s-button href={csvUrl} target="_blank" variant="secondary" icon="download">
            Download CSV
          </s-button>
        </s-stack>
      </s-stack>
    </s-section>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <s-stack direction="block" gap="small-100">
      <s-text color="subdued">{label}</s-text>
      <s-heading>{value}</s-heading>
      <s-text color="subdued">{note}</s-text>
    </s-stack>
  );
}

/**
 * Plain SVG bars: Polaris web components have no chart, and one series per
 * chart doesn't justify a charting library. Every bar has a <title> so the
 * exact count is a hover away, and the whole chart has a text summary for
 * screen readers.
 */
function BarChart({
  series,
  metric,
  granularity,
}: {
  series: AnalyticsBucket[];
  metric: "registries" | "items" | "gifts";
  granularity: Granularity;
}) {
  const values = series.map((b) => b[metric]);
  const max = Math.max(1, ...values);
  const total = values.reduce((a, b) => a + b, 0);

  const width = 600;
  const height = 140;
  const labelHeight = 18;
  const plot = height - labelHeight;
  const slot = width / series.length;
  const barWidth = Math.max(2, slot * 0.7);
  // Label every bucket for 12/13 bars; thin out for 30 daily bars.
  const labelEvery = series.length > 15 ? 5 : 1;

  if (total === 0) {
    return (
      <s-paragraph>
        <s-text color="subdued">None in this period yet.</s-text>
      </s-paragraph>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label={`${total} ${metric} in this period, at most ${max} in a single ${granularity}.`}
      style={{ display: "block", maxWidth: "100%" }}
    >
      <line x1={0} x2={width} y1={plot} y2={plot} stroke="#d4d4d4" strokeWidth={1} />
      {series.map((bucket, i) => {
        const value = bucket[metric];
        const h = (value / max) * (plot - 4);
        const x = i * slot + (slot - barWidth) / 2;
        const label = bucketLabel(bucket.start, granularity);
        return (
          <g key={bucket.start}>
            <rect x={x} y={plot - h} width={barWidth} height={h} rx={2} fill="#2c6ecb">
              <title>{`${label}: ${value}`}</title>
            </rect>
            {i % labelEvery === 0 && (
              <text x={i * slot + slot / 2} y={height - 4} textAnchor="middle" fontSize={10} fill="#616161">
                {label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
