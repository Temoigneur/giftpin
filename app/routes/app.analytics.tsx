import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useSearchParams } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { isPro, requireShop } from "../models/shop.server";
import { groupPerformance } from "../models/group-analytics.server";
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
import { GIFT_CARD_FEE_HOLD_DAYS, GIFT_CARD_FEE_PERCENT } from "../shared/plans";
import { useAdminT, type AdminT } from "../lib/use-admin-t";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await requireShop(session.shop);

  // Pro only. Free shops get the pitch and no queries.
  if (!isPro(shop)) return { locked: true as const };

  const range = parseRange(new URL(request.url).searchParams.get("range"));
  const giftCardsSince = new Date(Date.now() - range * 86_400_000);
  const [report, sales, giftCards, group] = await Promise.all([
    analyticsReport(shop.id, range),
    monthlySales(shop.id),
    giftCardSalesSummary(shop.id, giftCardsSince, shop.currency),
    // Linked stores: every store's registry sales and engagement (null when not linked).
    groupPerformance(shop.id, range).catch((err) => {
      console.error("[analytics] linked stores:", (err as Error).message);
      return null;
    }),
  ]);
  return { locked: false as const, report, sales, giftCards, group, salesCsvUrl: exportUrl(shop.id, "sales") };
};

const RANGE_KEYS: Record<number, "admin.an.range30" | "admin.an.range90" | "admin.ov.last12"> = {
  30: "admin.an.range30",
  90: "admin.an.range90",
  365: "admin.ov.last12",
};

/** English keeps the Canadian number and date style the admin always used. */
const numberLocale = (t: AdminT) => (t.locale === "en" ? "en-CA" : t.intl);

function money(t: AdminT, amount: number, currency: string): string {
  return new Intl.NumberFormat(numberLocale(t), { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function money2(t: AdminT, amount: number, currency: string): string {
  return new Intl.NumberFormat(numberLocale(t), { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);
}

function change(t: AdminT, current: number, previous: number): string {
  if (previous === 0) return current === 0 ? t("admin.an.changeNone") : t("admin.an.changeNew");
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return t("admin.an.changeNone");
  return t("admin.an.changePct", { pct: `${pct > 0 ? "+" : ""}${pct}` });
}

function bucketLabel(t: AdminT, iso: string, granularity: Granularity): string {
  const d = new Date(iso);
  if (granularity === "month") return d.toLocaleDateString(numberLocale(t), { month: "short", year: "2-digit", timeZone: "UTC" });
  return d.toLocaleDateString(numberLocale(t), { month: "short", day: "numeric", timeZone: "UTC" });
}

export default function Analytics() {
  const data = useLoaderData<typeof loader>();
  const t = useAdminT();
  const [searchParams, setSearchParams] = useSearchParams();

  if (data.locked) {
    return (
      <s-page heading={t("admin.an.page")}>
        <s-section heading={t("admin.an.lockedHead")}>
          <s-paragraph>{t("admin.an.lockedText")}</s-paragraph>
          <s-button href="/app/billing">{t("admin.set.seePro")}</s-button>
        </s-section>
      </s-page>
    );
  }

  const { report, sales, giftCards, group, salesCsvUrl } = data;
  const { totals, previous } = report;
  const internalShare = totals.itemsAdded > 0 ? Math.round((totals.itemsAddedInternal / totals.itemsAdded) * 100) : 0;
  const range = String(report.range);

  return (
    <s-page heading={t("admin.an.page")}>
      <s-section>
        <s-stack direction="inline" gap="base">
          {Object.entries(RANGE_KEYS).map(([value, key]) => (
            <s-button
              key={value}
              variant={value === range ? "primary" : "secondary"}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("range", value);
                setSearchParams(next);
              }}
            >
              {t(key)}
            </s-button>
          ))}
        </s-stack>
      </s-section>

      <s-section heading={t(RANGE_KEYS[report.range])}>
        <s-stack direction="inline" gap="large">
          <Stat label={t("admin.an.registriesCreated")} value={String(totals.registriesCreated)} note={change(t, totals.registriesCreated, previous.registriesCreated)} />
          <Stat label={t("admin.an.itemsAdded")} value={String(totals.itemsAdded)} note={change(t, totals.itemsAdded, previous.itemsAdded)} />
          <Stat label={t("admin.an.giftsCredited")} value={String(totals.giftsCredited)} note={change(t, totals.giftsCredited, previous.giftsCredited)} />
          <Stat label={t("admin.ov.revenue")} value={money(t, totals.revenue, report.currency)} note={change(t, totals.revenue, previous.revenue)} />
          <Stat label={t("admin.ov.newCustomers")} value={String(totals.newCustomers)} note={change(t, totals.newCustomers, previous.newCustomers)} />
        </s-stack>
      </s-section>

      {group && <GroupSection t={t} group={group} />}

      <SalesReport t={t} sales={sales} currency={report.currency} csvUrl={salesCsvUrl} />

      <s-section heading={t("admin.an.registriesCreated")}>
        <BarChart t={t} series={report.series} metric="registries" granularity={report.granularity} />
      </s-section>

      <s-section heading={t("admin.an.itemsAdded")}>
        <s-stack direction="block" gap="base">
          <BarChart t={t} series={report.series} metric="items" granularity={report.granularity} />
          {totals.itemsAdded > 0 && (
            <s-paragraph>
              <s-text color="subdued">
                {t("admin.an.internalShare", { pct: internalShare, internal: totals.itemsAddedInternal, total: totals.itemsAdded })}
              </s-text>
            </s-paragraph>
          )}
        </s-stack>
      </s-section>

      <s-section heading={t("admin.an.giftsCredited")}>
        <BarChart t={t} series={report.series} metric="gifts" granularity={report.granularity} />
      </s-section>

      <s-section slot="aside" heading={t("admin.an.whereHead")}>
        <s-unordered-list>
          <s-list-item>{t("admin.an.srcStore", { n: report.giftsBySource.store })}</s-list-item>
          <s-list-item>{t("admin.an.srcElsewhere", { n: report.giftsBySource.elsewhere })}</s-list-item>
          <s-list-item>{t("admin.an.srcMarked", { n: report.giftsBySource.markedByRegistrant })}</s-list-item>
        </s-unordered-list>
        <s-paragraph>
          <s-text color="subdued">{t("admin.an.notCounted")}</s-text>
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading={t("admin.an.gcHead")}>
        <s-paragraph>
          {t("admin.an.gcLine", { count: t.n("admin.an.gc", giftCards.count), total: money2(t, giftCards.total, giftCards.currency) })}
        </s-paragraph>
        <s-paragraph>
          <s-text color="subdued">{t("admin.an.gcFrom")}</s-text>
        </s-paragraph>
        <s-paragraph>
          <s-text color="subdued">
            {t("admin.an.gcFee", {
              fee: money2(t, giftCards.feesCharged, "USD"),
              pct: GIFT_CARD_FEE_PERCENT,
              days: GIFT_CARD_FEE_HOLD_DAYS,
            })}
          </s-text>
        </s-paragraph>
      </s-section>

      {report.registriesByEventType.length > 0 && (
        <s-section slot="aside" heading={t("admin.an.byOccasion")}>
          <s-unordered-list>
            {report.registriesByEventType.map((entry) => (
              <s-list-item key={entry.eventType}>
                {t.event(entry.eventType)}: {entry.count}
              </s-list-item>
            ))}
          </s-unordered-list>
        </s-section>
      )}

      <s-section slot="aside">
        <s-paragraph>
          <s-text color="subdued">{t("admin.an.utc")}</s-text>
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
function SalesReport({ t, sales, currency, csvUrl }: { t: AdminT; sales: MonthlySales[]; currency: string; csvUrl: string }) {
  const rows = [...sales].reverse();
  const total = sales.reduce(
    (t, m) => ({ revenue: t.revenue + m.revenue, orders: t.orders + m.orders, newCustomers: t.newCustomers + m.newCustomers }),
    { revenue: 0, orders: 0, newCustomers: 0 },
  );
  const cents = (n: number) => money2(t, n, currency);

  return (
    <s-section heading={t("admin.an.salesHead")}>
      <s-stack direction="block" gap="base">
        <s-paragraph>
          <s-text color="subdued">{t("admin.an.salesText")}</s-text>
        </s-paragraph>
        <s-table>
          <s-table-header-row>
            <s-table-header>{t("admin.an.colMonth")}</s-table-header>
            <s-table-header format="currency">{t("admin.an.colRevenue")}</s-table-header>
            <s-table-header format="numeric">{t("admin.an.colOrders")}</s-table-header>
            <s-table-header format="numeric">{t("admin.an.colNewCust")}</s-table-header>
            <s-table-header format="currency">{t("admin.an.colAvg")}</s-table-header>
          </s-table-header-row>
          <s-table-body>
            {rows.map((m) => (
              <s-table-row key={m.month}>
                <s-table-cell>
                  {new Date(m.month).toLocaleDateString(numberLocale(t), { month: "long", year: "numeric", timeZone: "UTC" })}
                </s-table-cell>
                <s-table-cell>{cents(m.revenue)}</s-table-cell>
                <s-table-cell>{m.orders}</s-table-cell>
                <s-table-cell>{m.newCustomers}</s-table-cell>
                <s-table-cell>{m.orders > 0 ? cents(m.averageOrder) : "—"}</s-table-cell>
              </s-table-row>
            ))}
            <s-table-row>
              <s-table-cell>
                <s-text type="strong">{t("admin.an.total12")}</s-text>
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
            {t("admin.an.csv")}
          </s-button>
        </s-stack>
      </s-stack>
    </s-section>
  );
}

type GroupData = NonNullable<Extract<ReturnType<typeof useLoaderData<typeof loader>>, { locked: false }>["group"]>;

/** Every linked store side by side. Money stays in each store's own currency, never converted. */
function GroupSection({ t, group }: { t: AdminT; group: GroupData }) {
  const sales = group.salesByCurrency.map((c) => money(t, c.amount, c.currency)).join(" · ");
  const pct = (n: number) => new Intl.NumberFormat(numberLocale(t), { maximumFractionDigits: 1 }).format(n);
  const times = group.proPaidForItselfTimes;
  return (
    <s-section heading={t("admin.an.group.head")}>
      <s-stack direction="block" gap="base">
        <s-paragraph>
          <s-text color="subdued">{t("admin.an.group.sub", { n: group.sinceDays })}</s-text>
        </s-paragraph>
        <s-paragraph>
          <s-text type="strong">
            {t("admin.an.group.headline", { sales, gifts: group.totals.giftsSold, views: group.totals.registryViews })}
          </s-text>
        </s-paragraph>
        {times !== null && times >= 1 && (
          <s-banner tone="success">
            <s-paragraph>{t("admin.an.group.roi", { x: pct(times) })}</s-paragraph>
          </s-banner>
        )}
        <s-table>
          <s-table-header-row>
            <s-table-header>{t("admin.an.group.colStore")}</s-table-header>
            <s-table-header format="currency">{t("admin.an.group.colSales")}</s-table-header>
            <s-table-header format="numeric">{t("admin.an.group.colGifts")}</s-table-header>
            <s-table-header format="numeric">{t("admin.an.group.colShare")}</s-table-header>
            <s-table-header format="numeric">{t("admin.an.group.colViews")}</s-table-header>
            <s-table-header format="numeric">{t("admin.an.group.colCart")}</s-table-header>
            <s-table-header format="numeric">{t("admin.an.group.colClicks")}</s-table-header>
            <s-table-header format="numeric">{t("admin.an.group.colArrivals")}</s-table-header>
            <s-table-header format="numeric">{t("admin.an.group.colActive")}</s-table-header>
          </s-table-header-row>
          <s-table-body>
            {group.stores.map((s) => (
              <s-table-row key={s.shopId}>
                <s-table-cell>
                  {s.name}
                  {s.current ? ` (${t("admin.an.group.thisStore")})` : ""}
                </s-table-cell>
                <s-table-cell>{money2(t, s.registrySales, s.currency)}</s-table-cell>
                <s-table-cell>{s.giftsSold}</s-table-cell>
                <s-table-cell>{s.registrySharePercent === null ? "–" : `${pct(s.registrySharePercent)}%`}</s-table-cell>
                <s-table-cell>{s.registryViews}</s-table-cell>
                <s-table-cell>
                  {s.cartAdds}
                  {s.cartAddRate !== null ? ` (${pct(s.cartAddRate)}%)` : ""}
                </s-table-cell>
                <s-table-cell>{s.outsideClicks}</s-table-cell>
                <s-table-cell>{s.linkedArrivals}</s-table-cell>
                <s-table-cell>{s.activeRegistries}</s-table-cell>
              </s-table-row>
            ))}
          </s-table-body>
        </s-table>
        <s-paragraph>
          <s-text color="subdued">{t("admin.an.group.note")}</s-text>
        </s-paragraph>
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
  t,
  series,
  metric,
  granularity,
}: {
  t: AdminT;
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
        <s-text color="subdued">{t("admin.an.none")}</s-text>
      </s-paragraph>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label={t("admin.an.chartAria", {
        total,
        max,
        unit: t(granularity === "day" ? "admin.an.unitDay" : granularity === "week" ? "admin.an.unitWeek" : "admin.an.unitMonth"),
      })}
      style={{ display: "block", maxWidth: "100%" }}
    >
      <line x1={0} x2={width} y1={plot} y2={plot} stroke="#d4d4d4" strokeWidth={1} />
      {series.map((bucket, i) => {
        const value = bucket[metric];
        const h = (value / max) * (plot - 4);
        const x = i * slot + (slot - barWidth) / 2;
        const label = bucketLabel(t, bucket.start, granularity);
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
