import { useState } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { isPro, requireShop, settingsFor, updateSettings } from "../models/shop.server";
import {
  EVENT_TYPES,
  COMPLETION_DISCOUNT_PERCENT_RANGE,
  COMPLETION_DISCOUNT_DAYS_RANGE,
} from "../shared/settings";

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
  });

  return { ok: true };
};

function clamp(value: FormDataEntryValue | null, min: number, max: number, fallback: number): number {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || value === null || value === "") return fallback;
  return Math.min(max, Math.max(min, n));
}

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
        </s-section>
      </fetcher.Form>

    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
