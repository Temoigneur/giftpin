import type { PageBranding } from "../../shared/branding";
import { layout, escapeHtml, escapeAttr, tx, jsStr } from "./layout";
import { countryName, formatLongDate, t, th } from "../../shared/i18n";
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
  <p style="margin:0 0 6px"><strong>${tx(t("create.perks", { shop: shopName }))}</strong></p>
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
<h1>${tx(t("create.title"))}</h1>
<p class="sub">${tx(t("create.sub"))}</p>

${renderPerks(data.shopName, data.perks)}

${data.error ? `<div class="err">${escapeHtml(data.error)}</div>` : ""}

<form method="post" action="${escapeAttr(data.actionUrl)}/create" class="note">
<div class="fields">
  <div>
  <label for="c-event">${tx(t("create.occasion"))}</label>
  <select id="c-event" name="eventType" required>
    ${types
      .map((t) => {
        const tpl = occasionTemplate(t.value);
        return `<option value="${escapeAttr(t.value)}" data-title="${escapeAttr(tpl.title)}" data-note="${escapeAttr(tpl.note)}"${isDatelessOccasion(t.value) ? " data-nodate" : ""}${v.eventType === t.value ? " selected" : ""}>${escapeHtml(eventTypeLabel(t.value))}</option>`;
      })
      .join("")}
  </select>
  </div>

  <div>
  <label for="c-title">${tx(t("create.name"))}</label>
  <input id="c-title" type="text" name="title" maxlength="200" required
         placeholder="${escapeAttr(initial.title)}" value="${escapeAttr(v.title)}">
  </div>

  <div id="c-date-field"${isDatelessOccasion(initialType) ? " hidden" : ""}>
  <label for="c-date">${tx(t("create.when"))}</label>
  <input id="c-date" type="date" name="eventDate" value="${escapeAttr(v.eventDate)}">
  <p class="hint">${tx(t("create.whenHint"))}</p>
  </div>

  <div>
  <label for="c-name">${tx(t("create.yourName"))}</label>
  <input id="c-name" type="text" name="registrantName" maxlength="120" required value="${escapeAttr(v.registrantName)}">
  </div>

  <div>
  <label for="c-email">${tx(t("create.yourEmail"))}</label>
  <input id="c-email" type="email" name="registrantEmail" required value="${escapeAttr(v.registrantEmail)}">
  <p class="hint">${tx(t("create.emailHint"))}</p>
  </div>

  <div>
  <label for="c-country">${tx(t("create.country"))}</label>
  <select id="c-country" name="country">
    ${COUNTRIES.map((c) => `<option value="${escapeAttr(c.code)}"${(v.country || DEFAULT_COUNTRY) === c.code ? " selected" : ""}>${escapeHtml(countryName(c.code, c.label))}</option>`).join("")}
  </select>
  <p class="hint">${tx(t("create.countryHint"))}</p>
  </div>

  <div class="full">
  <label for="c-msg">${tx(t("create.note"))}</label>
  <textarea id="c-msg" name="message" maxlength="2000" placeholder="${escapeAttr(t("create.notePh", { example: initial.note }))}">${escapeHtml(v.message)}</textarea>
  </div>
</div>

  <div class="row" style="margin-top:20px">
    <button class="btn block" type="submit">${tx(t("create.submit"))}</button>
  </div>
</form>
<script>(function(){var s=document.getElementById('c-event'),t=document.getElementById('c-title'),m=document.getElementById('c-msg');if(!s)return;s.addEventListener('change',function(){var o=s.options[s.selectedIndex];t.placeholder=o.dataset.title;m.placeholder=${jsStr("create.notePh")}.replace('{example}',o.dataset.note);var d=document.getElementById('c-date-field');d.hidden='nodate' in o.dataset;if(d.hidden)document.getElementById('c-date').value='';});})();</script>

<div class="note">
  <p style="margin:0">${t("create.alreadyHtml")}</p>
  <form method="post" action="${escapeAttr(data.actionUrl)}/resend" style="margin-top:10px">
    <label class="sr" for="c-resend">${tx(t("create.yourEmail"))}</label>
    <input id="c-resend" type="email" name="email" placeholder="${escapeAttr(t("create.yourEmail"))}" required>
    <div class="row" style="margin-top:10px">
      <button class="btn sm ghost" type="submit">${tx(t("create.resendButton"))}</button>
    </div>
  </form>
</div>
`;

  return layout(
    {
      title: t("create.pageTitle", { shop: data.shopName }),
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
    { title: t("pw.title"), accentColor: data.accentColor, indexable: false, shopName: data.shopName, branding: data.branding },
    `<h1>${tx(t("pw.title"))}</h1>
     <p class="sub">${tx(t("pw.sub"))}</p>
     ${data.error ? `<div class="err">${escapeHtml(data.error)}</div>` : ""}
     <form method="post" action="${escapeAttr(data.actionUrl)}/r/${escapeAttr(data.slug)}" class="note">
       <label for="pw">${tx(t("pw.label"))}</label>
       <input id="pw" type="password" name="password" required autocomplete="off">
       <div class="row" style="margin-top:16px"><button class="btn" type="submit">${tx(t("pw.button"))}</button></div>
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
<h1>${tx(t("find.title"))}</h1>
<p class="sub">${tx(t("find.sub"))}</p>

<form method="get" action="${escapeAttr(data.actionUrl)}/find" class="note">
  <label class="sr" for="q">${tx(t("find.name"))}</label>
  <input id="q" type="text" name="q" value="${escapeAttr(data.query)}" placeholder="${escapeAttr(t("find.placeholder"))}" required>
  <div class="row" style="margin-top:12px"><button class="btn sm" type="submit">${tx(t("find.search"))}</button></div>
</form>

${
  !data.searched
    ? ""
    : data.results.length === 0
      ? `<div class="empty"><p>${tx(t("find.none"))}</p><p class="hint">${tx(t("find.noneHint"))}</p></div>`
      : `${
          lookalikes
            ? `<div class="note" role="status">${t("find.lookalikeHtml")}</div>`
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
        ? `<strong>${formatLongDate(r.eventDate)}</strong>`
        : tx(t("find.noDate"))
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
      title: t("find.pageTitle", { shop: data.shopName }),
      description: t("find.description", { shop: data.shopName }),
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
    { title: t("chooser.title"), accentColor: data.accentColor, indexable: false, shopName: data.shopName, branding: data.branding },
    `<h1>${tx(t("chooser.title"))}</h1>
     <p class="sub">${tx(t("chooser.sub"))}</p>
     <ul class="items">${registries
       .map(
         (r) =>
           `<li class="item" style="grid-template-columns:1fr"><div><p class="item-title">${escapeHtml(r.title)}</p><p><a class="btn sm" href="${escapeAttr(r.href)}">${tx(t("chooser.manage"))}</a></p></div></li>`,
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
  return formatLongDate(date);
}

/** Every registry one person holds at this store, from their emailed My registries link. */
export function renderAccountPage(data: AccountPageData): string {
  const list = data.registries.length
    ? `<ul class="items">${data.registries
        .map((r) => {
          const meta = [eventTypeLabel(r.eventType), formatEventDate(r.eventDate), r.partner ? t("account.partner") : ""]
            .filter(Boolean)
            .join(" · ");
          return `<li class="item" style="grid-template-columns:1fr"><div><p class="item-title">${escapeHtml(r.title)}</p><p class="item-meta">${escapeHtml(meta)}</p><p><a class="btn sm" href="${escapeAttr(r.href)}">${tx(t("account.open"))}</a></p></div></li>`;
        })
        .join("")}</ul>`
    : data.accountToken
      ? `<p>${tx(t("account.noneEmail"))}</p>`
      : `<p>${tx(t("account.noneStore"))}</p>`;
  const root = data.actionUrl.replace(/\/+$/, "");
  // Store-account sign-in only: the list holds just the registries started
  // while signed in, so offer the email link for the rest.
  const storeAccountOnly = data.accountToken
    ? ""
    : `${followSavedLink(root)}
     <h2>${tx(t("account.dontSee"))}</h2>
     <p>${tx(t("account.keptUnderEmail"))}</p>
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
    { title: t("account.title"), accentColor: data.accentColor, indexable: false, shopName: data.shopName, branding: data.branding },
    `<h1>${tx(t("account.title"))}</h1>
     <p class="sub">${tx(t(data.accountToken ? "account.sub.email" : "account.sub.store", { shop: data.shopName }))}</p>
     ${list}
     <p style="margin-top:24px"><a class="btn" href="${escapeAttr(data.createHref)}">${tx(t("account.startAnother"))}</a></p>
     <p class="hint">${tx(t("account.hint"))}</p>
     ${remember}
     ${storeAccountOnly}
     ${data.accountToken ? `<form method="post" action="${escapeAttr(root)}/account-link?a=${encodeURIComponent(data.accountToken)}" style="margin-top:12px"><button class="btn sm ghost" type="submit">${tx(t("account.emailThisLink"))}</button></form>` : ""}`,
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
    { title: t("account.title"), accentColor: data.accentColor, indexable: false, shopName: data.shopName, branding: data.branding },
    `${data.expired ? forgetSavedLink() : followSavedLink(data.actionUrl)}
     <h1>${tx(t("account.title"))}</h1>
     <p class="sub">${data.expired ? tx(t("account.expired")) : ""}${tx(t("account.signInSub"))}</p>
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
         <p style="margin:0 0 10px">${tx(t("account.oneClick"))}</p>
         <button class="btn" type="submit">${tx(t("account.emailLink"))}</button>
       </form>`
    : `<form method="post" action="${escapeAttr(actionUrl)}/resend" class="note">
         <label for="a-email">${tx(t("create.yourEmail"))}</label>
         <input id="a-email" type="email" name="email" required>
         <div class="row" style="margin-top:16px"><button class="btn" type="submit">${tx(t("create.resendButton"))}</button></div>
       </form>`;
}

/** This browser opened an emailed My registries link before: go straight there. */
function followSavedLink(actionUrl: string): string {
  return `<script>(function(){try{var a=localStorage.getItem(${JSON.stringify(ACCOUNT_STORAGE_KEY)});if(a)location.replace(${JSON.stringify(`${actionUrl}/account?a=`)}+encodeURIComponent(a));}catch(_){}})();</script>`;
}

function forgetSavedLink(): string {
  return `<script>try{localStorage.removeItem(${JSON.stringify(ACCOUNT_STORAGE_KEY)})}catch(_){}</script>`;
}
