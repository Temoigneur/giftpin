import { useState } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { isPro, requireShop, settingsFor, updateSettings } from "../models/shop.server";
import {
  changePromotion,
  createPromotion,
  listPromotions,
  type PromotionChange,
} from "../lib/promotions.server";
import { t as translate } from "../shared/i18n";
import { adminLocale } from "../lib/admin-locale.server";
import { useAdminT, type AdminT } from "../lib/use-admin-t";
import {
  MAX_PROMOTIONS,
  MAX_PROMOTION_COLLECTIONS,
  MAX_PROMOTION_PRODUCTS,
  PROMOTION_FIXED_MAX,
  PROMOTION_MESSAGE_MAX,
  PROMOTION_MIN_QUANTITY_MAX,
  PROMOTION_PERCENT_RANGE,
  PROMOTION_TITLE_MAX,
  parsePromotionForm,
  type PromotionConfig,
  type PromotionSummary,
} from "../shared/promotions";

/**
 * Registry promotions (Pro): sales and coupons that only apply to gifts
 * bought from a registry. See app/shared/promotions.ts.
 */

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = await requireShop(session.shop);
  const settings = settingsFor(shop);
  const graphql = (q: string, o?: { variables?: Record<string, unknown> }) => admin.graphql(q, o);

  let promotions: PromotionSummary[] = [];
  let loadError: string | null = null;
  try {
    const listed = await listPromotions(graphql, settings.promotionIds);
    promotions = listed.promotions;
    // Deleted from Shopify's own Discounts page: forget them here too.
    if (listed.missing.length > 0) {
      await updateSettings(session.shop, {
        promotionIds: settings.promotionIds.filter((id) => !listed.missing.includes(id)),
      });
    }
  } catch (err) {
    console.error("[promotions] list:", (err as Error).message);
    loadError = translate("admin.promo.loadErr", undefined, adminLocale(request));
  }

  return {
    pro: isPro(shop),
    currency: shop.currency,
    promotions,
    loadError,
    completionDiscount: {
      enabled: settings.completionDiscountEnabled,
      percent: settings.completionDiscountPercent,
      days: settings.completionDiscountValidDays,
    },
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = await requireShop(session.shop);
  const settings = settingsFor(shop);
  const graphql = (q: string, o?: { variables?: Record<string, unknown> }) => admin.graphql(q, o);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const locale = adminLocale(request);
  const say = (key: Parameters<typeof translate>[0], vars?: Record<string, string | number>) => translate(key, vars, locale);

  if (intent === "create") {
    if (!isPro(shop)) return { ok: false, error: say("admin.promo.errPro") };
    if (settings.promotionIds.length >= MAX_PROMOTIONS) {
      return { ok: false, error: say("admin.promo.errMax", { max: MAX_PROMOTIONS }) };
    }
    const parsed = parsePromotionForm(form);
    if (!parsed.ok) return { ok: false, error: parsed.error };
    const created = await createPromotion(graphql, parsed.draft);
    if (!created.ok) return { ok: false, error: say("admin.promo.errShopify", { reason: created.reason }) };
    await updateSettings(session.shop, { promotionIds: [...settings.promotionIds, created.id] });
    return { ok: true, created: true };
  }

  const change = intent as PromotionChange;
  if (change === "activate" || change === "deactivate" || change === "delete") {
    const id = String(form.get("id") ?? "");
    // Only ever touch discounts Giftpin made.
    if (!settings.promotionIds.includes(id)) return { ok: false, error: say("admin.promo.errNotFound") };
    if (change === "activate" && !isPro(shop)) {
      return { ok: false, error: say("admin.promo.errPro") };
    }
    const result = await changePromotion(graphql, id, change);
    if (!result.ok) return { ok: false, error: say("admin.promo.errShopify", { reason: result.reason }) };
    if (change === "delete") {
      await updateSettings(session.shop, { promotionIds: settings.promotionIds.filter((p) => p !== id) });
    }
    return { ok: true };
  }

  return { ok: false, error: say("admin.promo.errUnknown") };
};

const STATUS: Record<string, { key: "admin.promo.stActive" | "admin.promo.stScheduled" | "admin.promo.stEnded"; tone: "success" | "info" | "neutral" }> = {
  ACTIVE: { key: "admin.promo.stActive", tone: "success" },
  SCHEDULED: { key: "admin.promo.stScheduled", tone: "info" },
  EXPIRED: { key: "admin.promo.stEnded", tone: "neutral" },
};

const numberLocale = (t: AdminT) => (t.locale === "en" ? "en-CA" : t.intl);

function dateLabel(t: AdminT, iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat(numberLocale(t), { dateStyle: "medium", timeZone: "UTC" }).format(new Date(iso));
}

/** "15% off" / "$5.00 off each", in the merchant's language (shared describeValue is English only). */
function describeValueFor(t: AdminT, config: PromotionConfig, currency: string): string {
  if (config.valueType === "percentage") return t("admin.promo.valuePct", { n: config.amount });
  const amount = new Intl.NumberFormat(numberLocale(t), { style: "currency", currency }).format(config.amount);
  return t("admin.promo.valueFixed", { amount });
}

function describeScopeFor(t: AdminT, config: PromotionConfig): string {
  if (config.allProducts) return t("admin.promo.scopeAll");
  const parts: string[] = [];
  if (config.productIds.length) parts.push(t.n("admin.promo.scopeProducts", config.productIds.length));
  if (config.collectionIds.length) parts.push(t.n("admin.promo.scopeCollections", config.collectionIds.length));
  return parts.join(", ");
}

export default function Promotions() {
  const { pro, promotions, loadError, completionDiscount } = useLoaderData<typeof loader>();
  const t = useAdminT();

  return (
    <s-page heading={t("admin.promo.page")}>
      {!pro && (
        <s-banner tone="info" heading={t("admin.promo.lockedHead")}>
          <s-paragraph>{t("admin.promo.lockedText")}</s-paragraph>
          <s-button slot="secondary-actions" href="/app/billing">
            {t("admin.set.seePro")}
          </s-button>
        </s-banner>
      )}
      {loadError && (
        <s-banner tone="critical">
          <s-paragraph>{loadError}</s-paragraph>
        </s-banner>
      )}

      <PromotionList promotions={promotions} />
      <NewPromotion />

      <s-section slot="aside" heading={t("admin.promo.how")}>
        <s-paragraph>{t("admin.promo.how1")}</s-paragraph>
        <s-paragraph>{t("admin.promo.how2")}</s-paragraph>
        <s-paragraph>
          <s-text color="subdued">{t("admin.promo.how3")}</s-text>
        </s-paragraph>
        <s-paragraph>
          <s-text color="subdued">{t("admin.promo.how4")}</s-text>
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading={t("admin.promo.after")}>
        <s-paragraph>
          {completionDiscount.enabled
            ? t("admin.promo.afterOn", { pct: completionDiscount.percent, days: completionDiscount.days })
            : t("admin.promo.afterOff")}
        </s-paragraph>
        <s-button href="/app/settings" variant="secondary">
          {completionDiscount.enabled ? t("admin.promo.change") : t("admin.promo.turnOn")}
        </s-button>
      </s-section>
    </s-page>
  );
}

function PromotionList({ promotions }: { promotions: PromotionSummary[] }) {
  const { currency } = useLoaderData<typeof loader>();
  const t = useAdminT();
  const fetcher = useFetcher<typeof action>();
  const busyId = fetcher.state !== "idle" ? String(fetcher.formData?.get("id") ?? "") : "";

  const post = (intent: PromotionChange, id: string) => {
    if (intent === "delete" && !window.confirm(t("admin.promo.confirmDelete"))) return;
    fetcher.submit({ intent, id }, { method: "post" });
  };

  return (
    <s-section heading={t("admin.promo.mine")}>
      {fetcher.data && !fetcher.data.ok && "error" in fetcher.data && (
        <s-banner tone="critical">
          <s-paragraph>{fetcher.data.error}</s-paragraph>
        </s-banner>
      )}
      {promotions.length === 0 ? (
        <s-paragraph>
          <s-text color="subdued">{t("admin.promo.none")}</s-text>
        </s-paragraph>
      ) : (
        <s-table>
          <s-table-header-row>
            <s-table-header>{t("admin.promo.colPromotion")}</s-table-header>
            <s-table-header>{t("admin.promo.colDeal")}</s-table-header>
            <s-table-header>{t("admin.promo.colDates")}</s-table-header>
            <s-table-header>{t("admin.promo.colStatus")}</s-table-header>
            <s-table-header>{t("admin.promo.colUses")}</s-table-header>
            <s-table-header>{t("admin.promo.colActions")}</s-table-header>
          </s-table-header-row>
          <s-table-body>
            {promotions.map((promotion) => {
              const status = STATUS[promotion.status]
                ? { label: t(STATUS[promotion.status].key), tone: STATUS[promotion.status].tone }
                : { label: t("admin.promo.stPaused"), tone: "warning" as const };
              const busy = busyId === promotion.id;
              return (
                <s-table-row key={promotion.id}>
                  <s-table-cell>
                    <s-stack direction="block" gap="small-200">
                      <s-text>{promotion.title}</s-text>
                      <s-text color="subdued">
                        {promotion.kind === "coupon" ? t("admin.promo.couponCode", { code: promotion.code ?? "" }) : t("admin.promo.autoSale")}
                      </s-text>
                    </s-stack>
                  </s-table-cell>
                  <s-table-cell>
                    {promotion.config ? (
                      <s-stack direction="block" gap="small-200">
                        <s-text>{describeValueFor(t, promotion.config, currency)}</s-text>
                        <s-text color="subdued">
                          {describeScopeFor(t, promotion.config)}
                          {promotion.config.minQuantity > 1 ? t("admin.promo.minGifts", { n: promotion.config.minQuantity }) : ""}
                        </s-text>
                      </s-stack>
                    ) : (
                      <s-text color="subdued">{t("admin.promo.missing")}</s-text>
                    )}
                  </s-table-cell>
                  <s-table-cell>
                    {promotion.endsAt
                      ? t("admin.promo.datesRange", { from: dateLabel(t, promotion.startsAt), to: dateLabel(t, promotion.endsAt) })
                      : t("admin.promo.datesOpen", { from: dateLabel(t, promotion.startsAt) })}
                  </s-table-cell>
                  <s-table-cell>
                    <s-badge tone={status.tone}>{status.label}</s-badge>
                  </s-table-cell>
                  <s-table-cell>{promotion.usageCount}</s-table-cell>
                  <s-table-cell>
                    <s-stack direction="inline" gap="small-200">
                      {promotion.status === "ACTIVE" || promotion.status === "SCHEDULED" ? (
                        <s-button
                          variant="secondary"
                          onClick={() => post("deactivate", promotion.id)}
                          {...(busy ? { loading: true } : {})}
                        >
                          {t("admin.promo.pause")}
                        </s-button>
                      ) : promotion.status !== "EXPIRED" ? (
                        <s-button
                          variant="secondary"
                          onClick={() => post("activate", promotion.id)}
                          {...(busy ? { loading: true } : {})}
                        >
                          {t("admin.promo.resume")}
                        </s-button>
                      ) : null}
                      <s-button variant="tertiary" tone="critical" onClick={() => post("delete", promotion.id)}>
                        {t("admin.promo.delete")}
                      </s-button>
                    </s-stack>
                  </s-table-cell>
                </s-table-row>
              );
            })}
          </s-table-body>
        </s-table>
      )}
    </s-section>
  );
}

interface Picked {
  id: string;
  title: string;
}

function NewPromotion() {
  const { pro, currency } = useLoaderData<typeof loader>();
  const t = useAdminT();
  const shopify = useAppBridge();
  const fetcher = useFetcher<typeof action>();
  const [kind, setKind] = useState<"sale" | "coupon">("sale");
  const [valueType, setValueType] = useState<"percentage" | "fixed">("percentage");
  const [appliesTo, setAppliesTo] = useState<"selected" | "all">("selected");
  const [products, setProducts] = useState<Picked[]>([]);
  const [collections, setCollections] = useState<Picked[]>([]);
  const saving = fetcher.state !== "idle";

  const pick = async (type: "product" | "collection") => {
    const current = type === "product" ? products : collections;
    const selection = await shopify.resourcePicker({
      type,
      multiple: type === "product" ? MAX_PROMOTION_PRODUCTS : MAX_PROMOTION_COLLECTIONS,
      action: "select",
      selectionIds: current.map(({ id }) => ({ id })),
    });
    if (!selection) return;
    const picked = selection.map((item) => ({ id: item.id, title: item.title }));
    if (type === "product") setProducts(picked);
    else setCollections(picked);
  };

  const error = fetcher.data && !fetcher.data.ok && "error" in fetcher.data ? fetcher.data.error : null;

  return (
    <s-section heading={t("admin.promo.new")}>
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="create" />
        <input type="hidden" name="productIds" value={JSON.stringify(products.map((p) => p.id))} />
        <input type="hidden" name="collectionIds" value={JSON.stringify(collections.map((c) => c.id))} />
        {/*
          The three choice lists below post through these hidden inputs, from
          React state. Relying on the s-choice-list's own form value let an
          "All products" promotion save as "specific products" (5 Nov 2026).
        */}
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="valueType" value={valueType} />
        <input type="hidden" name="appliesTo" value={appliesTo} />
        <s-stack direction="block" gap="base">
          <s-choice-list
            label={t("admin.promo.type")}
            values={[kind]}
            onChange={(event) => {
              const [selected] = event.currentTarget.values ?? [];
              if (selected === "sale" || selected === "coupon") setKind(selected);
            }}
          >
            <s-choice value="sale">{t("admin.promo.typeSale")}</s-choice>
            <s-choice value="coupon">{t("admin.promo.typeCoupon")}</s-choice>
          </s-choice-list>

          {kind === "coupon" && (
            <s-stack direction="block" gap="small-100">
              <s-text-field
                name="code"
                label={t("admin.promo.code")}
                placeholder="REGISTRY15"
                details={t("admin.promo.codeDetails")}
                maxLength={40}
              />
              <s-number-field
                name="usageLimit"
                label={t("admin.promo.usage")}
                details={t("admin.promo.usageDetails")}
                value="0"
                min={0}
              />
            </s-stack>
          )}

          <s-text-field
            name="title"
            label={t("admin.promo.name")}
            details={t("admin.promo.nameDetails")}
            placeholder={kind === "coupon" ? t("admin.promo.namePhCoupon") : t("admin.promo.namePhSale")}
            maxLength={PROMOTION_TITLE_MAX}
          />

          <s-choice-list
            label={t("admin.promo.discount")}
            values={[valueType]}
            onChange={(event) => {
              const [selected] = event.currentTarget.values ?? [];
              if (selected === "percentage" || selected === "fixed") setValueType(selected);
            }}
          >
            <s-choice value="percentage">{t("admin.promo.pct")}</s-choice>
            <s-choice value="fixed">{t("admin.promo.fixed", { currency })}</s-choice>
          </s-choice-list>
          {valueType === "percentage" ? (
            <s-number-field
              name="amount"
              label={t("admin.promo.pct")}
              value="10"
              min={PROMOTION_PERCENT_RANGE.min}
              max={PROMOTION_PERCENT_RANGE.max}
              suffix="%"
            />
          ) : (
            <s-number-field name="amount" label={t("admin.promo.fixedLabel")} value="5" min={0.01} max={PROMOTION_FIXED_MAX} step={0.01} />
          )}

          <s-choice-list
            label={t("admin.promo.appliesTo")}
            values={[appliesTo]}
            onChange={(event) => {
              const [selected] = event.currentTarget.values ?? [];
              if (selected === "selected" || selected === "all") setAppliesTo(selected);
            }}
          >
            <s-choice value="selected">{t("admin.promo.selected")}</s-choice>
            <s-choice value="all">{t("admin.promo.all")}</s-choice>
          </s-choice-list>
          {appliesTo === "selected" && (
            <s-stack direction="block" gap="small-100">
              <s-stack direction="inline" gap="base">
                <s-button variant="secondary" onClick={() => pick("product")}>
                  {products.length ? t("admin.promo.productsN", { n: products.length }) : t("admin.promo.chooseProducts")}
                </s-button>
                <s-button variant="secondary" onClick={() => pick("collection")}>
                  {collections.length ? t("admin.promo.collectionsN", { n: collections.length }) : t("admin.promo.chooseCollections")}
                </s-button>
              </s-stack>
              {(products.length > 0 || collections.length > 0) && (
                <s-text color="subdued">{[...products, ...collections].map((p) => p.title).join(", ")}</s-text>
              )}
            </s-stack>
          )}

          <s-number-field
            name="minQuantity"
            label={t("admin.promo.minQty")}
            details={t("admin.promo.minQtyDetails")}
            value="1"
            min={1}
            max={PROMOTION_MIN_QUANTITY_MAX}
          />

          <s-stack direction="inline" gap="base">
            <s-date-field name="startsAt" label={t("admin.promo.starts")} details={t("admin.promo.startsDetails")} />
            <s-date-field name="endsAt" label={t("admin.promo.ends")} details={t("admin.promo.endsDetails")} />
          </s-stack>

          <s-text-field
            name="message"
            label={t("admin.promo.message")}
            details={t("admin.promo.messageDetails")}
            placeholder={kind === "coupon" ? t("admin.promo.msgPhCoupon") : t("admin.promo.msgPhSale")}
            maxLength={PROMOTION_MESSAGE_MAX}
          />

          <s-checkbox
            name="combines"
            label={t("admin.promo.combines")}
            details={t("admin.promo.combinesDetails")}
          />

          {error && (
            <s-banner tone="critical">
              <s-paragraph>{error}</s-paragraph>
            </s-banner>
          )}
          {fetcher.data?.ok && "created" in fetcher.data && (
            <s-banner tone="success">
              <s-paragraph>{t("admin.promo.created")}</s-paragraph>
            </s-banner>
          )}

          <s-stack direction="inline" gap="base">
            <s-button type="submit" {...(saving ? { loading: true } : {})} {...(!pro ? { disabled: true } : {})}>
              {t("admin.promo.createBtn")}
            </s-button>
          </s-stack>
        </s-stack>
      </fetcher.Form>
    </s-section>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
