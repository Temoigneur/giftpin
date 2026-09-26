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
import { EVENT_TYPES, eventTypeLabel } from "../shared/settings";

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
  if (!isPro(shop)) return { ok: false as const, error: "In-store mode is part of Giftpin Pro." };

  const form = await request.formData();
  return createRegistryInStore(shop, Object.fromEntries(form), "admin");
};

function money(amount: number, currency: string | null): string {
  if (!currency) return amount.toFixed(2);
  return new Intl.NumberFormat("en-CA", { style: "currency", currency }).format(amount);
}

export default function InStore() {
  const data = useLoaderData<typeof loader>();
  const create = useFetcher<typeof action>();
  const navigation = useNavigation();

  if (data.locked) {
    return (
      <s-page heading="In-store">
        <s-section heading="In-store registry mode is part of Pro">
          <s-paragraph>
            Let your staff find a customer&apos;s registry, or start one for them, right at the counter
            from Shopify POS or from here. Items rung up in store count toward the registry.
          </s-paragraph>
          <s-button href="/app/billing">See Pro</s-button>
        </s-section>
      </s-page>
    );
  }

  const { q, results, registry } = data;
  const searching = navigation.state === "loading";
  const created = create.data;

  return (
    <s-page heading="In-store">
      <s-section heading="Find a registry">
        <Form method="get">
          <s-stack direction="inline" gap="base" alignItems="end">
            <s-search-field
              name="q"
              label="Name, email or registry link"
              labelAccessibilityVisibility="exclusive"
              placeholder="Name, email or registry link"
              value={q}
            />
            <s-button type="submit" {...(searching ? { loading: true } : {})}>
              Search
            </s-button>
          </s-stack>
        </Form>

        {q && results.length === 0 && (
          <s-paragraph>
            <s-text color="subdued">No registries match &ldquo;{q}&rdquo;.</s-text>
          </s-paragraph>
        )}

        {results.length > 0 && (
          <s-table>
            <s-table-header-row>
              <s-table-header>Registry</s-table-header>
              <s-table-header>Occasion</s-table-header>
              <s-table-header>Date</s-table-header>
              <s-table-header>Still wanted</s-table-header>
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
                  <s-table-cell>{eventTypeLabel(r.eventType)}</s-table-cell>
                  <s-table-cell>{r.eventDate ?? "—"}</s-table-cell>
                  <s-table-cell>
                    {r.itemsLeft} {r.itemsLeft === 1 ? "item" : "items"}
                  </s-table-cell>
                  <s-table-cell>
                    <s-link href={`/app/in-store?${new URLSearchParams({ q, id: r.id })}`}>Open</s-link>
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
            {registry.names} &middot; {eventTypeLabel(registry.eventType)}
            {registry.eventDate ? ` · ${registry.eventDate}` : ""}
          </s-paragraph>
          <s-paragraph>
            <s-link href={registry.publicUrl} target="_blank">
              Open the guest page
            </s-link>
          </s-paragraph>

          {registry.items.length === 0 ? (
            <s-paragraph>Nothing on this registry yet.</s-paragraph>
          ) : (
            <s-table>
              <s-table-header-row>
                <s-table-header>Item</s-table-header>
                <s-table-header>Price</s-table-header>
                <s-table-header>Still wanted</s-table-header>
                <s-table-header>Where</s-table-header>
              </s-table-header-row>
              <s-table-body>
                {registry.items.map((item) => (
                  <s-table-row key={item.id}>
                    <s-table-cell>{item.title}</s-table-cell>
                    <s-table-cell>{money(item.price, item.currency)}</s-table-cell>
                    <s-table-cell>
                      {item.remainingQty > 0 ? (
                        `${item.remainingQty} of ${item.desiredQty}`
                      ) : item.claimedQty > 0 ? (
                        <s-badge tone="warning">Someone may be buying this</s-badge>
                      ) : (
                        <s-badge tone="success">Bought</s-badge>
                      )}
                    </s-table-cell>
                    <s-table-cell>
                      {item.externalDomain ? item.externalDomain : "Your store"}
                    </s-table-cell>
                  </s-table-row>
                ))}
              </s-table-body>
            </s-table>
          )}
          <s-paragraph>
            <s-text color="subdued">
              To ring up an item so it counts toward this registry, use the Giftpin tile in Shopify POS.
            </s-text>
          </s-paragraph>
        </s-section>
      )}

      <s-section heading="Start a registry for a customer">
        <s-paragraph>
          <s-text color="subdued">
            We email the customer their private link to manage the registry, the same as signing up online.
          </s-text>
        </s-paragraph>
        <create.Form method="post">
          <s-stack direction="block" gap="base">
            <s-text-field name="registrantName" label="Customer's name" required />
            <s-email-field name="registrantEmail" label="Customer's email" required />
            <s-text-field name="title" label="Registry name" placeholder="Sam & Alex's wedding" required />
            <s-select name="eventType" label="Occasion">
              {EVENT_TYPES.map((type) => (
                <s-option key={type.value} value={type.value}>
                  {type.label}
                </s-option>
              ))}
            </s-select>
            <s-date-field name="eventDate" label="Event date" />
            <s-button type="submit" variant="primary" {...(create.state !== "idle" ? { loading: true } : {})}>
              Create registry
            </s-button>
            {created && !created.ok && <s-banner tone="critical">{created.error}</s-banner>}
            {created?.ok && (
              <s-banner tone="success" heading={`${created.title} is ready`}>
                <s-paragraph>
                  The customer&apos;s link is on its way by email.{" "}
                  <s-link href={created.publicUrl} target="_blank">
                    Open the guest page
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
