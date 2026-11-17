import type { PageBranding } from "../../shared/branding";
import { storeMatchHref, layout, tx, escapeHtml, escapeAttr, formatMoney, jsonForScript, jsStr } from "./layout";
import { formatLongDate, t, th, tNoun } from "../../shared/i18n";
import { GIFT_CATEGORIES, giftCategoryLabel, isGiftCategory } from "../../shared/gift-categories";
import type { DisplayItem } from "../../models/item.server";
import type { RegistryProgress } from "../../models/registry.server";
import { wrapAffiliateLink } from "../../lib/affiliate";
import { SHIP_TO_LABEL, shipToValue } from "../../lib/attribution";
import { eventHeroArt, eventHeroImage } from "../../shared/event-art";
import { REGISTRIES_STORAGE_KEY, LEGACY_REGISTRIES_STORAGE_KEY } from "../../shared/storage-keys";
import { UNDO_STORAGE_KEY, UNDO_WINDOW_SECONDS } from "../../shared/undo";
import type { ContributionVariant } from "../../shared/contributions";
import { isSoldOutStoreItem } from "../../lib/stock";
import { listNoun } from "../../shared/settings";

/**
 * The registry page — the thing 80 people open from a text message.
 *
 * Design rules, all of which come from the incumbent's reviews:
 *  - Readable and tappable on a phone first. Nothing below 44px.
 *  - No account, no login, no interstitial before seeing the gifts.
 *  - Merchant's own items first and buyable in one tap; external items are
 *    clearly secondary and clearly labelled as leaving the store.
 *  - Never show the registrant's email, phone or address.
 */

export interface RegistryPageData {
  /** Names of every store in the linked group; empty or undefined when not linked. */
  linkedStoreNames?: string[];
  title: string;
  message: string | null;
  /** Raw value ("wedding", "baby", ...) — picks the default hero art below. */
  eventType: string;
  eventLabel: string;
  eventDate: Date | null;
  coverImageUrl: string | null;
  registrantNames: string;
  /** Used only to recognise the owner's own browser (see clientScript). */
  registryId: string;
  items: DisplayItem[];
  progress: RegistryProgress;
  shopName: string;
  accentColor: string;
  branding?: PageBranding | null;
  indexable: boolean;
  currency: string;
  shareUrl: string;
  /** Where add-to-cart posts. Built from path_prefix, never hardcoded. */
  actionUrl: string;
  /** Registry.version at render time, so an open tab can tell it's gone stale. */
  version: number;
  /** GET endpoint returning `{ version }` — see registryVersionAction. */
  versionUrl: string;
  /**
   * Affiliate link-wrapper endpoint (see app/lib/affiliate.ts), or null/
   * undefined if no network is configured yet. Read from
   * process.env.AFFILIATE_LINK_WRAPPER_BASE by the caller, not here — this
   * module stays free of env access so it's trivial to test.
   */
  affiliateLinkWrapperBase?: string | null;
  /** Pro feature ("branding removal") — see app/routes/app.billing.tsx. */
  hidePoweredBy?: boolean;
  /**
   * Group gifts and cash funds (Pro, SPIKE-C.md): the gift card denominations
   * guests can chip in with. Null/undefined hides every chip-in control.
   */
  contributions?: {
    variants: ContributionVariant[];
    /** The couple opted in to receiving the cards directly. */
    toRegistrant: boolean;
  } | null;
  /**
   * The store's gift card page (/apps/registry/gift-card?src=registry), shown
   * as "Rather give a gift card?" while its giftpin.app listing is live.
   */
  giftCardUrl?: string | null;
  /** Pro: show the "email me before the event" sign-up. See automations.server.ts. */
  offerReminder?: boolean;
  /** App origin serving public/art/ (SHOPIFY_APP_URL) — see eventHeroImage. */
  artBaseUrl?: string | null;
  /**
   * The registrant saved a ship-to address. Each guest still chooses: they're
   * asked on their first add (see renderShipChoice), and "Send to me" leaves
   * the order's address alone (Ben, 25 Sep 2026: a guest may want it at their
   * own door).
   */
  shipToRegistrant?: boolean;
  /**
   * Registry promotions (Pro): lines for the banner above the list, and a
   * price line per discounted item (item id -> text). Advertising only; the
   * discount itself is applied at checkout. See app/shared/promotion-display.ts.
   */
  promoBanner?: string[];
  itemDeals?: Record<string, string>;
}

/**
 * Where a guest's gift ships (2 Nov 2026, Ben: a box at the top of the page
 * read like one setting for everyone, when every guest decides for
 * themselves). The guest is asked on EVERY "Add to cart" (Ben, same day: they
 * may want gifts sent to different places), and nothing about shipping shows
 * on the page before that. But one Shopify order has one shipping address, and
 * purchase.server.ts rewrites it for the whole order when any of this
 * registry's lines asks for it. So an answer also updates this registry's
 * lines already in the cart to match, and the prompt says that a different
 * place means a separate checkout. Each "In your cart" row then carries a
 * "Ships to ... Change" note. The choice can't live in checkout itself: Shopify only lets apps
 * add UI to the shipping step on Plus stores.
 *
 * window.rgShip(cb, form) is the hook the add-to-cart script calls:
 * cb(true|false) once the guest has chosen (and the cart is in step), or
 * cb(null) if they close the prompt.
 * window.rgShipShow(row) adds that note to a new "In your cart" row (markInCart
 * calls it) and refreshes every row's note.
 */
function renderShipChoice(data: RegistryPageData): string {
  if (!data.shipToRegistrant || !data.items.some((i) => i.sourceType === "internal")) return "";
  const who = data.registrantNames || t("guest.ship.fallbackWho");
  return `<style>.js-ship{margin:0}.js-ship .linkish{display:inline;margin:0;padding:0 2px;font-size:inherit}</style>
<dialog class="match-dialog js-ship-dialog" aria-labelledby="ship-q" data-who="${escapeAttr(who)}" data-key="rg_ship_${escapeAttr(data.registryId)}" data-label="${escapeAttr(shipToValue(data.registrantNames))}">
  <h2 id="ship-q" style="margin-top:0">${tx(t("guest.ship.title"))}</h2>
  <p class="hint">${tx(t("guest.ship.hint"))}</p>
  <p style="display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 0"><button type="button" class="btn" value="1">${tx(t("guest.ship.toThem", { who }))}</button><button type="button" class="btn ghost" value="0">${tx(t("guest.ship.toMe"))}</button></p>
</dialog>
<script>(function(){
  var S={to:${jsStr("guest.ship.shipsTo")},you:${jsStr("guest.ship.shipsToYou")},chg:${jsStr("guest.ship.change")},ask:${jsStr("guest.ship.confirm")},ok:${jsStr("guest.ship.cartUpdated")},bad:${jsStr("guest.ship.cartFailed")}};
  var dlg=document.querySelector('.js-ship-dialog'),st;
  var KEY=dlg.dataset.key,who=dlg.dataset.who,mem=null,pending=null;
  function get(){try{var v=localStorage.getItem(KEY);if(v==='1'||v==='0')return v==='1';}catch(_){}return mem;}
  function set(on){mem=on;try{localStorage.setItem(KEY,on?'1':'0');}catch(_){}show();}
  function show(p){if(p&&p.insertAdjacentHTML)p.insertAdjacentHTML('beforeend','<span class="hint js-ship" hidden><span></span> <button type="button" class="linkish js-ship-change">'+S.chg+'</button></span>');var on=get();document.querySelectorAll('.js-ship').forEach(function(x){x.hidden=on===null;x.firstChild.textContent=on?S.to.replace('{who}',who):S.you})}
  window.rgShipShow=show;
  function ask(cb){if(typeof dlg.showModal==='function'){pending=cb;dlg.showModal();}else cb(confirm(S.ask.replace('{who}',who)));}
  window.rgShip=function(cb,f){st=f;ask(function(v){if(v===null)return cb(v);set(v);update(v).then(function(){cb(v)})});};
  dlg.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var cb=pending;pending=null;dlg.close();if(cb)cb(b.value==='1');});
  dlg.addEventListener('close',function(){var cb=pending;pending=null;if(cb)cb(null);});
  document.addEventListener('click',function(e){var c=e.target.closest('.js-ship-change');if(!c)return;st=c.closest('.js-add');ask(function(on){if(on===null)return;set(on);update(on);});});
  function msg(t){var x=st&&st.querySelector('.js-status');if(x)x.textContent=t;}
  function update(on){
    return fetch('/cart.js',{headers:{Accept:'application/json'},credentials:'same-origin'}).then(function(r){return r.json()}).then(function(cart){
      var lines=(cart.items||[]).filter(function(l){return l.properties&&l.properties._rg&&document.querySelector('.js-add[data-variant="'+String(l.variant_id)+'"]')&&(!!l.properties._rg_ship)!==on;});
      return lines.reduce(function(p,l){return p.then(function(){
        var props={};Object.keys(l.properties).forEach(function(k){props[k]=l.properties[k]});
        if(on){props._rg_ship='1';props['${SHIP_TO_LABEL}']=dlg.dataset.label;}else{delete props._rg_ship;delete props['${SHIP_TO_LABEL}'];}
        return fetch('/cart/change.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:l.key,quantity:l.quantity,properties:props})}).then(function(r){if(!r.ok)throw new Error();});
      })},Promise.resolve()).then(function(){msg(lines.length?S.ok:'');});
    }).catch(function(){msg(S.bad);});
  }
})();</script>`;
}

/**
 * The registrant's note to guests, set like a line from a wedding invitation
 * rather than a form box (2 Nov 2026, Ben): centred serif italic between two
 * fine accent-coloured hairlines that fade out at the ends, no card. Only emitted when the registry has
 * a note, so registries without one carry none of these bytes.
 *
 * The font (Cormorant Garamond Italic, ~24KB) is served by the app itself,
 * see app/routes/fonts.note-italic[.]woff2.tsx, and only downloads on pages
 * that show a note. Without an app URL (tests) it falls back to Georgia.
 * white-space:pre-line keeps the registrant's own paragraph breaks.
 */
function noteStyles(assetBase: string | null | undefined): string {
  const base = (assetBase ?? "").replace(/\/+$/, "");
  const face = /^https?:\/\//.test(base)
    ? `@font-face{font-family:GiftpinNote;font-style:italic;font-weight:500;font-display:swap;src:url(${base}/fonts/note-italic.woff2) format("woff2")}`
    : "";
  return `<style>${face}
.vow{margin:22px auto 18px;max-width:30em;text-align:center;font:italic 500 21px/1.45 GiftpinNote,Georgia,serif;white-space:pre-line;overflow-wrap:anywhere}
.vow::before,.vow::after{content:"";display:block;width:160px;height:1px;margin:0 auto 16px;background:linear-gradient(90deg,transparent,var(--accent),transparent)}
.vow::after{margin:16px auto 0}
@media (min-width:960px){.vow{font-size:24px}}
</style>`;
}

export function renderRegistryPage(data: RegistryPageData): string {
  const { progress } = data;
  const pct = progress.totalItems
    ? Math.round((progress.fulfilledItems / progress.totalItems) * 100)
    : 0;

  // "wish list" for the date-less Wish list occasion, otherwise "registry".
  const noun = listNoun(data.eventType);
  const ogDescription = tNoun("guest.og", data.eventType, { event: data.eventLabel, shop: data.shopName });

  const dateLine = data.eventDate
    ? formatLongDate(data.eventDate)
    : null;

  const head = `
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeAttr(data.title)}">
<meta property="og:description" content="${escapeAttr(ogDescription)}">
${data.coverImageUrl ? `<meta property="og:image" content="${escapeAttr(data.coverImageUrl)}">` : ""}
${data.message ? noteStyles(data.artBaseUrl) : ""}`;

  const body = `
<header class="hero">
  ${
    data.coverImageUrl
      ? `<img class="hero-img" src="${escapeAttr(data.coverImageUrl)}" alt="" loading="eager">`
      : eventHeroImage(data.eventType, data.artBaseUrl) ??
        `<div class="hero-art">${eventHeroArt(data.eventType)}</div>`
  }
  <p class="sub">${escapeHtml(data.eventLabel)}${dateLine ? ` &middot; ${escapeHtml(dateLine)}` : ""}</p>
  <h1>${escapeHtml(data.title)}</h1>
  ${data.registrantNames ? `<p class="sub">${escapeHtml(data.registrantNames)}</p>` : ""}
  ${data.message ? `<p class="vow">${escapeHtml(data.message)}</p>` : ""}
  <div id="registro-progress">${
    progress.totalItems
      ? `<div class="progress" role="img" aria-label="${escapeAttr(t("guest.progress.aria", { pct }))}"><i style="width:${pct}%"></i></div>
         <p class="sub">${tx(t("guest.progress.text", { done: progress.fulfilledItems, total: progress.totalItems }))}</p>`
      : ""
  }</div>
</header>

${renderShare(data)}

<div id="registro-refresh" class="update-banner" hidden role="status">
  <span>${tx(tNoun("guest.updated", data.eventType))}</span>
  <button type="button" class="btn sm" id="registro-refresh-btn">${tx(t("guest.refresh"))}</button>
  <button type="button" class="dismiss" id="registro-dismiss-btn" aria-label="${escapeAttr(t("guest.dismiss"))}">&times;</button>
</div>

${renderShipChoice(data)}
${renderPromoBanner(data)}
${renderListTools(data)}
<div id="registro-items">${
  data.items.length === 0
    ? `<div class="empty"><p>${tx(tNoun("guest.empty", data.eventType))}</p><p>${tx(t("guest.empty.checkBack"))}</p></div>`
    : renderItemGroups(data)
}</div>

${renderDuplicateNotice(data)}

${data.offerReminder ? renderReminderSignup() : ""}

${data.giftCardUrl ? `<p class="owner-link big">${th("guest.giftCardHtml", { shop: data.shopName }, { href: escapeAttr(data.giftCardUrl) })}</p>` : ""}

<p class="owner-link big" id="registro-owner"><a href="${escapeAttr(data.actionUrl.replace(/\/+$/, "") + "/manage")}">${tNoun("guest.owner", data.eventType)}</a></p>

<script id="registro-config" type="application/json">${jsonForScript({
    actionUrl: data.actionUrl,
    registryId: data.registryId,
    version: data.version,
    versionUrl: data.versionUrl,
  })}</script>
<script>${clientScript()}</script>${renderChipInAssets(data)}
`;

  return layout(
    {
      title: `${data.title} — ${data.shopName}`,
      description: ogDescription,
      accentColor: data.accentColor,
      indexable: data.indexable,
      shopName: data.shopName,
      branding: data.branding,
      head,
      hidePoweredBy: data.hidePoweredBy,
      lean: true,
    },
    body,
  );
}

/**
 * Groups items by the category the registrant chose. If nobody has categorised
 * anything the page is exactly the flat list it always was. Once any item has
 * a category, groups follow GIFT_CATEGORIES order and anything uncategorised
 * lands under "Miscellaneous" (merged with items explicitly filed there).
 * Order within a group is the incoming order, so merchant items stay on top.
 */
function renderItemGroups(data: RegistryPageData): string {
  const names = data.linkedStoreNames ?? [];
  const joined = names.length > 1 ? `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}` : "";
  const note = joined ? `<p class="item-meta">${tx(t("guest.linked.stores", { stores: joined }))}</p>` : "";
  return note + renderItemLists(data);
}

function renderItemLists(data: RegistryPageData): string {
  // Template indentation costs ~1KB on a 30-item list against the page budget.
  // Stripping it after a newline never changes rendering: the newline is kept,
  // and nothing in an item uses <pre>, <textarea> or white-space:pre.
  const list = (items: DisplayItem[]) =>
    `<ul class="items">${items.map((item) => renderItem(item, data)).join("\n").replace(/\n[ \t]+/g, "\n")}</ul>`;

  if (!data.items.some((i) => i.category)) return list(data.items);

  return GIFT_CATEGORIES.map((cat) => {
    const inGroup = data.items.filter((i) => (isGiftCategory(i.category) ? i.category : "misc") === cat.value);
    if (inGroup.length === 0) return "";
    return `<section class="cat-group"><h2 class="cat-head">${escapeHtml(giftCategoryLabel(cat.value))}</h2>${list(inGroup)}</section>`;
  })
    .filter(Boolean)
    .join("\n");
}

/**
 * Sort by price and "still needed only", for guests on a long list. Client-side
 * only (the page is cached per registry, so no query params), hidden until the
 * script runs, and only on lists long enough to need it.
 */
const LIST_TOOLS_MIN_ITEMS = 4;

/** Registry promotions (Pro). Its CSS is inline so a page without any carries no extra bytes. */
function renderPromoBanner(data: RegistryPageData): string {
  const lines = data.promoBanner ?? [];
  if (lines.length === 0) return "";
  return `<style>.deal-banner{border:1px solid var(--accent);border-radius:10px;padding:10px 14px;margin:16px 0}.deal-banner p{margin:2px 0;font-weight:600}.deal{color:var(--accent)}</style>
<div class="deal-banner" role="note">${lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}</div>`;
}

function renderListTools(data: RegistryPageData): string {
  if (data.items.length < LIST_TOOLS_MIN_ITEMS) return "";
  return `<style>#tools:not([hidden]){display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;margin:16px 0 12px}@media (min-width:960px){#tools:not([hidden]){margin-bottom:16px}}#tools select{width:auto}#registro-items [hidden]{display:none}</style>
<div id="tools" hidden><select aria-label="${escapeAttr(t("guest.tools.sort"))}"><option value="">${tx(t("guest.tools.suggested"))}</option><option value="1">${tx(t("guest.tools.priceLow"))}</option><option value="-1">${tx(t("guest.tools.priceHigh"))}</option></select><label class="check"><input type="checkbox"> ${tx(t("guest.tools.onlyNeeded"))}</label></div>`;
}

const mixedCache = new WeakMap<RegistryPageData, boolean>();

/** True when the page prices items in more than one currency (linked stores, other shops). */
function mixedCurrencies(data: RegistryPageData): boolean {
  let mixed = mixedCache.get(data);
  if (mixed === undefined) {
    mixed = new Set(data.items.filter((i) => i.price > 0).map((i) => (i.currency ?? data.currency ?? "").toUpperCase())).size > 1;
    mixedCache.set(data, mixed);
  }
  return mixed;
}

/**
 * "$18" is CAD in one place and USD in the next. When a page mixes
 * currencies, a bare symbol gets the ISO code ("$18 CAD"); "US$42" already
 * says which dollar it is.
 */
export function withCurrencyCode(formatted: string, currency: string | null | undefined, mixed: boolean): string {
  if (!mixed || !formatted || !currency || /[A-Z]{2}/.test(formatted)) return formatted;
  return `${formatted} ${currency.toUpperCase()}`;
}

function renderItem(item: DisplayItem, data: RegistryPageData): string {
  const currency = item.currency ?? data.currency;
  const price = withCurrencyCode(formatMoney(item.price, currency), currency, mixedCurrencies(data));
  const remaining = item.remainingQty;
  // "Held" means someone has an outstanding soft claim, whether or not anything
  // is still available. Gating this on `remaining > 0` made the fully-claimed
  // state below unreachable, so an item every guest had clicked through on kept
  // rendering as freely available — the exact duplicate-gift path the claim
  // system exists to close.
  const held = item.claimedQty > 0;

  const classes = ["item"];
  if (item.fulfilled) classes.push("done");
  if (held) classes.push("held");

  const image = item.imageUrl
    ? `<img class="item-img" src="${escapeAttr(item.imageUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer">`
    : `<div class="item-img ph">${tx(t("guest.item.noPhoto"))}</div>`;

  // The source badge is how a guest knows, before tapping, whether they're
  // staying on this store or leaving it. Never surprise someone into Amazon.
  const badge = item.linkedStore
    ? `<span class="src live">${escapeHtml(item.linkedStore.name)}</span>`
    : !item.isExternal
    ? ""
    : item.sourceType === "shopify_ext"
      ? `<span class="src live" title="${escapeAttr(t("guest.item.liveTitle"))}">${escapeHtml(item.externalDomain ?? t("guest.item.anotherStore"))}</span>`
      : `<span class="src" title="${escapeAttr(t("guest.item.addedTitle"))}">${escapeHtml(item.externalDomain ?? t("guest.item.anotherStore"))}</span>`;

  const meta: string[] = [];
  if (price && !item.isFund) meta.push(`<span class="price">${price}</span>`);
  if (item.desiredQty > 1) meta.push(tx(t("guest.item.bought", { n: item.purchasedQty, desired: item.desiredQty })));
  if (item.isStale && price) meta.push(tx(t("guest.item.priceMayChange")));
  const deal = data.itemDeals?.[item.id];
  if (deal && !item.fulfilled) meta.push(`<b class="deal">${escapeHtml(deal)}</b>`);
  if (item.availability === "out_of_stock" && item.isExternal) meta.push(tx(t("guest.item.outOfStock")));

  // For the list tools. "Still needed" errs toward hiding: an item whose last
  // one someone may be buying counts as taken (CLAUDE.md hard rule 5).
  if (held && remaining === 0) classes.push("taken");
  const sortPrice = item.isFund || !item.price ? "" : ` data-p="${item.price}"`;

  return `<li class="${classes.join(" ")}" id="item-${escapeAttr(item.id)}" data-item="${escapeAttr(item.id)}"${sortPrice}>
  ${image}
  <div>
    <p class="item-title">${escapeHtml(item.title)}${badge}</p>
    <p class="item-meta">${meta.join(" &middot; ")}</p>${renderFundProgress(item, data)}
    ${item.note ? `<p class="item-note">&ldquo;${escapeHtml(item.note)}&rdquo;</p>` : ""}
    ${renderStoreLink(item, data)}
    ${renderItemAction(item, data, remaining, held)}
  </div>
</li>`;
}

/** Only a match the registrant chose to keep is ever shown to guests. */
function renderStoreLink(item: DisplayItem, data: RegistryPageData): string {
  if (item.storeMatch?.status !== "kept") return "";
  const label =
    item.storeMatch.kind === "product"
      ? tx(t("guest.storeLink.product", { shop: data.shopName }))
      : tx(t("guest.storeLink.search", { title: item.storeMatch.title, shop: data.shopName }));
  return `<p class="item-meta"><a class="store-link" href="${escapeAttr(storeMatchHref(item.storeMatch))}">${label} &rarr;</a></p>`;
}

function renderItemAction(
  item: DisplayItem,
  data: RegistryPageData,
  remaining: number,
  held: boolean,
): string {
  if (item.fulfilled) {
    return `<p class="item-meta"><strong>${tx(t("guest.item.taken"))}</strong></p>`;
  }

  if (held && remaining === 0) {
    return `<p class="item-meta">${t("guest.item.someoneBuyingHtml")}</p>`;
  }

  const heldNotice = held
    ? `<p class="item-meta">${tx(t("guest.item.someoneBuyingOne"))}</p>`
    : "";

  // Sold by another linked store: a cart here can't hold it.
  const ls = item.linkedStore;
  // Sold out on the store that sells it (checked there, live): no "Buy at"
  // that only leads to a sold-out page.
  if (ls?.href && isSoldOutStoreItem(item)) {
    return `${heldNotice}<p class="item-meta">${t("guest.item.soldOutHtml")}</p>`;
  }
  if (ls?.href) {
    return `${heldNotice}<div class="row"><a class="btn sm" href="${escapeAttr(ls.href)}">${tx(t("guest.item.buyAt", { domain: ls.name }))}</a></div>`;
  }
  if (ls) {
    return `${heldNotice}<div class="row">
  <a class="btn sm ghost js-claim" href="${escapeAttr(ls.searchHref)}" data-item="${escapeAttr(item.id)}" target="_blank" rel="noopener noreferrer">${tx(t("guest.linked.findAt", { store: ls.name }))}</a>
  <button class="btn sm ghost js-bought" data-item="${escapeAttr(item.id)}" type="button">${tx(t("guest.item.iBought"))}</button>
  <span class="js-status item-meta" role="status"></span>
</div>`;
  }

  const chipIn = renderChipIn(item, data);
  if (item.isFund) return chipIn;

  // --- Internal but sold out: no Add to cart that Shopify would refuse ----
  if (isSoldOutStoreItem(item)) {
    return `${heldNotice}<p class="item-meta">${t("guest.item.soldOutHtml")}</p>
<div class="row">
  <button class="linkish js-bought" data-item="${escapeAttr(item.id)}" data-store="1" type="button">${tx(t("guest.item.alreadyBought"))}</button>
  <span class="js-status item-meta" role="status"></span>
</div>${chipIn}`;
  }

  // --- Internal: buy here, one tap, fully attributed --------------------
  if (!item.isExternal && item.variantGid) {
    const variantId = item.variantGid.split("/").pop() ?? "";
    const max = Math.max(1, remaining);
    return `${heldNotice}<form class="row js-add" data-item="${escapeAttr(item.id)}" data-variant="${escapeAttr(variantId)}">
  ${max > 1 ? `<label class="sr" for="q-${escapeAttr(item.id)}">${tx(t("guest.item.quantity"))}</label><input class="qty" id="q-${escapeAttr(item.id)}" type="number" name="qty" value="1" min="1" max="${max}" inputmode="numeric">` : ""}
  <button class="btn sm js-add-btn" type="submit">${tx(t("guest.item.addToCart"))}</button>
  <span class="js-status item-meta" role="status"></span>
  <button class="linkish js-bought" data-item="${escapeAttr(item.id)}" data-store="1" type="button">${tx(t("guest.item.alreadyBought"))}</button>
</form>${chipIn}`;
  }

  // --- External: outbound link, soft claim, honest labelling -------------
  //
  // 20 Sep 2026: Ben's deliberate reversal of the old "no commission, ever"
  // rule (see CLAUDE.md's "Resolved" section) — Giftpin now takes a
  // disclosed commission on external-store purchases, via whichever
  // affiliate-network link-wrapper is configured (see app/lib/affiliate.ts).
  // The wrap is a no-op until AFFILIATE_LINK_WRAPPER_BASE is set, and the
  // disclosure text (renderDuplicateNotice, below) is shown regardless,
  // since the commitment is to disclose the *policy* from launch, not only
  // once a network happens to be wired in.
  if (item.externalUrl) {
    const href = wrapAffiliateLink(item.externalUrl, data.affiliateLinkWrapperBase);
    return `${heldNotice}<div class="row">
  <a class="btn sm ghost js-claim" href="${escapeAttr(href)}"
     data-item="${escapeAttr(item.id)}" target="_blank" rel="noopener noreferrer nofollow">
    ${tx(t("guest.item.buyAt", { domain: item.externalDomain ?? t("guest.item.theStore") }))}
  </a>
  <button class="btn sm ghost js-bought" data-item="${escapeAttr(item.id)}" type="button">${tx(t("guest.item.iBought"))}</button>
  <span class="js-status item-meta" role="status"></span>
</div>`;
  }

  return `<div class="row">
  <button class="btn sm ghost js-bought" data-item="${escapeAttr(item.id)}" type="button">${tx(t("guest.item.iBought"))}</button>
  <span class="js-status item-meta" role="status"></span>
</div>`;
}

/** "$340 of $1,200 raised" plus a bar, for group gifts and funds. */
function renderFundProgress(item: DisplayItem, data: RegistryPageData): string {
  if (!item.fund || !data.contributions) return "";
  const currency = item.currency ?? data.currency;
  const funded = formatMoney(item.fund.funded, currency);
  const goal = formatMoney(item.fund.goal, currency);
  const line = escapeHtml(funded ? t("guest.fund.raised", { funded, goal }) : t("guest.fund.first", { goal }));
  return `<div class="progress" role="img" aria-label="${escapeAttr(t("guest.fund.aria", { pct: item.fund.percent }))}"><i style="width:${item.fund.percent}%"></i></div>
    <p class="item-meta">${line}</p>`;
}

/**
 * Chip-in: one gift card from this store, at a denomination the merchant set
 * up. Where the card goes is said up front, because it's the guest's money
 * and they need to know whether to pass it on.
 */
function renderChipIn(item: DisplayItem, data: RegistryPageData): string {
  const setup = data.contributions;
  if (!item.fund || !setup || setup.variants.length === 0 || item.fund.complete) return "";

  const currency = data.currency;
  const options = setup.variants
    .map((v) => `<option value="${escapeAttr(v.id)}">${formatMoney(v.amount, currency) || escapeHtml(String(v.amount))}</option>`)
    .join("");
  const id = escapeAttr(item.id);
  const delivery = t(setup.toRegistrant ? "guest.chip.toRegistrant" : "guest.chip.toGuest");

  return `<form class="js-chip chip" data-item="${id}">
  <p class="item-meta">${item.isFund ? "" : `<strong>${tx(t("guest.chip.orChipIn"))}</strong> `}${escapeHtml(delivery)}</p>
  <div class="row">
    <label class="sr" for="c-${id}">${tx(t("guest.chip.amount"))}</label>
    <select class="qty amt" id="c-${id}" name="variant">${options}</select>
    ${setup.toRegistrant ? `<label class="sr" for="m-${id}">${tx(t("guest.chip.message"))}</label><input class="qty msg" id="m-${id}" name="message" maxlength="200" placeholder="${escapeAttr(t("guest.chip.messagePh"))}">` : ""}
    <button class="btn sm${item.isFund ? "" : " ghost"}" type="submit">${tx(t("guest.chip.button"))}</button>
    <span class="js-status item-meta" role="status"></span>
  </div>
</form>`;
}

/**
 * Share: a phone's own share sheet on phones; on computers the button copies
 * the link, since desktop share sheets can leave the clipboard empty. The copy
 * uses execCommand first so a storefront's clipboard policy can't block it.
 */
function renderShare(data: RegistryPageData): string {
  const encoded = encodeURIComponent(data.shareUrl);
  const text = encodeURIComponent(tNoun("guest.share.text", data.eventType, { title: data.title }));
  return `<div class="share">
  <button class="btn sm ghost js-share" type="button" data-url="${escapeAttr(data.shareUrl)}" data-title="${escapeAttr(data.title)}">${tx(t("guest.share.button"))}</button>
  <a class="btn sm ghost" href="https://wa.me/?text=${text}%20${encoded}" target="_blank" rel="noopener">WhatsApp</a>
  <a class="btn sm ghost" href="sms:?&body=${text}%20${encoded}">${tx(t("guest.share.sms"))}</a>
  <a class="btn sm ghost" href="mailto:?subject=${text}&body=${encoded}">${tx(t("guest.share.email"))}</a>
</div>`;
}

function renderReminderSignup(): string {
  return `<form class="note js-remind" method="post" hidden>
  <label for="registro-remind-email">${t("guest.remind.labelHtml")}</label>
  <div class="row" style="margin-top:8px">
    <input id="registro-remind-email" type="email" name="email" required autocomplete="email" placeholder="${escapeAttr(t("guest.remind.placeholder"))}" style="flex:1;min-height:44px;padding:0 12px;border:1px solid #ccc;border-radius:8px">
    <button class="btn sm" type="submit">${tx(t("guest.remind.button"))}</button>
  </div>
  <span class="js-status item-meta" role="status"></span>
</form>`;
}

function renderDuplicateNotice(data: RegistryPageData): string {
  if (data.progress.externalItems === 0) return "";
  return `<div class="note">
  <p style="margin:0">${t("guest.dup.leadHtml")}</p>
  <p class="disclosure" style="margin:6px 0 0">${tx(t("guest.dup.disclosure"))}</p>
</div>`;
}

/**
 * Client script. Under 2KB, no dependencies, and the page works without it —
 * every action falls back to a plain link or form post.
 */
/**
 * Chip-in styles and script, sent only when a chip-in form is on the page so
 * every other registry keeps its weight budget (see registry-page.test.ts).
 * Same two-step as Add to cart, but the server picks the gift card line's
 * properties (and, only if the couple opted in, the recipient).
 */
function renderChipInAssets(data: RegistryPageData): string {
  if (!data.contributions || !data.items.some((i) => i.fund && !i.fund.complete && !i.fulfilled)) return "";
  return `<style>.qty.amt{width:auto}.qty.msg{width:auto;flex:1 1 160px}.chip{margin-top:10px}</style>
<script>(function(){
  var cfg=JSON.parse(document.getElementById('registro-config').textContent);
  var X={add:${jsStr("guest.adding")},bad:${jsStr("guest.couldNotAdd")},ok:${jsStr("guest.chip.added")},out:${jsStr("guest.cart.checkout")}};
  function status(el,msg,ok){var s=el.querySelector('.js-status');if(s){s.textContent=msg;s.style.color=ok===false?'#8c1d13':'';}}
  document.addEventListener('submit',function(e){
    var form=e.target.closest('.js-chip');if(!form)return;e.preventDefault();
    var btn=form.querySelector('button');btn.disabled=true;status(form,X.add);
    var msg=form.querySelector('[name=message]');
    fetch(cfg.actionUrl+'/contribute',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({itemId:form.dataset.item,variantId:form.querySelector('[name=variant]').value,message:msg?msg.value:''})})
      .then(function(r){return r.json()})
      .then(function(res){
        if(!res||!res.ok){throw new Error(res&&res.error||X.bad);}
        return fetch('/cart/add.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(res.payload)});
      })
      .then(function(r){if(!r.ok)return r.json().then(function(e){throw new Error(e.description||X.bad)});var s=form.querySelector('.js-status');if(s){s.style.color='';s.innerHTML=X.ok+' <a class="btn sm" href="/cart">'+X.out+'</a>';}btn.disabled=false;})
      .catch(function(err){status(form,err.message,false);btn.disabled=false;});
  });
})();</script>`;
}

function clientScript(): string {
  // Whole-line comments and indentation below are for us, not the guest:
  // strip them so they don't count against the page's byte budget.
  return `
(function(){
  var cfg=JSON.parse(document.getElementById('registro-config').textContent);
  var M={manage:${jsStr("guest.owner.manage")},cartIn:${jsStr("guest.cart.in")},checkout:${jsStr("guest.cart.checkout")},cancel:${jsStr("guest.cart.cancel")},allTaken:${jsStr("guest.tools.allTaken")},undoNote:${jsStr("guest.undo.note")},undo:${jsStr("guest.undo.button")},undoing:${jsStr("guest.undo.undoing")},undoBad:${jsStr("guest.undo.error")},saving:${jsStr("guest.saving")},saveBad:${jsStr("guest.couldNotSave")},remindOk:${jsStr("guest.remind.done")},adding:${jsStr("guest.adding")},addBad:${jsStr("guest.couldNotAdd")},sure:${jsStr("guest.bought.confirm")},copied:${jsStr("guest.share.copied")},copy:${jsStr("guest.share.copyPrompt")}};
  // Remember this registry so the store's cart page can link back to it (the
  // Registry links theme block reads giftpin_last; see registry-links.liquid).
  try{localStorage.setItem('giftpin_last',JSON.stringify({u:location.pathname,t:document.querySelector('h1').textContent}))}catch(_){}
  function status(el,msg,ok){var s=el.querySelector('.js-status')||el.parentNode.querySelector('.js-status');if(s){s.textContent=msg;s.style.color=ok===false?'#8c1d13':'';}}
  function pj(u,b){return fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)})}
  function post(path,body){return pj(cfg.actionUrl+path,body).then(function(r){return r.json()})}

  // If this browser is the owner's (the manage page left a token in
  // localStorage), upgrade the always-visible owner link so it goes straight in.
  try{
    var owned=JSON.parse(localStorage.getItem('${REGISTRIES_STORAGE_KEY}')||localStorage.getItem('${LEGACY_REGISTRIES_STORAGE_KEY}')||'[]');
    var mine=Array.isArray(owned)&&owned.filter(function(r){return r&&r.id===cfg.registryId&&r.token})[0];
    var ownerEl=document.getElementById('registro-owner');
    if(mine&&ownerEl){ownerEl.querySelector('a').href=cfg.actionUrl.replace(/[/]+$/,'')+'/manage?t='+encodeURIComponent(mine.token);ownerEl.querySelector('u').textContent=M.manage;}
  }catch(_){}

  // Store items: once a line for this variant is in the guest's cart, swap
  // "Add to cart" for a checkout prompt so nobody adds it twice by accident.
  // The item only counts as bought when the order webhook lands.
  function markInCart(form){
    // Built here rather than rendered hidden on every item: the page has a
    // strict byte budget and most items are never added.
    var b=form.querySelector('.js-add-btn'),q=form.querySelector('.qty');
    if(b)b.hidden=true;if(q)q.hidden=true;
    if(!form.querySelector('.js-incart')){
      var p=document.createElement('p');p.className='js-incart incart';
      p.innerHTML='<strong>'+M.cartIn+'</strong> <a class="btn sm" href="/cart">'+M.checkout+'</a> <button type="button" class="btn sm ghost js-uncart">'+M.cancel+'</button>';
      if(b)b.parentNode.insertBefore(p,b);else form.appendChild(p);
      if(window.rgShipShow)rgShipShow(p);
    }
  }
  // Cancel: take this gift's registry lines back out of the cart and show Add
  // to cart again. Adding places no hold, so nothing to release on our side.
  document.addEventListener('click',function(e){
    var c=e.target.closest('.js-uncart');if(!c)return;var f=c.closest('.js-add'),u={};c.disabled=true;
    fetch('/cart.js').then(function(r){return r.json()}).then(function(k){k.items.forEach(function(l){if(l.properties&&l.properties._rg&&l.variant_id==f.dataset.variant)u[l.key]=0});return pj('/cart/update.js',{updates:u})})
      .then(function(r){if(!r.ok)throw 0;f.querySelector('.js-incart').remove();f.querySelectorAll('.js-add-btn,.qty').forEach(function(x){x.hidden=false})}).catch(function(){c.disabled=false});
  });
  function syncCart(){
    if(!document.querySelector('.js-add'))return;
    fetch('/cart.js',{headers:{Accept:'application/json'},credentials:'same-origin'})
      .then(function(r){return r.ok?r.json():null})
      .then(function(cart){
        if(!cart||!cart.items)return;
        cart.items.forEach(function(line){
          if(!line.properties||!line.properties._rg)return;
          Array.prototype.forEach.call(document.querySelectorAll('.js-add[data-variant="'+String(line.variant_id)+'"]'),markInCart);
        });
      })
      .catch(function(){});
  }
  syncCart();

  // Sort by price / still needed only, within each category's list so the
  // categories stay put. Unpriced items (funds) go last; ties keep page order.
  var tools=document.getElementById('tools');
  function applyView(){
    if(!tools)return;
    var dir=+tools.querySelector('select').value,need=tools.querySelector('input').checked,n=0,box=document.getElementById('registro-items'),e=document.getElementById('none');
    [].forEach.call(box.querySelectorAll('ul'),function(ul){
      var lis=[].slice.call(ul.children),k=0;
      lis.forEach(function(li,i){li.dataset.i=li.dataset.i||i+1;});
      lis.sort(function(a,b){var x=a.dataset.p,y=b.dataset.p;return (dir&&(x||y)?!x?1:!y?-1:dir*(x-y):0)||a.dataset.i-b.dataset.i;});
      lis.forEach(function(li){var c=li.classList;ul.appendChild(li);li.hidden=need&&(c.contains('done')||c.contains('taken'));k+=!li.hidden;});
      if(ul.parentNode.className=='cat-group')ul.parentNode.hidden=!k;n+=k;
    });
    if(!e){e=document.createElement('p');e.id='none';e.className='empty';e.textContent=M.allTaken;box.appendChild(e);}
    e.hidden=n>0;
  }
  if(tools){tools.hidden=false;tools.onchange=applyView;}

  // Undo for "I bought this". The token only ever lives in the browser that
  // made the mark, and the server stops honouring it after a day.
  var UNDO_KEY='${UNDO_STORAGE_KEY}';
  function readUndo(){try{var m=JSON.parse(localStorage.getItem(UNDO_KEY)||'{}');return m&&typeof m==='object'?m:{};}catch(_){return {};}}
  function writeUndo(m){try{localStorage.setItem(UNDO_KEY,JSON.stringify(m));}catch(_){}}
  function saveUndo(id,t){var m=readUndo();m[id]={t:t,x:Date.now()+${UNDO_WINDOW_SECONDS * 1000}};writeUndo(m);}
  function dropUndo(id){var m=readUndo();delete m[id];writeUndo(m);}
  function showUndo(){
    var m=readUndo(),now=Date.now(),changed=false;
    Object.keys(m).forEach(function(id){
      if(!m[id]||!(m[id].x>now)){delete m[id];changed=true;return;}
      if(!/^[A-Za-z0-9_-]+$/.test(id))return;
      var li=document.querySelector('#registro-items li[data-item="'+id+'"]');
      if(!li||li.querySelector('.js-undo'))return;
      var p=document.createElement('p');p.className='item-meta undo';
      p.appendChild(document.createTextNode(M.undoNote));
      var b=document.createElement('button');b.type='button';b.className='linkish js-undo';b.dataset.item=id;b.textContent=M.undo;
      p.appendChild(b);li.appendChild(p);
    });
    if(changed)writeUndo(m);
  }
  showUndo();

  // The reminder sign-up is JSON-only, so it stays hidden without script.
  Array.prototype.forEach.call(document.querySelectorAll('.js-remind'),function(f){f.hidden=false;});

  document.addEventListener('submit',function(e){
    var remind=e.target.closest('.js-remind');
    if(remind){
      e.preventDefault();var rb=remind.querySelector('button');rb.disabled=true;status(remind,M.saving);
      post('/remind',{registryId:cfg.registryId,email:remind.querySelector('[name=email]').value})
        .then(function(res){if(res&&res.ok){status(remind,M.remindOk);}else{status(remind,(res&&res.error)||M.saveBad,false);rb.disabled=false;}})
        .catch(function(){status(remind,M.saveBad,false);rb.disabled=false;});
      return;
    }
    var form=e.target.closest('.js-add');if(!form)return;e.preventDefault();
    var btn=form.querySelector('button');btn.disabled=true;
    var qtyEl=form.querySelector('[name=qty]');
    // Ask where it ships first, on every add (see renderShipChoice).
    (window.rgShip||function(cb){cb(false)})(function(ship){
    if(ship===null){btn.disabled=false;return;}
    status(form,M.adding);
    post('/cart-add',{itemId:form.dataset.item,variantId:form.dataset.variant,qty:qtyEl?Number(qtyEl.value):1,shipToRegistrant:ship})
      .then(function(res){
        if(!res||!res.ok){throw new Error(res&&res.error||M.addBad);}
        // Hand the signed properties to Shopify's own cart endpoint. The token
        // travels on the cart LINE, which is what survives Shop Pay.
        return pj('/cart/add.js',res.payload);
      })
      .then(function(r){if(!r.ok)return r.json().then(function(e){throw new Error(e.description||M.addBad)});status(form,'');btn.disabled=false;markInCart(form);})
      .catch(function(err){status(form,err.message,false);btn.disabled=false;});
    },form);
  });

  // Place the soft hold as the guest leaves. keepalive so it survives the
  // navigation — this is exactly what keepalive is for.
  document.addEventListener('click',function(e){
    var link=e.target.closest('.js-claim');
    if(link){
      try{fetch(cfg.actionUrl+'/claim',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({itemId:link.dataset.item}),keepalive:true});}catch(_){}
      return;
    }
    var bought=e.target.closest('.js-bought');
    if(bought){
      if(bought.dataset.store&&!confirm(M.sure))return;
      bought.disabled=true;status(bought,M.saving);
      post('/bought',{itemId:bought.dataset.item}).then(function(res){
        if(res&&res.ok){if(res.undoToken)saveUndo(bought.dataset.item,res.undoToken);location.reload();}else{status(bought,(res&&res.error)||M.saveBad,false);bought.disabled=false;}
      }).catch(function(){status(bought,M.saveBad,false);bought.disabled=false;});
      return;
    }
    var undo=e.target.closest('.js-undo');
    if(undo){
      var u=readUndo()[undo.dataset.item];if(!u)return;
      undo.disabled=true;undo.textContent=M.undoing;
      post('/undo-bought',{token:u.t}).then(function(res){
        dropUndo(undo.dataset.item);
        if(res&&res.ok){location.reload();}else{undo.parentNode.textContent=(res&&res.error)||M.undoBad;}
      }).catch(function(){undo.disabled=false;undo.textContent=M.undo;});
      return;
    }
    var share=e.target.closest('.js-share');
    if(share){
      var d=share.dataset,copy=function(){copyLink(d.url,function(){share.textContent=M.copied;});};
      if(navigator.share&&matchMedia('(hover:none) and (pointer:coarse)').matches){try{navigator.share({title:d.title,url:d.url}).catch(function(e){if(!e||e.name!=='AbortError')copy();});}catch(_){copy();}}
      else copy();
    }
  });
  function copyLink(l,done){var ok=false;try{var t=document.createElement('textarea');t.value=l;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();ok=document.execCommand('copy');t.remove();}catch(_){}if(ok)return done();if(navigator.clipboard)navigator.clipboard.writeText(l).then(done,function(){prompt(M.copy,l);});else prompt(M.copy,l);}

  // "New gift added" banner. The page is server-cached and correctly
  // invalidated the instant a write lands, so a newly-added item is already
  // available — an already-open tab just has no way to know that without
  // this. Deliberately a manual-refresh prompt, not an auto-reload: someone
  // mid-tap on "Add to cart" shouldn't have the page yanked out from under
  // them.
  if(cfg.versionUrl){
    var banner=document.getElementById('registro-refresh');
    var dismissed=false;
    var checking=false;
    function busy(){
      // Never swap the list out from under someone who is typing or has a
      // request in flight.
      var a=document.activeElement;
      if(a&&a.closest&&a.closest('#registro-items')&&/^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName))return true;
      return !!document.querySelector('#registro-items button:disabled');
    }
    function applyUpdate(){
      return fetch(location.href,{headers:{Accept:'text/html'},cache:'no-store',credentials:'same-origin'})
        .then(function(r){return r.text()})
        .then(function(html){
          var doc=new DOMParser().parseFromString(html,'text/html');
          var newItems=doc.getElementById('registro-items');
          var newCfg=doc.getElementById('registro-config');
          if(!newItems||!newCfg)throw new Error('no items');
          var next=JSON.parse(newCfg.textContent);
          document.getElementById('registro-items').innerHTML=newItems.innerHTML;
          var p=doc.getElementById('registro-progress'),cur=document.getElementById('registro-progress');
          if(p&&cur)cur.innerHTML=p.innerHTML;
          cfg.version=next.version;
          banner.hidden=true;
          applyView();
          syncCart();
          showUndo();
        });
    }
    function checkVersion(){
      if(checking||dismissed||!banner||document.visibilityState==='hidden')return;
      checking=true;
      fetch(cfg.versionUrl,{headers:{Accept:'application/json'}})
        .then(function(r){return r.json()})
        .then(function(res){
          if(!(res&&res.ok&&res.version>cfg.version))return;
          // Quietly update in place; only fall back to the manual banner when
          // the guest is mid-action or the fetch fails.
          if(busy()){banner.hidden=false;return;}
          return applyUpdate().catch(function(){banner.hidden=false;});
        })
        .catch(function(){})
        .then(function(){checking=false;});
    }
    var refreshBtn=document.getElementById('registro-refresh-btn');
    var dismissBtn=document.getElementById('registro-dismiss-btn');
    if(refreshBtn)refreshBtn.addEventListener('click',function(){location.reload();});
    setTimeout(checkVersion,3000);
    if(dismissBtn)dismissBtn.addEventListener('click',function(){dismissed=true;banner.hidden=true;});
    setInterval(checkVersion,20000);
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')checkVersion();});
  }
})();`
    .replace(/^\s*\/\/.*\n/gm, "")
    // Indentation too: same budget, and no line depends on it.
    .replace(/^[ \t]+/gm, "")
    .trim();
}
