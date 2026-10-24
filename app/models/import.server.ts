import db from "../db.server";
import { blindIndex } from "../lib/crypto.server";
import { absoluteProxyUrl } from "../lib/proxy.server";
import { sendEmail } from "../lib/email.server";
import { findVariantsByCodes, getVariant, type CatalogVariant } from "../lib/catalog.server";
import { isRecent, parseImport, type ImportRegistry, type ParsedImport } from "../shared/registry-import";
import { createRegistry, logEvent, mintManageToken } from "./registry.server";

/**
 * Registry import (admin → Registries → Import). Brings registries across
 * from another registry app's spreadsheet, so a store switching to Giftpin
 * doesn't strand the registries its customers already have.
 *
 * Preview and import both re-read the file and re-check every product with
 * Shopify, so what's written never depends on anything the browser sent back.
 * Imported registries are "Anyone with the link", and their bought counts
 * carry over so nothing already given looks available again (hard rule #5).
 */

/** The app proxy's default mount; see shopify.app.toml [app_proxy]. */
const PROXY_PREFIX = "/apps/registry";

export interface ImportOptions {
  /** Leave out registries whose event was more than a year ago. */
  recentOnly: boolean;
  /** Email each registrant a private link to their registry. */
  emailRegistrants: boolean;
}

export interface ImportPlan {
  error: string | null;
  columns: ParsedImport["columns"];
  problems: string[];
  registries: number;
  items: number;
  /** Items whose code matched nothing in the store, shown so the merchant can fix them. */
  unmatched: { registry: string; code: string; productTitle: string | null }[];
  skippedOld: number;
  /** Already in Giftpin: same registrant email and registry name. */
  skippedExisting: number;
}

interface Planned {
  registry: ImportRegistry;
  items: { variant: CatalogVariant; wanted: number; purchased: number }[];
}

async function plan(shop: { id: string; domain: string }, text: string, options: ImportOptions) {
  const parsed = parseImport(text);
  const result: ImportPlan = {
    error: parsed.error,
    columns: parsed.columns,
    problems: parsed.problems.slice(0, 50),
    registries: 0,
    items: 0,
    unmatched: [],
    skippedOld: 0,
    skippedExisting: 0,
  };
  if (parsed.error) return { result, planned: [] as Planned[] };

  let registries = parsed.registries;
  if (options.recentOnly) {
    const recent = registries.filter((r) => isRecent(r));
    result.skippedOld = registries.length - recent.length;
    registries = recent;
  }

  // Skip registries that are already here, so importing the same file twice
  // doesn't make doubles.
  const existing = await db.registry.findMany({
    where: {
      shopId: shop.id,
      registrants: { some: { emailHash: { in: [...new Set(registries.map((r) => blindIndex(r.email)))] } } },
    },
    select: { title: true, registrants: { select: { emailHash: true } } },
  });
  const seen = new Set(existing.flatMap((r) => r.registrants.map((p) => `${p.emailHash}|${r.title.toLowerCase()}`)));
  const fresh = registries.filter((r) => !seen.has(`${blindIndex(r.email)}|${r.title.toLowerCase()}`));
  result.skippedExisting = registries.length - fresh.length;

  const codes = fresh.flatMap((r) => r.items.map((i) => i.code));
  const byCode = await findVariantsByCodes(
    shop.domain,
    codes.filter((c) => !c.startsWith("variant:")),
  );
  const byVariantId = new Map<string, CatalogVariant>();
  for (const code of new Set(codes.filter((c) => c.startsWith("variant:")))) {
    const variant = await getVariant(shop.domain, `gid://shopify/ProductVariant/${code.slice(8)}`);
    if (variant) byVariantId.set(code, variant);
  }

  const planned: Planned[] = fresh.map((registry) => {
    const items: Planned["items"] = [];
    for (const item of registry.items) {
      // A code shared by several variants is ambiguous; take none rather than guess.
      const matches = item.code.startsWith("variant:")
        ? [byVariantId.get(item.code)].filter((v): v is CatalogVariant => Boolean(v))
        : byCode.get(item.code) ?? [];
      const variant = matches.length === 1 ? matches[0] : null;
      if (!variant) {
        result.unmatched.push({ registry: registry.title, code: item.code.replace(/^variant:/, "variant "), productTitle: item.productTitle });
        continue;
      }
      const already = items.find((i) => i.variant.variantGid === variant.variantGid);
      if (already) {
        already.wanted = Math.min(99, already.wanted + item.wanted);
        already.purchased = Math.min(99, already.purchased + item.purchased);
      } else {
        items.push({ variant, wanted: item.wanted, purchased: item.purchased });
      }
    }
    return { registry, items };
  });

  result.registries = planned.length;
  result.items = planned.reduce((sum, p) => sum + p.items.length, 0);
  result.unmatched = result.unmatched.slice(0, 200);
  return { result, planned };
}

export async function previewImport(shop: { id: string; domain: string }, text: string, options: ImportOptions) {
  return (await plan(shop, text, options)).result;
}

export async function runImport(
  shop: { id: string; domain: string; currency: string },
  text: string,
  options: ImportOptions,
): Promise<ImportPlan & { created: number; emailed: number }> {
  const { result, planned } = await plan(shop, text, options);
  let created = 0;
  let emailed = 0;
  if (result.error) return { ...result, created, emailed };

  for (const { registry, items } of planned) {
    const row = await createRegistry({
      shopId: shop.id,
      eventType: registry.eventType,
      eventDate: registry.eventDate,
      title: registry.title,
      registrantName: registry.registrantName,
      registrantEmail: registry.email,
      privacy: "unlisted",
    });
    if (items.length) {
      await db.registryItem.createMany({
        data: items.map((item, i) => ({
          registryId: row.id,
          sourceType: "internal" as const,
          productGid: item.variant.productGid,
          variantGid: item.variant.variantGid,
          snapshotTitle: item.variant.title.slice(0, 300),
          snapshotImageUrl: item.variant.imageUrl,
          snapshotPrice: item.variant.price,
          snapshotCurrency: shop.currency,
          // Never fewer wanted than were already bought: that would read as
          // "more than enough", and a bought count must never vanish.
          desiredQty: Math.max(1, item.wanted, item.purchased),
          purchasedQty: item.purchased,
          // Keep the spreadsheet's order on the page.
          priority: items.length - i,
        })),
        skipDuplicates: true,
      });
    }
    await logEvent(row.id, "imported", { items: items.length, sourceRow: registry.row });
    created++;

    if (options.emailRegistrants) {
      await sendEmail("registry-link", registry.email, {
        registryTitle: row.title,
        url: absoluteProxyUrl(shop.domain, PROXY_PREFIX, "manage", { t: mintManageToken(row.id) }),
      });
      emailed++;
    }
  }

  return { ...result, created, emailed };
}
