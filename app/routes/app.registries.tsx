import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useSearchParams } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { requireShop } from "../models/shop.server";
import { eventTypeLabel } from "../shared/settings";
import { listRegistries } from "../models/dashboard.server";

const PAGE_SIZE = 25;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await requireShop(session.shop);

  const page = Math.max(0, Number(new URL(request.url).searchParams.get("page") ?? 0));
  const { registries, total } = await listRegistries(shop.id, page, PAGE_SIZE);

  return { registries, total, page, shopDomain: session.shop };
};

export default function Registries() {
  const { registries, total, page, shopDomain } = useLoaderData<typeof loader>();
  const [, setSearchParams] = useSearchParams();

  const lastPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  return (
    <s-page heading="Registries">
      <s-section>
        {registries.length === 0 ? (
          <s-paragraph>No registries yet.</s-paragraph>
        ) : (
          <s-table>
            <s-table-header-row>
              <s-table-header>Registry</s-table-header>
              <s-table-header>Occasion</s-table-header>
              <s-table-header>Date</s-table-header>
              <s-table-header>Items</s-table-header>
              <s-table-header>Progress</s-table-header>
              <s-table-header></s-table-header>
            </s-table-header-row>
            <s-table-body>
              {registries.map((registry) => (
                <s-table-row key={registry.id}>
                  <s-table-cell>
                    <s-stack direction="block" gap="small-500">
                      <s-text>{registry.title}</s-text>
                      <s-text color="subdued">{registry.names}</s-text>
                    </s-stack>
                  </s-table-cell>
                  <s-table-cell>{eventTypeLabel(registry.eventType)}</s-table-cell>
                  <s-table-cell>
                    {registry.eventDate
                      ? new Date(registry.eventDate).toLocaleDateString("en-CA", { timeZone: "UTC" })
                      : "—"}
                  </s-table-cell>
                  <s-table-cell>
                    {/*
                      Showing the split per registry, not just in aggregate, is
                      what lets a merchant spot "this couple wants six things I
                      don't stock" and do something about it.
                    */}
                    {registry.internalCount} yours
                    {registry.itemCount > registry.internalCount
                      ? ` · ${registry.itemCount - registry.internalCount} elsewhere`
                      : ""}
                  </s-table-cell>
                  <s-table-cell>
                    {registry.bought}/{registry.wanted} ({registry.percentComplete}%)
                  </s-table-cell>
                  <s-table-cell>
                    <s-link
                      href={`https://${shopDomain}/apps/registry/r/${registry.slug}`}
                      target="_blank"
                    >
                      View
                    </s-link>
                  </s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        )}
      </s-section>

      {lastPage > 0 && (
        <s-section>
          <s-stack direction="inline" gap="base">
            <s-button
              variant="secondary"
              {...(page === 0 ? { disabled: true } : {})}
              onClick={() => setSearchParams({ page: String(page - 1) })}
            >
              Previous
            </s-button>
            <s-text>
              Page {page + 1} of {lastPage + 1}
            </s-text>
            <s-button
              variant="secondary"
              {...(page >= lastPage ? { disabled: true } : {})}
              onClick={() => setSearchParams({ page: String(page + 1) })}
            >
              Next
            </s-button>
          </s-stack>
        </s-section>
      )}
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
