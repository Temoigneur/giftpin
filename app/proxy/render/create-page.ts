import type { PageBranding } from "../../shared/branding";
import { layout, escapeHtml, escapeAttr } from "./layout";
import { EVENT_TYPES, OPT_IN_EVENT_TYPES, isDatelessOccasion, eventTypeLabel } from "../../shared/settings";
import { ACCOUNT_STORAGE_KEY, REGISTRIES_STORAGE_KEY } from "../../shared/storage-keys";
import { occasionTemplate } from "../../shared/registry-ideas";
import { COUNTRIES, DEFAULT_COUNTRY } from "../../shared/retailers";

/**
 * Registry creation.
 *
 * One screen, six fields, no account. Time-to-value under five minutes is the
 * documented difference between 8-18% and 2-5% install-to-paid conversion, and
 * for the registrant it's the difference between finishing and closing the tab.
 * A plain form post, so it works with JavaScript off.
 */

export interface CreatePageData {
  shopName: string;
  accentColor: string;
  branding?: PageBranding | null;
  actionUrl: string;
  enabledEventTypes: string[];
  /** Registry perks (Pro), already cleaned. See app/shared/perks.ts. */
  perks?: string[];
  error?: string | null;
  values?: Record<string, string>;
}

/** "Perks of registering with us". Shared with the manage page. */
export function renderPerks(shopName: string, perks: string[] | undefined): string {
  if (!perks || perks.length === 0) return "";
  return `<div class="note perks">
  <p style="margin:0 0 6px"><strong>Perks when you register with ${escapeHtml(shopName)}</strong></p>
  <ul style="margin:0;padding-left:20px">${perks.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
</div>`;
}

export function renderCreatePage(data: CreatePageData): string {
  const enabled = EVENT_TYPES.filter((t) => data.enabledEventTypes.includes(t.value));
  const types = enabled.length ? enabled : EVENT_TYPES.filter((t) => !OPT_IN_EVENT_TYPES.includes(t.value));
  const v = data.values ?? {};
  // Each occasion is its own template: the name and note placeholders follow
  // the dropdown (small inline script below; without JS they match the
  // initially selected occasion).
  const initialType = types.some((t) => t.value === v.eventType) ? v.eventType : types[0].value;
  const initial = occasionTemplate(initialType);

  const body = `
<h1>Start a registry</h1>
<p class="sub">Tell your guests what you'd love. They buy it, you get one list.</p>

${renderPerks(data.shopName, data.perks)}

${data.error ? `<div class="err">${escapeHtml(data.error)}</div>` : ""}

<form method="post" action="${escapeAttr(data.actionUrl)}/create" class="note">
<div class="fields">
  <div>
  <label for="c-event">What's the occasion?</label>
  <select id="c-event" name="eventType" required>
    ${types
      .map((t) => {
        const tpl = occasionTemplate(t.value);
        return `<option value="${escapeAttr(t.value)}" data-title="${escapeAttr(tpl.title)}" data-note="${escapeAttr(tpl.note)}"${isDatelessOccasion(t.value) ? " data-nodate" : ""}${v.eventType === t.value ? " selected" : ""}>${escapeHtml(t.label)}</option>`;
      })
      .join("")}
  </select>
  </div>

  <div>
  <label for="c-title">Registry name</label>
  <input id="c-title" type="text" name="title" maxlength="200" required
         placeholder="${escapeAttr(initial.title)}" value="${escapeAttr(v.title)}">
  </div>

  <div id="c-date-field"${isDatelessOccasion(initialType) ? " hidden" : ""}>
  <label for="c-date">When is it?</label>
  <input id="c-date" type="date" name="eventDate" value="${escapeAttr(v.eventDate)}">
  <p class="hint">Optional. We'll remind you to share your link as it gets closer.</p>
  </div>

  <div>
  <label for="c-name">Your name</label>
  <input id="c-name" type="text" name="registrantName" maxlength="120" required value="${escapeAttr(v.registrantName)}">
  </div>

  <div>
  <label for="c-email">Your email</label>
  <input id="c-email" type="email" name="registrantEmail" required value="${escapeAttr(v.registrantEmail)}">
  <p class="hint">We email you a private link to manage your registry, and tell you when someone buys something. Your email is never shown to guests.</p>
  </div>

  <div>
  <label for="c-country">Where will your guests shop?</label>
  <select id="c-country" name="country">
    ${COUNTRIES.map((c) => `<option value="${escapeAttr(c.code)}"${(v.country || DEFAULT_COUNTRY) === c.code ? " selected" : ""}>${escapeHtml(c.label)}</option>`).join("")}
  </select>
  <p class="hint">When this store doesn't carry something, we'll suggest that country's other big stores.</p>
  </div>

  <div class="full">
  <label for="c-msg">A note for your guests</label>
  <textarea id="c-msg" name="message" maxlength="2000" placeholder="Optional. For example: ${escapeAttr(initial.note)}">${escapeHtml(v.message)}</textarea>
  </div>
</div>

  <div class="row" style="margin-top:20px">
    <button class="btn block" type="submit">Create my registry</button>
  </div>
</form>
<script>(function(){var s=document.getElementById('c-event'),t=document.getElementById('c-title'),m=document.getElementById('c-msg');if(!s)return;s.addEventListener('change',function(){var o=s.options[s.selectedIndex];t.placeholder=o.dataset.title;m.placeholder='Optional. For example: '+o.dataset.note;var d=document.getElementById('c-date-field');d.hidden='nodate' in o.dataset;if(d.hidden)document.getElementById('c-date').value='';});})();</script>

<div class="note">
  <p style="margin:0"><strong>Already have one?</strong> We'll email you a link to all your registries here.</p>
  <form method="post" action="${escapeAttr(data.actionUrl)}/resend" style="margin-top:10px">
    <label class="sr" for="c-resend">Your email</label>
    <input id="c-resend" type="email" name="email" placeholder="Your email" required>
    <div class="row" style="margin-top:10px">
      <button class="btn sm ghost" type="submit">Email me my registries</button>
    </div>
  </form>
</div>
`;

  return layout(
    {
      title: `Start a registry — ${data.shopName}`,
      accentColor: data.accentColor,
      indexable: false,
      shopName: data.shopName,
      branding: data.branding,
    },
    body,
  );
}

/** Shown after create/resend so we never render an email address back. */
export function renderSimplePage(
  data: { shopName: string; accentColor: string; branding?: PageBranding | null },
  heading: string,
  message: string,
  cta?: { label: string; href: string },
): string {
  return layout(
    { title: heading, accentColor: data.accentColor, indexable: false, shopName: data.shopName, branding: data.branding },
    `<h1>${escapeHtml(heading)}</h1>
     <p>${escapeHtml(message)}</p>
     ${cta ? `<p style="margin-top:24px"><a class="btn" href="${escapeAttr(cta.href)}">${escapeHtml(cta.label)}</a></p>` : ""}`,
  );
}

export function renderPasswordPage(data: {
  shopName: string;
  accentColor: string;
  branding?: PageBranding | null;
  actionUrl: string;
  slug: string;
  error?: string | null;
}): string {
  return layout(
    { title: "This registry is private", accentColor: data.accentColor, indexable: false, shopName: data.shopName, branding: data.branding },
    `<h1>This registry is private</h1>
     <p class="sub">Enter the password the couple shared with you.</p>
     ${data.error ? `<div class="err">${escapeHtml(data.error)}</div>` : ""}
     <form method="post" action="${escapeAttr(data.actionUrl)}/r/${escapeAttr(data.slug)}" class="note">
       <label for="pw">Password</label>
       <input id="pw" type="password" name="password" required autocomplete="off">
       <div class="row" style="margin-top:16px"><button class="btn" type="submit">Open registry</button></div>
     </form>`,
  );
}

export function renderFindPage(data: {
  shopName: string;
  accentColor: string;
  branding?: PageBranding | null;
  actionUrl: string;
  query: string;
  results: { title: string; eventLabel: string; eventDate: Date | null; url: string; names: string; coverImageUrl?: string | null }[];
  searched: boolean;
}): string {
  // Two couples can share names (and titles like "Sam & Alex's Wedding"). A
  // guest who picks the wrong one buys a gift for strangers, so make the
  // date and names impossible to miss and say so when results look alike.
  const lookalikes = hasLookalikes(data.results);
  const body = `
<h1>Find a registry</h1>
<p class="sub">Search by the name of the person or couple you're shopping for.</p>

<form method="get" action="${escapeAttr(data.actionUrl)}/find" class="note">
  <label class="sr" for="q">Name</label>
  <input id="q" type="text" name="q" value="${escapeAttr(data.query)}" placeholder="e.g. Sam and Alex" required>
  <div class="row" style="margin-top:12px"><button class="btn sm" type="submit">Search</button></div>
</form>

${
  !data.searched
    ? ""
    : data.results.length === 0
      ? `<div class="empty"><p>No registries match that name.</p><p class="hint">Only registries whose owners chose to be listed appear here. If you have a direct link, use that instead.</p></div>`
      : `${
          lookalikes
            ? `<div class="note" role="status"><strong>More than one registry matches.</strong> Check the names and date before you choose, so your gift goes to the right people.</div>`
            : ""
        }<ul class="items">${data.results
          .map(
            (r) => `<li class="item"${r.coverImageUrl ? "" : ` style="grid-template-columns:1fr"`}>
  ${r.coverImageUrl ? `<img class="item-img" src="${escapeAttr(r.coverImageUrl)}" alt="" loading="lazy" style="object-fit:cover">` : ""}
  <div>
    <p class="item-title"><a href="${escapeAttr(r.url)}">${escapeHtml(r.title)}</a></p>
    ${r.names ? `<p class="item-meta">${escapeHtml(r.names)}</p>` : ""}
    <p class="item-meta">${escapeHtml(r.eventLabel)} &middot; ${
      r.eventDate
        ? `<strong>${new Intl.DateTimeFormat("en-CA", { dateStyle: "long", timeZone: "UTC" }).format(r.eventDate)}</strong>`
        : "No date set"
    }</p>
  </div>
</li>`,
          )
          .join("\n")}</ul>`
}
`;

  // The find page is the indexable SEO asset — individual registries are not.
  // That distinction is the whole privacy design: a guest who googles a
  // couple's name lands here, not on a page listing someone's email address.
  return layout(
    {
      title: `Find a registry — ${data.shopName}`,
      description: `Search gift registries at ${data.shopName}.`,
      accentColor: data.accentColor,
      indexable: true,
      shopName: data.shopName,
      branding: data.branding,
    },
    body,
  );
}

/** True when two results share a title or the same registrant names. */
export function hasLookalikes(results: { title: string; names: string }[]): boolean {
  const norm = (v: string) => v.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const seen = new Set<string>();
  for (const r of results) {
    // Names in either order ("Sam & Alex" / "Alex & Sam") are the same couple.
    const names = norm(r.names).split(" ").filter((w) => w && w !== "and").sort().join(" ");
    for (const key of [`t:${norm(r.title)}`, names ? `n:${names}` : ""]) {
      if (!key) continue;
      if (seen.has(key)) return true;
      seen.add(key);
    }
  }
  return false;
}

/** Shown when a signed-in shopper has more than one registry: pick which to manage. */
export function renderRegistryChooser(
  data: { shopName: string; accentColor: string; branding?: PageBranding | null },
  registries: { title: string; href: string }[],
): string {
  return layout(
    { title: "Your registries", accentColor: data.accentColor, indexable: false, shopName: data.shopName, branding: data.branding },
    `<h1>Your registries</h1>
     <p class="sub">Choose one to manage.</p>
     <ul class="items">${registries
       .map(
         (r) =>
           `<li class="item" style="grid-template-columns:1fr"><div><p class="item-title">${escapeHtml(r.title)}</p><p><a class="btn sm" href="${escapeAttr(r.href)}">Manage</a></p></div></li>`,
       )
       .join("")}</ul>`,
  );
}

// ---------------------------------------------------------------------------
// My registries
// ---------------------------------------------------------------------------

type PageBrand = { shopName: string; accentColor: string; branding?: PageBranding | null };

export interface AccountPageData extends PageBrand {
  /** Proxy root, e.g. /apps/registry. */
  actionUrl: string;
  registries: { id: string; title: string; eventType: string; eventDate: Date | null; partner: boolean; href: string; token: string }[];
  /** "Start another registry", prefilled with this person's name and email. */
  createHref: string;
  /** Fresh account token, saved in this browser. Null for a store-account sign-in with no email link. */
  accountToken: string | null;
  /**
   * Signed in to the store account but no emailed link: registries started
   * without signing in aren't listed, so offer the email link too (from a
   * manage page, in one click). Only used while accountToken is null.
   */
  manageToken?: string | null;
}

function formatEventDate(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** Every registry one person holds at this store, from their emailed My registries link. */
export function renderAccountPage(data: AccountPageData): string {
  const list = data.registries.length
    ? `<ul class="items">${data.registries
        .map((r) => {
          const meta = [eventTypeLabel(r.eventType), formatEventDate(r.eventDate), r.partner ? "You're a partner" : ""]
            .filter(Boolean)
            .join(" · ");
          return `<li class="item" style="grid-template-columns:1fr"><div><p class="item-title">${escapeHtml(r.title)}</p><p class="item-meta">${escapeHtml(meta)}</p><p><a class="btn sm" href="${escapeAttr(r.href)}">Open</a></p></div></li>`;
        })
        .join("")}</ul>`
    : data.accountToken
      ? `<p>There are no registries with this email yet.</p>`
      : `<p>No registries are linked to your store account yet.</p>`;
  const root = data.actionUrl.replace(/\/+$/, "");
  // Store-account sign-in only: the list holds just the registries started
  // while signed in, so offer the email link for the rest.
  const storeAccountOnly = data.accountToken
    ? ""
    : `${followSavedLink(root)}
     <h2>Don't see one?</h2>
     <p>Registries you started without signing in are kept under your email instead.</p>
     ${emailLinkForm(root, data.manageToken ?? null)}`;

  // Remember the account link on this browser (the manage page's "My
  // registries" link uses it), and hand every registry to the storefront's
  // "Add to registry" button, the same list the manage page writes.
  const remember = data.accountToken
    ? `<script>(function(){try{localStorage.setItem(${JSON.stringify(ACCOUNT_STORAGE_KEY)},${JSON.stringify(data.accountToken)});var K=${JSON.stringify(REGISTRIES_STORAGE_KEY)},s=JSON.parse(localStorage.getItem(K)||'[]');if(!Array.isArray(s))s=[];var mine=${JSON.stringify(
        data.registries.slice(0, 10).map((r) => ({ id: r.id, title: r.title, token: r.token })),
      ).replace(/</g, "\\u003c")};mine.slice().reverse().forEach(function(m){s=s.filter(function(r){return r&&r.id!==m.id});s.unshift(m);});localStorage.setItem(K,JSON.stringify(s.slice(0,10)));}catch(_){}})();</script>`
    : "";

  return layout(
    { title: "My registries", accentColor: data.accentColor, indexable: false, shopName: data.shopName, branding: data.branding },
    `<h1>My registries</h1>
     <p class="sub">${data.accountToken ? `Everything you've started at ${escapeHtml(data.shopName)} with this email.` : `Registries linked to your ${escapeHtml(data.shopName)} account.`} Pick one to open it.</p>
     ${list}
     <p style="margin-top:24px"><a class="btn" href="${escapeAttr(data.createHref)}">Start another registry</a></p>
     <p class="hint">A new registry made with the same email shows up here on its own. Keep this page's link to yourself: anyone who has it can edit these registries.</p>
     ${remember}
     ${storeAccountOnly}`,
  );
}

/**
 * /account without a working link. If this browser saved a My registries link
 * before, go straight there. Otherwise offer to email one: in one click from a
 * manage page (the link goes to that registry's own email), or by typing the
 * email. Never lists anything here, so a forwarded manage link can't open the
 * owner's other registries.
 */
export function renderAccountSignInPage(data: PageBrand & { actionUrl: string; manageToken: string | null; expired: boolean }): string {
  return layout(
    { title: "My registries", accentColor: data.accentColor, indexable: false, shopName: data.shopName, branding: data.branding },
    `${data.expired ? forgetSavedLink() : followSavedLink(data.actionUrl)}
     <h1>My registries</h1>
     <p class="sub">${data.expired ? "That link has expired. " : ""}See every registry you've started here with one email. For your privacy, we send the link to your inbox.</p>
     ${emailLinkForm(data.actionUrl, data.manageToken)}`,
  );
}

/**
 * One click from a manage page (goes to that registry's own email), or type
 * the email.
 */
function emailLinkForm(actionUrl: string, manageToken: string | null): string {
  return manageToken
    ? `<form method="post" action="${escapeAttr(actionUrl)}/account-link?t=${encodeURIComponent(manageToken)}" class="note">
         <p style="margin:0 0 10px">We'll email a link to all your registries to the address on this one.</p>
         <button class="btn" type="submit">Email me the link</button>
       </form>`
    : `<form method="post" action="${escapeAttr(actionUrl)}/resend" class="note">
         <label for="a-email">Your email</label>
         <input id="a-email" type="email" name="email" required>
         <div class="row" style="margin-top:16px"><button class="btn" type="submit">Email me my registries</button></div>
       </form>`;
}

/** This browser opened an emailed My registries link before: go straight there. */
function followSavedLink(actionUrl: string): string {
  return `<script>(function(){try{var a=localStorage.getItem(${JSON.stringify(ACCOUNT_STORAGE_KEY)});if(a)location.replace(${JSON.stringify(`${actionUrl}/account?a=`)}+encodeURIComponent(a));}catch(_){}})();</script>`;
}

function forgetSavedLink(): string {
  return `<script>try{localStorage.removeItem(${JSON.stringify(ACCOUNT_STORAGE_KEY)})}catch(_){}</script>`;
}
