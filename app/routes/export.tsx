import type { LoaderFunctionArgs } from "react-router";
import db from "../db.server";
import { audit } from "../lib/audit.server";
import { csvResponse } from "../lib/csv";
import { isPro } from "../models/shop.server";
import { monthlySales } from "../models/analytics.server";
import {
  purchaseExportRows,
  purchasesCsv,
  readExportToken,
  registriesCsv,
  registryExportRows,
  salesCsv,
} from "../models/export.server";

/**
 * GET /export?t=<signed token> — Pro CSV downloads.
 *
 * Deliberately outside /app: the link is opened in a new tab, with no admin
 * session. The token (minted by the authenticated /app/registries and
 * /app/analytics loaders, 15 minutes) names the shop and the export, and
 * the plan is checked again here so a downgraded shop's leftover link stops
 * working. See app/models/export.server.ts.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const parsed = readExportToken(new URL(request.url).searchParams.get("t"));
  if (!parsed) {
    return new Response("This download link has expired. Go back to Giftpin in your Shopify admin and click the export button again.", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const shop = await db.shop.findUnique({ where: { id: parsed.shopId } });
  if (!shop || shop.uninstalledAt || !isPro(shop)) {
    return new Response("CSV export is part of Giftpin Pro.", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const date = new Date().toISOString().slice(0, 10);

  switch (parsed.kind) {
    case "registries": {
      const rows = await registryExportRows(shop.id);
      await audit({
        shop: shop.domain,
        actor: "merchant:export",
        action: "registrant_emails_exported",
        detail: { registries: rows.length },
      });
      return csvResponse(registriesCsv(rows), `giftpin-registries-${date}.csv`);
    }
    case "purchases": {
      const rows = await purchaseExportRows(shop.id);
      await audit({
        shop: shop.domain,
        actor: "merchant:export",
        action: "buyer_names_exported",
        detail: { purchases: rows.length },
      });
      return csvResponse(purchasesCsv(rows, shop.currency), `giftpin-purchases-${date}.csv`);
    }
    case "sales":
      return csvResponse(salesCsv(await monthlySales(shop.id), shop.currency), `giftpin-sales-${date}.csv`);
  }
};
