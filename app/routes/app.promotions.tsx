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
import {
  MAX_PROMOTIONS,
  MAX_PROMOTION_COLLECTIONS,
  MAX_PROMOTION_PRODUCTS,
  PROMOTION_FIXED_MAX,
  PROMOTION_MESSAGE_MAX,
  PROMOTION_MIN_QUANTITY_MAX,
  PROMOTION_PERCENT_RANGE,
  PROMOTION_TITLE_MAX,
  describeScope,
  describeValue,
  parsePromotionForm,
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
    loadError = "Couldn't load your promotions from Shopify just now. Refresh to try again.";
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

  if (intent === "create") {
    if (!isPro(shop)) return { ok: false, error: "Registry promotions are part of Giftpin Pro." };
    if (settings.promotionIds.length >= MAX_PROMOTIONS) {
      return { ok: false, error: `You can have up to ${MAX_PROMOTIONS} promotions. Delete an old one first.` };
    }
    const parsed = parsePromotionForm(form);
    if (!parsed.ok) return { ok: false, error: parsed.error };
    const created = await createPromotion(graphql, parsed.draft);
    if (!created.ok) return { ok: false, error: `Shopify said: ${created.reason}` };
    await updateSettings(session.shop, { promotionIds: [...settings.promotionIds, created.id] });
    return { ok: true, created: true };
  }

  const change = intent as PromotionChange;
  if (change === "activate" || change === "deactivate" || change === "delete") {
    const id = String(form.get("id") ?? "");
    // Only ever touch discounts Giftpin made.
    if (!settings.promotionIds.includes(id)) return { ok: false, error: "That promotion wasn't found." };
    if (change === "activate" && !isPro(shop)) {
      return { ok: false, error: "Registry promotions are part of Giftpin Pro." };
    }
    const result = await changePromotion(graphql, id, change);
    if (!result.ok) return { ok: false, error: `Shopify said: ${result.reason}` };
    if (change === "delete") {
      await updateSettings(session.shop, { promotionIds: settings.promotionIds.filter((p) => p !== id) });
    }
    return { ok: true };
  }

  return { ok: false, error: "Unknown action." };
};

const STATUS: Record<string, { label: string; tone: "success" | "info" | "neutral" | "warning" }> = {
  ACTIVE: { label: "Active", tone: "success" },
  SCHEDULED: { label: "Scheduled", tone: "info" },
  EXPIRED: { label: "Ended", tone: "neutral" },
};

function dateLabel(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(iso));
}

export default function Promotions() {
  const { pro, promotions, loadError, completionDiscount } = useLoaderData<typeof loader>();

  return (
    <s-page heading="Registry promotions">
      {!pro && (
        <s-banner tone="info" heading="Registry promotions are part of Giftpin Pro">
          <s-paragraph>
            Run sales and coupons that only apply to gifts bought from a registry, so guests get a reason to buy
            from your list instead of somewhere else.
          </s-paragraph>
          <s-button slot="secondary-actions" href="/app/billing">
            See Pro
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

      <s-section slot="aside" heading="How it works">
        <s-paragraph>
          A promotion only applies to gifts added to the cart from a registry page. The same product bought the
          usual way stays full price. Guests see the discount at checkout, including with Shop Pay.
        </s-paragraph>
        <s-paragraph>
          <s-text color="subdued">
            Anyone can make a registry and buy from it, so a registry price is about as open as a public coupon.
            Pick an amount you&apos;re happy to give anyone who goes to that trouble. Gift cards (cash funds and
            group gifts) are never discounted.
          </s-text>
        </s-paragraph>
        <s-paragraph>
          <s-text color="subdued">
            Promotions also show in Shopify&apos;s Discounts page, starting with &ldquo;Giftpin:&rdquo;. If you
            leave Pro, they&apos;re paused, not deleted.
          </s-text>
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading="After the event">
        <s-paragraph>
          {completionDiscount.enabled
            ? `Registrants get ${completionDiscount.percent}% off your products still on their list after the event, for ${completionDiscount.days} days.`
            : "Give registrants a one-time code for your products still on their list after the event. It's off right now."}
        </s-paragraph>
        <s-button href="/app/settings" variant="secondary">
          {completionDiscount.enabled ? "Change in Settings" : "Turn on in Settings"}
        </s-button>
      </s-section>
    </s-page>
  );
}

function PromotionList({ promotions }: { promotions: PromotionSummary[] }) {
  const { currency } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const busyId = fetcher.state !== "idle" ? String(fetcher.formData?.get("id") ?? "") : "";

  const post = (intent: PromotionChange, id: string) => {
    if (intent === "delete" && !window.confirm("Delete this promotion? This can't be undone.")) return;
    fetcher.submit({ intent, id }, { method: "post" });
  };

  return (
    <s-section heading="Your promotions">
      {fetcher.data && !fetcher.data.ok && "error" in fetcher.data && (
        <s-banner tone="critical">
          <s-paragraph>{fetcher.data.error}</s-paragraph>
        </s-banner>
      )}
      {promotions.length === 0 ? (
        <s-paragraph>
          <s-text color="subdued">No promotions yet. Create one below.</s-text>
        </s-paragraph>
      ) : (
        <s-table>
          <s-table-header-row>
            <s-table-header>Promotion</s-table-header>
            <s-table-header>Deal</s-table-header>
            <s-table-header>Dates</s-table-header>
            <s-table-header>Status</s-table-header>
            <s-table-header>Uses</s-table-header>
            <s-table-header>Actions</s-table-header>
          </s-table-header-row>
          <s-table-body>
            {promotions.map((promotion) => {
              const status = STATUS[promotion.status] ?? { label: "Paused", tone: "warning" as const };
              const busy = busyId === promotion.id;
              return (
                <s-table-row key={promotion.id}>
                  <s-table-cell>
                    <s-stack direction="block" gap="small-200">
                      <s-text>{promotion.title}</s-text>
                      <s-text color="subdued">
                        {promotion.kind === "coupon" ? `Coupon code ${promotion.code ?? ""}` : "Automatic sale"}
                      </s-text>
                    </s-stack>
                  </s-table-cell>
                  <s-table-cell>
                    {promotion.config ? (
                      <s-stack direction="block" gap="small-200">
                        <s-text>{describeValue(promotion.config, currency)}</s-text>
                        <s-text color="subdued">
                          {describeScope(promotion.config)}
                          {promotion.config.minQuantity > 1 ? `, ${promotion.config.minQuantity}+ registry gifts` : ""}
                        </s-text>
                      </s-stack>
                    ) : (
                      <s-text color="subdued">Settings missing</s-text>
                    )}
                  </s-table-cell>
                  <s-table-cell>
                    {dateLabel(promotion.startsAt)}
                    {promotion.endsAt ? ` to ${dateLabel(promotion.endsAt)}` : ", no end date"}
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
                          Pause
                        </s-button>
                      ) : promotion.status !== "EXPIRED" ? (
                        <s-button
                          variant="secondary"
                          onClick={() => post("activate", promotion.id)}
                          {...(busy ? { loading: true } : {})}
                        >
                          Resume
                        </s-button>
                      ) : null}
                      <s-button variant="tertiary" tone="critical" onClick={() => post("delete", promotion.id)}>
                        Delete
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
    <s-section heading="New promotion">
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="create" />
        <input type="hidden" name="productIds" value={JSON.stringify(products.map((p) => p.id))} />
        <input type="hidden" name="collectionIds" value={JSON.stringify(collections.map((c) => c.id))} />
        <s-stack direction="block" gap="base">
          <s-choice-list
            name="kind"
            label="Type"
            values={[kind]}
            onChange={(event) => {
              const [selected] = event.currentTarget.values ?? [];
              if (selected === "sale" || selected === "coupon") setKind(selected);
            }}
          >
            <s-choice value="sale">Registry sale: applies automatically to registry gifts</s-choice>
            <s-choice value="coupon">Registry coupon: guests enter a code you share</s-choice>
          </s-choice-list>

          {kind === "coupon" && (
            <s-stack direction="block" gap="small-100">
              <s-text-field
                name="code"
                label="Coupon code"
                placeholder="REGISTRY15"
                details="Letters, numbers, - and _. Only works on gifts bought from a registry."
                maxLength={40}
              />
              <s-number-field
                name="usageLimit"
                label="Total uses allowed"
                details="Leave at 0 for no limit."
                value="0"
                min={0}
              />
            </s-stack>
          )}

          <s-text-field
            name="title"
            label="Name"
            details="For you. Also shown in Shopify's Discounts page."
            placeholder={kind === "coupon" ? "Registry coupon" : "Registry sale"}
            maxLength={PROMOTION_TITLE_MAX}
          />

          <s-choice-list
            name="valueType"
            label="Discount"
            values={[valueType]}
            onChange={(event) => {
              const [selected] = event.currentTarget.values ?? [];
              if (selected === "percentage" || selected === "fixed") setValueType(selected);
            }}
          >
            <s-choice value="percentage">Percent off</s-choice>
            <s-choice value="fixed">{`Amount off each item (${currency})`}</s-choice>
          </s-choice-list>
          {valueType === "percentage" ? (
            <s-number-field
              name="amount"
              label="Percent off"
              value="10"
              min={PROMOTION_PERCENT_RANGE.min}
              max={PROMOTION_PERCENT_RANGE.max}
              suffix="%"
            />
          ) : (
            <s-number-field name="amount" label="Amount off each item" value="5" min={0.01} max={PROMOTION_FIXED_MAX} step={0.01} />
          )}

          <s-choice-list
            name="appliesTo"
            label="Applies to"
            values={[appliesTo]}
            onChange={(event) => {
              const [selected] = event.currentTarget.values ?? [];
              if (selected === "selected" || selected === "all") setAppliesTo(selected);
            }}
          >
            <s-choice value="selected">Specific products or collections</s-choice>
            <s-choice value="all">All products, when bought from a registry</s-choice>
          </s-choice-list>
          {appliesTo === "selected" && (
            <s-stack direction="block" gap="small-100">
              <s-stack direction="inline" gap="base">
                <s-button variant="secondary" onClick={() => pick("product")}>
                  {products.length ? `Products (${products.length})` : "Choose products"}
                </s-button>
                <s-button variant="secondary" onClick={() => pick("collection")}>
                  {collections.length ? `Collections (${collections.length})` : "Choose collections"}
                </s-button>
              </s-stack>
              {(products.length > 0 || collections.length > 0) && (
                <s-text color="subdued">{[...products, ...collections].map((p) => p.title).join(", ")}</s-text>
              )}
            </s-stack>
          )}

          <s-number-field
            name="minQuantity"
            label="Registry gifts needed in the cart"
            details="1 means every registry gift. Set it higher for a 'buy 3 gifts, save more' deal."
            value="1"
            min={1}
            max={PROMOTION_MIN_QUANTITY_MAX}
          />

          <s-stack direction="inline" gap="base">
            <s-date-field name="startsAt" label="Starts" details="Leave empty to start now." />
            <s-date-field name="endsAt" label="Ends" details="Optional." />
          </s-stack>

          <s-text-field
            name="message"
            label="What guests see at checkout"
            placeholder={kind === "coupon" ? "Registry coupon" : "Registry price"}
            maxLength={PROMOTION_MESSAGE_MAX}
          />

          <s-checkbox
            name="combines"
            label="Can be combined with your other product and order discounts"
            details="Off by default, so a registry gift never gets two discounts at once."
          />

          {error && (
            <s-banner tone="critical">
              <s-paragraph>{error}</s-paragraph>
            </s-banner>
          )}
          {fetcher.data?.ok && "created" in fetcher.data && (
            <s-banner tone="success">
              <s-paragraph>Promotion created. It&apos;s in the list above.</s-paragraph>
            </s-banner>
          )}

          <s-stack direction="inline" gap="base">
            <s-button type="submit" {...(saving ? { loading: true } : {})} {...(!pro ? { disabled: true } : {})}>
              Create promotion
            </s-button>
          </s-stack>
        </s-stack>
      </fetcher.Form>
    </s-section>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
