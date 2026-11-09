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
import { withLocale, overrideLocale } from "../lib/i18n.server";
import { currentLocale, isLocale, registryLanguageFrom, t, type MessageKey } from "../shared/i18n";
import { bumpStat, countView } from "../models/stats.server";
import { STAT_METRICS } from "../shared/stats";
import { settingsFor, eventTypeLabel, isPro, type ShopSettings } from "../models/shop.server";
import { isDatelessOccasion } from "../shared/settings";
import {
  findBySlug as findBySlugRaw,
  findVersionBySlug,
  findByEmail,
  createRegistry,
  authorizeManage as authorizeManageRaw,
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
  registrantEmail,
  addPartner,
  removePartner,
  ownerOf,
  manageTokenFor,
  readManageGrant,
  renewManageToken,
  mintAccountToken,
  readAccountToken,
  listAccountRegistries,
  accountProfile,
  type RegistryWithItems,
} from "../models/registry.server";
import {
  addInternalItem,
  addExternalItem,
  addManualItem,
  addNamedItem,
  addFundItem,
  setItemFundGoal,
  parseFundGoal,
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
import { cartAddPayload, contributionCartPayload, giftForValue, signGiftCardAttribution } from "../lib/attribution";
import { giftCardListingLive, giftCardSource, listedGiftCardAmounts } from "../shared/gift-card-listing";
import { renderGiftCardPage } from "./render/gift-card-page";
import { fundState, giftCardRecipientProperties } from "../shared/contributions";
import { audit } from "../lib/audit.server";
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
  renderAccountPage,
  renderAccountSignInPage,
} from "./render/create-page";
import { blindIndex } from "../lib/crypto.server";
import { escapeHtml, formatMoney } from "./render/layout";
import { csvCell } from "../lib/csv";
import { cleanHexColor, cleanLogoUrl, type PageBranding } from "../shared/branding";
import { applyStock, hiddenFromGuests, type StockMap } from "../lib/stock";
import { fetchVariantStock, findVariantsByCode, getVariant } from "../lib/catalog.server";
import { registrantPerks } from "../shared/perks";
import { liveDeals, productCollections } from "../lib/promotions.server";
import { bannerLines, dealForProduct, itemDealText, promotionPerkLines, type Deal } from "../shared/promotion-display";
import { queueFlowTrigger } from "../models/flow.server";

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
 *   GET  /gift-card?src=       → buy the store's gift card (giftpin.app listing, Pro)
 *   POST /create | /resend | /settings | /delete
 *   POST /cart-add | /claim | /bought | /undo-bought | /add-external | /update-item | /remove-item
 *   POST /link-preview | /add-link   → the manage page's paste box (look up, then add)
 *   POST /remind               → guest opts in to a pre-event reminder (Pro)
 *   POST /contribute | /add-fund | /item-fund | /contribution-settings  (Pro, SPIKE-C.md)
 */

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

/**
 * A registry can have a language of its own (Registry.language; null follows
 * the store). Once a request has found its registry, the rest of it is in
 * that language: the page, its error messages and its emails.
 */
function inRegistryLanguage<T extends { language?: string | null } | null>(registry: T): T {
  if (registry) overrideLocale(registry.language);
  return registry;
}

async function findBySlug(...args: Parameters<typeof findBySlugRaw>) {
  return inRegistryLanguage(await findBySlugRaw(...args));
}

async function authorizeManage(...args: Parameters<typeof authorizeManageRaw>) {
  return inRegistryLanguage(await authorizeManageRaw(...args));
}

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
  // Everything below renders in the store's chosen language (see
  // app/lib/i18n.server.ts for why this is per request and not a global).
  //
  // ?lang=xx on a page (GET) shows it in that language instead, over the
  // store's and the registry's own. For checking a translation, for example
  // ?lang=en on a store that is set to Japanese.
  const asked = request.method === "GET" ? ctx.query.get("lang") : null;
  const forced = isLocale(asked);
  return withLocale(forced ? asked : settings.language, () => routeProxyRequest(request, ctx, shop, settings), forced);
}

async function routeProxyRequest(
  request: Request,
  ctx: ProxyContext,
  shop: ShopRecord,
  settings: ShopSettings,
): Promise<Response> {
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
      case "": {
        countView(request, shop.id, STAT_METRICS.createPageView);
        // "Start another registry" from My registries: same name and email, so
        // the new one joins their list.
        const accountHash = readAccountToken(ctx.query.get("a"), shop.id);
        const profile = accountHash ? await accountProfile(shop.id, accountHash) : null;
        return page(renderCreatePage({
          ...brand,
          actionUrl: ctx.pathPrefix,
          enabledEventTypes: settings.eventTypes,
          languageChoice: settings.language,
          perks: perksFor(shop, settings, await shopDeals(shop, settings)),
          values: profile ? { registrantName: profile.name, registrantEmail: profile.email } : undefined,
        }));
      }

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
        countView(request, shop.id, STAT_METRICS.findPageView);
        return await findPage(ctx, shop, brand, settings);

      case "my-registries":
        return await myRegistriesJson(ctx, shop);

      case "deal":
        return await productDealJson(ctx, shop, settings);

      case "account":
        return await accountPage(ctx, shop, brand);

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

      case "gift-card":
        countView(request, shop.id, STAT_METRICS.giftCardPageView);
        return giftCardPage(ctx, shop, settings, brand);

      default:
        return page(
          renderSimplePage(brand, t("server.p.notFound.t"), t("server.p.notFound.m"), {
            label: t("server.p.start"),
            href: ctx.pathPrefix,
          }),
          404,
        );
    }
  } catch (err) {
    console.error("[proxy]", err);
    return page(
      renderSimplePage(brand, t("server.p.wrong.t"), t("server.p.wrong.m")),
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

/** Registry perks (Pro) for the create and manage pages. See app/shared/perks.ts. */
function perksFor(shop: Pick<ShopRecord, "plan" | "currency">, settings: ShopSettings, deals: Deal[] = []): string[] {
  const perks = registrantPerks({
    pro: isPro(shop),
    registryPerks: settings.registryPerks,
    completionDiscountEnabled: settings.completionDiscountEnabled,
    completionDiscountPercent: settings.completionDiscountPercent,
  });
  // Registry promotions (Pro): what guests get for buying from the registry.
  return isPro(shop) ? [...perks, ...promotionPerkLines(deals, shop.currency)] : perks;
}

/**
 * The store's running registry promotions (Pro), for the banner, price tags
 * and perk lines. A minute of cache keeps it to one Admin API call per shop
 * a minute however many pages are opened.
 */
async function shopDeals(shop: Pick<ShopRecord, "plan" | "domain">, settings: ShopSettings): Promise<Deal[]> {
  if (!isPro(shop) || settings.promotionIds.length === 0) return [];
  return cached(`deals:${shop.domain}`, 60, () => liveDeals(shop.domain, settings.promotionIds));
}

/**
 * The barcode reader for phones without a built-in one (iPhone Safari). It's
 * served from the app, not a CDN, and only fetched when someone taps Scan.
 */
function scannerScriptUrl(): string | null {
  const base = process.env.SHOPIFY_APP_URL;
  return base ? `${base.replace(/\/+$/, "")}/vendor/zxing-library-0.21.3.min.js` : null;
}

async function registryPage(
  request: Request,
  ctx: ProxyContext,
  shop: ShopRecord,
  settings: ShopSettings,
  brand: Brand,
  slug: string | undefined,
): Promise<Response> {
  if (!slug) return page(renderSimplePage(brand, t("server.p.notFound.t"), t("server.p.incomplete")), 404);

  const registry = await findBySlug(ctx.shop, slug);
  if (!registry) {
    return page(
      renderSimplePage(brand, t("server.p.regNotFound.t"), t("server.p.regNotFound.m")),
      404,
    );
  }

  if (registry.privacy === "password") {
    const supplied = ctx.query.get("pw");
    if (!checkRegistryPassword(registry, supplied)) {
      return page(renderPasswordPage({ ...brand, actionUrl: ctx.pathPrefix, slug }));
    }
  }

  // Counted outside the page cache below, so a cached render still counts.
  countView(request, shop.id, STAT_METRICS.registryView, registry.id);

  // Read-through cache. A registry link going out to 80 guests at once should
  // be one render, not 80 — and the version in the key means a purchase
  // invalidates it the instant it lands.
  const html = await cached(
    registryCacheKey(registry.id, registry.version, `${registry.privacy === "password" ? "pw" : "page"}:${currentLocale()}`),
    60,
    async () =>
      buildRegistryHtml(
        registry,
        ctx,
        shop,
        settings,
        brand,
        await registryStock(ctx.shop, registry),
        await registryDeals(shop, settings, registry),
      ),
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

/**
 * Live stock for the registry's store products, fetched inside the page
 * cache above, so it costs at most one Admin API call per registry a minute.
 */
async function registryStock(shopDomain: string, registry: RegistryWithItems): Promise<StockMap> {
  const variantGids = registry.items
    .filter((i) => i.sourceType === "internal" && i.variantGid && i.purchasedQty < i.desiredQty)
    .map((i) => i.variantGid!);
  return variantGids.length ? fetchVariantStock(shopDomain, variantGids) : new Map();
}

/** The promotions advertised on one registry page: a banner, and a price line per discounted item. */
async function registryDeals(
  shop: ShopRecord,
  settings: ShopSettings,
  registry: RegistryWithItems,
): Promise<{ banner: string[]; itemDeals: Record<string, string> }> {
  const deals = await shopDeals(shop, settings);
  if (deals.length === 0) return { banner: [], itemDeals: {} };
  const items = registry.items.filter((i) => i.sourceType === "internal" && i.productGid && i.purchasedQty < i.desiredQty);
  const needCollections = deals.some((d) => d.config.collectionIds.length > 0);
  const collections = needCollections ? await productCollections(shop.domain, items.map((i) => i.productGid!)) : {};
  const itemDeals: Record<string, string> = {};
  for (const item of items) {
    const deal = dealForProduct(deals, item.productGid, collections[item.productGid!] ?? []);
    if (deal) itemDeals[item.id] = itemDealText(deal, Number(item.snapshotPrice) || 0, item.snapshotCurrency ?? shop.currency);
  }
  // Nothing on this registry qualifies (a collection sale, none of whose
  // products are here): don't advertise a deal the guest can't use.
  if (Object.keys(itemDeals).length === 0) return { banner: [], itemDeals };
  return { banner: bannerLines(deals, shop.currency), itemDeals };
}

function buildRegistryHtml(
  registry: RegistryWithItems,
  ctx: ProxyContext,
  shop: ShopRecord,
  settings: ShopSettings,
  brand: Brand,
  stock: StockMap = null,
  promotions: { banner: string[]; itemDeals: Record<string, string> } = { banner: [], itemDeals: {} },
): string {
  const chipIn = contributionsAvailable(shop, settings);
  // A fund nobody can pay into (plan lapsed, or the merchant removed the gift
  // card product) is hidden rather than shown as a dead end. Sold-out store
  // products are left off too when the merchant chose that (app/lib/stock.ts).
  const items = applyStock(registry.items.map((item) => toDisplayItem(item)), stock)
    .filter((item) => chipIn || !item.isFund)
    .filter((item) => !hiddenFromGuests(item, settings.soldOutItems));

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
    giftCardUrl: giftCardListingLive({
      pro: isPro(shop),
      uninstalled: shop.uninstalledAt !== null,
      listing: settings.giftCardListing,
      product: settings.contributionProduct,
    })
      ? `${ctx.pathPrefix.replace(/\/+$/, "")}/gift-card?src=registry`
      : null,
    shipToRegistrant: registry.shipToRegistrant,
    promoBanner: promotions.banner,
    itemDeals: promotions.itemDeals,
    contributions: chipIn
      ? {
          variants: settings.contributionProduct!.variants,
          toRegistrant: registry.contributionsToRegistrant,
        }
      : null,
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
        token ? t("server.p.expired.t") : t("server.p.private.t"),
        token
          ? t("server.p.expired.m")
          : t("server.p.private.m"),
        { label: t("server.p.newLink"), href: ctx.pathPrefix },
      ),
      403,
    );
  }

  // A fresh token on every visit: the page's own writes, the copyable link and
  // the browser's saved token all use it, so an active owner never expires.
  const freshToken = token ? renewManageToken(token, registry.id) : mintManageToken(registry.id);

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
        isContribution: p.isContribution,
        amount: p.amount === null ? null : Number(p.amount),
      })),
  );

  const flash = flashFrom(ctx);
  const flashKey = ctx.query.get("flash") ?? "";
  const shippingFlash = flashKey.startsWith("ship-") ? flash : null;
  const setupParam = ctx.query.get("setup");
  const setupStep = setupParam === "1" ? 1 : setupParam === "2" ? 2 : undefined;

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
      affiliateLinkWrapperBase: process.env.AFFILIATE_LINK_WRAPPER_BASE || null,
      chromeExtensionUrl: process.env.CHROME_EXTENSION_URL || null,
      extensionConnect: ctx.query.get("extension") === "1",
      items: applyStock(registry.items.map((item) => toDisplayItem(item)), await registryStock(ctx.shop, registry)),
      soldOutHidden: settings.soldOutItems === "hide",
      perks: perksFor(shop, settings, await shopDeals(shop, settings)),
      enabledEventTypes: settings.eventTypes,
      languageChoice: true,
      language: registry.language ?? settings.language,
      scanner: isPro(shop),
      scannerScriptUrl: scannerScriptUrl(),
      currency: shop.currency,
      shareUrl: absoluteProxyUrl(ctx.shop, ctx.pathPrefix, `r/${registry.slug}`),
      actionUrl: `${ctx.pathPrefix.replace(/\/+$/, "")}`,
      token: freshToken,
      manageUrl: absoluteProxyUrl(ctx.shop, ctx.pathPrefix, "manage", { t: freshToken }),
      myRegistriesUrl: proxyUrl(ctx, "account", { t: freshToken }),
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
      contributions: contributionsAvailable(shop, settings)
        ? { toRegistrant: registry.contributionsToRegistrant }
        : null,
      partner: partnerFor(registry),
      setupStep,
      // A save from "Edit registry & preferences" lands back with it open.
      prefsOpen: !setupStep && (flashKey === "saved" || flashKey.startsWith("ship-") || flashKey.startsWith("partner-")),
    }),
  );
}

function partnerFor(registry: RegistryWithItems): { name: string } | null {
  const partner = registry.registrants.find((r) => r.role === "co");
  return partner ? { name: partner.name } : null;
}

async function findPage(
  ctx: ProxyContext,
  shop: ShopRecord,
  brand: Brand,
  settings: ShopSettings,
): Promise<Response> {
  // The theme's "Registry links" block shows a t("server.p.find.t") link by
  // default, and the theme can't see this setting, so a store that hasn't
  // turned the search on used to send that link to t("server.p.notFound.t") (Ben, 29
  // Oct 2026). Tell the guest what to do instead of showing a dead end.
  if (!settings.findARegistryEnabled) {
    return page(
      renderSimplePage(
        brand,
        t("server.p.find.t"),
        t("server.p.find.m", { shop: brand.shopName }),
        { label: t("server.p.startOwn"), href: ctx.pathPrefix },
      ),
    );
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
          include: { registrants: { orderBy: { createdAt: "asc" } } },
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
        coverImageUrl: r.coverImageUrl,
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
/**
 * The registry deal for one product, for the "Add to registry" button block
 * on the storefront product page. Advertising only (the checkout function
 * grants the price). `?product=<numeric id>&price=<amount>`.
 */
async function productDealJson(ctx: ProxyContext, shop: ShopRecord, settings: ShopSettings): Promise<Response> {
  const numeric = (ctx.query.get("product") ?? "").replace(/\D/g, "").slice(0, 20);
  const deals = numeric ? await shopDeals(shop, settings) : [];
  if (!numeric || deals.length === 0) return json({ text: null });
  const gid = `gid://shopify/Product/${numeric}`;
  const needCollections = deals.some((d) => d.config.collectionIds.length > 0);
  const collections = needCollections ? await productCollections(shop.domain, [gid]) : {};
  const deal = dealForProduct(deals, gid, collections[gid] ?? []);
  if (!deal) return json({ text: null });
  const price = Number(ctx.query.get("price")) || 0;
  return json({ text: itemDealText(deal, price, shop.currency) });
}

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

/**
 * My registries: every registry one email holds here. Opened from an emailed
 * link (?a=); a signed-in store customer also sees the ones tied to their
 * account. See mintAccountToken for why a manage link alone doesn't open it.
 */
async function accountPage(ctx: ProxyContext, shop: ShopRecord, brand: Brand): Promise<Response> {
  const rawAccount = ctx.query.get("a");
  const emailHash = readAccountToken(rawAccount, shop.id);
  const customerId = ctx.loggedInCustomerId ? String(ctx.loggedInCustomerId) : null;
  const rawManage = ctx.query.get("t");
  const manageToken = readManageGrant(rawManage) ? rawManage : null;

  if (!emailHash && !customerId) {
    return page(
      renderAccountSignInPage({
        ...brand,
        actionUrl: ctx.pathPrefix.replace(/\/+$/, ""),
        manageToken,
        expired: Boolean(rawAccount),
      }),
      rawAccount ? 403 : 200,
    );
  }

  const registries = await listAccountRegistries(shop.id, emailHash, customerId);
  const fresh = emailHash ? mintAccountToken(shop.id, emailHash) : null;
  return page(
    renderAccountPage({
      ...brand,
      actionUrl: ctx.pathPrefix,
      registries: registries.map((r) => ({ ...r, href: proxyUrl(ctx, "manage", { t: r.token }) })),
      createHref: fresh ? proxyUrl(ctx, "", { a: fresh }) : ctx.pathPrefix,
      accountToken: fresh,
      manageToken,
    }),
  );
}

async function sendAccountEmail(ctx: ProxyContext, shop: ShopRecord, email: string, titles: string[]): Promise<void> {
  await sendEmail("registry-account", email, {
    shopName: shop.name ?? ctx.shop.replace(".myshopify.com", ""),
    titles: titles.slice(0, 20),
    url: absoluteProxyUrl(ctx.shop, ctx.pathPrefix, "account", { a: mintAccountToken(shop.id, blindIndex(email)) }),
  });
}

/**
 * "Email me the link" from a manage page: sends the My registries link to the
 * email of whoever this manage link belongs to (the owner, or the partner for a
 * partner link). Never to the person clicking, unless that's them.
 */
async function accountLinkAction(ctx: ProxyContext, shop: ShopRecord, brand: Brand): Promise<Response> {
  // From the My registries page itself: the account link already proves the
  // email, so send a fresh copy to it.
  const accountHash = readAccountToken(ctx.query.get("a"), shop.id);
  if (accountHash) {
    const profile = await accountProfile(shop.id, accountHash);
    if (profile) {
      const registries = await findByEmail(shop.id, profile.email);
      await sendAccountEmail(ctx, shop, profile.email, registries.map((r) => r.title));
    }
    return page(renderSimplePage(brand, t("server.p.check.t"), t("server.p.check.m2")));
  }
  const registry = await requireManage(ctx);
  if (registry) {
    const grant = readManageGrant(ctx.query.get("t"));
    const holder = grant?.partnerId
      ? registry.registrants.find((r) => r.id === grant.partnerId)
      : ownerOf(registry.registrants);
    const email = holder ? registrantEmail(holder) : null;
    if (email) {
      const registries = await findByEmail(shop.id, email);
      await sendAccountEmail(ctx, shop, email, registries.map((r) => r.title));
    }
  }
  return page(
    renderSimplePage(brand, t("server.p.check.t"), t("server.p.check.m3")),
  );
}

async function confirmPage(ctx: ProxyContext, brand: Brand): Promise<Response> {
  const claimId = readClaimToken(ctx.query.get("c"));
  if (!claimId) {
    return page(renderSimplePage(brand, t("server.p.claimExpired.t"), t("server.p.claimExpired.m")), 410);
  }
  await confirmClaim(claimId);
  return page(
    renderSimplePage(brand, t("server.p.thanks.t"), t("server.p.thanks.m")),
  );
}

async function releasePage(ctx: ProxyContext, brand: Brand): Promise<Response> {
  const claimId = readClaimToken(ctx.query.get("c"));
  if (claimId) await releaseClaim(claimId);
  return page(renderSimplePage(brand, t("server.p.back.t"), t("server.p.back.m")));
}

async function unsubscribePage(ctx: ProxyContext, brand: Brand): Promise<Response> {
  const reminderId = readGuestUnsubscribeToken(ctx.query.get("u"));
  if (reminderId) await removeGuestReminder(reminderId);
  return page(renderSimplePage(brand, t("server.p.unsub.t"), t("server.p.unsub.m")));
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
        purchase.isContribution
          ? `Chipped in ${purchase.amount ?? ""} ${purchase.currency ?? ""}`.trim()
          : String(purchase.qty),
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
    case "account-link":
      return await accountLinkAction(ctx, shop, brand);
    case "resend":
      return resendAction(request, ctx, shop, brand);
    case "r":
      return unlockAction(request, ctx, segments[1]);
    case "cart-add":
      return cartAddAction(request, ctx);
    case "contribute":
      return contributeAction(request, ctx, shop, settings);
    case "add-fund":
      return addFundAction(request, ctx, shop);
    case "item-fund":
      return itemFundAction(request, ctx, shop);
    case "contribution-settings":
      return contributionSettingsAction(request, ctx);
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
      return addManualAction(request, ctx, shop);
    case "add-from-store":
      return addFromStoreAction(request, ctx, shop);
    case "scan-lookup":
      return scanLookupAction(request, ctx, shop);
    case "scan-add":
      return scanAddAction(request, ctx, shop);
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
      return settingsAction(request, ctx, settings);
    case "shipping":
      return shippingAction(request, ctx);
    case "partner":
      return partnerAction(request, ctx, brand);
    case "partner-remove":
      return partnerRemoveAction(ctx, brand);
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
    ["eventType", "title", "eventDate", "registrantName", "registrantEmail", "message", "country", "language"].map((k) => [
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
        languageChoice: settings.language,
        perks: perksFor(shop, settings, await shopDeals(shop, settings)),
        error: t("server.createInvalid"),
        values,
      }),
      400,
    );
  }

  const registry = await createRegistry({
    shopId: shop.id,
    customerId: ctx.loggedInCustomerId,
    eventType: values.eventType || "other",
    eventDate: values.eventDate && !isDatelessOccasion(values.eventType) ? new Date(`${values.eventDate}T00:00:00Z`) : null,
    title: values.title.trim(),
    message: values.message.trim() || null,
    registrantName: values.registrantName.trim(),
    registrantEmail: email,
    country: normalizeCountry(values.country),
    language: registryLanguageFrom(values.language, settings.language, true),
  });
  // The first email and the page it lands on are in the language just chosen.
  overrideLocale(registry.language);

  const manageUrl = absoluteProxyUrl(ctx.shop, ctx.pathPrefix, "manage", {
    t: mintManageToken(registry.id),
  });

  await sendEmail("registry-link", email, { registryTitle: registry.title, eventType: registry.eventType, url: manageUrl });
  await queueFlowTrigger(registry.id, "registryCreated");

  // Straight into the registry rather than a "check your email" dead end —
  // the email is the durable copy, not the gate. setup=1 opens the first-run
  // questions (renderSetup in render/manage-page.ts) over it, once.
  return redirect(`${manageUrl}&setup=1`);
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
    // More than one: a single My registries link rather than an email each.
    if (registries.length > 1) {
      await sendAccountEmail(ctx, shop, email, registries.map((r) => r.title));
    }
    for (const registry of registries.length === 1 ? registries : []) {
      const registrant = registry.registrants[0];
      if (!registrant) continue;
      await sendEmail("registry-link", email, {
        registryTitle: registry.title,
        eventType: registry.eventType,
        url: absoluteProxyUrl(ctx.shop, ctx.pathPrefix, "manage", { t: manageTokenFor(registry.id, registrant) }),
      });
    }
  }

  // Identical response whether or not the address exists. Confirming which
  // emails have registries here would leak exactly the thing we encrypt.
  return page(
    renderSimplePage(
      brand,
      t("server.p.check.t"),
      t("server.p.check.m1"),
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
    include: { registry: { include: { registrants: { select: { name: true } } } } },
  });

  if (!item || !item.variantGid?.endsWith(`/${variantId}`)) {
    return json({ ok: false, error: t("server.itemGone") }, 404);
  }
  const names = item.registry.registrants.map((r) => firstNameOnly(r.name)).filter(Boolean).join(" & ");
  void bumpStat(item.registry.shopId, STAT_METRICS.cartAdd, { registryId: item.registryId, count: qty });

  return json({
    ok: true,
    payload: cartAddPayload(
      variantId,
      qty,
      item.registryId,
      item.id,
      // Only when the guest left "ship to the registrant" ticked.
      item.registry.shipToRegistrant && body.shipToRegistrant === true,
      names,
      giftForValue(names, eventTypeLabel(item.registry.eventType), item.registry.eventDate),
    ),
  });
}

// ---------------------------------------------------------------------------
// Group gifts and cash funds (Pro) — see SPIKE-C.md
// ---------------------------------------------------------------------------

/** Chip-ins need Pro AND a gift card product the merchant picked in Settings. */
/**
 * The store's gift card page, where giftpin.app/gift-cards sends shoppers.
 * Only while the listing is live (Pro, switched on, amounts to sell): a
 * lapsed listing says so rather than selling through a page the merchant
 * turned off.
 */
function giftCardPage(ctx: ProxyContext, shop: ShopRecord, settings: ShopSettings, brand: Brand): Response {
  const live = giftCardListingLive({
    pro: isPro(shop),
    uninstalled: shop.uninstalledAt !== null,
    listing: settings.giftCardListing,
    product: settings.contributionProduct,
  });
  if (!live) {
    return page(
      renderSimplePage(brand, t("server.p.noGc.t"), t("server.p.noGc.m")),
      404,
    );
  }
  return page(
    renderGiftCardPage({
      ...brand,
      currency: shop.currency,
      amounts: listedGiftCardAmounts(settings.contributionProduct),
      blurb: settings.giftCardListing.blurb,
      token: signGiftCardAttribution(ctx.shop, giftCardSource(ctx.query.get("src"))),
    }),
  );
}

function contributionsAvailable(shop: ShopRecord, settings: ShopSettings): boolean {
  return isPro(shop) && (settings.contributionProduct?.variants.length ?? 0) > 0;
}

/**
 * Guest chip-in. Mints the gift card line for the browser to post to
 * /cart/add.js, exactly like cartAddAction does for a product.
 *
 * The couple's email only leaves the server when they opted in to receiving
 * the cards themselves (Registry.contributionsToRegistrant) — it has to go on
 * the cart line for Shopify to deliver to it, where the guest can see it.
 */
async function contributeAction(
  request: Request,
  ctx: ProxyContext,
  shop: ShopRecord,
  settings: ShopSettings,
): Promise<Response> {
  if (!contributionsAvailable(shop, settings)) {
    return json({ ok: false, error: t("server.chipUnavail") }, 404);
  }

  const body = await readJson(request);
  const itemId = String(body.itemId ?? "");
  const variantId = String(body.variantId ?? "");

  const variant = settings.contributionProduct!.variants.find((v) => v.id === variantId);
  if (!variant) return json({ ok: false, error: t("server.pickAmount") }, 400);

  const item = await db.registryItem.findFirst({
    where: { id: itemId, fundGoal: { not: null }, registry: { shopId: shop.id, status: "active" } },
    include: { registry: { include: { registrants: { orderBy: { createdAt: "asc" } } } } },
  });
  if (!item) return json({ ok: false, error: t("server.itemGone") }, 404);

  if (fundState(item.fundGoal, item.fundedAmount)?.complete) {
    return json({ ok: false, error: t("server.fullyFunded") }, 409);
  }

  let recipient: Record<string, string> | null = null;
  // The owner's address only, never the partner's: it's what the owner opted
  // in to, and what the manage page tells them.
  const owner = ownerOf(item.registry.registrants);
  const email = item.registry.contributionsToRegistrant && owner ? registrantEmail(owner) : null;
  if (email && owner) {
    await audit({
      shop: ctx.shop,
      actor: "guest:contribute",
      action: "registrant_email_decrypted",
      subject: item.registryId,
      detail: { purpose: "gift_card_recipient", optedIn: true },
    });
    recipient = giftCardRecipientProperties({
      email,
      name: item.registry.registrants.map((r) => firstNameOnly(r.name)).join(" & "),
      message: typeof body.message === "string" ? body.message : null,
    });
  }

  return json({
    ok: true,
    toRegistrant: recipient !== null,
    payload: contributionCartPayload(variant.id, item.registryId, item.id, recipient),
  });
}

async function addFundAction(request: Request, ctx: ProxyContext, shop: ShopRecord): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return json({ ok: false, error: t("server.notAuth") }, 403);
  if (!isPro(shop)) return json({ ok: false, error: t("server.fundsUnavail") }, 403);

  const body = await readJson(request);
  const goal = parseFundGoal(body.goal);
  if (!goal) return json({ ok: false, error: t("server.goalAmount") }, 400);

  try {
    await addFundItem({
      registryId: registry.id,
      title: String(body.title ?? ""),
      goal,
      note: cleanNote(body.note),
      currency: shop.currency,
    });
    return json({ ok: true });
  } catch (err) {
    if (err instanceof ItemError) return json({ ok: false, error: err.message }, 400);
    throw err;
  }
}

/** Group gifting on/off for one of the store's own items. */
async function itemFundAction(request: Request, ctx: ProxyContext, shop: ShopRecord): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return json({ ok: false, error: t("server.notAuth") }, 403);

  const body = await readJson(request);
  const itemId = String(body.itemId ?? "");
  const turningOn = body.goal !== null && body.goal !== undefined && body.goal !== "";
  // Switching OFF stays allowed after a downgrade, so nobody is stuck.
  if (turningOn && !isPro(shop)) {
    return json({ ok: false, error: t("server.groupUnavail") }, 403);
  }
  const goal = turningOn ? parseFundGoal(body.goal) : null;
  if (turningOn && !goal) return json({ ok: false, error: t("server.goalAmount") }, 400);

  try {
    await setItemFundGoal(itemId, registry.id, goal);
    return json({ ok: true });
  } catch (err) {
    if (err instanceof ItemError) return json({ ok: false, error: err.message }, 400);
    throw err;
  }
}

async function contributionSettingsAction(request: Request, ctx: ProxyContext): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return json({ ok: false, error: t("server.notAuth") }, 403);

  const body = await readJson(request);
  await updateRegistry(registry.id, { contributionsToRegistrant: body.toRegistrant === true });
  await logEvent(registry.id, "settings_updated", { contributionsToRegistrant: body.toRegistrant === true });
  return json({ ok: true });
}

async function claimAction(request: Request, ctx: ProxyContext): Promise<Response> {
  const body = await readJson(request);
  const itemId = String(body.itemId ?? "");

  const item = await db.registryItem.findFirst({
    where: { id: itemId, registry: { shop: { domain: ctx.shop } } },
    include: { externalSource: true },
  });
  if (!item) return json({ ok: false }, 404);
  if (item.sourceType !== "internal") {
    const shopRow = await db.shop.findUnique({ where: { domain: ctx.shop }, select: { id: true } });
    if (shopRow) void bumpStat(shopRow.id, STAT_METRICS.externalClick, { registryId: item.registryId });
  }

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
  if (!item) return json({ ok: false, error: t("server.itemNotFound") }, 404);

  if (item.sourceType === "fund") {
    return json({ ok: false, error: t("server.autoTracked") }, 400);
  }

  const details = {
    buyerName: typeof body.buyerName === "string" ? body.buyerName : null,
    buyerMessage: typeof body.buyerMessage === "string" ? body.buyerMessage : null,
  };

  if (item.sourceType === "internal") {
    const purchase = await confirmBoughtElsewhere(item.id, details);
    if (!purchase) return json({ ok: false, error: t("server.alreadyHandled") }, 409);
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
  if (!claim) return json({ ok: false, error: t("server.alreadyHandled") }, 409);
  const purchase = await confirmClaim(claim.claimId, details);
  return json({ ok: true, undoToken: purchase ? mintUndoToken(purchase.id) : null });
}

/** Guest undoing their own "I bought this", within the undo window. */
async function undoBoughtAction(request: Request, ctx: ProxyContext): Promise<Response> {
  const body = await readJson(request);
  const purchaseId = readUndoToken(typeof body.token === "string" ? body.token : null);
  if (!purchaseId) return json({ ok: false, error: t("server.noUndo") }, 400);

  // Scope to this shop, the same as every other guest action.
  const purchase = await db.purchase.findFirst({
    where: { id: purchaseId, item: { registry: { shop: { domain: ctx.shop } } } },
    select: { id: true },
  });
  if (!purchase || !(await undoGuestPurchase(purchase.id))) {
    return json({ ok: false, error: t("server.noUndo") }, 409);
  }
  return json({ ok: true });
}

async function addExternalAction(request: Request, ctx: ProxyContext): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return json({ ok: false, error: t("server.notAuth") }, 403);

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
      { ok: false, error: t("server.pageRead") },
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
  if (!registry) return json({ ok: false, error: t("server.notAuth") }, 403);

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
  if (!registry) return json({ ok: false, error: t("server.notAuth") }, 403);

  const body = await readJson(request);
  const title = String(body.title ?? "").trim().slice(0, 300);
  if (!title) return json({ ok: false, error: t("server.itemName") }, 400);

  // Required: a pasted item from a site that blocks our read has nothing else
  // telling guests what it costs (Ben, 25 Sep 2026).
  const rawPrice = typeof body.price === "string" ? body.price.trim() : "";
  if (!rawPrice) return json({ ok: false, error: t("server.itemPrice") }, 400);
  const price = normalizePrice(rawPrice);
  if (price === null) return json({ ok: false, error: t("server.priceBad") }, 400);

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
      return json({ ok: false, error: t("server.linkDup") }, 409);
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
    return json({ ok: false, error: t("server.notAuth") }, 403);
  }

  // The registrant confirmed, in the button's duplicate-quantity prompt, an
  // explicit total for an item already on the registry — a deliberate "yes I
  // want N of these", not a second add silently bumping the count. Same
  // manage-token authorisation as a normal add, just a different write.
  if (typeof body.itemId === "string" && body.confirmQty !== undefined) {
    const item = registry.items.find((i) => i.id === body.itemId);
    if (!item) return json({ ok: false, error: t("server.itemNotFound") }, 404);

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
    return json({ ok: false, error: t("server.missingProduct") }, 400);
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

/**
 * In-store scanning (Pro): the registrant walks the shop with their own phone,
 * scans a product's barcode on the manage page, and adds it. Same manage-token
 * authorisation as every other edit. The product details come from the
 * merchant's catalog, never from the phone.
 */
async function scanLookupAction(request: Request, ctx: ProxyContext, shop: ShopRecord): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return json({ ok: false, error: t("server.notAuth") }, 403);
  if (!isPro(shop)) return json({ ok: false, error: t("server.scanUnavail") }, 403);

  const body = await readJson(request);
  try {
    const variants = await findVariantsByCode(ctx.shop, body.code);
    return json({
      ok: true,
      matches: variants.slice(0, 5).map((v) => ({
        variantId: v.variantGid.split("/").pop(),
        title: v.title,
        imageUrl: v.imageUrl,
        price: formatMoney(Number(v.price), shop.currency) || null,
        availableForSale: v.availableForSale,
        onRegistry: registry.items.some((i) => i.variantGid === v.variantGid),
      })),
    });
  } catch (err) {
    console.error("[scan] lookup failed:", (err as Error).message);
    return json({ ok: false, error: t("server.lookupFail") }, 502);
  }
}

async function scanAddAction(request: Request, ctx: ProxyContext, shop: ShopRecord): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return json({ ok: false, error: t("server.notAuth") }, 403);
  if (!isPro(shop)) return json({ ok: false, error: t("server.scanUnavail") }, 403);

  const body = await readJson(request);
  const variantId = String(body.variantId ?? "");
  if (!/^\d+$/.test(variantId)) return json({ ok: false, error: t("server.missingProduct") }, 400);
  const variantGid = `gid://shopify/ProductVariant/${variantId}`;

  // Already on the list: only a deliberate "add one more" changes the count,
  // the same rule as the product-page button (no silent bumps).
  const existing = registry.items.find((i) => i.variantGid === variantGid);
  if (existing) {
    if (body.addOne !== true) {
      return json({ ok: true, duplicate: true, currentQty: existing.desiredQty });
    }
    const desiredQty = Math.min(99, existing.desiredQty + 1);
    await updateItem(existing.id, registry.id, { desiredQty });
    return json({ ok: true, desiredQty });
  }

  let variant;
  try {
    variant = await getVariant(ctx.shop, variantGid);
  } catch (err) {
    console.error("[scan] variant lookup failed:", (err as Error).message);
    return json({ ok: false, error: t("server.addFail") }, 502);
  }
  if (!variant) return json({ ok: false, error: t("server.productNotInStore") }, 404);

  const result = await addInternalItem({
    registryId: registry.id,
    productGid: variant.productGid,
    variantGid: variant.variantGid,
    title: variant.title.slice(0, 300),
    imageUrl: variant.imageUrl,
    price: variant.price,
    currency: shop.currency,
    desiredQty: 1,
  });
  if (result.duplicate) return json({ ok: true, duplicate: true, currentQty: result.item.desiredQty });
  return json({ ok: true, added: true });
}

/** GET .../ext-verify?t=<token> — the browser extension's one-time "connect" check. */
async function extVerifyAction(ctx: ProxyContext, shop: ShopRecord): Promise<Response> {
  const token = ctx.query.get("t");
  const registryId = token ? readTokenRegistryId(token) : null;
  const registry = registryId ? await authorizeManage(registryId, token, null) : null;

  if (!registry || registry.shopId !== shop.id) {
    return json({ ok: false, error: t("server.linkExpiredAsk") }, 401);
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
  if (!registryId) return json({ ok: false, error: t("server.notAuth") }, 403);

  const registry = await authorizeManage(registryId, token, null);
  if (!registry || registry.shopId !== shop.id) {
    return json({ ok: false, error: t("server.notAuth") }, 403);
  }

  // Confirming an explicit total for something the extension already found
  // on this registry — same "ask, don't silently bump" pattern as the theme
  // button's duplicate prompt.
  if (typeof body.itemId === "string" && body.confirmQty !== undefined) {
    const item = registry.items.find((i) => i.id === body.itemId);
    if (!item) return json({ ok: false, error: t("server.itemNotFound") }, 404);

    const desiredQty = clampInt(body.confirmQty, 1, 99);
    if (desiredQty < item.purchasedQty) {
      return json({ ok: false, error: `${item.purchasedQty} have already been bought` }, 400);
    }

    await updateItem(item.id, registry.id, { desiredQty });
    return json({ ok: true });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return json({ ok: false, error: t("server.noProductName") }, 400);

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
/**
 * An item added by name, with an optional link and price. The manage page's
 * ideas guide uses it for experiences (a cooking class, a spa day), which no
 * store search can find (29 Oct 2026). Those are bought somewhere else, so
 * the store's "items from other stores" setting applies (addNamedItem).
 */
async function addManualAction(request: Request, ctx: ProxyContext, shop: ShopRecord): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return json({ ok: false, error: t("server.notAuth") }, 403);

  const body = await readJson(request);
  const title = String(body.title ?? "").trim();
  if (!title) return json({ ok: false, error: t("server.itemName") }, 400);

  // Optional here, but a typed "$120" must not reach the database as text.
  const rawPrice = typeof body.price === "string" ? body.price.trim() : "";
  const price = rawPrice ? normalizePrice(rawPrice) : null;
  if (rawPrice && price === null) return json({ ok: false, error: t("server.priceBad") }, 400);

  try {
    await addNamedItem({
      registryId: registry.id,
      title,
      url: typeof body.url === "string" && body.url.trim() ? body.url.trim() : null,
      price,
      currency: price
        ? normalizeCurrency(typeof body.currency === "string" ? body.currency : null) ?? shop.currency
        : null,
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
  if (!registry) return json({ ok: false, error: t("server.notAuth") }, 403);

  const body = await readJson(request);
  const itemId = String(body.itemId ?? "");
  const desiredQty = clampInt(body.desiredQty, 1, 99);

  const item = registry.items.find((i) => i.id === itemId);
  if (!item) return json({ ok: false, error: t("server.itemNotFound") }, 404);
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
  if (!registry) return json({ ok: false, error: t("server.notAuth") }, 403);

  const body = await readJson(request);
  const action = String(body.action ?? "");
  if (action !== "keep" && action !== "dismiss" && action !== "swap") {
    return json({ ok: false, error: t("server.unknownAction") }, 400);
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
  if (!registry) return json({ ok: false, error: t("server.notAuth") }, 403);

  const body = await readJson(request);
  try {
    const preview = await getMatchPreview(registry.id, String(body.itemId ?? ""));
    return json({ ok: true, ...preview });
  } catch (err) {
    if (err instanceof ItemError) return json({ ok: false, error: err.message }, 400);
    console.error("[proxy] match-preview failed:", (err as Error).message);
    return json({ ok: false, error: t("server.storeProductsFail") }, 502);
  }
}

async function removeItemAction(request: Request, ctx: ProxyContext): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return json({ ok: false, error: t("server.notAuth") }, 403);

  const body = await readJson(request);
  try {
    await removeItem(String(body.itemId ?? ""), registry.id);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: (err as Error).message }, 400);
  }
}

async function settingsAction(request: Request, ctx: ProxyContext, settings: ShopSettings): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return new Response("Unauthorized", { status: 403 });

  const form = await request.formData();
  const privacy = String(form.get("privacy") ?? "unlisted");
  const eventDate = String(form.get("eventDate") ?? "");
  const eventType = String(form.get("eventType") ?? registry.eventType);

  await updateRegistry(registry.id, {
    title: String(form.get("title") ?? registry.title).slice(0, 200),
    eventType,
    eventDate: eventDate && !isDatelessOccasion(eventType) ? new Date(`${eventDate}T00:00:00Z`) : null,
    message: String(form.get("message") ?? "").slice(0, 2000) || null,
    country: normalizeCountry(form.get("country")),
    ...(form.has("language")
      ? { language: registryLanguageFrom(form.get("language"), settings.language, true) }
      : {}),
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
  // From the setup dialog: an error stays on that step, anything else moves
  // on to step 2 (the partner question).
  const setup = ctx.query.get("setup") === "1";
  const back = (flash: string) =>
    redirect(proxyUrl(ctx, "manage", { t: ctx.query.get("t") ?? "", flash }) + "#ship");
  const next = () => redirect(proxyUrl(ctx, "manage", { t: ctx.query.get("t") ?? "", setup: "2" }));

  if (form.get("enabled") !== "on") {
    if (setup) return next();
    await setShippingAddress(registry.id, null);
    await logEvent(registry.id, "shipping_address_updated", { enabled: false });
    return back("ship-off");
  }

  const parsed = parseShippingAddressForm(form);
  if ("error" in parsed) {
    return setup
      ? redirect(proxyUrl(ctx, "manage", { t: ctx.query.get("t") ?? "", flash: `ship-${parsed.error}`, setup: "1" }))
      : back(`ship-${parsed.error}`);
  }

  await setShippingAddress(registry.id, parsed.address);
  await logEvent(registry.id, "shipping_address_updated", { enabled: true, country: parsed.address.countryCode });
  return setup ? next() : back("ship-saved");
}

/**
 * Owner adds their partner. The partner gets their own copy of the private
 * manage link by email; from then on they can do anything the owner can,
 * including removing themselves. See addPartner().
 */
async function partnerAction(request: Request, ctx: ProxyContext, brand: Brand): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return new Response("Unauthorized", { status: 403 });

  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const back = (flash: string) =>
    redirect(proxyUrl(ctx, "manage", { t: ctx.query.get("t") ?? "", flash }) + "#partner");
  // From the setup dialog's last step: a mistake keeps the dialog open.
  const retry = (flash: string) =>
    ctx.query.get("setup") === "2"
      ? redirect(proxyUrl(ctx, "manage", { t: ctx.query.get("t") ?? "", flash, setup: "2" }))
      : back(flash);

  if (!name || !isEmail(email)) return retry("partner-invalid");

  const result = await addPartner(registry.id, { name, email });
  if (!result.ok) return retry(`partner-${result.error === "has_partner" ? "exists" : "self"}`);

  await logEvent(registry.id, "partner_added", {});
  const owner = ownerOf(registry.registrants);
  await sendEmail("registry-partner", email, {
    registryTitle: registry.title,
    inviterName: owner ? firstNameOnly(owner.name) : "",
    shopName: brand.shopName,
    url: absoluteProxyUrl(ctx.shop, ctx.pathPrefix, "manage", {
      t: manageTokenFor(registry.id, { id: result.partner.id, role: "co" }),
    }),
  });
  return back("partner-added");
}

async function partnerRemoveAction(ctx: ProxyContext, brand: Brand): Promise<Response> {
  const registry = await requireManage(ctx);
  if (!registry) return new Response("Unauthorized", { status: 403 });

  await removePartner(registry.id);
  await logEvent(registry.id, "partner_removed", {});
  // The partner removed themselves, so their link no longer opens the page.
  if (readManageGrant(ctx.query.get("t"))?.partnerId) {
    return page(renderSimplePage(brand, t("server.p.left.t"), t("server.p.left.m")));
  }
  return redirect(proxyUrl(ctx, "manage", { t: ctx.query.get("t") ?? "", flash: "partner-removed" }) + "#partner");
}

/**
 * Guest opts in to a pre-event reminder (Pro). Answers the same way whether or
 * not the email was already signed up, so this can't be used to check who is.
 */
async function remindAction(request: Request, ctx: ProxyContext, shop: ShopRecord): Promise<Response> {
  const body = await readJson(request);
  const email = String(body.email ?? "").trim();
  const registryId = String(body.registryId ?? "");
  if (!isEmail(email)) return json({ ok: false, error: t("server.emailBad") }, 400);

  const registry = await db.registry.findFirst({
    where: { id: registryId, shopId: shop.id, status: "active" },
    select: { id: true, eventDate: true },
  });
  if (!registry || !offersGuestReminder(shop, registry.eventDate)) {
    return json({ ok: false, error: t("server.remindersUnavail") }, 404);
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
      t("server.p.deleted.t"),
      t("server.p.deleted.m"),
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

const PARTNER_FLASH: Record<string, MessageKey> = {
  "partner-added": "manage.flash.partnerAdded",
  "partner-removed": "manage.flash.partnerRemoved",
  "partner-invalid": "manage.flash.partnerInvalid",
  "partner-exists": "manage.flash.partnerExists",
  "partner-self": "manage.flash.partnerSelf",
};
const PARTNER_FLASH_KIND: Record<string, "ok" | "err"> = {
  "partner-added": "ok",
  "partner-removed": "ok",
  "partner-invalid": "err",
  "partner-exists": "err",
  "partner-self": "err",
};

function flashFrom(ctx: ProxyContext): { kind: "ok" | "err"; message: string } | null {
  const flash = ctx.query.get("flash");
  if (flash === "saved") return { kind: "ok", message: t("manage.flash.saved") };
  if (flash === "ship-saved") return { kind: "ok", message: t("manage.flash.shipSaved") };
  if (flash?.startsWith("partner-") && flash in PARTNER_FLASH) {
    return { kind: PARTNER_FLASH_KIND[flash], message: t(PARTNER_FLASH[flash]) };
  }
  if (flash === "ship-off") return { kind: "ok", message: t("manage.flash.shipOff") };
  const shipError = flash?.startsWith("ship-") ? flash.slice(5) : null;
  if (shipError && shipError in SHIPPING_ADDRESS_ERRORS) {
    return { kind: "err", message: t(`manage.flash.shipErr.${shipError}` as MessageKey) };
  }
  return null;
}

export const __testables = { csvCell, isEmail, clampInt, firstNameOnly, escapeHtml };
