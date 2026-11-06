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
import { LOCALES, LOCALE_NAMES, toLocale } from "../shared/i18n";
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
      warnings.push(
        `To list your gift cards on giftpin.app, pick a gift card with at least one amount of ${MAX_LISTED_GIFT_CARD} or less.`,
      );
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
    warnings.push("The logo link wasn't saved: it needs to be a full https:// image link.");
  }
  if ("backgroundColor" in branding && (branding.backgroundColor || branding.textColor)) {
    const ratio = contrastRatio(branding.backgroundColor || DEFAULT_BACKGROUND, branding.textColor || DEFAULT_TEXT);
    if (ratio < 4.5) {
      warnings.push(
        `Your text and background colours are hard to read together (contrast ${ratio.toFixed(1)}:1; aim for at least 4.5:1).`,
      );
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
  const fetcher = useFetcher<typeof action>();
  const runFetcher = useFetcher<typeof action>();
  const giftFetcher = useFetcher<typeof action>();
  const [externalItems, setExternalItems] = useState(settings.externalItems);
  const [soldOutItems, setSoldOutItems] = useState(settings.soldOutItems);

  const saving = fetcher.state !== "idle";
  const formRef = useRef<HTMLFormElement>(null);
  const shopify = useAppBridge();

  // The header Save sits far from the "Saved" text at the bottom, so confirm
  // with a toast wherever the merchant pressed it.
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      shopify.toast.show("Settings saved");
    }
  }, [fetcher.state, fetcher.data, shopify]);

  return (
    <s-page heading="Settings">
      {/* Page header, top right. Saves everything down to "Automatic emails";
          group gifts and funds keep their own Save below. */}
      <s-button
        slot="primary-action"
        variant="primary"
        onClick={() => formRef.current?.requestSubmit()}
        {...(saving ? { loading: true } : {})}
      >
        Save
      </s-button>
      {fetcher.data?.warnings?.map((warning) => (
        <s-banner key={warning} tone="warning">
          <s-paragraph>{warning}</s-paragraph>
        </s-banner>
      ))}
      <fetcher.Form method="post" ref={formRef}>
        <s-section heading="Occasions">
          <s-paragraph>
            <s-text color="subdued">Which kinds of registry customers can create.</s-text>
          </s-paragraph>
          <s-stack direction="block" gap="small-100">
            {EVENT_TYPES.map((type) => (
              <s-checkbox
                key={type.value}
                name="eventTypes"
                value={type.value}
                label={type.label}
                {...(type.value === "wishlist"
                  ? {
                      details:
                        "A shareable list with no event date, such as a holiday wish list. Family marks what they bought, so nobody doubles up. Off until you switch it on.",
                    }
                  : {})}
                {...(settings.eventTypes.includes(type.value) ? { checked: true } : {})}
              />
            ))}
          </s-stack>
        </s-section>

        <s-section heading="Items from other stores">
          <s-paragraph>
            Customers register where they can put everything in one list. Allowing items from
            elsewhere is usually what makes a couple choose your registry as their main one &mdash;
            and your products stay at the top of it.
          </s-paragraph>
          <s-paragraph>
            <s-text color="subdued">
              Items from other stores are links, not purchases. Guests buy them at that retailer and
              tell us, so nobody buys the same gift twice. Giftpin may earn a small commission on
              some of those clicks, which never changes the guest&apos;s price.
            </s-text>
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
              <s-choice value="on">Allow (recommended)</s-choice>
              <s-choice value="capped">Allow, but keep my products in the majority</s-choice>
              <s-choice value="off">My products only</s-choice>
            </s-choice-list>
          </s-stack>

          {externalItems === "capped" && (
            <s-number-field
              name="externalItemsCapPercent"
              label="Maximum share of items from other stores (%)"
              value={String(settings.externalItemsCapPercent)}
              min={10}
              max={95}
            />
          )}

          {externalItems === "off" && (
            <s-banner tone="warning">
              <s-paragraph>
                Customers who need something you don&apos;t stock will build their list somewhere
                else entirely &mdash; and you get none of it rather than most of it.
              </s-paragraph>
            </s-banner>
          )}
        </s-section>

        <s-section heading="Sold-out products">
          <s-paragraph>
            <s-text color="subdued">
              When one of your products on a registry sells out. It always stays on the registry, so
              it comes back by itself when you restock.
            </s-text>
          </s-paragraph>
          <s-choice-list
            name="soldOutItems"
            values={[soldOutItems]}
            onChange={(event) => {
              const [selected] = event.currentTarget.values ?? [];
              if (selected === "show" || selected === "hide") setSoldOutItems(selected);
            }}
          >
            <s-choice value="show">Show it as sold out (guests can&apos;t add it to their cart)</s-choice>
            <s-choice value="hide">Hide it from guests until it&apos;s back in stock</s-choice>
          </s-choice-list>
        </s-section>

        <s-section heading="Registry perks (Pro)">
          <s-paragraph>
            <s-text color="subdued">
              What you offer people who register with you, like free gift wrapping or a gift when the
              registry reaches a total. Shown to registrants when they start a registry and on their own
              registry page, not to guests. One perk per line, up to {PERKS_MAX_LINES}.
            </s-text>
          </s-paragraph>
          {!pro && (
            <s-banner tone="info">
              <s-paragraph>
                Perks show on Giftpin Pro. <s-link href="/app/billing">Upgrade</s-link> to turn them on.
              </s-paragraph>
            </s-banner>
          )}
          <s-text-area
            name="registryPerks"
            label="Your perks"
            value={settings.registryPerks}
            rows={4}
            maxLength={PERKS_MAX_LENGTH}
            placeholder={"Free gift wrapping on every registry gift\nA free gift when your registry reaches $500"}
            details="If the after-event discount below is on, it's listed for you."
          />
        </s-section>

        <s-section heading="Appearance">
          <s-select
            name="language"
            label="Registry page language"
            value={settings.language}
            details="The language guests see on registry pages and in registry emails. The text you type, like registry names and product titles, is shown as entered."
          >
            {LOCALES.map((code) => (
              <s-option key={code} value={code}>
                {LOCALE_NAMES[code]}
              </s-option>
            ))}
          </s-select>
          <s-text-field
            name="buttonLabel"
            label="Button label"
            value={settings.buttonLabel}
            maxLength={40}
          />
          <s-text-field
            name="accentColor"
            label="Accent colour"
            value={settings.accentColor}
            details="Hex, e.g. #1a1a1a. Used for buttons on the registry page."
          />
        </s-section>

        <s-section heading="Your branding">
          {pro ? (
            <s-stack direction="block" gap="base">
              <s-paragraph>
                <s-text color="subdued">
                  Shown on every registry page, with the &quot;Powered by Giftpin&quot; credit removed.
                  Changes can take a minute to appear on pages guests already have open.
                </s-text>
              </s-paragraph>
              <s-url-field
                name="logoUrl"
                label="Logo image link"
                value={settings.logoUrl}
                details="An https:// link to your logo, e.g. from Content → Files in your Shopify admin. Shown at the top of the page, linking to your store."
              />
              <s-text-field
                name="backgroundColor"
                label="Page background colour"
                value={settings.backgroundColor}
                placeholder={DEFAULT_BACKGROUND}
                details="Hex, e.g. #fbf7f2. Leave empty for the default, which follows the guest's light or dark mode."
              />
              <s-text-field
                name="textColor"
                label="Text colour"
                value={settings.textColor}
                placeholder={DEFAULT_TEXT}
                details="Hex, e.g. #2b2b2b."
              />
              <s-select name="fontFamily" label="Font" value={settings.fontFamily}>
                {BRAND_FONTS.map((font) => (
                  <s-option key={font.value} value={font.value}>
                    {font.label}
                  </s-option>
                ))}
              </s-select>
              <s-paragraph>
                <s-text color="subdued">Fonts other than the first two load from Google Fonts.</s-text>
              </s-paragraph>
            </s-stack>
          ) : (
            <s-stack direction="block" gap="base">
              <s-paragraph>
                With Pro, registry pages use your logo, colours and font, and the &quot;Powered by
                Giftpin&quot; credit is removed.
              </s-paragraph>
              <s-button href="/app/billing">See Pro</s-button>
            </s-stack>
          )}
        </s-section>

        <s-section heading="Privacy">
          <s-checkbox
            name="hideBuyerUntilEvent"
            label="Hide who gave what until the event date"
            details="Registrants still see that something was bought, just not by whom."
            {...(settings.hideBuyerUntilEvent ? { checked: true } : {})}
          />
          <s-checkbox
            name="findARegistryEnabled"
            label="Enable the public find-a-registry page"
            details="Lets guests search by name. Only registries whose owners opt in are listed, and no personal details are ever shown. The Registry links theme block's “Find a gift registry” link opens this page."
            {...(settings.findARegistryEnabled ? { checked: true } : {})}
          />
        </s-section>

        <s-section heading="After the event (Pro)">
          {!pro && (
            <s-banner tone="info">
              <s-paragraph>
                These run on Giftpin Pro. <s-link href="/app/billing">Upgrade</s-link> to turn
                them on.
              </s-paragraph>
            </s-banner>
          )}
          <s-checkbox
            name="completionDiscountEnabled"
            label="Give registrants a discount on what's left on their list"
            details="A few days after the event, the registrant gets a one-time code for your products still on their registry. Nothing is created for items from other stores."
            {...(settings.completionDiscountEnabled ? { checked: true } : {})}
          />
          <s-number-field
            name="completionDiscountPercent"
            label="Discount (%)"
            value={String(settings.completionDiscountPercent)}
            min={COMPLETION_DISCOUNT_PERCENT_RANGE.min}
            max={COMPLETION_DISCOUNT_PERCENT_RANGE.max}
          />
          <s-number-field
            name="completionDiscountValidDays"
            label="Code works for (days)"
            value={String(settings.completionDiscountValidDays)}
            min={COMPLETION_DISCOUNT_DAYS_RANGE.min}
            max={COMPLETION_DISCOUNT_DAYS_RANGE.max}
          />
        </s-section>

        <s-section heading="Automatic emails (Pro)">
          <s-stack direction="block" gap="small-100">
            <s-checkbox
              name="guestEventReminderEmails"
              label="Remind guests two weeks before the event"
              details="Guests can ask for a reminder on the registry page. The registrant also gets a nudge to share their link again."
              {...(settings.guestEventReminderEmails ? { checked: true } : {})}
            />
            <s-checkbox
              name="mostGoneAlertEmails"
              label="Tell registrants when most of their list is bought"
              details="Sent once, when three quarters of the items are taken care of, so they can add more."
              {...(settings.mostGoneAlertEmails ? { checked: true } : {})}
            />
            <s-checkbox
              name="thankYouReminderEmails"
              label="Send registrants a thank-you note reminder"
              details="A few days after the event, with a list of who gave what."
              {...(settings.thankYouReminderEmails ? { checked: true } : {})}
            />
          </s-stack>
        </s-section>

        <s-section>
          <s-stack direction="inline" gap="base">
            <s-button type="submit" {...(saving ? { loading: true } : {})}>
              Save
            </s-button>
            {fetcher.data?.ok && <s-text>Saved</s-text>}
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
        <s-section heading="Group gifts and funds">
          <s-paragraph>
            Guests can chip in toward a big item or a cash fund, like a honeymoon, by buying one
            of your gift cards. Every chip-in is a sale in your store, and the gift card gets
            spent here.
          </s-paragraph>
          {!pro && (
            <s-banner tone="info">
              <s-paragraph>This is part of Giftpin Pro.</s-paragraph>
            </s-banner>
          )}
          <s-banner tone="warning">
            <s-paragraph>
              Shopify only emails a gift card once its order is fulfilled. In Settings &rarr; General
              &rarr; Order processing, choose &ldquo;Automatically fulfill only the gift cards&rdquo;
              (or fulfill everything automatically), or chip-in gift cards won&rsquo;t arrive until you
              fulfill each order yourself.
            </s-paragraph>
          </s-banner>
          {giftCards.length === 0 ? (
            <s-paragraph>
              <s-text color="subdued">
                First go to Products &rarr; Gift cards &rarr; Add a gift card product, with a few amounts such as
                $25, $50 and $100. Then come back here and pick it.
              </s-text>
            </s-paragraph>
          ) : (
            <s-select
              name="contributionProduct"
              label="Gift card guests chip in with"
              value={settings.contributionProduct?.productGid ?? ""}
            >
              <s-option value="">Off</s-option>
              {giftCards.map((card) => (
                <s-option key={card.productGid} value={card.productGid}>
                  {card.title} ({card.variants.map((v) => v.amount).join(", ")})
                </s-option>
              ))}
            </s-select>
          )}
          <s-heading>Sell gift cards on giftpin.app</s-heading>
          <s-paragraph>
            List your store at giftpin.app/gift-cards, and add a &ldquo;Buy a gift card&rdquo; link to your
            registry pages. Shoppers pick an amount and buy your gift card at your own checkout, so the money
            and any unspent balance stay with you. Uses the gift card above, in amounts up to{" "}
            {MAX_LISTED_GIFT_CARD}.
          </s-paragraph>
          <s-paragraph>
            <s-text color="subdued">
              Giftpin charges {GIFT_CARD_FEE_PERCENT}% of each gift card sold this way, on your Shopify bill, after a{" "}
              {GIFT_CARD_FEE_HOLD_DAYS}-day refund window. No fee during your free trial.
            </s-text>
          </s-paragraph>
          <s-checkbox
            name="giftCardListingEnabled"
            label="List my gift cards on giftpin.app"
            {...(settings.giftCardListing.enabled ? { checked: true } : {})}
          />
          <s-text-field
            name="giftCardBlurb"
            label="One line about your store"
            details="Shown under your store name on giftpin.app."
            maxLength={GIFT_CARD_BLURB_MAX}
            value={settings.giftCardListing.blurb}
          />
          {settings.giftCardListing.enabled && pro && (
            <s-paragraph>
              <s-text color="subdued">
                Your gift card page:{" "}
                <s-link href={`https://${shopDomain}/apps/registry/gift-card?cb=${cacheBust}`} target="_blank">
                  /apps/registry/gift-card
                </s-link>
              </s-text>
            </s-paragraph>
          )}
          <s-stack direction="inline" gap="base">
            <s-button type="submit" {...(giftFetcher.state !== "idle" ? { loading: true } : {})}>
              Save
            </s-button>
            {giftFetcher.data?.ok && <s-text>Saved</s-text>}
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
          <s-section heading="Run the after-event emails and discounts now">
            <s-paragraph>
              <s-text color="subdued">
                They run on their own once a day, along with gift card fees. This runs them now for your store,
                which is handy for checking your settings. Nothing is sent or charged twice.
              </s-text>
            </s-paragraph>
            <s-stack direction="inline" gap="base">
              <s-button type="submit" variant="secondary" {...(runFetcher.state !== "idle" ? { loading: true } : {})}>
                Run now
              </s-button>
              {runFetcher.data && "ran" in runFetcher.data && runFetcher.data.ran && (
                <s-text>Started. Emails and codes arrive within a minute.</s-text>
              )}
            </s-stack>
          </s-section>
        </runFetcher.Form>
      )}
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
