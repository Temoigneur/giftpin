import { useState } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { requireShop } from "../models/shop.server";
import { previewImport, runImport } from "../models/import.server";
import { FIELD_LABELS, IMPORT_MAX_ROWS } from "../shared/registry-import";

/** CSVs bigger than this are refused before parsing; IMPORT_MAX_ROWS rows fit well under it. */
const MAX_BYTES = 4 * 1024 * 1024;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await requireShop(session.shop);
  const form = await request.formData();
  const csv = String(form.get("csv") ?? "");
  if (!csv.trim()) return { kind: "error" as const, message: "Choose a CSV file first." };
  if (csv.length > MAX_BYTES) return { kind: "error" as const, message: "That file is too big. Split it into smaller files." };

  const options = {
    recentOnly: form.get("recentOnly") === "on",
    emailRegistrants: form.get("emailRegistrants") === "on",
  };
  try {
    if (form.get("intent") === "import") {
      return { kind: "done" as const, ...(await runImport(shop, csv, options)) };
    }
    return { kind: "preview" as const, ...(await previewImport(shop, csv, options)) };
  } catch (err) {
    console.error("[import]", err);
    return { kind: "error" as const, message: "Something went wrong reading your products from Shopify. Try again in a moment." };
  }
};

export default function ImportRegistries() {
  const fetcher = useFetcher<typeof action>();
  const [csv, setCsv] = useState("");
  const [fileName, setFileName] = useState("");
  const [recentOnly, setRecentOnly] = useState(true);
  const [emailRegistrants, setEmailRegistrants] = useState(false);
  const busy = fetcher.state !== "idle";
  const data = fetcher.data;

  const submit = (intent: "preview" | "import") =>
    fetcher.submit(
      { intent, csv, ...(recentOnly ? { recentOnly: "on" } : {}), ...(emailRegistrants ? { emailRegistrants: "on" } : {}) },
      { method: "post" },
    );

  return (
    <s-page heading="Import registries">
      <s-link slot="breadcrumb-actions" href="/app/registries">
        Registries
      </s-link>

      <s-section heading="Bring registries from another app">
        <s-paragraph>
          Export your registries from your old registry app as a CSV, with one row per item. Giftpin
          matches each item to your products by SKU or barcode, and keeps what&apos;s already been
          bought so nobody gives the same gift twice.
        </s-paragraph>
        <s-paragraph>
          <s-text color="subdued">
            Columns we look for: registry name, occasion, event date, registrant name, registrant email
            (required), SKU or barcode, quantity wanted and quantity bought. Column names don&apos;t have to
            match exactly. Up to {IMPORT_MAX_ROWS} rows per file.
          </s-text>
        </s-paragraph>

        <input
          type="file"
          accept=".csv,text/csv"
          aria-label="CSV file"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (!file) return;
            setFileName(file.name);
            file.text().then(setCsv);
          }}
        />

        <s-checkbox
          label="Skip registries whose event was more than a year ago"
          {...(recentOnly ? { checked: true } : {})}
          onChange={(event) => setRecentOnly(event.currentTarget.checked)}
        />
        <s-checkbox
          label="Email each registrant a private link to their registry"
          details="Only if your customers expect to hear from you about the move. Without this, they can get their link any time from “Email me my link” on the registry pages."
          {...(emailRegistrants ? { checked: true } : {})}
          onChange={(event) => setEmailRegistrants(event.currentTarget.checked)}
        />

        <s-stack direction="inline" gap="base">
          <s-button
            onClick={() => submit("preview")}
            {...(!csv ? { disabled: true } : {})}
            {...(busy ? { loading: true } : {})}
          >
            Check {fileName || "file"}
          </s-button>
        </s-stack>
      </s-section>

      {data?.kind === "error" && (
        <s-section>
          <s-banner tone="critical">
            <s-paragraph>{data.message}</s-paragraph>
          </s-banner>
        </s-section>
      )}

      {(data?.kind === "preview" || data?.kind === "done") && (
        <s-section heading={data.kind === "done" ? "Imported" : "What this file will do"}>
          {data.error ? (
            <s-banner tone="critical">
              <s-paragraph>{data.error}</s-paragraph>
            </s-banner>
          ) : (
            <s-stack direction="block" gap="base">
              {data.kind === "done" ? (
                <s-banner tone="success">
                  <s-paragraph>
                    Created {data.created} {data.created === 1 ? "registry" : "registries"} with {data.items}{" "}
                    {data.items === 1 ? "item" : "items"}.
                    {data.emailed ? ` Emailed ${data.emailed} registrants their link.` : ""}
                  </s-paragraph>
                </s-banner>
              ) : (
                <s-paragraph>
                  {data.registries} {data.registries === 1 ? "registry" : "registries"} with {data.items} matched{" "}
                  {data.items === 1 ? "item" : "items"}.
                </s-paragraph>
              )}
              {data.skippedExisting > 0 && (
                <s-paragraph>
                  {data.skippedExisting} already in Giftpin (same email and registry name), so they&apos;re skipped.
                </s-paragraph>
              )}
              {data.skippedOld > 0 && (
                <s-paragraph>{data.skippedOld} with an event more than a year ago are skipped.</s-paragraph>
              )}
              <s-paragraph>
                <s-text color="subdued">
                  Columns used:{" "}
                  {Object.entries(data.columns)
                    .map(([field, header]) => `${FIELD_LABELS[field as keyof typeof FIELD_LABELS]} ← “${header}”`)
                    .join(", ")}
                </s-text>
              </s-paragraph>
              {data.unmatched.length > 0 && (
                <s-banner tone="warning">
                  <s-paragraph>
                    {data.unmatched.length} {data.unmatched.length === 1 ? "item doesn't" : "items don't"} match a
                    product in your store by SKU or barcode{data.kind === "done" ? " and weren't added" : " and won't be added"}:
                  </s-paragraph>
                  <s-unordered-list>
                    {data.unmatched.slice(0, 20).map((u, i) => (
                      <s-list-item key={i}>
                        {u.registry}: {u.productTitle ? `${u.productTitle} ` : ""}({u.code})
                      </s-list-item>
                    ))}
                  </s-unordered-list>
                </s-banner>
              )}
              {data.problems.length > 0 && (
                <s-banner tone="warning">
                  <s-unordered-list>
                    {data.problems.slice(0, 10).map((p) => (
                      <s-list-item key={p}>{p}</s-list-item>
                    ))}
                  </s-unordered-list>
                </s-banner>
              )}
              {data.kind === "preview" && data.registries > 0 && (
                <s-stack direction="inline" gap="base">
                  <s-button variant="primary" onClick={() => submit("import")} {...(busy ? { loading: true } : {})}>
                    Import {data.registries} {data.registries === 1 ? "registry" : "registries"}
                  </s-button>
                </s-stack>
              )}
            </s-stack>
          )}
        </s-section>
      )}
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
