import db from "../db.server";
import { signToken, tryDecrypt, verifyToken } from "../lib/crypto.server";
import { toCsv } from "../lib/csv";
import { eventTypeLabel } from "../shared/settings";
import type { MonthlySales } from "./analytics.server";

/**
 * Pro CSV exports: registries (with registrant contact details, for
 * mail-outs), purchases (for accounting) and the monthly sales report.
 *
 * Downloads go through a short-lived signed link rather than an authenticated
 * admin request. The admin runs inside Shopify's iframe, where a plain link
 * has no session token and a fetch-then-blob download depends on the iframe's
 * sandbox allowing downloads. A link minted by the (authenticated) admin
 * loader and opened in a new tab works either way. See app/routes/export.tsx.
 *
 * The merchant is the controller of this data (privacy policy §09), so
 * handing it to them is fine, but each export that includes personal data is
 * written to the audit log.
 */

export const EXPORT_KINDS = ["registries", "purchases", "sales"] as const;
export type ExportKind = (typeof EXPORT_KINDS)[number];

const PURPOSE = "admin-export";
/** Long enough to click after the page loads, short enough that a leaked link dies quickly. */
export const EXPORT_LINK_TTL_SECONDS = 15 * 60;

export function isExportKind(value: unknown): value is ExportKind {
  return (EXPORT_KINDS as readonly unknown[]).includes(value);
}

export function mintExportToken(shopId: string, kind: ExportKind): string {
  return signToken({ p: PURPOSE, s: shopId, k: kind }, EXPORT_LINK_TTL_SECONDS);
}

export function readExportToken(token: string | null): { shopId: string; kind: ExportKind } | null {
  const payload = verifyToken<{ p: string; s?: unknown; k?: unknown }>(token, PURPOSE);
  if (!payload || typeof payload.s !== "string" || !isExportKind(payload.k)) return null;
  return { shopId: payload.s, kind: payload.k };
}

const day = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : "");
const money = (n: number) => n.toFixed(2);

// ---------------------------------------------------------------------------
// Registries
// ---------------------------------------------------------------------------

export interface RegistryExportRow {
  id: string;
  slug: string;
  title: string;
  eventType: string;
  eventDate: Date | null;
  status: string;
  privacy: string;
  createdAt: Date;
  registrants: { name: string; email: string | null; role: string }[];
  items: { desiredQty: number; purchasedQty: number }[];
}

export function registriesCsv(rows: RegistryExportRow[]): string {
  const out: (string | number)[][] = [
    [
      "Registry ID",
      "Title",
      "Occasion",
      "Event date",
      "Status",
      "Privacy",
      "Created",
      "Registrant names",
      "Registrant emails",
      "Items",
      "Items fully bought",
      "Registry link path",
    ],
  ];
  for (const r of rows) {
    out.push([
      r.id,
      r.title,
      eventTypeLabel(r.eventType),
      day(r.eventDate),
      r.status,
      r.privacy === "public_" ? "public" : r.privacy,
      day(r.createdAt),
      r.registrants.map((p) => p.name).join("; "),
      r.registrants.map((p) => p.email ?? "").filter(Boolean).join("; "),
      r.items.length,
      r.items.filter((i) => i.purchasedQty >= i.desiredQty).length,
      `/r/${r.slug}`,
    ]);
  }
  return toCsv(out);
}

export async function registryExportRows(shopId: string): Promise<RegistryExportRow[]> {
  const registries = await db.registry.findMany({
    where: { shopId, status: { not: "deleted" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      eventType: true,
      eventDate: true,
      status: true,
      privacy: true,
      createdAt: true,
      registrants: { select: { name: true, emailEnc: true, role: true }, orderBy: { createdAt: "asc" } },
      items: { select: { desiredQty: true, purchasedQty: true } },
    },
  });
  return registries.map(({ registrants, ...r }) => ({
    ...r,
    registrants: registrants.map((p) => ({ name: p.name, role: p.role, email: tryDecrypt(p.emailEnc) })),
  }));
}

// ---------------------------------------------------------------------------
// Purchases
// ---------------------------------------------------------------------------

const SOURCE_LABELS: Record<string, string> = {
  online: "Your store (online)",
  pos: "Your store (POS)",
  external: "Another store (guest confirmed)",
  manual: "Marked by registrant",
};

export interface PurchaseExportRow {
  createdAt: Date;
  source: string;
  orderName: string | null;
  orderId: string | null;
  qty: number;
  amount: unknown;
  currency: string | null;
  buyerName: string | null;
  isNewCustomer: boolean;
  shippedToRegistrant: boolean;
  voidedAt: Date | null;
  item: { snapshotTitle: string | null; registry: { id: string; title: string } };
}

export function purchasesCsv(rows: PurchaseExportRow[], shopCurrency: string): string {
  const out: (string | number)[][] = [
    [
      "Date",
      "Registry ID",
      "Registry",
      "Gift",
      "Bought at",
      "Order",
      "Order ID",
      "Quantity",
      "Amount",
      "Currency",
      "Buyer name",
      "New customer",
      "Shipped to registrant",
      "Refunded or cancelled",
    ],
  ];
  for (const p of rows) {
    const amount = p.amount === null || p.amount === undefined ? null : Number(p.amount);
    out.push([
      day(p.createdAt),
      p.item.registry.id,
      p.item.registry.title,
      p.item.snapshotTitle ?? "",
      SOURCE_LABELS[p.source] ?? p.source,
      p.orderName ?? "",
      p.orderId ?? "",
      p.qty,
      amount !== null && Number.isFinite(amount) ? money(amount) : "",
      amount !== null ? (p.currency ?? shopCurrency) : "",
      p.buyerName ?? "",
      p.isNewCustomer ? "yes" : "no",
      p.shippedToRegistrant ? "yes" : "no",
      p.voidedAt ? day(p.voidedAt) : "",
    ]);
  }
  return toCsv(out);
}

export async function purchaseExportRows(shopId: string): Promise<PurchaseExportRow[]> {
  return db.purchase.findMany({
    where: { item: { registry: { shopId } } },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      source: true,
      orderName: true,
      orderId: true,
      qty: true,
      amount: true,
      currency: true,
      buyerName: true,
      isNewCustomer: true,
      shippedToRegistrant: true,
      voidedAt: true,
      item: { select: { snapshotTitle: true, registry: { select: { id: true, title: true } } } },
    },
  });
}

// ---------------------------------------------------------------------------
// Monthly sales report
// ---------------------------------------------------------------------------

export function salesCsv(months: MonthlySales[], currency: string): string {
  const out: (string | number)[][] = [
    ["Month", `Registry revenue (${currency})`, "Orders", "New customers", `Average registry order (${currency})`],
  ];
  for (const m of months) {
    out.push([m.month.slice(0, 7), money(m.revenue), m.orders, m.newCustomers, money(m.averageOrder)]);
  }
  return toCsv(out);
}

/** Absolute download link for the admin to open in a new tab. */
export function exportUrl(shopId: string, kind: ExportKind): string {
  const base = (process.env.SHOPIFY_APP_URL ?? "").replace(/\/+$/, "");
  return `${base}/export?t=${encodeURIComponent(mintExportToken(shopId, kind))}`;
}
