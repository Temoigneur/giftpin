import type { PageBranding } from "../../shared/branding";
import { storeMatchHref, layout, escapeHtml, escapeAttr, formatMoney, jsonForScript } from "./layout";
import { GIFT_CATEGORIES, isGiftCategory } from "../../shared/gift-categories";
import type { DisplayItem } from "../../models/item.server";
import type { RegistryProgress } from "../../models/registry.server";
import { wrapAffiliateLink } from "../../lib/affiliate";
import { SHIP_TO_LABEL, shipToValue } from "../../lib/attribution";
import { eventHeroArt, eventHeroImage } from "../../shared/event-art";
import { REGISTRIES_STORAGE_KEY, LEGACY_REGISTRIES_STORAGE_KEY } from "../../shared/storage-keys";
import { UNDO_STORAGE_KEY, UNDO_WINDOW_SECONDS } from "../../shared/undo";
import type { ContributionVariant } from "../../shared/contributions";

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
  /** Pro: show the "email me before the event" sign-up. See automations.server.ts. */
  offerReminder?: boolean;
  /** App origin serving public/art/ (SHOPIFY_APP_URL) — see eventHeroImage. */
  artBaseUrl?: string | null;
  /**
   * The registrant saved a ship-to address. Guests still choose per purchase:
   * the box below is ticked by default, and unticking it leaves the order's
   * address alone (Ben, 25 Sep 2026: a guest may want it at their own door).
   */
  shipToRegistrant?: boolean;
}

function renderShipChoice(data: RegistryPageData): string {
  if (!data.shipToRegistrant || !data.items.some((i) => i.sourceType === "internal")) return "";
  const who = data.registrantNames || "the registrant";
  return `<div class="note">
  <label class="check"><input type="checkbox" class="js-ship-choice" data-label="${escapeAttr(shipToValue(data.registrantNames))}" checked> Ship gifts from ${escapeHtml(data.shopName)} straight to ${escapeHtml(who)}</label>
  <p class="hint">Their address stays private. Checkout will still ask for your address; we swap in theirs after you order, as long as you're in the same state or province. Untick this to have it sent to you instead. Anything already in your cart updates too.</p>
  <p class="hint js-ship-status" role="status"></p>
</div>
<script>(function(){
  // Ticking or unticking the box also updates registry lines already in the
  // cart, so the "Gift ships to" note at checkout always matches it.
  var shipBox=document.querySelector('.js-ship-choice'),st=document.querySelector('.js-ship-status');
  shipBox.addEventListener('change',function(){
    var on=shipBox.checked;
    fetch('/cart.js',{headers:{Accept:'application/json'},credentials:'same-origin'}).then(function(r){return r.json()}).then(function(cart){
      var lines=(cart.items||[]).filter(function(l){return l.properties&&l.properties._rg&&document.querySelector('.js-add[data-variant="'+String(l.variant_id)+'"]')&&(!!l.properties._rg_ship)!==on;});
      return lines.reduce(function(p,l){return p.then(function(){
        var props={};Object.keys(l.properties).forEach(function(k){props[k]=l.properties[k]});
        if(on){props._rg_ship='1';props['${SHIP_TO_LABEL}']=shipBox.dataset.label;}else{delete props._rg_ship;delete props['${SHIP_TO_LABEL}'];}
        return fetch('/cart/change.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:l.key,quantity:l.quantity,properties:props})}).then(function(r){if(!r.ok)throw new Error();});
      })},Promise.resolve()).then(function(){if(lines.length)st.textContent=on?'Your cart is updated: it ships to them.':'Your cart is updated: it ships to you.';});
    }).catch(function(){st.textContent="Couldn't update your cart. Remove the item and add it again.";});
  });
})();</script>`;
}

export function renderRegistryPage(data: RegistryPageData): string {
  const { progress } = data;
  const pct = progress.totalItems
    ? Math.round((progress.fulfilledItems / progress.totalItems) * 100)
    : 0;

  const dateLine = data.eventDate
    ? new Intl.DateTimeFormat("en-CA", { dateStyle: "long", timeZone: "UTC" }).format(data.eventDate)
    : null;

  const head = `
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeAttr(data.title)}">
<meta property="og:description" content="${escapeAttr(`${data.eventLabel} registry at ${data.shopName}`)}">
${data.coverImageUrl ? `<meta property="og:image" content="${escapeAttr(data.coverImageUrl)}">` : ""}`;

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
  ${data.message ? `<div class="note">${escapeHtml(data.message)}</div>` : ""}
  <div id="registro-progress">${
    progress.totalItems
      ? `<div class="progress" role="img" aria-label="${pct}% of gifts claimed"><i style="width:${pct}%"></i></div>
         <p class="sub">${progress.fulfilledItems} of ${progress.totalItems} gifts taken care of</p>`
      : ""
  }</div>
</header>

${renderShare(data)}

<div id="registro-refresh" class="update-banner" hidden role="status">
  <span>This registry has been updated.</span>
  <button type="button" class="btn sm" id="registro-refresh-btn">Refresh</button>
  <button type="button" class="dismiss" id="registro-dismiss-btn" aria-label="Dismiss">&times;</button>
</div>

${renderShipChoice(data)}
<div id="registro-items">${
  data.items.length === 0
    ? `<div class="empty"><p>This registry doesn't have any items yet.</p><p>Check back soon.</p></div>`
    : renderItemGroups(data)
}</div>

${renderDuplicateNotice(data)}

${data.offerReminder ? renderReminderSignup() : ""}

<p class="owner-link" id="registro-owner"><a href="${escapeAttr(data.actionUrl.replace(/\/+$/, "") + "/manage")}">Your registry? Sign in or get your private edit link</a></p>

<!-- config must precede the client script: it reads it synchronously on load -->
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
      description: `${data.eventLabel} registry at ${data.shopName}`,
      accentColor: data.accentColor,
      indexable: data.indexable,
      shopName: data.shopName,
      branding: data.branding,
      head,
      hidePoweredBy: data.hidePoweredBy,
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
  const list = (items: DisplayItem[]) =>
    `<ul class="items">${items.map((item) => renderItem(item, data)).join("\n")}</ul>`;

  if (!data.items.some((i) => i.category)) return list(data.items);

  return GIFT_CATEGORIES.map((cat) => {
    const inGroup = data.items.filter((i) => (isGiftCategory(i.category) ? i.category : "misc") === cat.value);
    if (inGroup.length === 0) return "";
    return `<section class="cat-group"><h2 class="cat-head">${escapeHtml(cat.label)}</h2>${list(inGroup)}</section>`;
  })
    .filter(Boolean)
    .join("\n");
}

function renderItem(item: DisplayItem, data: RegistryPageData): string {
  const price = formatMoney(item.price, item.currency ?? data.currency);
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
    : `<div class="item-img ph">No photo</div>`;

  // The source badge is how a guest knows, before tapping, whether they're
  // staying on this store or leaving it. Never surprise someone into Amazon.
  const badge = !item.isExternal
    ? ""
    : item.sourceType === "shopify_ext"
      ? `<span class="src live" title="Price and availability are live">${escapeHtml(item.externalDomain ?? "another store")}</span>`
      : `<span class="src" title="Price was correct when this was added">${escapeHtml(item.externalDomain ?? "another store")}</span>`;

  const meta: string[] = [];
  if (price && !item.isFund) meta.push(`<span class="price">${price}</span>`);
  if (item.desiredQty > 1) meta.push(`${item.purchasedQty} of ${item.desiredQty} bought`);
  if (item.isStale && price) meta.push("price may have changed");
  if (item.availability === "out_of_stock") meta.push("out of stock");

  return `<li class="${classes.join(" ")}" data-item="${escapeAttr(item.id)}">
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
      ? `Similar item at ${escapeHtml(data.shopName)}`
      : `More ${escapeHtml(item.storeMatch.title)} at ${escapeHtml(data.shopName)}`;
  return `<p class="item-meta"><a class="store-link" href="${escapeAttr(storeMatchHref(item.storeMatch))}">${label} &rarr;</a></p>`;
}

function renderItemAction(
  item: DisplayItem,
  data: RegistryPageData,
  remaining: number,
  held: boolean,
): string {
  if (item.fulfilled) {
    return `<p class="item-meta"><strong>Already taken care of</strong></p>`;
  }

  if (held && remaining === 0) {
    return `<p class="item-meta"><strong>Someone may be buying this.</strong> It'll come back if they don't.</p>`;
  }

  const heldNotice = held
    ? `<p class="item-meta">Someone may be buying one of these.</p>`
    : "";

  const chipIn = renderChipIn(item, data);
  if (item.isFund) return chipIn;

  // --- Internal: buy here, one tap, fully attributed --------------------
  if (!item.isExternal && item.variantGid) {
    const variantId = item.variantGid.split("/").pop() ?? "";
    const max = Math.max(1, remaining);
    return `${heldNotice}<form class="row js-add" data-item="${escapeAttr(item.id)}" data-variant="${escapeAttr(variantId)}">
  ${max > 1 ? `<label class="sr" for="q-${escapeAttr(item.id)}">Quantity</label><input class="qty" id="q-${escapeAttr(item.id)}" type="number" name="qty" value="1" min="1" max="${max}" inputmode="numeric">` : ""}
  <button class="btn sm js-add-btn" type="submit">Add to cart</button>
  <span class="js-status item-meta" role="status"></span>
  <button class="linkish js-bought" data-item="${escapeAttr(item.id)}" data-store="1" type="button">Already bought it?</button>
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
    Buy at ${escapeHtml(item.externalDomain ?? "the store")} &rarr;
  </a>
  <button class="btn sm ghost js-bought" data-item="${escapeAttr(item.id)}" type="button">I bought this</button>
  <span class="js-status item-meta" role="status"></span>
</div>`;
  }

  return `<div class="row">
  <button class="btn sm ghost js-bought" data-item="${escapeAttr(item.id)}" type="button">I bought this</button>
  <span class="js-status item-meta" role="status"></span>
</div>`;
}

/** "$340 of $1,200 raised" plus a bar, for group gifts and funds. */
function renderFundProgress(item: DisplayItem, data: RegistryPageData): string {
  if (!item.fund || !data.contributions) return "";
  const currency = item.currency ?? data.currency;
  const funded = formatMoney(item.fund.funded, currency);
  const goal = formatMoney(item.fund.goal, currency);
  const line = funded ? `${funded} of ${goal} raised` : `Goal ${goal}. Be the first to chip in.`;
  return `<div class="progress" role="img" aria-label="${item.fund.percent}% funded"><i style="width:${item.fund.percent}%"></i></div>
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
  const delivery = setup.toRegistrant
    ? "You'll buy a store gift card, and it's emailed straight to the couple. Use the Check out button, not Shop Pay: Shop Pay emails the card to you instead."
    : "You'll buy a store gift card. It's emailed to you, so you can pass it on or print it into a card.";

  return `<form class="js-chip chip" data-item="${id}">
  <p class="item-meta">${item.isFund ? "" : "<strong>Or chip in with others.</strong> "}${escapeHtml(delivery)}</p>
  <div class="row">
    <label class="sr" for="c-${id}">Amount</label>
    <select class="qty amt" id="c-${id}" name="variant">${options}</select>
    ${setup.toRegistrant ? `<label class="sr" for="m-${id}">Message</label><input class="qty msg" id="m-${id}" name="message" maxlength="200" placeholder="Add a message (optional)">` : ""}
    <button class="btn sm${item.isFund ? "" : " ghost"}" type="submit">Chip in</button>
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
  const text = encodeURIComponent(`${data.title} — gift registry`);
  return `<div class="share">
  <button class="btn sm ghost js-share" type="button" data-url="${escapeAttr(data.shareUrl)}" data-title="${escapeAttr(data.title)}">Share</button>
  <a class="btn sm ghost" href="https://wa.me/?text=${text}%20${encoded}" target="_blank" rel="noopener">WhatsApp</a>
  <a class="btn sm ghost" href="sms:?&body=${text}%20${encoded}">Text</a>
  <a class="btn sm ghost" href="mailto:?subject=${text}&body=${encoded}">Email</a>
</div>`;
}

function renderReminderSignup(): string {
  return `<form class="note js-remind" method="post" hidden>
  <label for="registro-remind-email"><strong>Want a reminder?</strong> We'll email you once, about two weeks before the event.</label>
  <div class="row" style="margin-top:8px">
    <input id="registro-remind-email" type="email" name="email" required autocomplete="email" placeholder="you@example.com" style="flex:1;min-height:44px;padding:0 12px;border:1px solid #ccc;border-radius:8px">
    <button class="btn sm" type="submit">Remind me</button>
  </div>
  <span class="js-status item-meta" role="status"></span>
</form>`;
}

function renderDuplicateNotice(data: RegistryPageData): string {
  if (data.progress.externalItems === 0) return "";
  return `<div class="note">
  <p style="margin:0"><strong>Buying something from another store?</strong> Tap &ldquo;I bought this&rdquo; when you're done so nobody buys it twice. We hold it for you in the meantime.</p>
  <p class="disclosure" style="margin:6px 0 0">Buying from another store through a link here may earn Giftpin a small commission — it never changes what you pay, and never applies to this store's own products. It helps us keep improving Giftpin.</p>
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
  function status(el,msg,ok){var s=el.querySelector('.js-status');if(s){s.textContent=msg;s.style.color=ok===false?'#8c1d13':'';}}
  document.addEventListener('submit',function(e){
    var form=e.target.closest('.js-chip');if(!form)return;e.preventDefault();
    var btn=form.querySelector('button');btn.disabled=true;status(form,'Adding...');
    var msg=form.querySelector('[name=message]');
    fetch(cfg.actionUrl+'/contribute',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({itemId:form.dataset.item,variantId:form.querySelector('[name=variant]').value,message:msg?msg.value:''})})
      .then(function(r){return r.json()})
      .then(function(res){
        if(!res||!res.ok){throw new Error(res&&res.error||'Could not add that');}
        return fetch('/cart/add.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(res.payload)});
      })
      .then(function(r){if(!r.ok)return r.json().then(function(e){throw new Error(e.description||'Could not add that')});var s=form.querySelector('.js-status');if(s){s.style.color='';s.innerHTML='Added to cart <a class="btn sm" href="/cart">Check out &rarr;</a>';}btn.disabled=false;})
      .catch(function(err){status(form,err.message,false);btn.disabled=false;});
  });
})();</script>`;
}

function clientScript(): string {
  // Whole-line comments below are for us, not the guest: strip them so they
  // don't count against the page's byte budget.
  return `
(function(){
  var cfg=JSON.parse(document.getElementById('registro-config').textContent);
  function status(el,msg,ok){var s=el.querySelector('.js-status')||el.parentNode.querySelector('.js-status');if(s){s.textContent=msg;s.style.color=ok===false?'#8c1d13':'';}}
  function post(path,body){return fetch(cfg.actionUrl+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json()})}

  // If this browser is the owner's (the manage page left a token in
  // localStorage), upgrade the always-visible owner link so it goes straight in.
  try{
    var owned=JSON.parse(localStorage.getItem('${REGISTRIES_STORAGE_KEY}')||localStorage.getItem('${LEGACY_REGISTRIES_STORAGE_KEY}')||'[]');
    var mine=Array.isArray(owned)&&owned.filter(function(r){return r&&r.id===cfg.registryId&&r.token})[0];
    var ownerEl=document.getElementById('registro-owner');
    if(mine&&ownerEl){ownerEl.querySelector('a').href=cfg.actionUrl.replace(/[/]+$/,'')+'/manage?t='+encodeURIComponent(mine.token);}
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
      p.innerHTML='<strong>In your cart</strong> <a class="btn sm" href="/cart">Check out &rarr;</a>';
      if(b)b.parentNode.insertBefore(p,b);else form.appendChild(p);
    }
  }
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
      p.appendChild(document.createTextNode('You marked this as bought. '));
      var b=document.createElement('button');b.type='button';b.className='linkish js-undo';b.dataset.item=id;b.textContent='Undo';
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
      e.preventDefault();var rb=remind.querySelector('button');rb.disabled=true;status(remind,'Saving...');
      post('/remind',{registryId:cfg.registryId,email:remind.querySelector('[name=email]').value})
        .then(function(res){if(res&&res.ok){status(remind,"Done. We'll email you before the event.");}else{status(remind,(res&&res.error)||'Could not save',false);rb.disabled=false;}})
        .catch(function(){status(remind,'Could not save',false);rb.disabled=false;});
      return;
    }
    var form=e.target.closest('.js-add');if(!form)return;e.preventDefault();
    var btn=form.querySelector('button');btn.disabled=true;status(form,'Adding...');
    var qtyEl=form.querySelector('[name=qty]');
    var shipEl=document.querySelector('.js-ship-choice');
    post('/cart-add',{itemId:form.dataset.item,variantId:form.dataset.variant,qty:qtyEl?Number(qtyEl.value):1,shipToRegistrant:shipEl?shipEl.checked:false})
      .then(function(res){
        if(!res||!res.ok){throw new Error(res&&res.error||'Could not add that');}
        // Hand the signed properties to Shopify's own cart endpoint. The token
        // travels on the cart LINE, which is what survives Shop Pay.
        return fetch('/cart/add.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(res.payload)});
      })
      .then(function(r){if(!r.ok)return r.json().then(function(e){throw new Error(e.description||'Could not add that')});status(form,'');btn.disabled=false;markInCart(form);})
      .catch(function(err){status(form,err.message,false);btn.disabled=false;});
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
      if(bought.dataset.store&&!confirm("Mark this as bought? Only do this if you got it some other way, like in the shop. Orders placed here are counted automatically."))return;
      bought.disabled=true;status(bought,'Saving...');
      post('/bought',{itemId:bought.dataset.item}).then(function(res){
        if(res&&res.ok){if(res.undoToken)saveUndo(bought.dataset.item,res.undoToken);location.reload();}else{status(bought,(res&&res.error)||'Could not save',false);bought.disabled=false;}
      }).catch(function(){status(bought,'Could not save',false);bought.disabled=false;});
      return;
    }
    var undo=e.target.closest('.js-undo');
    if(undo){
      var u=readUndo()[undo.dataset.item];if(!u)return;
      undo.disabled=true;undo.textContent='Undoing...';
      post('/undo-bought',{token:u.t}).then(function(res){
        dropUndo(undo.dataset.item);
        if(res&&res.ok){location.reload();}else{undo.parentNode.textContent=(res&&res.error)||'Could not undo';}
      }).catch(function(){undo.disabled=false;undo.textContent='Undo';});
      return;
    }
    var share=e.target.closest('.js-share');
    if(share){
      var d=share.dataset,copy=function(){copyLink(d.url,function(){share.textContent='Link copied';});};
      if(navigator.share&&matchMedia('(hover:none) and (pointer:coarse)').matches){try{navigator.share({title:d.title,url:d.url}).catch(function(e){if(!e||e.name!=='AbortError')copy();});}catch(_){copy();}}
      else copy();
    }
  });
  function copyLink(l,done){var ok=false;try{var t=document.createElement('textarea');t.value=l;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();ok=document.execCommand('copy');t.remove();}catch(_){}if(ok)return done();if(navigator.clipboard)navigator.clipboard.writeText(l).then(done,function(){prompt('Copy this link:',l);});else prompt('Copy this link:',l);}

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
})();`.replace(/^\s*\/\/.*\n/gm, "").trim();
}
