import { parseCsv } from "../lib/csv";
import { EVENT_TYPES } from "./settings";

/**
 * Registry import: a spreadsheet from another registry app (Gift Reggie and
 * the like) turned into registries to create. Pure, so it's easy to test and
 * the admin page can show what a file will do before anything is written.
 *
 * We have never seen a real Gift Reggie export, so nothing here assumes its
 * exact column names. Headers are matched loosely against common names (see
 * COLUMNS), and the admin page tells the merchant which columns it used and
 * which it couldn't find. One row per item; registry details repeat on each
 * row, and a row with no item just creates the registry.
 */

export const IMPORT_MAX_ROWS = 5000;

type Field =
  | "registryKey"
  | "title"
  | "eventType"
  | "eventDate"
  | "name"
  | "firstName"
  | "lastName"
  | "email"
  | "code"
  | "variantId"
  | "productTitle"
  | "wanted"
  | "purchased";

/** Header names each field answers to, compared lowercased with punctuation removed. */
const COLUMNS: Record<Field, string[]> = {
  registryKey: ["registry id", "registry number", "registry no", "list id", "registry code", "registry url", "registry link"],
  title: ["registry name", "registry title", "title", "event name", "list name", "registry"],
  eventType: ["event type", "occasion", "registry type", "type", "event"],
  eventDate: ["event date", "date", "registry date", "due date", "wedding date"],
  name: ["registrant", "registrant name", "name", "customer name", "full name", "owner", "owner name"],
  firstName: ["first name", "registrant first name", "firstname"],
  lastName: ["last name", "registrant last name", "lastname", "surname"],
  email: ["email", "registrant email", "customer email", "e mail", "email address", "owner email"],
  code: ["sku", "variant sku", "product sku", "barcode", "upc", "ean", "variant barcode", "item sku"],
  variantId: ["variant id", "variantid", "shopify variant id"],
  productTitle: ["product", "product title", "product name", "item", "item name", "item title", "variant title"],
  wanted: ["quantity", "qty", "desired", "wanted", "requested", "quantity wanted", "qty wanted", "quantity requested", "qty requested", "desired quantity"],
  purchased: ["purchased", "bought", "qty purchased", "quantity purchased", "purchased quantity", "fulfilled", "received", "qty bought"],
};

export const FIELD_LABELS: Record<Field, string> = {
  registryKey: "Registry ID",
  title: "Registry name",
  eventType: "Occasion",
  eventDate: "Event date",
  name: "Registrant name",
  firstName: "First name",
  lastName: "Last name",
  email: "Registrant email",
  code: "SKU or barcode",
  variantId: "Variant ID",
  productTitle: "Product name",
  wanted: "Quantity wanted",
  purchased: "Quantity bought",
};

export interface ImportItem {
  /** SKU/barcode, or "variant:<id>" for a Shopify variant id. */
  code: string;
  productTitle: string | null;
  wanted: number;
  purchased: number;
}

export interface ImportRegistry {
  key: string;
  title: string;
  eventType: string;
  eventDate: Date | null;
  registrantName: string;
  email: string;
  items: ImportItem[];
  /** First spreadsheet row (1-based, header = 1), for error messages. */
  row: number;
}

export interface ParsedImport {
  registries: ImportRegistry[];
  /** Field → the header it was read from. */
  columns: Partial<Record<Field, string>>;
  /** Row-level problems, e.g. no email. Those rows are skipped. */
  problems: string[];
  /** A problem with the whole file; nothing can be imported. */
  error: string | null;
}

function norm(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function mapColumns(headers: string[]): Partial<Record<Field, number>> {
  const normalized = headers.map(norm);
  const found: Partial<Record<Field, number>> = {};
  const used = new Set<number>();
  // Exact names first, in the order listed, so "registry name" beats "registry".
  for (const field of Object.keys(COLUMNS) as Field[]) {
    for (const name of COLUMNS[field]) {
      const index = normalized.findIndex((h, i) => h === name && !used.has(i));
      if (index >= 0) {
        found[field] = index;
        used.add(index);
        break;
      }
    }
  }
  return found;
}

export function eventTypeFrom(raw: string): string {
  const text = raw.toLowerCase();
  if (!text.trim()) return "other";
  const exact = EVENT_TYPES.find((t) => t.value === text.trim() || t.label.toLowerCase() === text.trim());
  if (exact) return exact.value;
  const rules: [RegExp, string][] = [
    [/bridal|shower.*(bride|wedding)/, "bridal-shower"],
    [/baby|shower|nursery|sprinkle/, "baby"],
    [/wedding|marriage|bride|groom/, "wedding"],
    [/engage/, "engagement"],
    [/baptism|christening/, "christening"],
    [/birthday/, "birthday"],
    [/mitzvah|quince|sweet 16|sweet sixteen/, "coming-of-age"],
    [/graduat/, "graduation"],
    [/college|university|dorm/, "college"],
    [/house|home/, "housewarming"],
    [/anniversary/, "anniversary"],
    [/retire/, "retirement"],
    [/christmas|holiday/, "holiday"],
    [/pet|puppy|kitten/, "new-pet"],
    [/charity|fundrais/, "fundraiser"],
    [/corporate|business|office/, "corporate"],
  ];
  return rules.find(([re]) => re.test(text))?.[1] ?? "other";
}

/**
 * Dates as registry apps tend to write them: 2026-05-30, 5/30/2026 (North
 * American month first, as Shopify's US and Canadian admins show it), or
 * "May 30, 2026". Anything else is left empty rather than guessed.
 */
export function dateFrom(raw: string): Date | null {
  const text = raw.trim();
  if (!text) return null;
  let m = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return utcDate(+m[1], +m[2], +m[3]);
  m = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (m) return utcDate(+m[3], +m[1], +m[2]);
  m = text.match(/^([A-Za-z]{3,9})\.? (\d{1,2}),? (\d{4})$/);
  if (m) {
    const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(
      m[1].slice(0, 3).toLowerCase(),
    );
    if (month >= 0) return utcDate(+m[3], month + 1, +m[2]);
  }
  return null;
}

function utcDate(y: number, mo: number, d: number): Date | null {
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 1990 || y > 2100) return null;
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCMonth() === mo - 1 ? date : null;
}

function qty(raw: string | undefined, fallback: number): number {
  const n = Math.floor(Number(String(raw ?? "").replace(/[^0-9.-]/g, "")));
  if (!Number.isFinite(n) || String(raw ?? "").trim() === "") return fallback;
  return Math.min(99, Math.max(0, n));
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function parseImport(text: string): ParsedImport {
  const empty = { registries: [], columns: {}, problems: [] };
  const rows = parseCsv(text);
  if (rows.length < 2) return { ...empty, error: "The file has no rows under the header." };
  if (rows.length - 1 > IMPORT_MAX_ROWS) {
    return { ...empty, error: `The file has ${rows.length - 1} rows. Split it into files of ${IMPORT_MAX_ROWS} rows or fewer.` };
  }

  const headers = rows[0];
  const index = mapColumns(headers);
  const columns = Object.fromEntries(
    Object.entries(index).map(([field, i]) => [field, headers[i as number].trim()]),
  ) as Partial<Record<Field, string>>;

  if (index.email === undefined) {
    return { ...empty, columns, error: "We couldn't find an email column. Registrants need an email to get into their registry." };
  }

  const cell = (row: string[], field: Field) => {
    const i = index[field];
    return i === undefined ? "" : (row[i] ?? "").trim();
  };

  const byKey = new Map<string, ImportRegistry>();
  const problems: string[] = [];

  rows.slice(1).forEach((row, i) => {
    const line = i + 2;
    const email = cell(row, "email").toLowerCase();
    if (!EMAIL.test(email)) {
      problems.push(`Row ${line}: no valid email, skipped.`);
      return;
    }
    const name =
      cell(row, "name") || [cell(row, "firstName"), cell(row, "lastName")].filter(Boolean).join(" ") || email.split("@")[0];
    const title = cell(row, "title") || `${name.split(" ")[0]}'s registry`;
    const key = cell(row, "registryKey") ? `id:${cell(row, "registryKey")}` : `${email}|${title.toLowerCase()}`;

    let registry = byKey.get(key);
    if (!registry) {
      registry = {
        key,
        title: title.slice(0, 200),
        eventType: eventTypeFrom(cell(row, "eventType") || title),
        eventDate: dateFrom(cell(row, "eventDate")),
        registrantName: name.slice(0, 120),
        email,
        items: [],
        row: line,
      };
      byKey.set(key, registry);
    }

    const variantId = cell(row, "variantId").replace(/^gid:\/\/shopify\/ProductVariant\//, "");
    const code = /^\d+$/.test(variantId) ? `variant:${variantId}` : cell(row, "code");
    if (!code) return;

    const wanted = qty(row[index.wanted ?? -1], 1);
    const purchased = qty(row[index.purchased ?? -1], 0);
    const existing = registry.items.find((it) => it.code === code);
    if (existing) {
      existing.wanted = Math.min(99, existing.wanted + wanted);
      existing.purchased = Math.min(99, existing.purchased + purchased);
    } else {
      registry.items.push({ code, productTitle: cell(row, "productTitle") || null, wanted, purchased });
    }
  });

  return { registries: [...byKey.values()], columns, problems, error: null };
}

/** Registries whose event is long past aren't worth bringing across, by default. */
export function isRecent(registry: Pick<ImportRegistry, "eventDate">, now = new Date()): boolean {
  if (!registry.eventDate) return true;
  const yearAgo = new Date(now);
  yearAgo.setUTCFullYear(yearAgo.getUTCFullYear() - 1);
  return registry.eventDate >= yearAgo;
}
