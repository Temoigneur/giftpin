import { layout, escapeHtml, escapeAttr, formatMoney, jsonForScript } from "./layout";
import type { DisplayItem } from "../../models/item.server";
import type { RegistryProgress } from "../../models/registry.server";
import { wrapAffiliateLink } from "../../lib/affiliate";

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
  eventLabel: string;
  eventDate: Date | null;
  coverImageUrl: string | null;
  registrantNames: string;
  items: DisplayItem[];
  progress: RegistryProgress;
  shopName: string;
  accentColor: string;
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
  ${data.coverImageUrl ? `<img class="hero-img" src="${escapeAttr(data.coverImageUrl)}" alt="" loading="eager">` : ""}
  <p class="sub">${escapeHtml(data.eventLabel)}${dateLine ? ` &middot; ${escapeHtml(dateLine)}` : ""}</p>
  <h1>${escapeHtml(data.title)}</h1>
  ${data.registrantNames ? `<p class="sub">${escapeHtml(data.registrantNames)}</p>` : ""}
  ${data.message ? `<div class="note">${escapeHtml(data.message)}</div>` : ""}
  ${
    progress.totalItems
      ? `<div class="progress" role="img" aria-label="${pct}% of gifts claimed"><i style="width:${pct}%"></i></div>
         <p class="sub">${progress.fulfilledItems} of ${progress.totalItems} gifts taken care of</p>`
      : ""
  }
</header>

${renderShare(data)}

<div id="registro-refresh" class="update-banner" hidden role="status">
  <span>This registry has new gifts.</span>
  <button type="button" class="btn sm" id="registro-refresh-btn">Refresh</button>
  <button type="button" class="dismiss" id="registro-dismiss-btn" aria-label="Dismiss">&times;</button>
</div>

${
  data.items.length === 0
    ? `<div class="empty"><p>This registry doesn't have any items yet.</p><p>Check back soon.</p></div>`
    : `<ul class="items">${data.items.map((item) => renderItem(item, data)).join("\n")}</ul>`
}

${renderDuplicateNotice(data)}

<script>${clientScript()}</script>
<script id="registro-config" type="application/json">${jsonForScript({
    actionUrl: data.actionUrl,
    version: data.version,
    versionUrl: data.versionUrl,
  })}</script>
`;

  return layout(
    {
      title: `${data.title} — ${data.shopName}`,
      description: `${data.eventLabel} registry at ${data.shopName}`,
      accentColor: data.accentColor,
      indexable: data.indexable,
      shopName: data.shopName,
      head,
      hidePoweredBy: data.hidePoweredBy,
    },
    body,
  );
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
  if (price) meta.push(`<span class="price">${price}</span>`);
  if (item.desiredQty > 1) meta.push(`${item.purchasedQty} of ${item.desiredQty} bought`);
  if (item.isStale && price) meta.push("price may have changed");
  if (item.availability === "out_of_stock") meta.push("out of stock");

  return `<li class="${classes.join(" ")}">
  ${image}
  <div>
    <p class="item-title">${escapeHtml(item.title)}${badge}</p>
    <p class="item-meta">${meta.join(" &middot; ")}</p>
    ${item.note ? `<p class="item-note">&ldquo;${escapeHtml(item.note)}&rdquo;</p>` : ""}
    ${renderItemAction(item, data, remaining, held)}
  </div>
</li>`;
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

  // --- Internal: buy here, one tap, fully attributed --------------------
  if (!item.isExternal && item.variantGid) {
    const variantId = item.variantGid.split("/").pop() ?? "";
    const max = Math.max(1, remaining);
    return `${heldNotice}<form class="row js-add" data-item="${escapeAttr(item.id)}" data-variant="${escapeAttr(variantId)}">
  ${max > 1 ? `<label class="sr" for="q-${escapeAttr(item.id)}">Quantity</label><input class="qty" id="q-${escapeAttr(item.id)}" type="number" name="qty" value="1" min="1" max="${max}" inputmode="numeric">` : ""}
  <button class="btn sm" type="submit">Add to cart</button>
  <span class="js-status item-meta" role="status"></span>
</form>`;
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

function renderDuplicateNotice(data: RegistryPageData): string {
  if (data.progress.externalItems === 0) return "";
  return `<div class="note">
  <p style="margin:0"><strong>Buying something from another store?</strong> Tap &ldquo;I bought this&rdquo; when you're done so nobody buys it twice. We hold it for you in the meantime.</p>
  <p class="disclosure" style="margin:6px 0 0">Buying from another store through a link here may earn Giftpin a small commission — it never changes what you pay, and never applies to this store's own products.</p>
</div>`;
}

/**
 * Client script. Under 2KB, no dependencies, and the page works without it —
 * every action falls back to a plain link or form post.
 */
function clientScript(): string {
  return `
(function(){
  var cfg=JSON.parse(document.getElementById('registro-config').textContent);
  function status(el,msg,ok){var s=el.querySelector('.js-status')||el.parentNode.querySelector('.js-status');if(s){s.textContent=msg;s.style.color=ok===false?'#8c1d13':'';}}
  function post(path,body){return fetch(cfg.actionUrl+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json()})}

  document.addEventListener('submit',function(e){
    var form=e.target.closest('.js-add');if(!form)return;e.preventDefault();
    var btn=form.querySelector('button');btn.disabled=true;status(form,'Adding...');
    var qtyEl=form.querySelector('[name=qty]');
    post('/cart-add',{itemId:form.dataset.item,variantId:form.dataset.variant,qty:qtyEl?Number(qtyEl.value):1})
      .then(function(res){
        if(!res||!res.ok){throw new Error(res&&res.error||'Could not add that');}
        // Hand the signed properties to Shopify's own cart endpoint. The token
        // travels on the cart LINE, which is what survives Shop Pay.
        return fetch('/cart/add.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(res.payload)});
      })
      .then(function(r){if(!r.ok)return r.json().then(function(e){throw new Error(e.description||'Could not add that')});status(form,'Added to cart');btn.disabled=false;})
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
      bought.disabled=true;status(bought,'Saving...');
      post('/bought',{itemId:bought.dataset.item}).then(function(res){
        if(res&&res.ok){location.reload();}else{status(bought,(res&&res.error)||'Could not save',false);bought.disabled=false;}
      }).catch(function(){status(bought,'Could not save',false);bought.disabled=false;});
      return;
    }
    var share=e.target.closest('.js-share');
    if(share){
      var data={title:share.dataset.title,url:share.dataset.url};
      if(navigator.share){navigator.share(data).catch(function(){});}
      else if(navigator.clipboard){navigator.clipboard.writeText(share.dataset.url).then(function(){share.textContent='Link copied';});}
    }
  });

  // "New gift added" banner. The page is server-cached and correctly
  // invalidated the instant a write lands, so a newly-added item is already
  // available — an already-open tab just has no way to know that without
  // this. Deliberately a manual-refresh prompt, not an auto-reload: someone
  // mid-tap on "Add to cart" shouldn't have the page yanked out from under
  // them.
  if(cfg.versionUrl){
    var banner=document.getElementById('registro-refresh');
    var dismissed=false;
    function checkVersion(){
      if(dismissed||!banner||document.visibilityState==='hidden')return;
      fetch(cfg.versionUrl,{headers:{Accept:'application/json'}})
        .then(function(r){return r.json()})
        .then(function(res){if(res&&res.ok&&res.version>cfg.version){banner.hidden=false;}})
        .catch(function(){});
    }
    var refreshBtn=document.getElementById('registro-refresh-btn');
    var dismissBtn=document.getElementById('registro-dismiss-btn');
    if(refreshBtn)refreshBtn.addEventListener('click',function(){location.reload();});
    if(dismissBtn)dismissBtn.addEventListener('click',function(){dismissed=true;banner.hidden=true;});
    setInterval(checkVersion,20000);
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')checkVersion();});
  }
})();`.trim();
}
