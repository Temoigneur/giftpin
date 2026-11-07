import { useState } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { requireShop, settingsFor } from "../models/shop.server";
import { previewImport, runImport } from "../models/import.server";
import { FIELD_LABELS, IMPORT_MAX_ROWS } from "../shared/registry-import";
import { t as translate } from "../shared/i18n";
import { adminLocale } from "../lib/admin-locale.server";
import { useAdminT } from "../lib/use-admin-t";

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
  const locale = adminLocale(request, settingsFor(shop).language);
  const csv = String(form.get("csv") ?? "");
  if (!csv.trim()) return { kind: "error" as const, message: translate("admin.imp.errChoose", undefined, locale) };
  if (csv.length > MAX_BYTES) return { kind: "error" as const, message: translate("admin.imp.errBig", undefined, locale) };

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
    return { kind: "error" as const, message: translate("admin.imp.errShopify", undefined, locale) };
  }
};

export default function ImportRegistries() {
  const t = useAdminT();
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
    <s-page heading={t("admin.imp.page")}>
      <s-link slot="breadcrumb-actions" href="/app/registries">
        {t("admin.nav.registries")}
      </s-link>

      <s-section heading={t("admin.imp.head")}>
        <s-paragraph>{t("admin.imp.intro")}</s-paragraph>
        <s-paragraph>
          <s-text color="subdued">{t("admin.imp.cols", { max: IMPORT_MAX_ROWS })}</s-text>
        </s-paragraph>

        <input
          type="file"
          accept=".csv,text/csv"
          aria-label={t("admin.imp.fileLabel")}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (!file) return;
            setFileName(file.name);
            file.text().then(setCsv);
          }}
        />

        <s-checkbox
          label={t("admin.imp.recentOnly")}
          {...(recentOnly ? { checked: true } : {})}
          onChange={(event) => setRecentOnly(event.currentTarget.checked)}
        />
        <s-checkbox
          label={t("admin.imp.email")}
          details={t("admin.imp.emailDetails")}
          {...(emailRegistrants ? { checked: true } : {})}
          onChange={(event) => setEmailRegistrants(event.currentTarget.checked)}
        />

        <s-stack direction="inline" gap="base">
          <s-button
            onClick={() => submit("preview")}
            {...(!csv ? { disabled: true } : {})}
            {...(busy ? { loading: true } : {})}
          >
            {t("admin.imp.check", { file: fileName || t("admin.imp.fileWord") })}
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
        <s-section heading={data.kind === "done" ? t("admin.imp.done") : t("admin.imp.preview")}>
          {data.error ? (
            <s-banner tone="critical">
              <s-paragraph>{data.error}</s-paragraph>
            </s-banner>
          ) : (
            <s-stack direction="block" gap="base">
              {data.kind === "done" ? (
                <s-banner tone="success">
                  <s-paragraph>
                    {t("admin.imp.created", { registries: t.n("admin.imp.reg", data.created), items: t.n("admin.imp.item", data.items) })}
                    {data.emailed ? ` ${t("admin.imp.emailed", { n: data.emailed })}` : ""}
                  </s-paragraph>
                </s-banner>
              ) : (
                <s-paragraph>
                  {t("admin.imp.previewLine", { registries: t.n("admin.imp.reg", data.registries), items: t.n("admin.imp.item", data.items) })}
                </s-paragraph>
              )}
              {data.skippedExisting > 0 && (
                <s-paragraph>{t("admin.imp.skipExisting", { n: data.skippedExisting })}</s-paragraph>
              )}
              {data.skippedOld > 0 && (
                <s-paragraph>{t("admin.imp.skipOld", { n: data.skippedOld })}</s-paragraph>
              )}
              <s-paragraph>
                <s-text color="subdued">
                  {t("admin.imp.colsUsed", {
                    list: Object.entries(data.columns)
                      .map(([field, header]) => `${FIELD_LABELS[field as keyof typeof FIELD_LABELS]} ← “${header}”`)
                      .join(", "),
                  })}
                </s-text>
              </s-paragraph>
              {data.unmatched.length > 0 && (
                <s-banner tone="warning">
                  <s-paragraph>
                    {t.n(data.kind === "done" ? "admin.imp.unmatchedDone" : "admin.imp.unmatchedPreview", data.unmatched.length)}
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
                    {t("admin.imp.importN", { registries: t.n("admin.imp.reg", data.registries) })}
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
