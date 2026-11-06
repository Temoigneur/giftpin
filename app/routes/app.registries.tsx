import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useSearchParams } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { isPro, requireShop } from "../models/shop.server";
import { exportUrl } from "../models/export.server";
import { listRegistries } from "../models/dashboard.server";
import { useAdminT } from "../lib/use-admin-t";

const PAGE_SIZE = 25;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await requireShop(session.shop);

  const page = Math.max(0, Number(new URL(request.url).searchParams.get("page") ?? 0));
  const { registries, total } = await listRegistries(shop.id, page, PAGE_SIZE);

  // Pro CSV links, minted fresh on every load (they expire after 15 minutes).
  const exports = isPro(shop)
    ? { registries: exportUrl(shop.id, "registries"), purchases: exportUrl(shop.id, "purchases") }
    : null;

  return { registries, total, page, shopDomain: session.shop, exports };
};

export default function Registries() {
  const { registries, total, page, shopDomain, exports } = useLoaderData<typeof loader>();
  const t = useAdminT();
  const [, setSearchParams] = useSearchParams();

  const lastPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  return (
    <s-page heading={t("admin.reg.page")}>
      <s-button slot="secondary-actions" href="/app/import">
        {t("admin.reg.import")}
      </s-button>
      <s-section>
        {registries.length === 0 ? (
          <s-paragraph>{t("admin.reg.none")}</s-paragraph>
        ) : (
          <s-table>
            <s-table-header-row>
              <s-table-header>{t("admin.reg.colRegistry")}</s-table-header>
              <s-table-header>{t("admin.reg.colOccasion")}</s-table-header>
              <s-table-header>{t("admin.reg.colDate")}</s-table-header>
              <s-table-header>{t("admin.reg.colItems")}</s-table-header>
              <s-table-header>{t("admin.reg.colProgress")}</s-table-header>
              <s-table-header></s-table-header>
            </s-table-header-row>
            <s-table-body>
              {registries.map((registry) => (
                <s-table-row key={registry.id}>
                  <s-table-cell>
                    <s-stack direction="block" gap="small-500">
                      <s-text>{registry.title}</s-text>
                      <s-text color="subdued">{registry.names}</s-text>
                    </s-stack>
                  </s-table-cell>
                  <s-table-cell>{t.event(registry.eventType)}</s-table-cell>
                  <s-table-cell>
                    {registry.eventDate
                      ? new Date(registry.eventDate).toLocaleDateString(t.locale === "en" ? "en-CA" : t.intl, { timeZone: "UTC" })
                      : "—"}
                  </s-table-cell>
                  <s-table-cell>
                    {/*
                      Showing the split per registry, not just in aggregate, is
                      what lets a merchant spot "this couple wants six things I
                      don't stock" and do something about it.
                    */}
                    {t("admin.reg.yours", { n: registry.internalCount })}
                    {registry.itemCount > registry.internalCount
                      ? ` · ${t("admin.reg.elsewhere", { n: registry.itemCount - registry.internalCount })}`
                      : ""}
                  </s-table-cell>
                  <s-table-cell>
                    {registry.bought}/{registry.wanted} ({registry.percentComplete}%)
                  </s-table-cell>
                  <s-table-cell>
                    <s-link
                      href={`https://${shopDomain}/apps/registry/r/${registry.slug}`}
                      target="_blank"
                    >
                      {t("admin.reg.view")}
                    </s-link>
                  </s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        )}
      </s-section>

      {lastPage > 0 && (
        <s-section>
          <s-stack direction="inline" gap="base">
            <s-button
              variant="secondary"
              {...(page === 0 ? { disabled: true } : {})}
              onClick={() => setSearchParams({ page: String(page - 1) })}
            >
              {t("admin.reg.prev")}
            </s-button>
            <s-text>{t("admin.reg.pageOf", { page: page + 1, total: lastPage + 1 })}</s-text>
            <s-button
              variant="secondary"
              {...(page >= lastPage ? { disabled: true } : {})}
              onClick={() => setSearchParams({ page: String(page + 1) })}
            >
              {t("admin.reg.next")}
            </s-button>
          </s-stack>
        </s-section>
      )}

      <s-section heading={t("admin.reg.export")}>
        {exports ? (
          <s-stack direction="block" gap="base">
            <s-paragraph>
              <s-text color="subdued">{t("admin.reg.exportText")}</s-text>
            </s-paragraph>
            <s-stack direction="inline" gap="base">
              <s-button href={exports.registries} target="_blank" variant="secondary" icon="download">
                {t("admin.reg.csvRegs")}
              </s-button>
              <s-button href={exports.purchases} target="_blank" variant="secondary" icon="download">
                {t("admin.reg.csvPurch")}
              </s-button>
            </s-stack>
          </s-stack>
        ) : (
          <s-stack direction="block" gap="base">
            <s-paragraph>{t("admin.reg.exportFree")}</s-paragraph>
            <s-button href="/app/billing">{t("admin.set.seePro")}</s-button>
          </s-stack>
        )}
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
