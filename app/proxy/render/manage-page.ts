import type { PageBranding } from "../../shared/branding";
import { layout, escapeHtml, escapeAttr, formatMoney, jsonForScript, storeMatchHref } from "./layout";
import type { DisplayItem } from "../../models/item.server";
import { EVENT_TYPES } from "../../shared/settings";
import { GIFT_CATEGORIES } from "../../shared/gift-categories";
import { ideaGuideFor } from "../../shared/registry-ideas";
import { IDEA_MATCH_JS } from "../../shared/idea-match";
import { ideaAliases } from "../../shared/idea-aliases";
import { eventHeroArt, eventHeroImage } from "../../shared/event-art";
import { REGISTRIES_STORAGE_KEY, LEGACY_REGISTRIES_STORAGE_KEY } from "../../shared/storage-keys";
import { COUNTRIES, normalizeCountry, retailerSearchLinks } from "../../shared/retailers";
import { affiliateEnabled } from "../../lib/affiliate";
import { PROVINCES, SHIPPING_COUNTRIES } from "../../shared/shipping-address";
import { renderPerks } from "./create-page";
import { isSoldOutStoreItem } from "../../lib/stock";

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
  /**
   * Chrome Web Store page for the Giftpin extension (CHROME_EXTENSION_URL).
   * Null hides every mention of the extension: it isn't approved yet (29 Sep
   * 2026), and pointing registrants at something they can't install only
   * frustrates them. Paste-a-link covers the same job meanwhile.
   */
  chromeExtensionUrl?: string | null;
  /**
   * Show the "Connect the browser extension" link even while
   * chromeExtensionUrl is unset (manage URL with &extension=1), so Ben and
   * Chrome Web Store reviewers can connect the unpublished extension.
   */
  extensionConnect?: boolean;
  /** Affiliate link-wrapper endpoint for the ideas guide's other-store links (see app/lib/affiliate.ts); null = links untouched. */
  affiliateLinkWrapperBase?: string | null;
  items: DisplayItem[];
  shopName: string;
  accentColor: string;
  branding?: PageBranding | null;
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
  /** App origin serving public/art/ (SHOPIFY_APP_URL) — see eventHeroImage. */
  artBaseUrl?: string | null;
  storeSearchUrl: string;
  flash?: { kind: "ok" | "err"; message: string } | null;
  /** Ship-to-registrant: the registrant's own saved address, from Giftpin's form. */
  shipping?: {
    enabled: boolean;
    address: Record<string, string> | null;
    flash?: { kind: "ok" | "err"; message: string } | null;
  };
  /** Who gave what — the thank-you list. */
  gifts: {
    itemTitle: string;
    buyerName: string | null;
    message: string | null;
    qty: number;
    hidden: boolean;
    source: string;
    /** A chip-in toward a group gift or fund: shown as money, not a quantity. */
    isContribution?: boolean;
    amount?: number | null;
  }[];
  /**
   * Group gifts and cash funds (Pro, SPIKE-C.md). Null hides every control:
   * the store isn't on Pro or hasn't picked a gift card product.
   */
  contributions?: {
    /** Registry.contributionsToRegistrant. */
    toRegistrant: boolean;
  } | null;
  /** The store hides sold-out products from guests (ShopSettings.soldOutItems). */
  soldOutHidden?: boolean;
  /** Registry perks (Pro). See app/shared/perks.ts. */
  perks?: string[];
  /** In-store barcode scanning on the registrant's phone (Pro). */
  scanner?: boolean;
  /** Barcode reader for phones without a built-in one; null = typing the number only. */
  scannerScriptUrl?: string | null;
}

export function renderManagePage(data: ManagePageData): string {
  const body = `
${eventHeroImage(data.eventType, data.artBaseUrl) ?? `<div class="hero-art">${eventHeroArt(data.eventType)}</div>`}
<p class="sub">Your registry</p>
<h1>${escapeHtml(data.title)}</h1>

${data.flash ? `<div class="${data.flash.kind === "ok" ? "ok" : "err"}">${escapeHtml(data.flash.message)}</div>` : ""}

${renderPerks(data.shopName, data.perks)}

<div class="note">
  <p style="margin:0 0 8px"><strong>Your share link</strong></p>
  <p class="sub" style="word-break:break-all;margin:0 0 10px">${escapeHtml(data.shareUrl)}</p>
  <button class="btn sm js-share" type="button" data-url="${escapeAttr(data.shareUrl)}" data-title="${escapeAttr(data.title)}">Share with guests</button>
  <button class="btn sm ghost js-share-copy" type="button" data-url="${escapeAttr(data.shareUrl)}">Copy link</button>
  ${renderShareMenu(data.title, data.shareUrl)}
  <p class="hint">Guests see the gifts and what's left. They never see your email or address.</p>
  ${renderLinkElsewhere(data.eventType, data.privacy)}
</div>

${data.chromeExtensionUrl || data.extensionConnect ? `<style>.touch-only{display:none}@media (hover:none) and (pointer:coarse){.touch-only{display:block}.no-touch{display:none}}</style>
<h2 id="extension">Connect the browser extension</h2>
<div class="note">
  ${data.chromeExtensionUrl ? `<p style="margin:0 0 10px"><a href="${escapeAttr(data.chromeExtensionUrl)}" target="_blank" rel="noopener">Get the Giftpin extension for Chrome</a></p>` : ""}
  <p class="touch-only" style="margin:0 0 10px"><strong>This part needs a computer.</strong> The extension runs in Chrome on a computer, not on phones or tablets. Open this page on your computer to connect it.</p>
  <p style="margin:0 0 10px">Add gifts from Amazon, Etsy or any other website in one click. Copy the link below, open the Giftpin extension in Chrome, and paste it in.</p>
  <label class="sr" for="manage-link">Your private connection link</label>
  <input id="manage-link" class="js-manage-link" type="text" readonly value="${escapeAttr(data.manageUrl)}">
  <div class="row" style="margin-top:10px">
    <button class="btn sm js-copy" type="button">Copy connection link</button>
    <span class="js-status item-meta" role="status"></span>
  </div>
  <p class="hint">This link is private &mdash; anyone who has it can edit your registry. It is not the guest share link above.</p>
</div>
` : ""}

<h2>Add items</h2>

${renderIdeaGuide(data)}

<div class="duo">
<div class="note">
  <p style="margin:0 0 10px"><strong>From ${escapeHtml(data.shopName)}</strong></p>
  <a class="btn sm block" href="${escapeAttr(data.storeSearchUrl)}">Browse the store</a>
  <p class="hint">Look for the &ldquo;Add to registry&rdquo; button on any product page. These are the items guests can buy in one tap.</p>
  ${data.scanner ? renderScanner(data) : ""}
</div>

${
  data.externalItemsAllowed
    ? `<div class="note">
  <p style="margin:0 0 10px"><strong>From anywhere else</strong></p>
  <form class="js-paste" novalidate>
    <label class="sr" for="paste-url">Product link</label>
    <input id="paste-url" type="url" name="url" placeholder="Paste a link to any product" required>
    <div class="row js-paste-lookup" style="margin-top:10px">
      <button class="btn sm" type="submit">Look it up</button>
      <span class="js-status item-meta" role="status"></span>
    </div>
    <div class="js-paste-found" hidden>
      <p class="item-meta js-paste-msg" style="margin-top:12px"></p>
      <div class="paste-grid">
        <div class="md-card">
          <img class="item-img js-paste-img" alt="" width="72" height="72" hidden>
          <div class="md-info">
            <label for="paste-title">Name</label>
            <input id="paste-title" type="text" name="title" maxlength="300">
            <label for="paste-price">Price</label>
            <input id="paste-price" type="text" name="price" inputmode="decimal" maxlength="20" placeholder="e.g. 49.99">
          </div>
        </div>
        <div class="match js-paste-match" hidden>
          <p class="item-meta"><strong>Closest match in ${escapeHtml(data.shopName)}</strong></p>
          <div class="js-paste-match-cards"></div>
          <label class="check"><input type="checkbox" name="showMatch"> Show this to guests too</label>
        </div>
      </div>
      <label for="paste-note">Note for guests (optional)</label>
      <input id="paste-note" type="text" name="note" maxlength="500" placeholder="e.g. grey or purple is fine">
      <div class="row" style="margin-top:10px">
        <button class="btn sm" type="submit">Add to registry</button>
        <button class="btn sm ghost js-paste-cancel" type="button">Cancel</button>
        <span class="js-status item-meta" role="status"></span>
      </div>
    </div>
  </form>
  ${
    data.chromeExtensionUrl
      ? `<p class="hint touch-only">On a phone, big stores like Amazon, Wayfair and Target block us from reading their pages, so you'll type the name and price yourself. To have the photo and price filled in for you, add those items with the <a href="#extension">Giftpin Chrome extension</a> on a computer.</p>
  <p class="hint no-touch">On a computer? The <a href="#extension">Giftpin browser extension</a> is the easiest way: it picks up the photo and price even on sites that block us here.</p>`
      : `<p class="hint">Some big stores block us from reading their pages. If that happens, type the name and price yourself and we'll add it with the link.</p>`
  }
  <p class="hint">We'll pull the name, photo and price from the page and show you anything similar in ${escapeHtml(data.shopName)}. Guests go to that store to buy it, and tell us when they have &mdash; so nobody buys it twice.</p>
</div>`
    : ""
}
</div>

${renderFundSetup(data)}

<div id="registro-list">
<h2>Your list${data.items.length ? ` (${data.items.length})` : ""}</h2>
${
  data.items.length === 0
    ? `<div class="empty"><p>Nothing here yet. Add your first gift above.</p></div>`
    : `<ul class="items">${data.items.map((item) => renderManageItem(item, data)).join("\n")}</ul>`
}

${renderGifts(data)}
</div>

${renderShipping(data)}

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
    extension: Boolean(data.chromeExtensionUrl),
    affiliateBase: affiliateEnabled(data.affiliateLinkWrapperBase) ? data.affiliateLinkWrapperBase : null,
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
      branding: data.branding,
    },
    body,
  );
}

/**
 * Ship-to-registrant. The address typed here is the only address Giftpin ever
 * stores; it's written onto registry orders by applyShipToRegistrant(), which
 * refuses when the guest checked out in a different country or province/state
 * (tax would change), so the copy says "usually" and explains that case.
 */
function renderShipping(data: ManagePageData): string {
  const shipping = data.shipping ?? { enabled: false, address: null };
  const a = shipping.address ?? {};
  const country = a.countryCode || a.countryCodeV2 || normalizeCountry(data.country);
  const flash = shipping.flash;
  const input = (name: string, label: string, autocomplete: string, optional = false, type = "text") => `
    <label for="ship-${name}">${label}${optional ? ' <span class="hint">(optional)</span>' : ""}</label>
    <input id="ship-${name}" type="${type}" name="${name}" autocomplete="${autocomplete}" maxlength="120" value="${escapeAttr(a[name] ?? "")}">`;

  return `<h2 id="ship">Send gifts to me</h2>
<form method="post" action="${escapeAttr(data.actionUrl)}/shipping?t=${encodeURIComponent(data.token)}" class="note js-ship">
  ${flash ? `<div class="${flash.kind === "ok" ? "ok" : "err"}">${escapeHtml(flash.message)}</div>` : ""}
  <label class="check"><input type="checkbox" name="enabled" class="js-ship-toggle"${shipping.enabled ? " checked" : ""}> Ship gifts bought from ${escapeHtml(data.shopName)} straight to me</label>
  <p class="hint">Guests never see your address, and each guest can choose to have their gift sent to themselves instead. If a guest checks out from a different ${country === "GB" ? "country" : "state, province or country"}, the store sends that gift to the guest's address instead, because the tax would change.</p>
  <fieldset class="js-ship-fields"${shipping.enabled ? "" : " hidden"}>
    <legend class="sr">Your shipping address</legend>
    <div class="duo">
      <div>${input("firstName", "First name", "given-name")}</div>
      <div>${input("lastName", "Last name", "family-name")}</div>
    </div>
    ${input("address1", "Street address", "address-line1")}
    ${input("address2", "Apartment, suite, etc.", "address-line2", true)}
    ${input("city", "City", "address-level2")}
    <label for="ship-country">Country</label>
    <select id="ship-country" name="countryCode" class="js-ship-country" autocomplete="country">
      ${SHIPPING_COUNTRIES.map((c) => `<option value="${escapeAttr(c.code)}"${c.code === country ? " selected" : ""}>${escapeHtml(c.label)}</option>`).join("")}
    </select>
    ${Object.entries(PROVINCES)
      .map(
        ([code, p]) => `<div class="js-ship-region" data-country="${code}"${code === country ? "" : " hidden"}>
    <label for="ship-region-${code}">${p.label}</label>
    <select id="ship-region-${code}" name="provinceCode" autocomplete="address-level1"${code === country ? "" : " disabled"}>
      <option value="">Choose&hellip;</option>
      ${p.regions.map((r) => `<option value="${escapeAttr(r.code)}"${code === country && r.code === a.provinceCode ? " selected" : ""}>${escapeHtml(r.label)}</option>`).join("")}
    </select>
    </div>`,
      )
      .join("")}
    ${input("zip", country === "US" ? "ZIP code" : "Postal code", "postal-code")}
    ${input("phone", "Phone, for the courier", "tel", true, "tel")}
  </fieldset>
  <div class="row" style="margin-top:18px">
    <button class="btn" type="submit">Save</button>
  </div>
</form>`;
}

/**
 * "Not sure what to add?" — an ideas guide for every occasion (wedding first,
 * 23 Sep 2026; every other occasion 24 Sep 2026, Ben's requests). Group →
 * subgroup → specific item, three levels deep, organized however suits the
 * occasion (wedding by room, birthday by age, baby by need; see
 * app/shared/registry-ideas.ts). Each item in a browsable group is its own
 * link to a search of this merchant's store; items in non-catalog groups
 * (experiences, funds) are plain suggestions pointing at "From anywhere else"
 * instead. Nested <details> so it needs no JS and stays collapsed by default.
 *
 * The summary is styled as a tinted call-out card with an icon and a pill
 * button, so it stands out as a key feature (Ben, 24 Sep 2026) without
 * shouting — the earlier oversized-text version read as garish.
 */
function renderIdeaGuide(data: ManagePageData): string {
  const guide = ideaGuideFor(data.eventType);

  const groups = guide.groups.map((cat) => {
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

  return `<details class="note ideas">
  <summary>
    <span class="ideas-icon" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2V16h5v-.2c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3z"/></svg></span>
    <span class="ideas-text"><span class="ideas-q">Not sure what to add?</span><span class="ideas-t">${escapeHtml(guide.title)}</span></span>
    <span class="ideas-cta"><span class="ideas-cta-label"><span class="ideas-cta-open">Browse ideas</span><span class="ideas-cta-close">Hide ideas</span></span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></span>
  </summary>
  <p class="hint" style="margin:10px 0">${escapeHtml(guide.intro)} Tap an item to search ${escapeHtml(data.shopName)}'s store &mdash; for things they don't carry, like experiences or a cash fund, use &ldquo;From anywhere else&rdquo; below.</p>
  ${groups}
  <div class="cat-fallback" id="cat-fallback" hidden role="status"></div>
</details>`;
}

function renderCategoryItem(item: { name: string; searchTerm?: string }, browsable: boolean): string {
  if (browsable) {
    const term = item.searchTerm ?? item.name;
    const href = `/search?q=${encodeURIComponent(term)}&type=product`;
    const aliases = ideaAliases(term);
    const alias = aliases.length ? ` data-aliases="${escapeAttr(aliases.join("|"))}"` : "";
    return `<a class="cat-chip js-cat" href="${escapeAttr(href)}" data-term="${escapeAttr(term)}"${alias}>${escapeHtml(item.name)}</a>`;
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
    <p class="item-meta">${
      item.isFund
        ? fundLine(item, data)
        : [price, `${item.purchasedQty} of ${item.desiredQty} bought`, item.fund ? fundLine(item, data) : ""].filter(Boolean).join(" &middot; ")
    }</p>
    ${
      isSoldOutStoreItem(item) && !item.fulfilled
        ? `<p class="item-meta"><strong>Sold out right now.</strong> ${data.soldOutHidden ? "Guests won't see it until it's back in stock." : "Guests can't add it to their cart until it's back in stock."}</p>`
        : ""
    }
    ${renderStoreMatch(item, data)}
    ${renderGroupGift(item, data)}
    <form class="row js-item" data-item="${escapeAttr(item.id)}">
      <label class="sr" for="note-${escapeAttr(item.id)}">Note for guests</label>
      <input class="item-note-input" id="note-${escapeAttr(item.id)}" type="text" name="note" maxlength="500" value="${escapeAttr(item.note ?? "")}" placeholder="Note for guests (optional), e.g. grey or purple" style="flex:1 1 100%">
      <label class="sr" for="dq-${escapeAttr(item.id)}">How many you'd like</label>
      ${
        item.isFund
          ? `<input type="hidden" name="desiredQty" value="1">`
          : `<input class="qty" id="dq-${escapeAttr(item.id)}" type="number" name="desiredQty" value="${item.desiredQty}" min="${Math.max(1, item.purchasedQty)}" max="99" inputmode="numeric">`
      }
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
 * In-store scanning (Pro). The registrant is in the shop with their own phone:
 * they scan the barcode on a tag or box and the product goes on their list.
 *
 * Uses the phone's built-in barcode reader where there is one (Chrome on
 * Android). iPhone Safari has none, so the ZXing reader is fetched from the
 * app, only once someone taps Scan. Typing the number always works, camera or
 * not. The server looks the code up in the store's own catalog (barcode or
 * SKU), so the store needs barcodes filled in on its products.
 */
function renderScanner(data: ManagePageData): string {
  return `<div class="scan js-scan" data-zxing="${escapeAttr(data.scannerScriptUrl ?? "")}">
  <button class="btn sm block js-scan-open" type="button" style="margin-top:10px">Scan a barcode in the store</button>
  <p class="hint">In the shop? Scan the barcode on a product's tag or box with your phone to add it.</p>
  <div class="js-scan-panel" hidden>
    <video class="js-scan-video" playsinline muted hidden style="width:100%;max-height:260px;border-radius:10px;background:#000;object-fit:cover"></video>
    <p class="item-meta js-scan-msg" role="status"></p>
    <form class="row js-scan-form" novalidate>
      <label class="sr" for="scan-code">Barcode number</label>
      <input id="scan-code" name="code" type="text" inputmode="numeric" autocomplete="off" maxlength="64" placeholder="Or type the barcode number" style="flex:1;min-height:44px">
      <button class="btn sm ghost" type="submit">Look up</button>
    </form>
    <div class="js-scan-result"></div>
    <button class="linkish js-scan-close" type="button">Done scanning</button>
  </div>
</div>
<script>${scannerScript()}</script>`;
}

function scannerScript(): string {
  return `
(function(){
  var cfg=JSON.parse(document.getElementById('registro-config')?document.getElementById('registro-config').textContent:'{}');
  var root=document.querySelector('.js-scan');if(!root)return;
  var panel=root.querySelector('.js-scan-panel'),video=root.querySelector('.js-scan-video'),msg=root.querySelector('.js-scan-msg'),out=root.querySelector('.js-scan-result'),form=root.querySelector('.js-scan-form');
  var stream=null,reader=null,paused=false,running=false;
  function say(t,bad){msg.textContent=t;msg.style.color=bad?'#8c1d13':'';}
  function call(path,body){
    // The config script sits below this one on the page, so read it on use.
    if(!cfg.actionUrl)cfg=JSON.parse(document.getElementById('registro-config').textContent);
    return fetch(cfg.actionUrl+path+'?t='+encodeURIComponent(cfg.token),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json()});
  }
  function esc(t){var d=document.createElement('div');d.textContent=t==null?'':String(t);return d.innerHTML;}
  function stop(){
    running=false;
    if(reader){try{reader.reset();}catch(_){}reader=null;}
    if(stream){stream.getTracks().forEach(function(t){t.stop()});stream=null;}
    video.hidden=true;
  }
  function found(code){
    if(paused)return;paused=true;
    try{if(navigator.vibrate)navigator.vibrate(60);}catch(_){}
    lookup(code);
  }
  function loadZxing(){
    return new Promise(function(ok,fail){
      if(window.ZXing)return ok();
      var src=root.getAttribute('data-zxing');if(!src)return fail();
      var s=document.createElement('script');s.src=src;s.onload=function(){ok()};s.onerror=fail;document.head.appendChild(s);
    });
  }
  function start(){
    if(running)return;paused=false;
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){say('This browser can\\'t use the camera. Type the number under the barcode instead.');return;}
    say('Starting the camera...');running=true;
    var constraints={video:{facingMode:{ideal:'environment'}},audio:false};
    if('BarcodeDetector' in window){
      var want=['ean_13','ean_8','upc_a','upc_e','code_128','code_39','itf'];
      Promise.resolve(window.BarcodeDetector.getSupportedFormats?window.BarcodeDetector.getSupportedFormats():want).then(function(have){
        var formats=want.filter(function(f){return have.indexOf(f)>=0});
        var detector=new window.BarcodeDetector(formats.length?{formats:formats}:undefined);
        return navigator.mediaDevices.getUserMedia(constraints).then(function(s){
          stream=s;video.srcObject=s;video.hidden=false;return video.play();
        }).then(function(){
          say('Point the camera at a barcode.');
          (function tick(){
            if(!running)return;
            if(paused||video.readyState<2)return setTimeout(tick,300);
            detector.detect(video).then(function(codes){if(codes&&codes[0]&&codes[0].rawValue)found(codes[0].rawValue);}).catch(function(){}).then(function(){setTimeout(tick,250)});
          })();
        });
      }).catch(fail);
      return;
    }
    loadZxing().then(function(){
      reader=new window.ZXing.BrowserMultiFormatReader();
      video.hidden=false;say('Point the camera at a barcode.');
      return reader.decodeFromConstraints(constraints,video,function(result){if(result&&!paused)found(result.getText());});
    }).catch(fail);
  }
  function fail(err){
    stop();
    var denied=err&&(err.name==='NotAllowedError'||err.name==='SecurityError');
    say(denied?'Camera access is off for this page. Allow the camera in your browser settings, or type the number under the barcode.':'The camera didn\\'t start. Type the number under the barcode instead.',true);
  }
  function resume(){out.innerHTML='';paused=false;if(running)say('Point the camera at a barcode.');else start();}
  function lookup(code){
    code=String(code||'').trim();if(!code){paused=false;return;}
    say('Looking up '+code+'...');out.innerHTML='';
    call('/scan-lookup',{code:code}).then(function(res){
      if(!res||!res.ok)throw new Error(res&&res.error||'Couldn\\'t look that up');
      if(!res.matches.length){
        say('No product in this store has the barcode '+code+'. Ask someone in the shop, or try another.',true);
        out.innerHTML='<button class="btn sm ghost js-scan-next" type="button">Scan again</button>';return;
      }
      say(res.matches.length>1?'Pick the one you want.':'Found it.');
      out.innerHTML=res.matches.map(function(m){
        return '<div class="md-card" style="margin-top:10px">'+(m.imageUrl?'<img class="item-img" src="'+esc(m.imageUrl)+'" alt="" width="72" height="72">':'')+
          '<div class="md-info"><p class="item-title">'+esc(m.title)+'</p><p class="item-meta">'+esc(m.price||'')+(m.availableForSale?'':' &middot; sold out right now')+'</p>'+
          '<div class="row"><button class="btn sm js-scan-add" type="button" data-variant="'+esc(m.variantId)+'">'+(m.onRegistry?'On your list: add one more':'Add to registry')+'</button><span class="js-status item-meta" role="status"></span></div></div></div>';
      }).join('')+'<button class="btn sm ghost js-scan-next" type="button" style="margin-top:10px">Scan another</button>';
      out.querySelectorAll('.js-scan-add').forEach(function(b){if(/add one more/.test(b.textContent))b.dataset.more='1';});
    }).catch(function(e){say(e.message,true);out.innerHTML='<button class="btn sm ghost js-scan-next" type="button">Try again</button>';});
  }
  root.addEventListener('click',function(e){
    if(e.target.closest('.js-scan-open')){panel.hidden=false;e.target.closest('.js-scan-open').hidden=true;start();return;}
    if(e.target.closest('.js-scan-close')){stop();panel.hidden=true;out.innerHTML='';say('');root.querySelector('.js-scan-open').hidden=false;return;}
    if(e.target.closest('.js-scan-next')){resume();return;}
    var add=e.target.closest('.js-scan-add');
    if(add){
      var st=add.parentNode.querySelector('.js-status');add.disabled=true;st.textContent='Adding...';st.style.color='';
      call('/scan-add',{variantId:add.dataset.variant,addOne:add.dataset.more==='1'}).then(function(res){
        if(!res||!res.ok)throw new Error(res&&res.error||'Couldn\\'t add that');
        if(res.duplicate){add.disabled=false;add.dataset.more='1';add.textContent='Add one more';st.textContent='Already on your list ('+res.currentQty+' wanted).';return;}
        add.textContent=res.desiredQty?'Now '+res.desiredQty+' on your list':'Added';st.textContent='';
      }).catch(function(err){add.disabled=false;st.textContent=err.message;st.style.color='#8c1d13';});
    }
  });
  form.addEventListener('submit',function(e){e.preventDefault();var v=form.querySelector('[name=code]');paused=true;lookup(v.value);v.value='';});
  window.addEventListener('pagehide',stop);
})();`.replace(/^\s*\/\/.*\n/gm, "").trim();
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
        : `<button class="btn sm ghost js-match-preview" type="button" data-item="${id}" data-action="preview" data-orig="${escapeAttr(item.title)}" data-kept="0">See matching products in ${shop}</button>`
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

// ---------------------------------------------------------------------------
// Group gifts and cash funds (Pro) — see SPIKE-C.md
// ---------------------------------------------------------------------------

function fundLine(item: DisplayItem, data: ManagePageData): string {
  if (!item.fund) return "";
  const currency = item.currency ?? data.currency;
  return `${formatMoney(item.fund.funded, currency) || "Nothing"} of ${formatMoney(item.fund.goal, currency)} raised`;
}

/** "Add a cash fund" plus where chip-in gift cards go. */
function renderFundSetup(data: ManagePageData): string {
  if (!data.contributions) return "";
  const checked = data.contributions.toRegistrant ? " checked" : "";
  return `<div class="note">
  <p style="margin:0 0 10px"><strong>A cash fund</strong></p>
  <p class="hint" style="margin-top:0">For a honeymoon, a house or anything bigger. Guests chip in any of a few set amounts, paid as ${escapeHtml(data.shopName)} gift cards.</p>
  <form class="js-fund">
    <label class="sr" for="fund-title">Fund name</label>
    <input id="fund-title" type="text" name="title" maxlength="300" placeholder="e.g. Honeymoon in Portugal" required>
    <label class="sr" for="fund-goal">Goal</label>
    <input id="fund-goal" type="number" name="goal" min="1" step="1" inputmode="numeric" placeholder="Goal, e.g. 1500" required style="margin-top:10px">
    <label class="sr" for="fund-note">Note for guests (optional)</label>
    <input id="fund-note" type="text" name="note" maxlength="500" placeholder="Optional note for guests" style="margin-top:10px">
    <div class="row" style="margin-top:10px">
      <button class="btn sm" type="submit">Add fund</button>
      <span class="js-status item-meta" role="status"></span>
    </div>
  </form>
  <form class="js-contrib-to" style="margin-top:14px">
    <label style="display:flex;gap:8px;align-items:flex-start;font-weight:400">
      <input type="checkbox" name="toRegistrant"${checked} style="width:auto;margin-top:4px">
      <span>Email chip-in gift cards straight to me. <span class="hint" style="display:inline">Guests will see my email address in their cart and at checkout. Guests who pay with Shop Pay still get the card themselves. Leave this off and each card goes to the guest to pass on.</span></span>
    </label>
    <span class="js-status item-meta" role="status"></span>
  </form>
</div>`;
}

/** Per-item group gifting: only the store's own products and funds. */
function renderGroupGift(item: DisplayItem, data: ManagePageData): string {
  if (!data.contributions) return "";
  if (item.isExternal && !item.isFund) return "";
  const id = escapeAttr(item.id);
  const goal = item.fund ? String(item.fund.goal) : item.price ? String(Math.ceil(item.price * item.desiredQty)) : "";
  return `<form class="row js-group" data-item="${id}" style="margin-top:8px">
  <label class="sr" for="gg-${id}">${item.isFund ? "Goal" : "Group gift goal"}</label>
  <input class="qty" style="width:110px" id="gg-${id}" type="number" name="goal" min="1" step="1" inputmode="numeric" value="${escapeAttr(goal)}" placeholder="Goal">
  <button class="btn sm ghost" type="submit">${item.isFund ? "Update goal" : item.fund ? "Update group gift" : "Let guests chip in"}</button>
  ${!item.isFund && item.fund ? `<button class="btn sm ghost js-group-off" type="button" data-item="${id}">Stop chip-ins</button>` : ""}
  <span class="js-status item-meta" role="status"></span>
</form>`;
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
    <p class="item-meta">From ${who}${
      gift.isContribution
        ? ` &middot; chipped in${gift.amount ? ` ${formatMoney(gift.amount, data.currency)}` : ""}`
        : gift.qty > 1 ? ` &middot; ${gift.qty}` : ""
    }${gift.source === "external" ? " &middot; bought elsewhere" : ""}</p>
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
 * Couples who also keep a registry elsewhere usually gather them on one page
 * (The Knot's registry page or a wedding website), which can link a registry
 * from another store by its address. Names are plain text: no partnership.
 * A password registry still works there, but every guest arriving that way
 * will be asked for the password, so say so.
 */
function renderLinkElsewhere(eventType: string, privacy: string): string {
  const where =
    eventType === "wedding"
      ? "Using The Knot or a wedding website? Add this as a registry from another store and paste the link above."
      : "Using a wedding website or another registry site? Add this as a registry from another store and paste the link above.";
  const passwordNote =
    privacy === "password"
      ? ` <strong>Your registry has a password</strong>, so guests who arrive from there will need it too. You can change this under Who can see this.`
      : "";
  return `<p class="hint">${escapeHtml(where)}${passwordNote}</p>`;
}

/**
 * Ways to share the guest link when the device has no share sheet of its own,
 * or its share sheet fails. Hidden until the Share button needs it.
 */
function renderShareMenu(title: string, url: string): string {
  const text = `${title}: ${url}`;
  const links: [string, string][] = [
    ["Email", `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`],
    ["Text message", `sms:?&body=${encodeURIComponent(text)}`],
    ["WhatsApp", `https://wa.me/?text=${encodeURIComponent(text)}`],
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`],
  ];
  return `<style>.share-menu:not([hidden]){display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.share-link{flex:1 1 100%;min-height:40px;padding:0 10px;border:1px solid #ccc;border-radius:8px;font:inherit}</style>
  <div class="share-menu js-share-menu" hidden>
    <input class="share-link" type="text" readonly value="${escapeAttr(url)}" aria-label="Guest link" onfocus="this.select()">
    <button class="btn sm js-share-copy" type="button" data-url="${escapeAttr(url)}">Copy link</button>
    ${links.map(([label, href]) => `<a class="btn sm" href="${escapeAttr(href)}" target="_blank" rel="noopener">${label}</a>`).join("\n    ")}
  </div>`;
}

function manageScript(): string {
  return `
(function(){
  ${IDEA_MATCH_JS}
  var cfg=JSON.parse(document.getElementById('registro-config').textContent);

  // Hand this registry's token to the storefront.
  //
  // The theme's "Add to registry" button runs on the same origin (both this
  // page and the product page are served from the merchant's domain), so
  // localStorage is how the button knows which registry to add to without
  // forcing the registrant to create a store account. It is a per-browser
  // convenience only — the server re-verifies the token on every write.
  //
  // The key must match STORE_KEY in extensions/registry-button/assets/giftpin.js
  // (guarded by a test). It was renamed from 'registro.registries' on one side
  // only, which left the product-page button always sending registrants to
  // "start a registry"; entries under the old key are carried over.
  try{
    var KEY='${REGISTRIES_STORAGE_KEY}',OLD='${LEGACY_REGISTRIES_STORAGE_KEY}';
    var stored=JSON.parse(localStorage.getItem(KEY)||'[]');
    if(!Array.isArray(stored))stored=[];
    var legacy=JSON.parse(localStorage.getItem(OLD)||'[]');
    if(Array.isArray(legacy))stored=stored.concat(legacy.filter(function(l){return l&&l.id&&!stored.some(function(r){return r&&r.id===l.id})}));
    localStorage.removeItem(OLD);
    stored=stored.filter(function(r){return r&&r.id!==cfg.registryId});
    stored.unshift({id:cfg.registryId,title:cfg.registryTitle,token:cfg.token});
    localStorage.setItem(KEY,JSON.stringify(stored.slice(0,10)));
  }catch(_){}

  // Ship-to-registrant: show the address only when it's switched on, and the
  // state/province list that matches the chosen country (the others are
  // disabled so only one provinceCode is posted).
  var ship=document.querySelector('.js-ship');
  if(ship){
    var toggle=ship.querySelector('.js-ship-toggle'),fields=ship.querySelector('.js-ship-fields'),countrySel=ship.querySelector('.js-ship-country');
    toggle.addEventListener('change',function(){fields.hidden=!toggle.checked;});
    countrySel.addEventListener('change',function(){
      ship.querySelectorAll('.js-ship-region').forEach(function(r){
        var on=r.getAttribute('data-country')===countrySel.value;
        r.hidden=!on;r.querySelector('select').disabled=!on;
      });
    });
  }

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


  // The paste box: look the link up first, show what we found (and the
  // store's closest match) so the registrant can check it, then add.
  var pasteFound=null;
  function pasteStatus(el,msg,ok){var s=el.querySelector('.js-status');if(s){s.textContent=msg;s.style.color=ok===false?'#8c1d13':'';}}
  function matchCard(p){
    var card=document.createElement('div');card.className='md-card';
    if(p.imageUrl){var im=document.createElement('img');im.src=p.imageUrl;im.alt='';im.width=56;im.height=56;im.className='item-img';card.appendChild(im);}
    var info=document.createElement('div');info.className='md-info';
    var t=document.createElement('p');t.className='item-title';t.textContent=p.title;info.appendChild(t);
    if(p.price){var pr=document.createElement('p');pr.className='item-meta';pr.textContent=p.price;info.appendChild(pr);}
    var a=document.createElement('a');a.className='hint';a.target='_blank';a.rel='noopener';a.href='/products/'+encodeURIComponent(p.handle);a.textContent='View in store';info.appendChild(a);
    card.appendChild(info);return card;
  }
  function resetPaste(paste){
    pasteFound=null;
    paste.querySelector('.js-paste-found').hidden=true;
    paste.querySelector('.js-paste-lookup').hidden=false;
    paste.querySelector('[name=url]').readOnly=false;
    paste.querySelector('.js-paste-match').hidden=true;
    paste.querySelector('[name=showMatch]').checked=false;
    paste.querySelectorAll('.js-status').forEach(function(s){s.textContent='';});
  }
  function lookUpLink(paste){
    var input=paste.querySelector('[name=url]');
    var lookup=paste.querySelector('.js-paste-lookup');var btn=lookup.querySelector('button');
    if(!input.value.trim()){pasteStatus(lookup,'Paste a link first',false);input.focus();return;}
    btn.disabled=true;pasteStatus(lookup,'Looking up that link\u2026');
    post('/link-preview',{url:input.value}).then(function(res){
      btn.disabled=false;
      if(!res||!res.ok){pasteStatus(lookup,(res&&res.error)||'Could not look up that link',false);return;}
      pasteFound=res;pasteStatus(lookup,'');
      lookup.hidden=true;input.readOnly=true;
      var found=paste.querySelector('.js-paste-found');found.hidden=false;
      paste.querySelector('.js-paste-msg').textContent=res.found
        ?'Here\u2019s what we found on '+res.domain+'. Change anything that\u2019s not right.'
        :res.domain+' didn\u2019t let us read that page. Type the name and price and we\u2019ll add it with the link.'+(cfg.extension?' (The browser extension can read it, if you\u2019re on a computer.)':'');
      var img=paste.querySelector('.js-paste-img');
      if(res.imageUrl){img.src=res.imageUrl;img.hidden=false;}else{img.removeAttribute('src');img.hidden=true;}
      paste.querySelector('[name=title]').value=res.title||'';
      paste.querySelector('[name=price]').value=res.price||'';
      var m=paste.querySelector('.js-paste-match'),cards=paste.querySelector('.js-paste-match-cards');
      cards.textContent='';
      if(res.match&&res.match.products.length){
        res.match.products.slice(0,2).forEach(function(p){cards.appendChild(matchCard(p));});
        m.hidden=false;
      }else{m.hidden=true;}
      paste.querySelector(res.found?'[name=note]':'[name=title]').focus();
    }).catch(function(){btn.disabled=false;pasteStatus(lookup,'Could not look up that link',false);});
  }
  function addLink(paste){
    var found=paste.querySelector('.js-paste-found');var btn=found.querySelector('button[type=submit]');
    var title=paste.querySelector('[name=title]').value.trim();
    if(!title){pasteStatus(found,'Please give the item a name',false);paste.querySelector('[name=title]').focus();return;}
    var price=paste.querySelector('[name=price]').value.trim();
    if(!price){pasteStatus(found,'Please add the price, so guests know what it costs',false);paste.querySelector('[name=price]').focus();return;}
    btn.disabled=true;pasteStatus(found,'Adding\u2026');
    post('/add-link',{
      url:pasteFound.url,title:title,
      price:paste.querySelector('[name=price]').value,
      currency:pasteFound.currency,imageUrl:pasteFound.imageUrl,
      note:paste.querySelector('[name=note]').value,
      showMatch:paste.querySelector('[name=showMatch]').checked,
      matchTitle:pasteFound.match?pasteFound.match.title:null
    }).then(function(res){
      if(res&&res.ok){location.reload();return;}
      btn.disabled=false;pasteStatus(found,(res&&res.error)||'Could not add that link',false);
    }).catch(function(){btn.disabled=false;pasteStatus(found,'Could not add that link',false);});
  }
  document.addEventListener('click',function(e){
    var c=e.target.closest('.js-paste-cancel');
    if(c)resetPaste(c.closest('.js-paste'));
  });

  document.addEventListener('submit',function(e){
    var paste=e.target.closest('.js-paste');
    if(paste){
      e.preventDefault();
      var found=paste.querySelector('.js-paste-found');
      if(found.hidden)lookUpLink(paste);else addLink(paste);
      return;
    }
    var item=e.target.closest('.js-item');
    if(item){
      e.preventDefault();status(item,'Saving...');
      post('/update-item',{itemId:item.dataset.item,desiredQty:Number(item.querySelector('[name=desiredQty]').value),category:item.querySelector('[name=category]').value,note:item.querySelector('[name=note]').value})
        .then(function(res){status(item,res&&res.ok?'Saved':((res&&res.error)||'Could not save'),!(res&&res.ok));});
      return;
    }
    var fund=e.target.closest('.js-fund');
    if(fund){
      e.preventDefault();var fb=fund.querySelector('button');fb.disabled=true;status(fund,'Adding...');
      post('/add-fund',{title:fund.querySelector('[name=title]').value,goal:fund.querySelector('[name=goal]').value,note:fund.querySelector('[name=note]').value})
        .then(function(res){if(res&&res.ok){location.reload();}else{status(fund,(res&&res.error)||'Could not add the fund',false);fb.disabled=false;}})
        .catch(function(){status(fund,'Could not add the fund',false);fb.disabled=false;});
      return;
    }
    var group=e.target.closest('.js-group');
    if(group){
      e.preventDefault();status(group,'Saving...');
      post('/item-fund',{itemId:group.dataset.item,goal:group.querySelector('[name=goal]').value})
        .then(function(res){if(res&&res.ok){location.reload();}else{status(group,(res&&res.error)||'Could not save',false);}});
      return;
    }
    var del=e.target.closest('.js-confirm-delete');
    if(del&&!confirm('Delete this registry and everything on it? This cannot be undone.')){e.preventDefault();}
  });

  document.addEventListener('change',function(e){
    var to=e.target.closest('.js-contrib-to');
    if(!to)return;
    status(to,'Saving...');
    post('/contribution-settings',{toRegistrant:e.target.checked})
      .then(function(res){status(to,res&&res.ok?'Saved':'Could not save',!(res&&res.ok));});
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
      // Shopify's predictive search is loose on purpose (prefix and typo
      // matching), so a store with no stockpot still answers "Stockpot" with
      // anything starting "sto". Ask for its top 10 for the idea and for up to
      // two other names it's sold under (app/shared/idea-aliases.ts), then
      // keep only real matches (gpIdeaMatch, app/shared/idea-match.ts).
      var names=[term].concat((chip.dataset.aliases||'').split('|').filter(Boolean));
      Promise.all(names.slice(0,3).map(function(q){
        return fetch('/search/suggest.json?q='+encodeURIComponent(q)+'&resources[type]=product&resources[limit]=10&resources[options][unavailable_products]=last',{headers:{Accept:'application/json'}})
          .then(function(r){return r.ok?r.json():null})
          .then(function(data){var l=data&&data.resources&&data.resources.results&&data.resources.results.products;return Array.isArray(l)?l:null;},function(){return null;});
      }))
        .then(function(lists){
          var list=null,seen={};
          lists.forEach(function(l){
            if(!l)return;list=list||[];
            l.forEach(function(prod){var k=prod&&(prod.id||prod.url);if(k&&!seen[k]){seen[k]=1;list.push(prod);}});
          });
          // Couldn't tell (search off, theme quirk): go to the store's own search.
          if(!list){location.href=href;return;}
          var hits=gpIdeaMatch(names,list).slice(0,6);
          panel.textContent='';
          if(hits.length){
            var fp=document.createElement('p');fp.className='item-meta';
            fp.textContent=(hits.length===1?'Found at ':'Found '+hits.length+' at ')+cfg.shopName+':';
            panel.appendChild(fp);
            var fr=document.createElement('div');fr.className='cat-grid';
            hits.forEach(function(prod){
              var a=document.createElement('a');a.className='cat-chip';a.href=prod.url||href;a.textContent=prod.title;fr.appendChild(a);
            });
            panel.appendChild(fr);
            var fh=document.createElement('p');fh.className='hint';
            fh.textContent='Open one and use its \u201cAdd to registry\u201d button.';
            panel.appendChild(fh);
            reveal();
            return;
          }
          var p=document.createElement('p');p.className='item-meta';
          p.textContent='No match for \u201c'+term+'\u201d at '+cfg.shopName+'. Look for it at:';
          panel.appendChild(p);
          var row=document.createElement('div');row.className='cat-grid';
          (cfg.retailers||[]).forEach(function(r){
            var a=document.createElement('a');a.className='cat-chip';a.target='_blank';a.rel='noopener noreferrer';
            var dest=r.url.replace('{q}',encodeURIComponent(term));
            a.href=cfg.affiliateBase?cfg.affiliateBase+encodeURIComponent(dest):dest;a.textContent=r.name;row.appendChild(a);
          });
          panel.appendChild(row);
          if(cfg.affiliateBase){
            var d=document.createElement('p');d.className='hint';
            d.textContent='Buying through these links may earn Giftpin a small commission. It never changes the price.';
            panel.appendChild(d);
          }
          var h=document.createElement('p');h.className='hint';
          h.textContent='Found one? Paste its link under \u201cFrom anywhere else\u201d below'+(cfg.extension?', or use the Giftpin browser extension.':'.');
          panel.appendChild(h);
          reveal();
        })
        .catch(function(){location.href=href;});
      return;
    }
    var off=e.target.closest('.js-group-off');
    if(off){
      var gf=off.closest('.js-group');status(gf,'Saving...');
      post('/item-fund',{itemId:off.dataset.item,goal:null})
        .then(function(res){if(res&&res.ok){location.reload();}else{status(gf,(res&&res.error)||'Could not save',false);}});
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
    // On a phone, the phone's own share sheet. On a computer, our own list:
    // desktop share sheets are unreliable (Chrome on Windows refuses a second
    // share while an earlier one is stuck, and its "Copy link" can leave the
    // clipboard empty). A phone sheet that fails for any reason other than
    // the person closing it falls back to our list too.
    var share=e.target.closest('.js-share');
    if(share){
      var menu=document.querySelector('.js-share-menu');
      var showMenu=function(){if(menu)menu.hidden=false;};
      var phone=window.matchMedia&&matchMedia('(hover:none) and (pointer:coarse)').matches;
      if(navigator.share&&phone){
        try{navigator.share({title:share.dataset.title,url:share.dataset.url}).catch(function(err){if(!err||err.name!=='AbortError')showMenu();});}
        catch(_){showMenu();}
      }else{showMenu();}
      return;
    }
    var shareCopy=e.target.closest('.js-share-copy');
    if(shareCopy){
      copyLink(shareCopy.dataset.url,function(){shareCopy.textContent='Link copied';});
    }
  });
  function copyLink(link,done){
    // execCommand first: it runs synchronously inside the click, so a
    // storefront's clipboard permissions policy can't block it. The async
    // clipboard API is the fallback, then a prompt the person copies from.
    var ok=false;
    try{var t=document.createElement('textarea');t.value=link;t.setAttribute('readonly','');t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();ok=document.execCommand('copy');document.body.removeChild(t);}catch(_){ok=false;}
    if(ok){done();return;}
    if(navigator.clipboard){navigator.clipboard.writeText(link).then(done,function(){prompt('Copy this link:',link);});}
    else{prompt('Copy this link:',link);}
  }
})();`.trim();
}
