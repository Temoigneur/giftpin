import { useState } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { requireShop, settingsFor, updateSettings } from "../models/shop.server";
import { EVENT_TYPES } from "../shared/settings";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await requireShop(session.shop);
  return {
    settings: settingsFor(shop),
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
  const form = await request.formData();

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
  const { settings } = useLoaderData<typeof loader>();
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

    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
