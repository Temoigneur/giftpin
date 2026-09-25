import db from "../db.server";
import {
  authenticateProxyRequest,
  ProxyAuthError,
  guestPageHeaders,
  guestFingerprint,
  proxyUrl,
  absoluteProxyUrl,
  type ProxyContext,
} from "../lib/proxy.server";
import { cached, registryCacheKey } from "../lib/cache.server";
import { settingsFor, eventTypeLabel, isPro, type ShopSettings } from "../models/shop.server";
import {
  findBySlug,
  findVersionBySlug,
  findByEmail,
  createRegistry,
  authorizeManage,
  mintManageToken,
  readManageToken,
  updateRegistry,
  setShippingAddress,
  readShippingAddress,
  deleteRegistry,
  progressFor,
  checkRegistryPassword,
  logEvent,
  touchRegistry,
  type RegistryWithItems,
} from "../models/registry.server";
import {
  addInternalItem,
  addExternalItem,
  addManualItem,
  addLinkedItem,
  updateItem,
  removeItem,
  toDisplayItem,
  ItemError,
} from "../models/item.server";
import {
  placeClaim,
  confirmClaim,
  confirmBoughtElsewhere,
  releaseClaim,
  readClaimToken,
  mintUndoToken,
  readUndoToken,
  undoGuestPurchase,
} from "../models/claim.server";
import { applyMatchChoice, getMatchPreview, previewStoreMatch, storeMatchFields } from "../lib/store-match.server";
import { previewUrl } from "../lib/resolver/index.server";
import { normalizeCurrency, normalizePrice } from "../lib/resolver/metadata";
import { normalizeCountry } from "../shared/retailers";
import { parseShippingAddressForm, SHIPPING_ADDRESS_ERRORS, type ShippingAddressError } from "../shared/shipping-address";
import { cartAddPayload } from "../lib/attribution";
import { sendEmail } from "../lib/email.server";
import {
  addGuestReminder,
  offersGuestReminder,
  readGuestUnsubscribeToken,
  removeGuestReminder,
} from "../models/automations.server";
import { InvalidProductUrl, canonicalizeUrl } from "../lib/resolver/canonical";
import { renderRegistryPage } from "./render/registry-page";
import { renderManagePage } from "./render/manage-page";
import {
  renderRegistryChooser,
  renderCreatePage,
  renderSimplePage,
  renderPasswordPage,
  renderFindPage,
} from "./render/create-page";
import { escapeHtml } from "./render/layout";
import { csvCell } from "../lib/csv";
import { cleanHexColor, cleanLogoUrl, type PageBranding } from "../shared/branding";

/**
 * Guest-surface router.
 *
 * Routes:
 *   GET  /                     → create a registry
 *   GET  /r/:slug              → the registry page (the shareable one)
 *   POST /r/:slug              → password unlock
 *   GET  /manage?t=<token>     → registrant's own view
 *   GET  /find?q=              → find-a-registry search
 *   GET  /confirm?c=<token>    → guest confirms an external purchase
 *   GET  /release?c=<token>    → guest releases their hold
 *   GET  /thank-you.csv        → thank-you list export
 *   GET  /unsubscribe?u=<token> → guest stops pre-event reminders
 *   POST /create | /resend | /settings | /delete
 *   POST /cart-add | /claim | /bought | /undo-bought | /add-external | /update-item | /remove-item
 *   POST /link-preview | /add-link   → the manage page's paste box (look up, then add)
 *   POST /remind               → guest opts in to a pre-event reminder (Pro)
 */

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

export async function handleProxyRequest(request: Request): Promise<Response> {
  let ctx: ProxyContext;
  try {
    ctx = authenticateProxyRequest(request);
  } catch (err) {
    // Deliberately terse. This endpoint is on the public internet and a
    // detailed error is a gift to whoever is probing it.
    if (err instanceof ProxyAuthError) {
      return new Response("Unauthorized", { status: 401 });
    }
    throw err;
  }

  const shop = await db.shop.findUnique({ where: { domain: ctx.shop } });
  if (!shop) return new Response("Not found", { status: 404 });

  const settings = settingsFor(shop);
  const brand: Brand = {
    shopName: shop.name ?? ctx.shop.replace(".myshopify.com", ""),
    accentColor: settings.accentColor,
    branding: brandingFor(shop, settings),
  };

  const segments = ctx.path.split("/").filter(Boolean);
  const head = segments[0] ?? "";

  try {
    if (request.method === "POST") {
      return await handlePost(request, ctx, shop, settings, brand, segments);
    }

    switch (head) {
      case "":
        return page(renderCreatePage({
          ...brand,
          actionUrl: ctx.pathPrefix,
          enabledEventTypes: settings.eventTypes,
        }));

      case "r":
        // /r/<slug>/version is the guest page's own polling endpoint (see
        // clientScript() in render/registry-page.ts) — kept under the same
        // path as the page itself rather than a new top-level case.
        if (segments[2] === "version") {
          return await registryVersionAction(ctx, segments[1]);
        }
        return await registryPage(request, ctx, shop, settings, brand, segments[1]);

      case "manage":
        return await managePage(ctx, shop, settings, brand);

      case "find":
        return await findPage(ctx, shop, brand, settings);

      case "my-registries":
        return await myRegistriesJson(ctx, shop);

      // Browser-extension surface (V1, 19 Sep 2026). No shop-signed session,
      // no localStorage to read — the manage token, pasted once into the
      // extension when the registrant connects, is the only credential. See
      // extAddAction below for why this reuses addManualItem rather than
      // addExternalItem.
      case "ext-verify":
        return await extVerifyAction(ctx, shop);

      case "confirm":
        return await confirmPage(ctx, brand);

      case "release":
        return await releasePage(ctx, brand);

      case "thank-you.csv":
        return await thankYouCsv(ctx);

      case "unsubscribe":
        return await unsubscribePage(ctx, brand);

      default:
        return page(
          renderSimplePage(brand, "Page not found", "That link doesn't lead anywhere.", {
            label: "Start a registry",
            href: ctx.pathPrefix,
          }),
          404,
        );
    }
  } catch (err) {
    console.error("[proxy]", err);
    return page(
      renderSimplePage(brand, "Something went wrong", "Please try again in a moment."),
      500,
    );
  }
}

// ---------------------------------------------------------------------------
// GET handlers
// ---------------------------------------------------------------------------

type Brand = { shopName: string; accentColor: string; branding: PageBranding | null };

/**
 * Pro branding for every guest page (registry, create, manage, find, and the
 * simple message pages). Null on Free: the saved logo/colours/font stay in
 * settings but aren't applied, and "Powered by Giftpin" shows.
 */
function brandingFor(shop: Pick<ShopRecord, "plan">, settings: ShopSettings): PageBranding | null {
  if (!isPro(shop)) return null;
  return {
    logoUrl: cleanLogoUrl(settings.logoUrl) || null,
    backgroundColor: cleanHexColor(settings.backgroundColor) || null,
    textColor: cleanHexColor(settings.textColor) || null,
    font: settings.fontFamily,
    hidePoweredBy: true,
  };
}
type ShopRecord = NonNullable<Awaited<ReturnType<typeof db.shop.findUnique>>>;

async function registryPage(
  request: Request,
  ctx: ProxyContext,
  shop: ShopRecord,
  settings: ShopSettings,
  brand: Brand,
  slug: string | undefined,
): Promise<Response> {
  if (!slug) return page(renderSimplePage(brand, "Page not found", "That link is incomplete."), 404);

  const registry = await findBySlug(ctx.shop, slug);
  if (!registry) {
    return page(
      renderSimplePage(brand, "Registry not found", "This registry may have been deleted, or the link is wrong."),
      404,
    );
  }

  if (registry.privacy === "password") {
    const supplied = ctx.query.get("pw");
    if (!checkRegistryPassword(registry, supplied)) {
      return page(renderPasswordPage({ ...brand, actionUrl: ctx.pathPrefix, slug }));
    }
  }

  // Read-through cache. A registry link going out to 80 guests at once should
  // be one render, not 80 — and the version in the key means a purchase
  // invalidates it the instant it lands.
  const html = await cached(
    registryCacheKey(registry.id, registry.version, registry.privacy === "password" ? "pw" : "page"),
    60,
    async () => buildRegistryHtml(registry, ctx, shop, settings, brand),
  );

  return page(html, 200, registry.indexable && registry.privacy === "public_");
}

/**
 * Backs the guest page's "new gift added" banner. The page itself is a
 * cached render keyed by `registry.version` (see registryPage above) — that
 * cache is already invalidated correctly the instant a write lands, so a
 * newly-added item is available server-side immediately. The only gap was a
 * browser tab that already loaded the old page having no way to know a
 * reload would show something new. This is deliberately not a full item
 * feed: just the version number, so an open tab can compare against what it
 * rendered with and offer a refresh rather than silently reloading out from
 * under someone mid-interaction.
 */
async function registryVersionAction(ctx: ProxyContext, slug: string | undefined): Promise<Response> {
  const registry = slug ? await findVersionBySlug(ctx.shop, slug) : null;
  if (!registry) return json({ ok: false }, 404);
  return json(
    { ok: true, version: registry.version },
    200,
  );
}

function buildRegistryHtml(
  registry: RegistryWithItems,
  ctx: ProxyContext,
  shop: ShopRecord,
  settings: ShopSettings,
  brand: Brand,
): string {
  const items = registry.items.map((item) => toDisplayItem(item));

  return renderRegistryPage({
    ...brand,
    registryId: registry.id,
    title: registry.title,
    message: registry.message,
    eventType: registry.eventType,
    eventLabel: eventTypeLabel(registry.eventType),
    eventDate: registry.eventDate,
    coverImageUrl: registry.coverImageUrl,
    // First names only. Never the email, phone or address — that was the
    // documented failure of the incumbent this app is built against.
    registrantNames: registry.registrants.map((r) => firstNameOnly(r.name)).join(" & "),
    items,
    progress: progressFor(registry),
    currency: shop.currency,
    indexable: registry.indexable && registry.privacy === "public_",
    shareUrl: absoluteProxyUrl(ctx.shop, ctx.pathPrefix, `r/${registry.slug}`),
    actionUrl: ctx.pathPrefix,
    accentColor: settings.accentColor,
    version: registry.version,
    versionUrl: `${ctx.pathPrefix.replace(/\/+$/, "")}/r/${registry.slug}/version`,
    // No-op until a real affiliate network is signed up and its redirect
    // endpoint is set — see app/lib/affiliate.ts.
    affiliateLinkWrapperBase: process.env.AFFILIATE_LINK_WRAPPER_BASE || null,
    artBaseUrl: process.env.SHOPIFY_APP_URL || null,
    // "Powered by Giftpin" removal and the rest of Pro branding arrive via
    // brand.branding (see brandingFor), on this page and every other one.
    offerReminder: offersGuestReminder(shop, registry.eventDate),
    shipToRegistrant: registry.shipToRegistrant,
  });
}

async function managePage(
  ctx: ProxyContext,
  shop: ShopRecord,
  settings: ShopSettings,
  brand: Brand,
): Promise<Response> {
  const token = ctx.query.get("t");
  const registryId = token ? readTokenRegistryId(token) : null;

  const registry = registryId
    ? await authorizeManage(registryId, token, ctx.loggedInCustomerId)
    : null;

  // No usable link, but the shopper is signed in to their store account:
  // their own registries are theirs to manage without any token.
  if (!registry && ctx.loggedInCustomerId) {
    const mine = await db.registry.findMany({
      where: { shopId: shop.id, status: "active", customerId: String(ctx.loggedInCustomerId) },
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    if (mine.length === 1) {
      return redirect(proxyUrl(ctx, "manage", { t: mintManageToken(mine[0].id) }));
    }
    if (mine.length > 1) {
      return page(
        renderRegistryChooser(
          brand,
          mine.map((r) => ({ title: r.title, href: proxyUrl(ctx, "manage", { t: mintManageToken(r.id) }) })),
        ),
      );
    }
  }

  if (!registry) {
    return page(
      renderSimplePage(
        brand,
        token ? "This link has expired" : "Open your private manage link",
        token
          ? "For your privacy, management links expire. Ask for a new one and we'll email it to you."
          : "Registries are edited from a private link sent to your email. Sign in to your store account, or ask us to email you a new link.",
        { label: "Email me a new link", href: ctx.pathPrefix },
      ),
      403,
    );
  }

  // A fresh token on every visit: the page's own writes, the copyable link and
  // the browser's saved token all use it, so an active owner never expires.
  const freshToken = mintManageToken(registry.id);

  const now = new Date();
  const gifts = registry.items.flatMap((item) =>
    item.purchases
      .filter((p) => p.voidedAt === null)
      .map((p) => ({
        itemTitle: item.snapshotTitle ?? "an item",
        buyerName: p.buyerName,
        message: p.buyerMessage,
        qty: p.qty,
        hidden: p.hiddenUntil !== null && p.hiddenUntil > now,
        source: p.source as string,
      })),
  );

  const flash = flashFrom(ctx);
  const shippingFlash = ctx.query.get("flash")?.startsWith("ship-") ? flash : null;

  return page(
    renderManagePage({
      ...brand,
      registryId: registry.id,
      title: registry.title,
      message: registry.message,
      eventType: registry.eventType,
      eventDate: registry.eventDate,
      privacy: registry.privacy,
      country: registry.country,
      items: registry.items.map((item) => toDisplayItem(item)),
      currency: shop.currency,
      shareUrl: absoluteProxyUrl(ctx.shop, ctx.pathPrefix, `r/${registry.slug}`),
      actionUrl: `${ctx.pathPrefix.replace(/\/+$/, "")}`,
      token: freshToken,
      manageUrl: absoluteProxyUrl(ctx.shop, ctx.pathPrefix, "manage", { t: freshToken }),
      externalItemsAllowed: settings.externalItems !== "off",
      version: registry.version,
      versionUrl: `${ctx.pathPrefix.replace(/\/+$/, "")}/r/${registry.slug}/version`,
      storeSearchUrl: "/collections/all",
      artBaseUrl: process.env.SHOPIFY_APP_URL || null,
      gifts,
      flash: shippingFlash ? null : flash,
      shipping: {
        enabled: registry.shipToRegistrant,
        address: registry.shipToRegistrant ? readShippingAddress(registry) : null,
        flash: shippingFlash,
      },
    }),
  );
}

async function findPage(
  ctx: ProxyContext,
  shop: ShopRecord,
  brand: Brand,
  settings: ShopSettings,
): Promise<Response> {
  if (!settings.findARegistryEnabled) {
    return page(renderSimplePage(brand, "Page not found", "That link doesn't lead anywhere."), 404);
  }

  const query = (ctx.query.get("q") ?? "").trim().slice(0, 80);

  // Only registries whose owners explicitly opted into being listed. The
  // indexable SEO asset is THIS page, never an individual registry.
  const results =
    query.length >= 2
      ? await db.registry.findMany({
          where: {
            shopId: shop.id,
            status: "active",
            privacy: "public_",
            indexable: true,
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { registrants: { some: { name: { contains: query, mode: "insensitive" } } } },
            ],
          },
          include: { registrants: true },
          take: 25,
          orderBy: { eventDate: "asc" },
        })
      : [];

  return page(
    renderFindPage({
      ...brand,
      actionUrl: ctx.pathPrefix,
      query,
      searched: query.length >= 2,
      results: results.map((r) => ({
        title: r.title,
        eventLabel: eventTypeLabel(r.eventType),
        eventDate: r.eventDate,
        url: proxyUrl(ctx, `r/${r.slug}`),
        names: r.registrants.map((p) => firstNameOnly(p.name)).join(" & "),
      })),
    }),
    200,
    true,
  );
}

/**
 * Registries belonging to a signed-in customer.
 *
 * Only serves shoppers with a store account — `logged_in_customer_id` is the
 * only identity app proxy hands us. Everyone else is identified by the
 * magic-link tokens the theme button reads out of localStorage, which the
 * server re-verifies on every write.
 */
async function myRegistriesJson(ctx: ProxyContext, shop: ShopRecord): Promise<Response> {
  if (!ctx.loggedInCustomerId) return json({ registries: [] });

  const registries = await db.registry.findMany({
    where: { shopId: shop.id, status: "active", customerId: String(ctx.loggedInCustomerId) },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return json({
    registries: registries.map((registry) => ({
      id: registry.id,
      title: registry.title,
      token: mintManageToken(registry.id),
    })),
  });
}

async function confirmPage(ctx: ProxyContext, brand: Brand): Promise<Response> {
  const claimId = readClaimToken(ctx.query.get("c"));
  if (!claimId) {
    return page(renderSimplePage(brand, "That link has expired", "No harm done — the item went back on the registry."), 410);
  }
  await confirmClaim(claimId);
  return page(
    renderSimplePage(brand, "Thank you", "We've marked it as bought so nobody else buys the same thing."),
  );
}

async function releasePage(ctx: ProxyContext, brand: Brand): Promise<Response> {
  const claimId = readClaimToken(ctx.query.get("c"));
  if (claimId) await releaseClaim(claimId);
  return page(renderSimplePage(brand, "Put back on the list", "Thanks for letting us know."));
}

async function unsubscribePage(ctx: ProxyContext, brand: Brand): Promise<Response> {
  const reminderId = readGuestUnsubscribeToken(ctx.query.get("u"));
  if (reminderId) await removeGuestReminder(reminderId);
  return page(renderSimplePage(brand, "You're unsubscribed", "We won't send you any more reminders about this registry."));
}

/** Small feature, disproportionate emotional value. Gets talked about. */
async function thankYouCsv(ctx: ProxyContext): Promise<Response> {
  const token = ctx.query.get("t");
  const registryId = token ? readTokenRegistryId(token) : null;
  const registry = registryId
    ? await authorizeManage(registryId, token, ctx.loggedInCustomerId)
    : null;

  if (!registry) return new Response("Unauthorized", { status: 401 });

  const now = new Date();
  const rows: string[][] = [["Gift", "From", "Quantity", "Message", "Where", "Date"]];

  for (const item of registry.items) {
    for (const purchase of item.purchases) {
      if (purchase.voidedAt) continue;
      const hidden = purchase.hiddenUntil !== null && purchase.hiddenUntil > now;
      rows.push([
        item.snapshotTitle ?? "",
        hidden ? "(hidden until your event)" : (purchase.buyerName ?? "Anonymous"),
        String(purchase.qty),
        purchase.buyerMessage ?? "",
        purchase.source === "external" ? "Bought elsewhere" : "This store",
        purchase.createdAt.toISOString().slice(0, 10),
      ]);
    }
  }

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="thank-you-list.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

// ---------------------------------------------------------------------------
// POST handlers
// ---------------------------------------------------------------------------

async function handlePost(
  request: Request,
  ctx: ProxyContext,
  shop: ShopRecord,
  settings: ShopSettings,
  brand: Brand,
  segments: string[],
): Promise<Response> {
  const head = segments[0] ?? "";

  switch (head) {
    case "create":
      return createRegistryAction(request, ctx, shop, settings, brand);
    case "resend":
      return resendAction(request, ctx, shop, brand);
    case "r":
      return unlockAction(request, ctx, segments[1]);
    case "cart-add":
      return cartAddAction(request, ctx);
    case "claim":
      return claimAction(request, ctx);
    case "bought":
      return boughtAction(request, ctx);
    case "undo-bought":
      return undoBoughtAction(request, ctx);
    case "add-external":
      return addExternalAction(request, ctx);
    case "link-preview":
      return linkPreviewAction(request, ctx, shop);
    case "add-link":
      return addLinkAction(request, ctx, shop);
    case "add-manual":
      return addManualAction(request, ctx);
    case "add-from-store":
      return addFromStoreAction(request, ctx, shop);
    case "ext-add":
      return extAddAction(request, ctx, shop);
    case "update-item":
      return updateItemAction(request, ctx);
    case "remove-item":
      return removeItemAction(request, ctx);
    case "item-match":
      return itemMatchAction(request, ctx);
    case "match-preview":
      return matchPreviewAction(request, ctx);
    case "settings":
      return settingsAction(request, ctx);
    case "shipping":
      return shippingAction(request, ctx);
    case "delete":
      return deleteAction(request, ctx, brand);
    case "remind":
      return remindAction(request, ctx, shop);
    default:
      return new Response("Not found", { status: 404 });
  }
}

async function createRegistryAction(
  request: Request,
  ctx: ProxyContext,
  shop: ShopRecord,
  settings: ShopSettings,
  brand: Brand,
): Promise<Response> {
  const form = await request.formData();
  const values = Object.fromEntries(
    ["eventType", "title", "eventDate", "registrantName", "registrantEmail", "message", "country"].map((k) => [
      k,
      String(form.get(k) ?? ""),
    ]),
  );

  const email = values.registrantEmail.trim();
  if (!values.title.trim() || !values.registrantName.trim() || !isEmail(email)) {
    return page(
      renderCreatePage({
        ...brand,
        actionUrl: ctx.pathPrefix,
        enabledEventTypes: settings.eventTypes,
        error: "Please fill in your name, a registry name and a valid email address.",
        values,
      }),
      400,
    );
  }

  const registry = await createRegistry({
    shopId: shop.id,
    customerId: ctx.loggedInCustomerId,
    eventType: values.eventType || "other",
    eventDate: values.eventDate ? new Date(`${values.eventDate}T00:00:00Z`) : null,
    title: values.title.trim(),
    message: values.message.trim() || null,
    registrantName: values.registrantName.trim(),
    registrantEmail: email,
    country: normalizeCountry(values.country),
  });

  const manageUrl = absoluteProxyUrl(ctx.shop, ctx.pathPrefix, "manage", {
    t: mintManageToken(registry.id),
  });

  await sendEmail("registry-link", email, { registryTitle: registry.title, url: manageUrl });

  // Straight into the registry rather than a "check your email" dead end —
  // the email is the durable copy, not the gate.
  return redirect(manageUrl);
}

async function resendAction(
  request: Request,
  ctx: ProxyContext,
  shop: ShopRecord,
  brand: Brand,
): Promise<Response> {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();

  if (isEmail(email)) {
    const registries = await findByEmail(shop.id, email);
    for (const registry of registries.slice(0, 5)) {
      await sendEmail("registry-link", email, {
        registryTitle: registry.title,
        url: absoluteProxyUrl(ctx.shop, ctx.pathPrefix, "manage", { t: mintManageToken(registry.id) }),
      });
    }
  }

  // Identical response whether or not the address exists. Confirming which
  // emails have registries here would leak exactly the thing we encrypt.
  return page(
    renderSimplePage(
      brand,
      "Check your email",
      "If that address has a registry with us, its link is on the way.",
    ),
  );
}

async function unlockAction(request: Request, ctx: ProxyContext, slug: string | undefined): Promise<Response> {
  if (!slug) return new Response("Not found", { status: 404 });
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  return redirect(proxyUrl(ctx, `r/${slug}`, { pw: password }));
}

/**
 * Mints the signed cart properties. The browser then posts them to Shopify's
 * own /cart/add.js — we never touch the cart ourselves, which is what keeps the
 * token on the cart LINE where it survives Shop Pay.
 */
async function cartAddAction(request: Request, ctx: ProxyContext): Promise<Response> {
  const body = await readJson(request);
  const itemId = String(body.itemId ?? "");
  const variantId = String(body.variantId ?? "");
  const qty = clampInt(body.qty, 1, 99);

  const item = await db.registryItem.findFirst({
    where: { id: itemId, sourceType: "internal", registry: { shop: { domain: ctx.shop } } },
    include: { registry: true },
  });

  if (!item || !item.variantGid?.endsWith(`/${variantId}`)) {
    return json({ ok: false, error: "That item is no longer on this registry" }, 404);
  }

  return json({
    ok: true,
    payload: cartAddPayload(
      variantId,
      qty,
      item.registryId,
      item.id,
      // Only when the guest left "ship to the registrant" ticked.
      item.registry.shipToRegistrant && body.shipToRegistrant === true,
    ),
  });
}

async function claimAction(request: Request, ctx: ProxyContext): Promise<Response> {
  const body = await readJson(request);
  const itemId = String(body.itemId ?? "");

  const item = await db.registryItem.findFirst({
    where: { id: itemId, registry: { shop: { domain: ctx.shop } } },
    include: { externalSource: true },
  });
  if (!item) return json({ ok: false }, 404);

  const claim = await placeClaim(item.id, item.registryId, guestFingerprint(request, item.id));
  if (!claim) return json({ ok: true, held: false });

  return json({ ok: true, held: true, expiresAt: claim.expiresAt.toISOString() });
}

/**
 * Guest confirming, from the registry page, that they bought an item. For
 * external items that converts their hold. For store items it's the "Already
 * bought it?" path (bought in person, or as a gift card, etc.); orders placed
 * online are still counted by the webhook, not by this.
 */
async function boughtAction(request: Request, ctx: ProxyContext): Promise<Response> {
  const body = await readJson(request);
  const itemId = String(body.itemId ?? "");

  const item = await db.registryItem.findFirst({
    where: { id: itemId, registry: { shop: { domain: ctx.shop } } },
    include: { claims: { where: { releasedAt: null } } },
  });
  if (!item) return json({ ok: false, error: "Item not found" }, 404);

  const details = {
    buyerName: typeof body.buyerName === "string" ? body.buyerName : null,
    buyerMessage: typeof body.buyerMessage === "string" ? body.buyerMessage : null,
  };

  if (item.sourceType === "internal") {
    const purchase = await confirmBoughtElsewhere(item.id, details);
    if (!purchase) return json({ ok: false, error: "This item is already taken care of" }, 409);
    return json({ ok: true, undoToken: mintUndoToken(purchase.id) });
  }

  const fingerprint = guestFingerprint(request, item.id);
  const own = item.claims.find((c) => c.guestFingerprint === fingerprint) ?? item.claims[0];

  if (own) {
    const purchase = await confirmClaim(own.id, details);
    return json({ ok: true, undoToken: purchase ? mintUndoToken(purchase.id) : null });
  }

  // No hold in flight — the guest bought it without clicking through.
  const claim = await placeClaim(item.id, item.registryId, fingerprint);
  if (!claim) return json({ ok: false, error: "This item is already taken care of" }, 409);
  const purchase = await confirmClaim(claim.claimId, details);
  return json({ ok: true, undoToken: purchase ? mintUndoToken(purchase.id) : null });
}

/** Guest undoing their own "I bought this", within the undo window. */
async function undoBoughtAction(request: Request, ctx: ProxyContext): Promise<Response> {
  const body = await readJson(request);
  const purchaseId = readUndoToken(typeof body.token === "string" ? body.token : null);
  if (!purchaseId) return json({ ok: false, error: "This can no longer be undone" }, 400);

  // Scope to this shop, the same as every other guest action.
  const purchase = await db.purchase.findFirst({
    where: { id: purchaseId, item: { registry: { shop: { domain: ctx.shop } } } },
    select: { id: true },
  });
  if (!purchase || !(await undoGuestPurchase(purchase.id))) {
    return json({ ok: false, error: "This can no longer be undone" }, 409);
  }
  return json({ ok: true });
}

async function addExternalAction(request: Request, ctx: ProxyContext): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return json({ ok: false, error: "Not authorised" }, 403);

  const body = await readJson(request);

  try {
    await addExternalItem({ registryId: registry.id, url: String(body.url ?? ""), note: cleanNote(body.note) });
    return json({ ok: true });
  } catch (err) {
    if (err instanceof InvalidProductUrl || err instanceof ItemError) {
      return json({ ok: false, error: err.message }, 400);
    }
    console.error("[add-external]", err);
    // Never a dead end: offer the manual path instead of a shrug.
    return json(
      { ok: false, error: "We couldn't read that page. You can add the item by hand instead." },
      502,
    );
  }
}

/**
 * Step one of the paste box: read the link now and show the registrant what
 * we found (title, photo, price) plus the store's closest match, before
 * anything is added. Read-only.
 *
 * `found: false` isn't an error — lots of big retailers refuse a server read —
 * it just means the registrant fills in the name and price themselves.
 */
async function linkPreviewAction(request: Request, ctx: ProxyContext, shop: ShopRecord): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return json({ ok: false, error: "Not authorised" }, 403);

  const body = await readJson(request);
  let link: Awaited<ReturnType<typeof previewUrl>>;
  try {
    link = await previewUrl(String(body.url ?? ""));
  } catch (err) {
    if (err instanceof InvalidProductUrl) return json({ ok: false, error: err.message }, 400);
    throw err;
  }

  const match = link.title ? await previewStoreMatch(shop.domain, shop.currency, link.title) : null;
  return json({
    ok: true,
    found: link.title !== null,
    url: link.url,
    domain: link.domain,
    title: link.title,
    imageUrl: link.imageUrl,
    price: link.price,
    currency: link.currency ?? shop.currency,
    match: match?.preview ?? null,
  });
}

/**
 * Step two of the paste box: add the link with the details the registrant
 * confirmed. The store match is looked up again here rather than trusted from
 * the browser, so nothing the page sends can put an arbitrary product in front
 * of guests; `showMatch` only decides whether it starts out kept.
 */
async function addLinkAction(request: Request, ctx: ProxyContext, shop: ShopRecord): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return json({ ok: false, error: "Not authorised" }, 403);

  const body = await readJson(request);
  const title = String(body.title ?? "").trim().slice(0, 300);
  if (!title) return json({ ok: false, error: "Please give the item a name" }, 400);

  // Required: a pasted item from a site that blocks our read has nothing else
  // telling guests what it costs (Ben, 25 Sep 2026).
  const rawPrice = typeof body.price === "string" ? body.price.trim() : "";
  if (!rawPrice) return json({ ok: false, error: "Please add the price, so guests know what it costs" }, 400);
  const price = normalizePrice(rawPrice);
  if (price === null) return json({ ok: false, error: "That price doesn't look right" }, 400);

  const match = await previewStoreMatch(shop.domain, shop.currency, title);

  try {
    const result = await addLinkedItem({
      registryId: registry.id,
      url: String(body.url ?? ""),
      title,
      imageUrl: typeof body.imageUrl === "string" ? body.imageUrl : null,
      price,
      currency: normalizeCurrency(typeof body.currency === "string" ? body.currency : null) ?? shop.currency,
      note: cleanNote(body.note),
      storeMatch: match ? storeMatchFields(match.match, keepMatch(match.preview.title, body) ? "kept" : "suggested") : null,
    });
    if (result.duplicate) {
      return json({ ok: false, error: "That link is already on your list. Change its quantity below." }, 409);
    }
    return json({ ok: true, itemId: result.item.id });
  } catch (err) {
    if (err instanceof InvalidProductUrl || err instanceof ItemError) {
      return json({ ok: false, error: err.message }, 400);
    }
    throw err;
  }
}

/**
 * Only keep the match the registrant actually saw: if they edited the name and
 * the store's closest match moved, it starts out as a suggestion instead.
 */
function keepMatch(foundTitle: string, body: Record<string, unknown>): boolean {
  return body.showMatch === true && typeof body.matchTitle === "string" && body.matchTitle === foundTitle;
}

/**
 * The theme button's endpoint.
 *
 * Authorised by the magic-link token the button read out of localStorage, or by
 * a matching logged-in customer id. Never by the app proxy signature alone —
 * that proves Shopify sent the request, not who sent it.
 */
async function addFromStoreAction(
  request: Request,
  ctx: ProxyContext,
  shop: ShopRecord,
): Promise<Response> {
  const body = await readJson(request);
  const registryId = String(body.registryId ?? "");
  const token = typeof body.token === "string" ? body.token : null;

  const registry = await authorizeManage(registryId, token, ctx.loggedInCustomerId);
  if (!registry || registry.shopId !== shop.id) {
    return json({ ok: false, error: "Not authorised" }, 403);
  }

  // The registrant confirmed, in the button's duplicate-quantity prompt, an
  // explicit total for an item already on the registry — a deliberate "yes I
  // want N of these", not a second add silently bumping the count. Same
  // manage-token authorisation as a normal add, just a different write.
  if (typeof body.itemId === "string" && body.confirmQty !== undefined) {
    const item = registry.items.find((i) => i.id === body.itemId);
    if (!item) return json({ ok: false, error: "Item not found" }, 404);

    const desiredQty = clampInt(body.confirmQty, 1, 99);
    if (desiredQty < item.purchasedQty) {
      return json({ ok: false, error: `${item.purchasedQty} have already been bought` }, 400);
    }

    await updateItem(item.id, registry.id, { desiredQty });
    return json({ ok: true });
  }

  const variantId = String(body.variantId ?? "");
  const productId = String(body.productId ?? "");
  if (!/^\d+$/.test(variantId) || !/^\d+$/.test(productId)) {
    return json({ ok: false, error: "Missing product details" }, 400);
  }

  const result = await addInternalItem({
    registryId: registry.id,
    productGid: `gid://shopify/Product/${productId}`,
    variantGid: `gid://shopify/ProductVariant/${variantId}`,
    title: String(body.title ?? "Item").slice(0, 300),
    imageUrl: typeof body.imageUrl === "string" && body.imageUrl ? body.imageUrl : null,
    price: typeof body.price === "string" && body.price ? body.price : null,
    currency: typeof body.currency === "string" ? body.currency : shop.currency,
    desiredQty: clampInt(body.qty, 1, 20),
    note: cleanNote(body.note),
  });

  if (result.duplicate) {
    return json({ ok: true, duplicate: true, itemId: result.item.id, currentQty: result.item.desiredQty });
  }

  return json({ ok: true });
}

/** GET .../ext-verify?t=<token> — the browser extension's one-time "connect" check. */
async function extVerifyAction(ctx: ProxyContext, shop: ShopRecord): Promise<Response> {
  const token = ctx.query.get("t");
  const registryId = token ? readTokenRegistryId(token) : null;
  const registry = registryId ? await authorizeManage(registryId, token, null) : null;

  if (!registry || registry.shopId !== shop.id) {
    return json({ ok: false, error: "This link has expired or isn't valid. Ask for a new one from your registry." }, 401);
  }

  return json({ ok: true, title: registry.title });
}

/**
 * The browser extension's "add this page" endpoint.
 *
 * Deliberately calls addManualItem, not addExternalItem: addExternalItem
 * re-fetches the URL itself to resolve title/image/price, which is exactly
 * the server-side fetch the extension exists to avoid (Amazon and others
 * block it). The extension already read the page's own rendered metadata
 * client-side — this stores that as-is, the same way a manually-typed item
 * is stored.
 *
 * addManualItem has no built-in dedup (the manage page's manual-entry form
 * doesn't need one — nobody fat-fingers the same product twice by hand), so
 * the duplicate check and the confirm-quantity round trip are handled here,
 * matching addFromStoreAction's pattern rather than changing addManualItem's
 * shared contract.
 */
async function extAddAction(request: Request, ctx: ProxyContext, shop: ShopRecord): Promise<Response> {
  const body = await readJson(request);
  const token = typeof body.token === "string" ? body.token : null;
  const registryId = token ? readTokenRegistryId(token) : null;
  if (!registryId) return json({ ok: false, error: "Not authorised" }, 403);

  const registry = await authorizeManage(registryId, token, null);
  if (!registry || registry.shopId !== shop.id) {
    return json({ ok: false, error: "Not authorised" }, 403);
  }

  // Confirming an explicit total for something the extension already found
  // on this registry — same "ask, don't silently bump" pattern as the theme
  // button's duplicate prompt.
  if (typeof body.itemId === "string" && body.confirmQty !== undefined) {
    const item = registry.items.find((i) => i.id === body.itemId);
    if (!item) return json({ ok: false, error: "Item not found" }, 404);

    const desiredQty = clampInt(body.confirmQty, 1, 99);
    if (desiredQty < item.purchasedQty) {
      return json({ ok: false, error: `${item.purchasedQty} have already been bought` }, 400);
    }

    await updateItem(item.id, registry.id, { desiredQty });
    return json({ ok: true });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return json({ ok: false, error: "Couldn't find a product name on that page" }, 400);

  const rawUrl = typeof body.url === "string" ? body.url : "";
  let canonicalUrl: string | null = null;
  if (rawUrl) {
    try {
      canonicalUrl = canonicalizeUrl(rawUrl).url;
    } catch {
      canonicalUrl = null; // still add it — a URL we can't canonicalize just means no dedup, not a hard failure
    }
  }

  if (canonicalUrl) {
    const existing = registry.items.find((i) => i.externalUrl === canonicalUrl);
    if (existing) {
      return json({ ok: true, duplicate: true, itemId: existing.id, currentQty: existing.desiredQty });
    }
  }

  const item = await addManualItem({
    registryId: registry.id,
    title: title.slice(0, 300),
    url: rawUrl || null,
    imageUrl: typeof body.imageUrl === "string" && body.imageUrl ? body.imageUrl : null,
    price: typeof body.price === "string" && body.price ? body.price : null,
    currency: typeof body.currency === "string" ? body.currency : null,
    desiredQty: clampInt(body.qty, 1, 20),
    note: cleanNote(body.note),
  });

  return json({ ok: true, itemId: item.id });
}

/**
 * The escape hatch behind "you can add the item by hand instead".
 *
 * Roughly one URL in ten won't resolve — a login wall, a hostile bot check, a
 * page with no structured data at all. A registrant who hits that must still
 * end up with the item on their list, or they go and build the list somewhere
 * that doesn't fail them.
 */
async function addManualAction(request: Request, ctx: ProxyContext): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return json({ ok: false, error: "Not authorised" }, 403);

  const body = await readJson(request);
  const title = String(body.title ?? "").trim();
  if (!title) return json({ ok: false, error: "Please give the item a name" }, 400);

  try {
    await addManualItem({
      registryId: registry.id,
      title,
      url: typeof body.url === "string" && body.url ? body.url : null,
      price: typeof body.price === "string" ? body.price : null,
      currency: typeof body.currency === "string" ? body.currency : null,
      desiredQty: clampInt(body.desiredQty, 1, 99),
      note: cleanNote(body.note),
    });
    return json({ ok: true });
  } catch (err) {
    if (err instanceof InvalidProductUrl || err instanceof ItemError) {
      return json({ ok: false, error: err.message }, 400);
    }
    throw err;
  }
}

async function updateItemAction(request: Request, ctx: ProxyContext): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return json({ ok: false, error: "Not authorised" }, 403);

  const body = await readJson(request);
  const itemId = String(body.itemId ?? "");
  const desiredQty = clampInt(body.desiredQty, 1, 99);

  const item = registry.items.find((i) => i.id === itemId);
  if (!item) return json({ ok: false, error: "Item not found" }, 404);
  if (desiredQty < item.purchasedQty) {
    return json(
      { ok: false, error: `${item.purchasedQty} have already been bought` },
      400,
    );
  }

  // Category is optional in the body so older clients that only send a
  // quantity keep working. "" clears it; unknown keys are ignored by updateItem.
  const category =
    "category" in body ? (String(body.category ?? "") === "" ? null : String(body.category)) : undefined;

  // Same optional-key rule as category: omitted leaves the note alone,
  // "" clears it.
  const note = "note" in body ? cleanNote(body.note) : undefined;

  await updateItem(itemId, registry.id, { desiredQty, category, note });
  return json({ ok: true });
}

async function itemMatchAction(request: Request, ctx: ProxyContext): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return json({ ok: false, error: "Not authorised" }, 403);

  const body = await readJson(request);
  const action = String(body.action ?? "");
  if (action !== "keep" && action !== "dismiss" && action !== "swap") {
    return json({ ok: false, error: "Unknown action" }, 400);
  }

  try {
    await applyMatchChoice({
      registryId: registry.id,
      itemId: String(body.itemId ?? ""),
      action,
      productGid: typeof body.productGid === "string" ? body.productGid : undefined,
    });
    // Guests see a kept match, so their cached page has to go stale.
    await touchRegistry(registry.id);
    return json({ ok: true });
  } catch (err) {
    if (err instanceof ItemError) return json({ ok: false, error: err.message }, 400);
    throw err;
  }
}

/** POST .../match-preview?t=<token> — what the "similar item" popup shows. Read-only. */
async function matchPreviewAction(request: Request, ctx: ProxyContext): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return json({ ok: false, error: "Not authorised" }, 403);

  const body = await readJson(request);
  try {
    const preview = await getMatchPreview(registry.id, String(body.itemId ?? ""));
    return json({ ok: true, ...preview });
  } catch (err) {
    if (err instanceof ItemError) return json({ ok: false, error: err.message }, 400);
    console.error("[proxy] match-preview failed:", (err as Error).message);
    return json({ ok: false, error: "Couldn't load the store's products right now" }, 502);
  }
}

async function removeItemAction(request: Request, ctx: ProxyContext): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return json({ ok: false, error: "Not authorised" }, 403);

  const body = await readJson(request);
  try {
    await removeItem(String(body.itemId ?? ""), registry.id);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: (err as Error).message }, 400);
  }
}

async function settingsAction(request: Request, ctx: ProxyContext): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return new Response("Unauthorized", { status: 403 });

  const form = await request.formData();
  const privacy = String(form.get("privacy") ?? "unlisted");
  const eventDate = String(form.get("eventDate") ?? "");

  await updateRegistry(registry.id, {
    title: String(form.get("title") ?? registry.title).slice(0, 200),
    eventType: String(form.get("eventType") ?? registry.eventType),
    eventDate: eventDate ? new Date(`${eventDate}T00:00:00Z`) : null,
    message: String(form.get("message") ?? "").slice(0, 2000) || null,
    country: normalizeCountry(form.get("country")),
    privacy: privacy === "public_" || privacy === "password" ? privacy : "unlisted",
    // Being listed and being indexable are the same decision, and it is always
    // an explicit opt-in by the registrant.
    indexable: privacy === "public_",
  });

  await logEvent(registry.id, "settings_updated", { privacy });

  return redirect(
    proxyUrl(ctx, "manage", { t: ctx.query.get("t") ?? "", flash: "saved" }),
  );
}

/**
 * Registrant saves (or turns off) ship-to-registrant. Turning it off deletes
 * the stored address rather than keeping it around unused.
 */
async function shippingAction(request: Request, ctx: ProxyContext): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return new Response("Unauthorized", { status: 403 });

  const form = await request.formData();
  const back = (flash: string) =>
    redirect(proxyUrl(ctx, "manage", { t: ctx.query.get("t") ?? "", flash }) + "#ship");

  if (form.get("enabled") !== "on") {
    await setShippingAddress(registry.id, null);
    await logEvent(registry.id, "shipping_address_updated", { enabled: false });
    return back("ship-off");
  }

  const parsed = parseShippingAddressForm(form);
  if ("error" in parsed) return back(`ship-${parsed.error}`);

  await setShippingAddress(registry.id, parsed.address);
  await logEvent(registry.id, "shipping_address_updated", { enabled: true, country: parsed.address.countryCode });
  return back("ship-saved");
}

/**
 * Guest opts in to a pre-event reminder (Pro). Answers the same way whether or
 * not the email was already signed up, so this can't be used to check who is.
 */
async function remindAction(request: Request, ctx: ProxyContext, shop: ShopRecord): Promise<Response> {
  const body = await readJson(request);
  const email = String(body.email ?? "").trim();
  const registryId = String(body.registryId ?? "");
  if (!isEmail(email)) return json({ ok: false, error: "Please enter a valid email address." }, 400);

  const registry = await db.registry.findFirst({
    where: { id: registryId, shopId: shop.id, status: "active" },
    select: { id: true, eventDate: true },
  });
  if (!registry || !offersGuestReminder(shop, registry.eventDate)) {
    return json({ ok: false, error: "Reminders aren't available for this registry." }, 404);
  }

  await addGuestReminder(registry.id, email);
  return json({ ok: true });
}

async function deleteAction(request: Request, ctx: ProxyContext, brand: Brand): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return new Response("Unauthorized", { status: 403 });

  await deleteRegistry(registry.id);

  return page(
    renderSimplePage(
      brand,
      "Your registry has been deleted",
      "Everything on it is gone, including the record of who bought what.",
    ),
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function requireManage(ctx: ProxyContext): Promise<RegistryWithItems | null> {
  const token = ctx.query.get("t");
  const registryId = token ? readTokenRegistryId(token) : null;
  if (!registryId) return null;

  const registry = await authorizeManage(registryId, token, ctx.loggedInCustomerId);
  // Belt and braces: the token proves who, this proves the registry belongs to
  // the shop that proxied the request.
  if (!registry) return null;
  const owned = await db.registry.findFirst({
    where: { id: registry.id, shop: { domain: ctx.shop } },
    select: { id: true },
  });
  return owned ? registry : null;
}

function readTokenRegistryId(token: string): string | null {
  return readManageToken(token);
}

function page(html: string, status = 200, indexable = false): Response {
  return new Response(html, { status, headers: guestPageHeaders(indexable) });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function redirect(location: string): Response {
  // App proxy follows 30x responses, so this lands the guest on the right page
  // on the merchant's own domain.
  return new Response(null, { status: 302, headers: { Location: location } });
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** Registrant's optional per-item note ("towels in grey or purple"). Blank -> null. */
function cleanNote(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, 500);
  return trimmed === "" ? null : trimmed;
}

function clampInt(value: unknown, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, Math.floor(parsed)));
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 254;
}

function firstNameOnly(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

function flashFrom(ctx: ProxyContext): { kind: "ok" | "err"; message: string } | null {
  const flash = ctx.query.get("flash");
  if (flash === "saved") return { kind: "ok", message: "Your changes are saved." };
  if (flash === "ship-saved") return { kind: "ok", message: "Your shipping address is saved." };
  if (flash === "ship-off") return { kind: "ok", message: "Gifts won't be sent to you, and your address has been deleted." };
  const shipError = flash?.startsWith("ship-") ? flash.slice(5) : null;
  if (shipError && shipError in SHIPPING_ADDRESS_ERRORS) {
    return { kind: "err", message: SHIPPING_ADDRESS_ERRORS[shipError as ShippingAddressError] };
  }
  return null;
}

export const __testables = { csvCell, isEmail, clampInt, firstNameOnly, escapeHtml };
