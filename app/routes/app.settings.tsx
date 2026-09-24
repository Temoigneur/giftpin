import { useState } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { isPro, requireShop, settingsFor, updateSettings } from "../models/shop.server";
import { listGiftCardProducts } from "../lib/contribution-product.server";
import { EVENT_TYPES } from "../shared/settings";

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
  const form = await request.formData();

  // Separate form so saving it can't clobber (or be clobbered by) the rest.
  if (form.get("intent") === "contributions") {
    const productGid = String(form.get("contributionProduct") ?? "");
    // Re-read from Shopify rather than trusting posted amounts: these are the
    // denominations guests will be charged.
    const picked = productGid
      ? (await listGiftCardProducts((q, o) => admin.graphql(q, o))).find((p) => p.productGid === productGid) ?? null
      : null;
    await updateSettings(session.shop, { contributionProduct: picked });
    return { ok: true };
  }

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
  });

  return { ok: true };
};

export default function Settings() {
  const { settings, pro, giftCards } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const giftFetcher = useFetcher<typeof action>();
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
          {giftCards.length === 0 ? (
            <s-paragraph>
              <s-text color="subdued">
                First create a gift card in Products &rarr; Gift cards, with a few amounts such as
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
          <s-stack direction="inline" gap="base">
            <s-button type="submit" {...(giftFetcher.state !== "idle" ? { loading: true } : {})}>
              Save
            </s-button>
            {giftFetcher.data?.ok && <s-text>Saved</s-text>}
          </s-stack>
        </s-section>
      </giftFetcher.Form>

    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
