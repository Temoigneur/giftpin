import { useState } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { isPro, requireShop, settingsFor, updateSettings } from "../models/shop.server";
import { EVENT_TYPES } from "../shared/settings";
import {
  BRAND_FONTS,
  DEFAULT_BACKGROUND,
  DEFAULT_TEXT,
  brandFont,
  cleanHexColor,
  cleanLogoUrl,
  contrastRatio,
} from "../shared/branding";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await requireShop(session.shop);
  return {
    settings: settingsFor(shop),
    pro: isPro(shop),
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
  const { session } = await authenticate.admin(request);
  const shop = await requireShop(session.shop);
  const form = await request.formData();

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
    accentColor: /^#[0-9a-fA-F]{6}$/.test(String(form.get("accentColor")))
      ? String(form.get("accentColor"))
      : "#1a1a1a",
    buttonLabel: String(form.get("buttonLabel") ?? "Add to registry").slice(0, 40),
    findARegistryEnabled: form.get("findARegistryEnabled") === "on",
    hideBuyerUntilEvent: form.get("hideBuyerUntilEvent") === "on",
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

export default function Settings() {
  const { settings, pro } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [externalItems, setExternalItems] = useState(settings.externalItems);

  const saving = fetcher.state !== "idle";

  return (
    <s-page heading="Settings">
      <fetcher.Form method="post">
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
              tell us, so nobody buys the same gift twice. We never earn a commission on those
              clicks.
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

        <s-section heading="Appearance">
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
            details="Lets guests search by name. Only registries whose owners opt in are listed, and no personal details are ever shown."
            {...(settings.findARegistryEnabled ? { checked: true } : {})}
          />
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

    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
