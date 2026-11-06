import { useEffect, useRef, useState } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { enqueue } from "../lib/queue.server";
import { isPro, requireShop, settingsFor, updateSettings } from "../models/shop.server";
import {
  EVENT_TYPES,
  COMPLETION_DISCOUNT_PERCENT_RANGE,
  COMPLETION_DISCOUNT_DAYS_RANGE,
} from "../shared/settings";
import {
  BRAND_FONTS,
  DEFAULT_BACKGROUND,
  DEFAULT_TEXT,
  brandFont,
  cleanHexColor,
  cleanLogoUrl,
  contrastRatio,
} from "../shared/branding";
import { listGiftCardProducts } from "../lib/contribution-product.server";
import { LOCALES, LOCALE_NAMES, t, toLocale, type MessageKey } from "../shared/i18n";
import { adminLocale } from "../lib/admin-locale.server";
import { splitAtLink, useAdminT } from "../lib/use-admin-t";
import { PERKS_MAX_LENGTH, PERKS_MAX_LINES, cleanPerks } from "../shared/perks";
import { GIFT_CARD_FEE_HOLD_DAYS, GIFT_CARD_FEE_PERCENT } from "../shared/plans";
import { GIFT_CARD_BLURB_MAX, MAX_LISTED_GIFT_CARD, cleanGiftCardBlurb, listedGiftCardAmounts } from "../shared/gift-card-listing";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = await requireShop(session.shop);
  // Group gifts and funds (Pro, SPIKE-C.md). A failed lookup just shows an
  // empty picker; it must never take the whole Settings page down.
  const giftCards = await listGiftCardProducts((q, o) => admin.graphql(q, o)).catch((err) => {
    console.error("[settings] gift card products:", (err as Error).message);
    return [];
  });
  return {
    settings: settingsFor(shop),
    pro: isPro(shop),
    giftCards,
    shopDomain: session.shop,
    // 23 Sep 2026: a bare, repeatedly-fetched /apps/registry URL got stuck
    // behind a stale cached response for one merchant (a leftover from a
    // now-fixed app-proxy misconfiguration, likely cached somewhere between
    // browser and Shopify's edge — never actually our own Cache-Control:
    // no-store responses, see app/lib/proxy.server.ts). A per-load query
    // param guarantees these two links are never a cache hit again,
    // regardless of where a future stale response might get cached.
    cacheBust: Date.now(),
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = await requireShop(session.shop);
  const form = await request.formData();
  const locale = adminLocale(request);

  // Separate form so saving it can't clobber (or be clobbered by) the rest.
  if (form.get("intent") === "contributions") {
    const productGid = String(form.get("contributionProduct") ?? "");
    // Re-read from Shopify rather than trusting posted amounts: these are the
    // denominations guests will be charged.
    const picked = productGid
      ? (await listGiftCardProducts((q, o) => admin.graphql(q, o))).find((p) => p.productGid === productGid) ?? null
      : null;
    // Gift cards on giftpin.app sell the same product. Saved on any plan so
    // the choice survives a plan change; the directory and the store page
    // check Pro themselves (giftCardListingLive).
    const giftCardListing = {
      enabled: form.get("giftCardListingEnabled") === "on",
      blurb: cleanGiftCardBlurb(form.get("giftCardBlurb")),
    };
    await updateSettings(session.shop, { contributionProduct: picked, giftCardListing });
    const warnings: string[] = [];
    if (giftCardListing.enabled && listedGiftCardAmounts(picked).length === 0) {
      warnings.push(t("admin.set.warnGc", { max: MAX_LISTED_GIFT_CARD }, locale));
    }
    return { ok: true, warnings };
  }

  // "Run now": the daily automations job (app/models/automations.server.ts)
  // for this shop only. Each automation still fires at most once per
  // registry, so pressing it twice sends nothing new.
  if (form.get("intent") === "run-automations") {
    if (isPro(shop)) {
      await enqueue("registry-automations", { shop: session.shop });
      // Gift card fees too: on a dev store there's no refund hold, so this
      // is how the fee flow gets tested (SPIKE-C.md Part 4).
      await enqueue("charge-gift-card-fees", { shop: session.shop });
    }
    return { ok: true, ran: isPro(shop), warnings: [] as string[] };
  }

  // Pro branding. Free shops don't get these fields in the form, and a
  // crafted post from one is ignored rather than saved.
  const branding = isPro(shop)
    ? {
        logoUrl: cleanLogoUrl(form.get("logoUrl")),
        backgroundColor: cleanHexColor(form.get("backgroundColor")),
        textColor: cleanHexColor(form.get("textColor")),
        fontFamily: brandFont(String(form.get("fontFamily") ?? "")).value,
      }
    : {};

  const external = String(form.get("externalItems") ?? "on");

  await updateSettings(session.shop, {
    eventTypes: form.getAll("eventTypes").map(String),
    externalItems: external === "off" || external === "capped" ? external : "on",
    externalItemsCapPercent: Math.min(
      95,
      Math.max(10, Number(form.get("externalItemsCapPercent") ?? 60)),
    ),
    language: toLocale(form.get("language")),
    registryLanguageChoice: form.get("registryLanguageChoice") === "on",
    accentColor: /^#[0-9a-fA-F]{6}$/.test(String(form.get("accentColor")))
      ? String(form.get("accentColor"))
      : "#1a1a1a",
    buttonLabel: String(form.get("buttonLabel") ?? "Add to registry").slice(0, 40),
    findARegistryEnabled: form.get("findARegistryEnabled") === "on",
    hideBuyerUntilEvent: form.get("hideBuyerUntilEvent") === "on",
    // Pro automations. Saved on any plan so a merchant's choices survive a
    // plan change; the daily job checks the plan before acting on them.
    completionDiscountEnabled: form.get("completionDiscountEnabled") === "on",
    completionDiscountPercent: clamp(
      form.get("completionDiscountPercent"),
      COMPLETION_DISCOUNT_PERCENT_RANGE.min,
      COMPLETION_DISCOUNT_PERCENT_RANGE.max,
      15,
    ),
    completionDiscountValidDays: clamp(
      form.get("completionDiscountValidDays"),
      COMPLETION_DISCOUNT_DAYS_RANGE.min,
      COMPLETION_DISCOUNT_DAYS_RANGE.max,
      60,
    ),
    thankYouReminderEmails: form.get("thankYouReminderEmails") === "on",
    guestEventReminderEmails: form.get("guestEventReminderEmails") === "on",
    mostGoneAlertEmails: form.get("mostGoneAlertEmails") === "on",
    soldOutItems: form.get("soldOutItems") === "hide" ? "hide" : "show",
    // Saved on any plan, like the automations; only shown to registrants on Pro.
    registryPerks: cleanPerks(form.get("registryPerks")),
    ...branding,
  });

  const warnings: string[] = [];
  if ("logoUrl" in branding && String(form.get("logoUrl") ?? "").trim() && !branding.logoUrl) {
    warnings.push(t("admin.set.warnLogo", undefined, locale));
  }
  if ("backgroundColor" in branding && (branding.backgroundColor || branding.textColor)) {
    const ratio = contrastRatio(branding.backgroundColor || DEFAULT_BACKGROUND, branding.textColor || DEFAULT_TEXT);
    if (ratio < 4.5) {
      warnings.push(t("admin.set.warnContrast", { ratio: ratio.toFixed(1) }, locale));
    }
  }

  return { ok: true, warnings };
};

function clamp(value: FormDataEntryValue | null, min: number, max: number, fallback: number): number {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || value === null || value === "") return fallback;
  return Math.min(max, Math.max(min, n));
}

export default function Settings() {
  const { settings, pro, giftCards, shopDomain, cacheBust } = useLoaderData<typeof loader>();
  const t = useAdminT();
  const fetcher = useFetcher<typeof action>();
  const runFetcher = useFetcher<typeof action>();
  const giftFetcher = useFetcher<typeof action>();
  const [externalItems, setExternalItems] = useState(settings.externalItems);
  const [soldOutItems, setSoldOutItems] = useState(settings.soldOutItems);

  const perksUpgrade = splitAtLink(t, "admin.set.perksUpgrade");
  const afterUpgrade = splitAtLink(t, "admin.set.afterUpgrade");
  const saving = fetcher.state !== "idle";
  const formRef = useRef<HTMLFormElement>(null);
  const shopify = useAppBridge();

  // The header Save sits far from the "Saved" text at the bottom, so confirm
  // with a toast wherever the merchant pressed it.
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      shopify.toast.show(t("admin.set.toast"));
    }
  }, [fetcher.state, fetcher.data, shopify, t]);

  return (
    <s-page heading={t("admin.set.page")}>
      {/* Page header, top right. Saves everything down to "Automatic emails";
          group gifts and funds keep their own Save below. */}
      <s-button
        slot="primary-action"
        variant="primary"
        onClick={() => formRef.current?.requestSubmit()}
        {...(saving ? { loading: true } : {})}
      >
        {t("admin.set.save")}
      </s-button>
      {fetcher.data?.warnings?.map((warning) => (
        <s-banner key={warning} tone="warning">
          <s-paragraph>{warning}</s-paragraph>
        </s-banner>
      ))}
      <fetcher.Form method="post" ref={formRef}>
        <s-section heading={t("admin.set.occasions")}>
          <s-paragraph>
            <s-text color="subdued">{t("admin.set.occasionsHint")}</s-text>
          </s-paragraph>
          <s-stack direction="block" gap="small-100">
            {EVENT_TYPES.map((type) => (
              <s-checkbox
                key={type.value}
                name="eventTypes"
                value={type.value}
                label={t(`event.${type.value}` as MessageKey)}
                {...(type.value === "wishlist" ? { details: t("admin.set.wishlistHint") } : {})}
                {...(settings.eventTypes.includes(type.value) ? { checked: true } : {})}
              />
            ))}
          </s-stack>
        </s-section>

        <s-section heading={t("admin.set.ext")}>
          <s-paragraph>{t("admin.set.extText")}</s-paragraph>
          <s-paragraph>
            <s-text color="subdued">{t("admin.set.extNote")}</s-text>
          </s-paragraph>

          <s-stack direction="block" gap="small-100">
            <s-choice-list
              name="externalItems"
              values={[externalItems]}
              onChange={(event) => {
                // s-choice-list is a form-associated custom element: the
                // selection arrives as `values`, not a single `value`.
                const [selected] = event.currentTarget.values ?? [];
                if (selected) setExternalItems(selected as typeof externalItems);
              }}
            >
              <s-choice value="on">{t("admin.set.extOn")}</s-choice>
              <s-choice value="capped">{t("admin.set.extCapped")}</s-choice>
              <s-choice value="off">{t("admin.set.extOff")}</s-choice>
            </s-choice-list>
          </s-stack>

          {externalItems === "capped" && (
            <s-number-field
              name="externalItemsCapPercent"
              label={t("admin.set.extCap")}
              value={String(settings.externalItemsCapPercent)}
              min={10}
              max={95}
            />
          )}

          {externalItems === "off" && (
            <s-banner tone="warning">
              <s-paragraph>{t("admin.set.extWarn")}</s-paragraph>
            </s-banner>
          )}
        </s-section>

        <s-section heading={t("admin.set.soldOut")}>
          <s-paragraph>
            <s-text color="subdued">{t("admin.set.soldOutText")}</s-text>
          </s-paragraph>
          <s-choice-list
            name="soldOutItems"
            values={[soldOutItems]}
            onChange={(event) => {
              const [selected] = event.currentTarget.values ?? [];
              if (selected === "show" || selected === "hide") setSoldOutItems(selected);
            }}
          >
            <s-choice value="show">{t("admin.set.soldOutShow")}</s-choice>
            <s-choice value="hide">{t("admin.set.soldOutHide")}</s-choice>
          </s-choice-list>
        </s-section>

        <s-section heading={t("admin.set.perks")}>
          <s-paragraph>
            <s-text color="subdued">{t("admin.set.perksText", { n: PERKS_MAX_LINES })}</s-text>
          </s-paragraph>
          {!pro && (
            <s-banner tone="info">
              <s-paragraph>
                {perksUpgrade[0]}
                <s-link href="/app/billing">{t("admin.set.upgrade")}</s-link>
                {perksUpgrade[1]}
              </s-paragraph>
            </s-banner>
          )}
          <s-text-area
            name="registryPerks"
            label={t("admin.set.perksLabel")}
            value={settings.registryPerks}
            rows={4}
            maxLength={PERKS_MAX_LENGTH}
            placeholder={t("admin.set.perksPh")}
            details={t("admin.set.perksDetails")}
          />
        </s-section>

        <s-section heading={t("admin.set.appearance")}>
          <s-select
            name="language"
            label={t("admin.set.langLabel")}
            value={settings.language}
            details={t("admin.set.langDetails")}
          >
            {LOCALES.map((code) => (
              <s-option key={code} value={code}>
                {LOCALE_NAMES[code]}
              </s-option>
            ))}
          </s-select>
          <s-checkbox
            name="registryLanguageChoice"
            label={t("admin.set.langChoice")}
            details={t("admin.set.langChoiceDetails")}
            {...(settings.registryLanguageChoice ? { checked: true } : {})}
          />
          <s-text-field
            name="buttonLabel"
            label={t("admin.set.buttonLabel")}
            value={settings.buttonLabel}
            maxLength={40}
          />
          <s-text-field
            name="accentColor"
            label={t("admin.set.accent")}
            value={settings.accentColor}
            details={t("admin.set.accentDetails")}
          />
        </s-section>

        <s-section heading={t("admin.set.branding")}>
          {pro ? (
            <s-stack direction="block" gap="base">
              <s-paragraph>
                <s-text color="subdued">{t("admin.set.brandingText")}</s-text>
              </s-paragraph>
              <s-url-field
                name="logoUrl"
                label={t("admin.set.logo")}
                value={settings.logoUrl}
                details={t("admin.set.logoDetails")}
              />
              <s-text-field
                name="backgroundColor"
                label={t("admin.set.bg")}
                value={settings.backgroundColor}
                placeholder={DEFAULT_BACKGROUND}
                details={t("admin.set.bgDetails")}
              />
              <s-text-field
                name="textColor"
                label={t("admin.set.text")}
                value={settings.textColor}
                placeholder={DEFAULT_TEXT}
                details={t("admin.set.textDetails")}
              />
              <s-select name="fontFamily" label={t("admin.set.font")} value={settings.fontFamily}>
                {BRAND_FONTS.map((font) => (
                  <s-option key={font.value} value={font.value}>
                    {font.label}
                  </s-option>
                ))}
              </s-select>
              <s-paragraph>
                <s-text color="subdued">{t("admin.set.fontNote")}</s-text>
              </s-paragraph>
            </s-stack>
          ) : (
            <s-stack direction="block" gap="base">
              <s-paragraph>{t("admin.set.brandingFree")}</s-paragraph>
              <s-button href="/app/billing">{t("admin.set.seePro")}</s-button>
            </s-stack>
          )}
        </s-section>

        <s-section heading={t("admin.set.privacy")}>
          <s-checkbox
            name="hideBuyerUntilEvent"
            label={t("admin.set.hideBuyer")}
            details={t("admin.set.hideBuyerDetails")}
            {...(settings.hideBuyerUntilEvent ? { checked: true } : {})}
          />
          <s-checkbox
            name="findARegistryEnabled"
            label={t("admin.set.find")}
            details={t("admin.set.findDetails")}
            {...(settings.findARegistryEnabled ? { checked: true } : {})}
          />
        </s-section>

        <s-section heading={t("admin.set.after")}>
          {!pro && (
            <s-banner tone="info">
              <s-paragraph>
                {afterUpgrade[0]}
                <s-link href="/app/billing">{t("admin.set.upgrade")}</s-link>
                {afterUpgrade[1]}
              </s-paragraph>
            </s-banner>
          )}
          <s-checkbox
            name="completionDiscountEnabled"
            label={t("admin.set.discount")}
            details={t("admin.set.discountDetails")}
            {...(settings.completionDiscountEnabled ? { checked: true } : {})}
          />
          <s-number-field
            name="completionDiscountPercent"
            label={t("admin.set.discountPct")}
            value={String(settings.completionDiscountPercent)}
            min={COMPLETION_DISCOUNT_PERCENT_RANGE.min}
            max={COMPLETION_DISCOUNT_PERCENT_RANGE.max}
          />
          <s-number-field
            name="completionDiscountValidDays"
            label={t("admin.set.discountDays")}
            value={String(settings.completionDiscountValidDays)}
            min={COMPLETION_DISCOUNT_DAYS_RANGE.min}
            max={COMPLETION_DISCOUNT_DAYS_RANGE.max}
          />
        </s-section>

        <s-section heading={t("admin.set.emails")}>
          <s-stack direction="block" gap="small-100">
            <s-checkbox
              name="guestEventReminderEmails"
              label={t("admin.set.guestRemind")}
              details={t("admin.set.guestRemindDetails")}
              {...(settings.guestEventReminderEmails ? { checked: true } : {})}
            />
            <s-checkbox
              name="mostGoneAlertEmails"
              label={t("admin.set.mostGone")}
              details={t("admin.set.mostGoneDetails")}
              {...(settings.mostGoneAlertEmails ? { checked: true } : {})}
            />
            <s-checkbox
              name="thankYouReminderEmails"
              label={t("admin.set.thanks")}
              details={t("admin.set.thanksDetails")}
              {...(settings.thankYouReminderEmails ? { checked: true } : {})}
            />
          </s-stack>
        </s-section>

        <s-section>
          <s-stack direction="inline" gap="base">
            <s-button type="submit" {...(saving ? { loading: true } : {})}>
              {t("admin.set.save")}
            </s-button>
            {fetcher.data?.ok && <s-text>{t("admin.set.saved")}</s-text>}
          </s-stack>
          {fetcher.data?.warnings?.map((warning) => (
            <s-banner key={warning} tone="warning">
              <s-paragraph>{warning}</s-paragraph>
            </s-banner>
          ))}
        </s-section>
      </fetcher.Form>

      <giftFetcher.Form method="post">
        <input type="hidden" name="intent" value="contributions" />
        <s-section heading={t("admin.set.funds")}>
          <s-paragraph>{t("admin.set.fundsText")}</s-paragraph>
          {!pro && (
            <s-banner tone="info">
              <s-paragraph>{t("admin.set.fundsPro")}</s-paragraph>
            </s-banner>
          )}
          <s-banner tone="warning">
            <s-paragraph>{t("admin.set.fundsFulfil")}</s-paragraph>
          </s-banner>
          {giftCards.length === 0 ? (
            <s-paragraph>
              <s-text color="subdued">{t("admin.set.fundsFirst")}</s-text>
            </s-paragraph>
          ) : (
            <s-select
              name="contributionProduct"
              label={t("admin.set.fundsPick")}
              value={settings.contributionProduct?.productGid ?? ""}
            >
              <s-option value="">{t("admin.set.off")}</s-option>
              {giftCards.map((card) => (
                <s-option key={card.productGid} value={card.productGid}>
                  {card.title} ({card.variants.map((v) => v.amount).join(", ")})
                </s-option>
              ))}
            </s-select>
          )}
          <s-heading>{t("admin.set.sell")}</s-heading>
          <s-paragraph>{t("admin.set.sellText", { max: MAX_LISTED_GIFT_CARD })}</s-paragraph>
          <s-paragraph>
            <s-text color="subdued">
              {t("admin.set.sellFee", { pct: GIFT_CARD_FEE_PERCENT, days: GIFT_CARD_FEE_HOLD_DAYS })}
            </s-text>
          </s-paragraph>
          <s-checkbox
            name="giftCardListingEnabled"
            label={t("admin.set.listMine")}
            {...(settings.giftCardListing.enabled ? { checked: true } : {})}
          />
          <s-text-field
            name="giftCardBlurb"
            label={t("admin.set.blurb")}
            details={t("admin.set.blurbDetails")}
            maxLength={GIFT_CARD_BLURB_MAX}
            value={settings.giftCardListing.blurb}
          />
          {settings.giftCardListing.enabled && pro && (
            <s-paragraph>
              <s-text color="subdued">
                {t("admin.set.gcPage")}{" "}
                <s-link href={`https://${shopDomain}/apps/registry/gift-card?cb=${cacheBust}`} target="_blank">
                  /apps/registry/gift-card
                </s-link>
              </s-text>
            </s-paragraph>
          )}
          <s-stack direction="inline" gap="base">
            <s-button type="submit" {...(giftFetcher.state !== "idle" ? { loading: true } : {})}>
              {t("admin.set.save")}
            </s-button>
            {giftFetcher.data?.ok && <s-text>{t("admin.set.saved")}</s-text>}
          </s-stack>
          {giftFetcher.data?.warnings?.map((warning) => (
            <s-banner key={warning} tone="warning">
              <s-paragraph>{warning}</s-paragraph>
            </s-banner>
          ))}
        </s-section>
      </giftFetcher.Form>

      {pro && (
        <runFetcher.Form method="post">
          <input type="hidden" name="intent" value="run-automations" />
          <s-section heading={t("admin.set.run")}>
            <s-paragraph>
              <s-text color="subdued">{t("admin.set.runText")}</s-text>
            </s-paragraph>
            <s-stack direction="inline" gap="base">
              <s-button type="submit" variant="secondary" {...(runFetcher.state !== "idle" ? { loading: true } : {})}>
                {t("admin.set.runNow")}
              </s-button>
              {runFetcher.data && "ran" in runFetcher.data && runFetcher.data.ran && (
                <s-text>{t("admin.set.runStarted")}</s-text>
              )}
            </s-stack>
          </s-section>
        </runFetcher.Form>
      )}
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
