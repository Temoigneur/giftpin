import { layout, escapeHtml, escapeAttr, formatMoney, jsonForScript, storeMatchHref } from "./layout";
import type { DisplayItem } from "../../models/item.server";
import { EVENT_TYPES } from "../../shared/settings";
import { GIFT_CATEGORIES } from "../../shared/gift-categories";
import { WEDDING_GIFT_CATEGORIES } from "../../shared/wedding-categories";
import { eventHeroArt } from "../../shared/event-art";

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
    <div class="row" style="margin-top:10px">
      <button class="btn sm" type="submit">Add to registry</button>
      <span class="js-status item-meta" role="status"></span>
    </div>
  </form>
  <p class="hint">We'll pull the name, photo and price from the page. Guests go to that store to buy it, and tell us when they have &mdash; so nobody buys it twice.</p>
</div>`
    : ""
}

<h2>Your list${data.items.length ? ` (${data.items.length})` : ""}</h2>
${
  data.items.length === 0
    ? `<div class="empty"><p>Nothing here yet. Add your first gift above.</p></div>`
    : `<ul class="items">${data.items.map((item) => renderManageItem(item, data)).join("\n")}</ul>`
}

${renderGifts(data)}

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

<script id="registro-config" type="application/json">${jsonForScript({
    actionUrl: data.actionUrl,
    registryId: data.registryId,
    registryTitle: data.title,
    token: data.token,
    shopName: data.shopName,
    retailers: retailerSearchLinks(data.currency),
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
  const link = isProduct
    ? `<a href="${href}" target="_blank" rel="noopener">${escapeHtml(m.title)}</a>`
    : `<a href="${href}" target="_blank" rel="noopener">Browse ${escapeHtml(m.title)} products</a>`;
  const id = escapeAttr(item.id);

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
    ${isProduct ? `<button class="btn sm ghost js-match" type="button" data-item="${id}" data-action="swap">Use this instead</button>` : ""}
    <button class="btn sm ghost js-match" type="button" data-item="${id}" data-action="dismiss">Remove</button>
  </div>
</div>`;
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

/**
 * Where to look when the hosting store doesn't carry something. Plain outbound
 * search pages, chosen by the shop's currency so a Canadian shopper lands on
 * the Canadian sites. `{q}` is replaced with the search term in the browser.
 */
function retailerSearchLinks(currency: string): { name: string; url: string }[] {
  if (currency === "CAD") {
    return [
      { name: "Amazon.ca", url: "https://www.amazon.ca/s?k={q}" },
      { name: "Walmart.ca", url: "https://www.walmart.ca/search?q={q}" },
      { name: "Wayfair.ca", url: "https://www.wayfair.ca/keyword.php?keyword={q}" },
      { name: "Etsy", url: "https://www.etsy.com/ca/search?q={q}" },
      { name: "Google Shopping", url: "https://www.google.com/search?tbm=shop&q={q}" },
    ];
  }
  return [
    { name: "Amazon", url: "https://www.amazon.com/s?k={q}" },
    { name: "Walmart", url: "https://www.walmart.com/search?q={q}" },
    { name: "Target", url: "https://www.target.com/s?searchTerm={q}" },
    { name: "Wayfair", url: "https://www.wayfair.com/keyword.php?keyword={q}" },
    { name: "Etsy", url: "https://www.etsy.com/search?q={q}" },
    { name: "Google Shopping", url: "https://www.google.com/search?tbm=shop&q={q}" },
  ];
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

  function status(el,msg,ok){var s=el.querySelector('.js-status');if(s){s.textContent=msg;s.style.color=ok===false?'#8c1d13':'';}}
  function post(path,body){return fetch(cfg.actionUrl+path+'?t='+encodeURIComponent(cfg.token),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json()})}

  document.addEventListener('submit',function(e){
    var paste=e.target.closest('.js-paste');
    if(paste){
      e.preventDefault();
      var input=paste.querySelector('[name=url]');var btn=paste.querySelector('button');
      btn.disabled=true;status(paste,'Looking up that link...');
      post('/add-external',{url:input.value}).then(function(res){
        if(res&&res.ok){location.reload();}
        else{status(paste,(res&&res.error)||'Could not add that link',false);btn.disabled=false;}
      }).catch(function(){status(paste,'Could not add that link',false);btn.disabled=false;});
      return;
    }
    var item=e.target.closest('.js-item');
    if(item){
      e.preventDefault();status(item,'Saving...');
      post('/update-item',{itemId:item.dataset.item,desiredQty:Number(item.querySelector('[name=desiredQty]').value),category:item.querySelector('[name=category]').value})
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
      panel.hidden=false;panel.textContent='Checking '+cfg.shopName+'...';
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
        })
        .catch(function(){location.href=href;});
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
