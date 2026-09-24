import { layout, escapeHtml, escapeAttr, formatMoney, jsonForScript, storeMatchHref } from "./layout";
import type { DisplayItem } from "../../models/item.server";
import { EVENT_TYPES } from "../../shared/settings";
import { GIFT_CATEGORIES } from "../../shared/gift-categories";
import { WEDDING_GIFT_CATEGORIES } from "../../shared/wedding-categories";
import { eventHeroArt } from "../../shared/event-art";
import { COUNTRIES, normalizeCountry, retailerSearchLinks } from "../../shared/retailers";

/**
 * The registrant's own view. Reached only with a valid magic-link token or a
 * matching logged-in customer id — the app proxy HMAC alone is not enough.
 *
 * This is also where the "add from anywhere" paste box lives, which is the
 * feature the whole external-item design exists to serve.
 */

export interface ManagePageData {
  registryId: string;
  title: string;
  message: string | null;
  eventType: string;
  eventDate: Date | null;
  privacy: string;
  /** US | CA | GB | AU; null/absent = US. Picks which stores we link to. */
  country?: string | null;
  items: DisplayItem[];
  shopName: string;
  accentColor: string;
  currency: string;
  shareUrl: string;
  actionUrl: string;
  /** Handed to the storefront button via localStorage — see manageScript(). */
  token: string;
  /** Absolute private manage link (carries the token). Shown so the owner can copy it. */
  manageUrl: string;
  externalItemsAllowed: boolean;
  /** Registry version + its poll endpoint, so the page can pick up items added elsewhere (e.g. the browser extension). */
  version?: number;
  versionUrl?: string;
  storeSearchUrl: string;
  flash?: { kind: "ok" | "err"; message: string } | null;
  /** Who gave what — the thank-you list. */
  gifts: {
    itemTitle: string;
    buyerName: string | null;
    message: string | null;
    qty: number;
    hidden: boolean;
    source: string;
  }[];
}

export function renderManagePage(data: ManagePageData): string {
  const body = `
<div class="hero-art">${eventHeroArt(data.eventType)}</div>
<p class="sub">Your registry</p>
<h1>${escapeHtml(data.title)}</h1>

${data.flash ? `<div class="${data.flash.kind === "ok" ? "ok" : "err"}">${escapeHtml(data.flash.message)}</div>` : ""}

<div class="note">
  <p style="margin:0 0 8px"><strong>Your share link</strong></p>
  <p class="sub" style="word-break:break-all;margin:0 0 10px">${escapeHtml(data.shareUrl)}</p>
  <button class="btn sm js-share" type="button" data-url="${escapeAttr(data.shareUrl)}" data-title="${escapeAttr(data.title)}">Share with guests</button>
  <p class="hint">Guests see the gifts and what's left. They never see your email or address.</p>
</div>

<h2>Connect the browser extension</h2>
<div class="note">
  <p style="margin:0 0 10px">Add gifts from Amazon, Etsy or any other website in one click. Copy the link below, open the Giftpin extension in Chrome, and paste it in.</p>
  <label class="sr" for="manage-link">Your private connection link</label>
  <input id="manage-link" class="js-manage-link" type="text" readonly value="${escapeAttr(data.manageUrl)}">
  <div class="row" style="margin-top:10px">
    <button class="btn sm js-copy" type="button">Copy connection link</button>
    <span class="js-status item-meta" role="status"></span>
  </div>
  <p class="hint">This link is private &mdash; anyone who has it can edit your registry. It is not the guest share link above.</p>
</div>

<h2>Add items</h2>

${renderWeddingCategories(data)}

<div class="note">
  <p style="margin:0 0 10px"><strong>From ${escapeHtml(data.shopName)}</strong></p>
  <a class="btn sm block" href="${escapeAttr(data.storeSearchUrl)}">Browse the store</a>
  <p class="hint">Look for the &ldquo;Add to registry&rdquo; button on any product page. These are the items guests can buy in one tap.</p>
</div>

${
  data.externalItemsAllowed
    ? `<div class="note">
  <p style="margin:0 0 10px"><strong>From anywhere else</strong></p>
  <form class="js-paste">
    <label class="sr" for="paste-url">Product link</label>
    <input id="paste-url" type="url" name="url" placeholder="Paste a link to any product" required>
    <label class="sr" for="paste-note">Note for guests (optional)</label>
    <input id="paste-note" type="text" name="note" maxlength="500" placeholder="Optional note for guests, e.g. towels in grey or purple" style="margin-top:10px">
    <div class="row" style="margin-top:10px">
      <button class="btn sm" type="submit">Add to registry</button>
      <span class="js-status item-meta" role="status"></span>
    </div>
  </form>
  <p class="hint">We'll pull the name, photo and price from the page. Guests go to that store to buy it, and tell us when they have &mdash; so nobody buys it twice.</p>
</div>`
    : ""
}

<div id="registro-list">
<h2>Your list${data.items.length ? ` (${data.items.length})` : ""}</h2>
${
  data.items.length === 0
    ? `<div class="empty"><p>Nothing here yet. Add your first gift above.</p></div>`
    : `<ul class="items">${data.items.map((item) => renderManageItem(item, data)).join("\n")}</ul>`
}

${renderGifts(data)}
</div>

<h2>Registry settings</h2>
<form method="post" action="${escapeAttr(data.actionUrl)}/settings?t=${encodeURIComponent(data.token)}" class="note">
  <label for="f-title">Registry name</label>
  <input id="f-title" type="text" name="title" value="${escapeAttr(data.title)}" maxlength="200" required>

  <label for="f-event">Occasion</label>
  <select id="f-event" name="eventType">
    ${EVENT_TYPES.map(
      (t) => `<option value="${escapeAttr(t.value)}"${t.value === data.eventType ? " selected" : ""}>${escapeHtml(t.label)}</option>`,
    ).join("")}
  </select>

  <label for="f-date">Date</label>
  <input id="f-date" type="date" name="eventDate" value="${data.eventDate ? data.eventDate.toISOString().slice(0, 10) : ""}">

  <label for="f-msg">A note for your guests</label>
  <textarea id="f-msg" name="message" maxlength="2000" placeholder="Thank you for celebrating with us...">${escapeHtml(data.message)}</textarea>

  <label for="f-country">Where do your guests shop?</label>
  <select id="f-country" name="country">
    ${COUNTRIES.map((c) => `<option value="${escapeAttr(c.code)}"${normalizeCountry(data.country) === c.code ? " selected" : ""}>${escapeHtml(c.label)}</option>`).join("")}
  </select>
  <p class="hint">When this store doesn't carry something, we suggest that country's stores.</p>

  <label for="f-privacy">Who can see this</label>
  <select id="f-privacy" name="privacy">
    <option value="unlisted"${data.privacy === "unlisted" ? " selected" : ""}>Anyone with the link (recommended)</option>
    <option value="password"${data.privacy === "password" ? " selected" : ""}>Anyone with the link and a password</option>
    <option value="public_"${data.privacy === "public_" ? " selected" : ""}>Listed publicly, so guests can search for it</option>
  </select>
  <p class="hint">Your registry is never indexed by search engines unless you choose to list it. Your email and address are never shown to anyone.</p>

  <div class="row" style="margin-top:18px">
    <button class="btn" type="submit">Save changes</button>
  </div>
</form>

<div class="note">
  <p style="margin:0 0 8px"><strong>Delete this registry</strong></p>
  <p class="hint" style="margin:0 0 10px">Removes the registry, every item, and everything we know about who bought what. This can't be undone.</p>
  <form method="post" action="${escapeAttr(data.actionUrl)}/delete?t=${encodeURIComponent(data.token)}" class="js-confirm-delete">
    <button class="btn sm ghost" type="submit">Delete registry</button>
  </form>
</div>

${data.items.some((i) => i.storeMatch) ? renderMatchDialog(data) : ""}
<script id="registro-config" type="application/json">${jsonForScript({
    actionUrl: data.actionUrl,
    registryId: data.registryId,
    registryTitle: data.title,
    token: data.token,
    shopName: data.shopName,
    retailers: retailerSearchLinks(data.country),
    version: data.version ?? null,
    versionUrl: data.versionUrl ?? null,
  })}</script>
<script>${manageScript()}</script>
`;

  return layout(
    {
      title: `Manage ${data.title}`,
      accentColor: data.accentColor,
      indexable: false,
      shopName: data.shopName,
    },
    body,
  );
}

/**
 * "Not sure what to add?" — wedding-only, scoped per Ben's request (23 Sep
 * 2026, expanded to room-by-room detail same day at his request). Room →
 * subcategory → specific item, three levels deep, so a bride can actually
 * work through it like a checklist instead of squinting at ten vague
 * headings. Each item in a browsable room (kitchen, bath, etc.) is its own
 * link to a search of this merchant's store; items in the two non-catalog
 * rooms (experiences, funds) are plain suggestions pointing at "From
 * anywhere else" / a cash fund instead. Wrapped in nested <details> — one
 * per room — so it needs no JS, stays collapsed by default, and a bride can
 * open just the room she's thinking about instead of one giant list.
 */
function renderWeddingCategories(data: ManagePageData): string {
  if (data.eventType !== "wedding") return "";

  const rooms = WEDDING_GIFT_CATEGORIES.map((cat) => {
    const subcats = cat.subcategories
      .map((sub) => {
        const items = sub.items
          .map((item) => renderCategoryItem(item, cat.browsable))
          .join("");
        return `<p class="cat-sub">${escapeHtml(sub.label)}</p><div class="cat-grid">${items}</div>`;
      })
      .join("\n");

    return `<details class="cat-room">
  <summary>${escapeHtml(cat.label)}</summary>
  ${subcats}
</details>`;
  }).join("\n");

  return `<details class="note">
  <summary><strong>Not sure what to add?</strong> Wedding registry ideas, room by room</summary>
  <p class="hint" style="margin:10px 0">Open a room to see what couples commonly register for. Tap an item to search ${escapeHtml(data.shopName)}'s store — for things they don't carry, like experiences or a honeymoon fund, use &ldquo;From anywhere else&rdquo; below.</p>
  ${rooms}
  <div class="cat-fallback" id="cat-fallback" hidden role="status"></div>
</details>`;
}

function renderCategoryItem(item: { name: string; searchTerm?: string }, browsable: boolean): string {
  if (browsable) {
    const term = item.searchTerm ?? item.name;
    const href = `/search?q=${encodeURIComponent(term)}&type=product`;
    return `<a class="cat-chip js-cat" href="${escapeAttr(href)}" data-term="${escapeAttr(term)}">${escapeHtml(item.name)}</a>`;
  }
  return `<span class="cat-chip cat-chip--add">${escapeHtml(item.name)}</span>`;
}

function renderManageItem(item: DisplayItem, data: ManagePageData): string {
  const price = formatMoney(item.price, item.currency ?? data.currency);

  const image = item.imageUrl
    ? `<img class="item-img" src="${escapeAttr(item.imageUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer">`
    : `<div class="item-img ph">No photo</div>`;

  const source = item.isExternal
    ? `<span class="src${item.sourceType === "shopify_ext" ? " live" : ""}">${escapeHtml(item.externalDomain ?? "elsewhere")}</span>`
    : `<span class="src live">${escapeHtml(data.shopName)}</span>`;

  return `<li class="item${item.fulfilled ? " done" : ""}">
  ${image}
  <div>
    <p class="item-title">${escapeHtml(item.title)}${source}</p>
    <p class="item-meta">${[price, `${item.purchasedQty} of ${item.desiredQty} bought`].filter(Boolean).join(" &middot; ")}</p>
    ${renderStoreMatch(item, data)}
    <form class="row js-item" data-item="${escapeAttr(item.id)}">
      <label class="sr" for="note-${escapeAttr(item.id)}">Note for guests</label>
      <input class="item-note-input" id="note-${escapeAttr(item.id)}" type="text" name="note" maxlength="500" value="${escapeAttr(item.note ?? "")}" placeholder="Note for guests (optional), e.g. grey or purple" style="flex:1 1 100%">
      <label class="sr" for="dq-${escapeAttr(item.id)}">How many you'd like</label>
      <input class="qty" id="dq-${escapeAttr(item.id)}" type="number" name="desiredQty" value="${item.desiredQty}" min="${Math.max(1, item.purchasedQty)}" max="99" inputmode="numeric">
      <label class="sr" for="cat-${escapeAttr(item.id)}">Category</label>
      <select class="cat-select" id="cat-${escapeAttr(item.id)}" name="category">
        <option value=""${item.category ? "" : " selected"}>No category</option>
        ${GIFT_CATEGORIES.map((c) => `<option value="${escapeAttr(c.value)}"${c.value === item.category ? " selected" : ""}>${escapeHtml(c.label)}</option>`).join("")}
      </select>
      <button class="btn sm ghost" type="submit">Update</button>
      ${item.purchasedQty === 0 ? `<button class="btn sm ghost js-remove" type="button" data-item="${escapeAttr(item.id)}">Remove</button>` : ""}
      <span class="js-status item-meta" role="status"></span>
    </form>
  </div>
</li>`;
}

/**
 * "Similar item in this store" — suggested by the matcher, decided by the
 * registrant. A suggestion is theirs alone; only a kept one reaches guests.
 */
function renderStoreMatch(item: DisplayItem, data: ManagePageData): string {
  const m = item.storeMatch;
  if (!m) return "";
  const shop = escapeHtml(data.shopName);
  const href = escapeAttr(storeMatchHref(m));
  const isProduct = m.kind === "product";
  const id = escapeAttr(item.id);
  // Opens the preview popup; without JavaScript it is still a plain link to the store.
  const previewAttrs = `class="js-match-preview" data-item="${id}" data-orig="${escapeAttr(item.title)}" data-kept="${m.status === "kept" ? "1" : "0"}"`;
  const link = isProduct
    ? `<a ${previewAttrs} href="${href}" target="_blank" rel="noopener">${escapeHtml(m.title)}</a>`
    : `<a ${previewAttrs} href="${href}" target="_blank" rel="noopener">Browse ${escapeHtml(m.title)} products</a>`;

  if (m.status === "kept") {
    return `<div class="match">
  <p class="item-meta">Guests also see: ${link} at ${shop}</p>
  <div class="row"><button class="btn sm ghost js-match" type="button" data-item="${id}" data-action="dismiss">Remove link</button></div>
</div>`;
  }
  const lead = isProduct ? `Similar item in ${shop}:` : `${shop} sells ${escapeHtml(m.title)} products:`;
  return `<div class="match">
  <p class="item-meta"><strong>${lead}</strong> ${link}</p>
  <div class="row">
    <button class="btn sm ghost js-match" type="button" data-item="${id}" data-action="keep">Show to guests</button>
    ${
      isProduct
        ? `<button class="btn sm ghost js-match-preview" type="button" data-item="${id}" data-action="swap" data-orig="${escapeAttr(item.title)}" data-kept="0">Preview &amp; swap</button>`
        : `<button class="btn sm ghost js-match-preview" type="button" data-item="${id}" data-action="preview" data-orig="${escapeAttr(item.title)}" data-kept="0">See matching products</button>`
    }
    <button class="btn sm ghost js-match" type="button" data-item="${id}" data-action="dismiss">Remove</button>
  </div>
</div>`;
}

/** The "similar item" popup, filled in by the page script. One per page. */
function renderMatchDialog(data: ManagePageData): string {
  return `<dialog id="match-dialog" class="match-dialog" aria-labelledby="match-dialog-title">
  <div class="md-head">
    <h2 id="match-dialog-title">From ${escapeHtml(data.shopName)}</h2>
    <button class="dismiss js-md-close" type="button" aria-label="Close">&times;</button>
  </div>
  <div id="md-body" role="status">Loading&hellip;</div>
  <div class="row md-foot">
    <button class="btn sm ghost js-md-keep" type="button">Show to guests</button>
    <button class="btn sm ghost js-md-close" type="button">Close</button>
  </div>
</dialog>`;
}

function renderGifts(data: ManagePageData): string {
  if (data.gifts.length === 0) return "";

  const rows = data.gifts
    .map((gift) => {
      const who = gift.hidden
        ? "<em>Hidden until your event</em>"
        : gift.buyerName
          ? escapeHtml(gift.buyerName)
          : "<em>Anonymous</em>";
      return `<li class="item" style="grid-template-columns:1fr">
  <div>
    <p class="item-title">${escapeHtml(gift.itemTitle)}</p>
    <p class="item-meta">From ${who}${gift.qty > 1 ? ` &middot; ${gift.qty}` : ""}${gift.source === "external" ? " &middot; bought elsewhere" : ""}</p>
    ${gift.message ? `<p class="item-note">&ldquo;${escapeHtml(gift.message)}&rdquo;</p>` : ""}
  </div>
</li>`;
    })
    .join("\n");

  return `<h2>Who gave what</h2>
<p class="sub">For your thank-you notes.</p>
<ul class="items">${rows}</ul>
<p><a class="btn sm ghost" href="${escapeAttr(data.actionUrl)}/thank-you.csv">Download as a spreadsheet</a></p>`;
}

function manageScript(): string {
  return `
(function(){
  var cfg=JSON.parse(document.getElementById('registro-config').textContent);

  // Hand this registry's token to the storefront.
  //
  // The theme's "Add to registry" button runs on the same origin (both this
  // page and the product page are served from the merchant's domain), so
  // localStorage is how the button knows which registry to add to without
  // forcing the registrant to create a store account. It is a per-browser
  // convenience only — the server re-verifies the token on every write.
  try{
    var KEY='registro.registries';
    var stored=JSON.parse(localStorage.getItem(KEY)||'[]');
    if(!Array.isArray(stored))stored=[];
    stored=stored.filter(function(r){return r&&r.id!==cfg.registryId});
    stored.unshift({id:cfg.registryId,title:cfg.registryTitle,token:cfg.token});
    localStorage.setItem(KEY,JSON.stringify(stored.slice(0,10)));
  }catch(_){}

  var dlg=document.getElementById('match-dialog');
  function mdMessage(msg){
    var b=document.getElementById('md-body');
    var old=b.querySelector('.md-error');if(old)old.remove();
    var p=document.createElement('p');p.className='item-meta md-error';p.style.color='#8c1d13';p.textContent=msg;b.appendChild(p);
  }
  function mdCard(p){
    var card=document.createElement('div');card.className='md-card';
    if(p.imageUrl){var im=document.createElement('img');im.src=p.imageUrl;im.alt='';im.width=72;im.height=72;im.className='item-img';card.appendChild(im);}
    var info=document.createElement('div');info.className='md-info';
    var t=document.createElement('p');t.className='item-title';t.textContent=p.title;info.appendChild(t);
    if(p.price){var pr=document.createElement('p');pr.className='item-meta';pr.textContent=p.price;info.appendChild(pr);}
    var row=document.createElement('div');row.className='row';
    var b=document.createElement('button');b.type='button';b.className='btn sm js-md-swap';b.dataset.gid=p.id;b.textContent='Use this instead';row.appendChild(b);
    var a=document.createElement('a');a.className='btn sm ghost';a.target='_blank';a.rel='noopener';a.href='/products/'+encodeURIComponent(p.handle);a.textContent='View on store';row.appendChild(a);
    info.appendChild(row);card.appendChild(info);
    return card;
  }
  function openPreview(trigger){
    var body=document.getElementById('md-body');
    dlg.dataset.item=trigger.dataset.item;dlg.dataset.orig=trigger.dataset.orig||'';
    dlg.querySelector('.js-md-keep').hidden=trigger.dataset.kept==='1';
    dlg.querySelector('.js-md-keep').disabled=false;
    body.textContent='Loading\u2026';
    dlg.showModal();
    post('/match-preview',{itemId:trigger.dataset.item}).then(function(res){
      body.textContent='';
      if(!res||!res.ok){mdMessage((res&&res.error)||'Could not load the store\u2019s products');return;}
      var intro=document.createElement('p');intro.className='item-meta';
      intro.textContent=res.kind==='product'
        ?'Instead of \u201c'+dlg.dataset.orig+'\u201d, '+cfg.shopName+' has:'
        :cfg.shopName+' sells '+res.title+' products. Pick one to swap in for \u201c'+dlg.dataset.orig+'\u201d:';
      body.appendChild(intro);
      if(res.products.length===0){
        var none=document.createElement('p');none.className='item-meta';none.textContent='No products to show right now.';body.appendChild(none);
      }
      res.products.forEach(function(p){body.appendChild(mdCard(p));});
      if(res.kind==='search'){
        var all=document.createElement('a');all.className='hint';all.target='_blank';all.rel='noopener';
        all.href='/search?q='+encodeURIComponent(res.title)+'&type=product';all.textContent='Browse all '+res.title+' products';body.appendChild(all);
      }
    }).catch(function(){body.textContent='';mdMessage('Could not load the store\u2019s products');});
  }

  function status(el,msg,ok){var s=el.querySelector('.js-status');if(s){s.textContent=msg;s.style.color=ok===false?'#8c1d13':'';}}
  function post(path,body){return fetch(cfg.actionUrl+path+'?t='+encodeURIComponent(cfg.token),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json()}).then(function(res){if(res&&res.ok)syncVersion();return res;})}

  // Pick up changes made elsewhere (the browser extension, the storefront
  // button, a guest buying something) without a manual refresh: poll the
  // registry's cheap version endpoint and, when it moves, swap in the fresh
  // list. Own edits mark their version as seen so the list isn't redrawn
  // under the owner right after they hit Update.
  var polling=false;
  function syncVersion(){
    if(!cfg.versionUrl)return;
    fetch(cfg.versionUrl,{headers:{Accept:'application/json'}}).then(function(r){return r.json()})
      .then(function(res){if(res&&res.ok&&res.version>cfg.version)cfg.version=res.version;}).catch(function(){});
  }
  function listBusy(){
    var a=document.activeElement;
    if(a&&a.closest&&a.closest('#registro-list')&&/^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName))return true;
    if(document.querySelector('#registro-list button:disabled'))return true;
    var d=document.querySelector('dialog');
    return !!(d&&d.open);
  }
  function refreshList(){
    return fetch(cfg.actionUrl+'/manage?t='+encodeURIComponent(cfg.token),{headers:{Accept:'text/html'},cache:'no-store',credentials:'same-origin'})
      .then(function(r){return r.text()})
      .then(function(html){
        var doc=new DOMParser().parseFromString(html,'text/html');
        var fresh=doc.getElementById('registro-list');
        var freshCfg=doc.getElementById('registro-config');
        if(!fresh||!freshCfg)throw new Error('no list');
        // The match preview dialog only exists when some item has a match; if
        // one just appeared, a full reload is the simple, correct answer.
        if(doc.querySelector('dialog')&&!document.querySelector('dialog')){location.reload();return;}
        document.getElementById('registro-list').innerHTML=fresh.innerHTML;
        var next=JSON.parse(freshCfg.textContent);
        cfg.version=next.version;
      });
  }
  function pollList(){
    if(polling||!cfg.versionUrl||document.visibilityState==='hidden')return;
    polling=true;
    fetch(cfg.versionUrl,{headers:{Accept:'application/json'}}).then(function(r){return r.json()})
      .then(function(res){
        if(!(res&&res.ok&&res.version>cfg.version)||listBusy())return;
        return refreshList();
      })
      .catch(function(){})
      .then(function(){polling=false;});
  }
  if(cfg.versionUrl){
    setInterval(pollList,4000);
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')pollList();});
  }

  document.addEventListener('submit',function(e){
    var paste=e.target.closest('.js-paste');
    if(paste){
      e.preventDefault();
      var input=paste.querySelector('[name=url]');var btn=paste.querySelector('button');
      btn.disabled=true;status(paste,'Looking up that link...');
      post('/add-external',{url:input.value,note:paste.querySelector('[name=note]').value}).then(function(res){
        if(res&&res.ok){location.reload();}
        else{status(paste,(res&&res.error)||'Could not add that link',false);btn.disabled=false;}
      }).catch(function(){status(paste,'Could not add that link',false);btn.disabled=false;});
      return;
    }
    var item=e.target.closest('.js-item');
    if(item){
      e.preventDefault();status(item,'Saving...');
      post('/update-item',{itemId:item.dataset.item,desiredQty:Number(item.querySelector('[name=desiredQty]').value),category:item.querySelector('[name=category]').value,note:item.querySelector('[name=note]').value})
        .then(function(res){status(item,res&&res.ok?'Saved':((res&&res.error)||'Could not save'),!(res&&res.ok));});
      return;
    }
    var del=e.target.closest('.js-confirm-delete');
    if(del&&!confirm('Delete this registry and everything on it? This cannot be undone.')){e.preventDefault();}
  });

  document.addEventListener('click',function(e){
    var chip=e.target.closest('.js-cat');
    if(chip){
      if(e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;
      e.preventDefault();
      var term=chip.dataset.term,href=chip.getAttribute('href'),panel=document.getElementById('cat-fallback');
      // Show the answer right under the room the person is looking at. The panel
      // used to sit at the very bottom of the whole list, so when the store
      // didn't carry an item the click appeared to do nothing.
      var grid=chip.closest('.cat-grid');
      if(grid&&grid.parentNode){grid.parentNode.insertBefore(panel,grid.nextSibling);}
      panel.hidden=false;panel.textContent='Checking '+cfg.shopName+'...';
      var reveal=function(){try{panel.scrollIntoView({block:'nearest',behavior:'smooth'});}catch(_){}};
      reveal();
      fetch('/search/suggest.json?q='+encodeURIComponent(term)+'&resources[type]=product&resources[limit]=1',{headers:{Accept:'application/json'}})
        .then(function(r){return r.ok?r.json():null})
        .then(function(data){
          var list=data&&data.resources&&data.resources.results&&data.resources.results.products;
          // Found one, or couldn't tell: go to the store's own search.
          if(!Array.isArray(list)||list.length>0){location.href=href;return;}
          panel.textContent='';
          var p=document.createElement('p');p.className='item-meta';
          p.textContent=cfg.shopName+' doesn\u2019t carry \u201c'+term+'\u201d yet. Look for it at:';
          panel.appendChild(p);
          var row=document.createElement('div');row.className='cat-grid';
          (cfg.retailers||[]).forEach(function(r){
            var a=document.createElement('a');a.className='cat-chip';a.target='_blank';a.rel='noopener noreferrer';
            a.href=r.url.replace('{q}',encodeURIComponent(term));a.textContent=r.name;row.appendChild(a);
          });
          panel.appendChild(row);
          var h=document.createElement('p');h.className='hint';
          h.textContent='Found one? Paste its link under \u201cFrom anywhere else\u201d below, or use the Giftpin browser extension.';
          panel.appendChild(h);
          reveal();
        })
        .catch(function(){location.href=href;});
      return;
    }
    var mp=e.target.closest('.js-match-preview');
    if(mp&&dlg&&typeof dlg.showModal==='function'){
      if(e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;
      e.preventDefault();openPreview(mp);return;
    }
    if(e.target===dlg){dlg.close();return;}
    if(e.target.closest('.js-md-close')){dlg.close();return;}
    var mk=e.target.closest('.js-md-keep');
    if(mk){
      mk.disabled=true;
      post('/item-match',{itemId:dlg.dataset.item,action:'keep'}).then(function(res){
        if(res&&res.ok){location.reload();}else{mdMessage((res&&res.error)||'Could not do that');mk.disabled=false;}
      });
      return;
    }
    var sw=e.target.closest('.js-md-swap');
    if(sw){
      if(!sw.dataset.armed){
        dlg.querySelectorAll('.js-md-swap').forEach(function(b){delete b.dataset.armed;b.textContent='Use this instead';});
        dlg.querySelectorAll('.md-warn').forEach(function(n){n.remove();});
        sw.dataset.armed='1';sw.textContent='Confirm swap';
        var warn=document.createElement('p');warn.className='hint md-warn';
        warn.textContent='This replaces \u201c'+(dlg.dataset.orig||'your item')+'\u201d on your registry. Guests will buy it through the store.';
        sw.closest('.md-card').appendChild(warn);
        return;
      }
      sw.disabled=true;
      post('/item-match',{itemId:dlg.dataset.item,action:'swap',productGid:sw.dataset.gid}).then(function(res){
        if(res&&res.ok){location.reload();}
        else{mdMessage((res&&res.error)||'Could not swap');sw.disabled=false;}
      });
      return;
    }
    var match=e.target.closest('.js-match');
    if(match){
      if(match.dataset.action==='swap'&&!confirm('Replace your item with this one from the store? Guests will be able to buy it in one tap.'))return;
      match.disabled=true;
      post('/item-match',{itemId:match.dataset.item,action:match.dataset.action}).then(function(res){
        if(res&&res.ok){location.reload();}
        else{alert((res&&res.error)||'Could not do that');match.disabled=false;}
      });
      return;
    }
    var remove=e.target.closest('.js-remove');
    if(remove){
      if(!confirm('Remove this item?'))return;
      remove.disabled=true;
      post('/remove-item',{itemId:remove.dataset.item}).then(function(res){
        if(res&&res.ok){location.reload();}
        else{status(remove.closest('.js-item'),(res&&res.error)||'Could not remove',false);remove.disabled=false;}
      });
      return;
    }
    var copy=e.target.closest('.js-copy');
    if(copy){
      var field=document.querySelector('.js-manage-link');
      field.select();
      var done=function(){status(copy.parentNode.parentNode,'Copied');};
      if(navigator.clipboard){navigator.clipboard.writeText(field.value).then(done,function(){document.execCommand('copy');done();});}
      else{document.execCommand('copy');done();}
      return;
    }
    var share=e.target.closest('.js-share');
    if(share){
      var data={title:share.dataset.title,url:share.dataset.url};
      if(navigator.share){navigator.share(data).catch(function(){});}
      else if(navigator.clipboard){navigator.clipboard.writeText(share.dataset.url).then(function(){share.textContent='Link copied';});}
    }
  });
})();`.trim();
}
