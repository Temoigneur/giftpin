import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Form, useFetcher, useLoaderData, useNavigation } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { isPro, requireShop } from "../models/shop.server";
import {
  createRegistryInStore,
  registryForStaff,
  searchRegistriesForStaff,
} from "../models/instore.server";
import { EVENT_TYPES } from "../shared/settings";
import { t as translate } from "../shared/i18n";
import { adminLocale } from "../lib/admin-locale.server";
import { useAdminT } from "../lib/use-admin-t";

/**
 * In-store registry mode (Pro). The admin half: staff at a desk or on the
 * shop's laptop look up a customer's registry or start one for them. The POS
 * half is extensions/pos-registry, served by app/routes/api.pos.tsx.
 */

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await requireShop(session.shop);
  if (!isPro(shop)) return { locked: true as const };

  const params = new URL(request.url).searchParams;
  const q = params.get("q") ?? "";
  const id = params.get("id");

  const [results, registry] = await Promise.all([
    searchRegistriesForStaff(shop.id, q),
    id ? registryForStaff(shop.id, id) : Promise.resolve(null),
  ]);

  return { locked: false as const, q, results, registry };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await requireShop(session.shop);
  if (!isPro(shop)) return { ok: false as const, error: translate("admin.ins.errPro", undefined, adminLocale(request)) };

  const form = await request.formData();
  return createRegistryInStore(shop, Object.fromEntries(form), "admin");
};

function money(amount: number, currency: string | null, intl: string): string {
  if (!currency) return amount.toFixed(2);
  return new Intl.NumberFormat(intl === "en" ? "en-CA" : intl, { style: "currency", currency }).format(amount);
}

export default function InStore() {
  const data = useLoaderData<typeof loader>();
  const t = useAdminT();
  const create = useFetcher<typeof action>();
  const navigation = useNavigation();

  if (data.locked) {
    return (
      <s-page heading={t("admin.ins.page")}>
        <s-section heading={t("admin.ins.lockedHead")}>
          <s-paragraph>{t("admin.ins.lockedText")}</s-paragraph>
          <s-button href="/app/billing">{t("admin.set.seePro")}</s-button>
        </s-section>
      </s-page>
    );
  }

  const { q, results, registry } = data;
  const searching = navigation.state === "loading";
  const created = create.data;

  return (
    <s-page heading={t("admin.ins.page")}>
      <s-section heading={t("admin.ins.find")}>
        <Form method="get">
          <s-stack direction="inline" gap="base" alignItems="end">
            <s-search-field
              name="q"
              label={t("admin.ins.searchLabel")}
              labelAccessibilityVisibility="exclusive"
              placeholder={t("admin.ins.searchLabel")}
              value={q}
            />
            <s-button type="submit" {...(searching ? { loading: true } : {})}>
              {t("admin.ins.search")}
            </s-button>
          </s-stack>
        </Form>

        {q && results.length === 0 && (
          <s-paragraph>
            <s-text color="subdued">{t("admin.ins.noMatch", { q })}</s-text>
          </s-paragraph>
        )}

        {results.length > 0 && (
          <s-table>
            <s-table-header-row>
              <s-table-header>{t("admin.reg.colRegistry")}</s-table-header>
              <s-table-header>{t("admin.reg.colOccasion")}</s-table-header>
              <s-table-header>{t("admin.reg.colDate")}</s-table-header>
              <s-table-header>{t("admin.ins.colStill")}</s-table-header>
              <s-table-header></s-table-header>
            </s-table-header-row>
            <s-table-body>
              {results.map((r) => (
                <s-table-row key={r.id}>
                  <s-table-cell>
                    <s-stack direction="block" gap="small-500">
                      <s-text>{r.title}</s-text>
                      <s-text color="subdued">{r.names}</s-text>
                    </s-stack>
                  </s-table-cell>
                  <s-table-cell>{t.event(r.eventType)}</s-table-cell>
                  <s-table-cell>{r.eventDate ?? "—"}</s-table-cell>
                  <s-table-cell>
                    {t.n("admin.imp.item", r.itemsLeft)}
                  </s-table-cell>
                  <s-table-cell>
                    <s-link href={`/app/in-store?${new URLSearchParams({ q, id: r.id })}`}>{t("admin.ins.open")}</s-link>
                  </s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        )}
      </s-section>

      {registry && (
        <s-section heading={registry.title}>
          <s-paragraph>
            {registry.names} &middot; {t.event(registry.eventType)}
            {registry.eventDate ? ` · ${registry.eventDate}` : ""}
          </s-paragraph>
          <s-paragraph>
            <s-link href={registry.publicUrl} target="_blank">
              {t("admin.ins.guestPage")}
            </s-link>
          </s-paragraph>

          {registry.items.length === 0 ? (
            <s-paragraph>{t("admin.ins.nothing")}</s-paragraph>
          ) : (
            <s-table>
              <s-table-header-row>
                <s-table-header>{t("admin.ins.colItem")}</s-table-header>
                <s-table-header>{t("admin.ins.colPrice")}</s-table-header>
                <s-table-header>{t("admin.ins.colStill")}</s-table-header>
                <s-table-header>{t("admin.ins.colWhere")}</s-table-header>
              </s-table-header-row>
              <s-table-body>
                {registry.items.map((item) => (
                  <s-table-row key={item.id}>
                    <s-table-cell>{item.title}</s-table-cell>
                    <s-table-cell>{money(item.price, item.currency, t.intl)}</s-table-cell>
                    <s-table-cell>
                      {item.remainingQty > 0 ? (
                        t("admin.ins.remaining", { n: item.remainingQty, total: item.desiredQty })
                      ) : item.claimedQty > 0 ? (
                        <s-badge tone="warning">{t("admin.ins.mayBuy")}</s-badge>
                      ) : (
                        <s-badge tone="success">{t("admin.ins.bought")}</s-badge>
                      )}
                    </s-table-cell>
                    <s-table-cell>
                      {item.externalDomain ? item.externalDomain : t("admin.ins.yourStore")}
                    </s-table-cell>
                  </s-table-row>
                ))}
              </s-table-body>
            </s-table>
          )}
          <s-paragraph>
            <s-text color="subdued">{t("admin.ins.posHint")}</s-text>
          </s-paragraph>
        </s-section>
      )}

      <s-section heading={t("admin.ins.start")}>
        <s-paragraph>
          <s-text color="subdued">{t("admin.ins.startText")}</s-text>
        </s-paragraph>
        <create.Form method="post">
          <s-stack direction="block" gap="base">
            <s-text-field name="registrantName" label={t("admin.ins.custName")} required />
            <s-email-field name="registrantEmail" label={t("admin.ins.custEmail")} required />
            <s-text-field name="title" label={t("admin.ins.regName")} placeholder={t("admin.ins.regNamePh")} required />
            <s-select name="eventType" label={t("admin.reg.colOccasion")}>
              {EVENT_TYPES.map((type) => (
                <s-option key={type.value} value={type.value}>
                  {t.event(type.value)}
                </s-option>
              ))}
            </s-select>
            <s-date-field name="eventDate" label={t("admin.ins.eventDate")} />
            <s-button type="submit" variant="primary" {...(create.state !== "idle" ? { loading: true } : {})}>
              {t("admin.ins.create")}
            </s-button>
            {created && !created.ok && <s-banner tone="critical">{created.error}</s-banner>}
            {created?.ok && (
              <s-banner tone="success" heading={t("admin.ins.ready", { title: created.title })}>
                <s-paragraph>
                  {t("admin.ins.linkOnWay")}{" "}
                  <s-link href={created.publicUrl} target="_blank">
                    {t("admin.ins.guestPage")}
                  </s-link>
                </s-paragraph>
              </s-banner>
            )}
          </s-stack>
        </create.Form>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
