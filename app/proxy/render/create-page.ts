import type { PageBranding } from "../../shared/branding";
import { layout, escapeHtml, escapeAttr } from "./layout";
import { EVENT_TYPES } from "../../shared/settings";
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
  error?: string | null;
  values?: Record<string, string>;
}

export function renderCreatePage(data: CreatePageData): string {
  const types = EVENT_TYPES.filter((t) => data.enabledEventTypes.includes(t.value));
  const v = data.values ?? {};

  const body = `
<h1>Start a registry</h1>
<p class="sub">Tell your guests what you'd love. They buy it, you get one list.</p>

${data.error ? `<div class="err">${escapeHtml(data.error)}</div>` : ""}

<form method="post" action="${escapeAttr(data.actionUrl)}/create" class="note">
  <label for="c-event">What's the occasion?</label>
  <select id="c-event" name="eventType" required>
    ${(types.length ? types : EVENT_TYPES)
      .map(
        (t) => `<option value="${escapeAttr(t.value)}"${v.eventType === t.value ? " selected" : ""}>${escapeHtml(t.label)}</option>`,
      )
      .join("")}
  </select>

  <label for="c-title">Registry name</label>
  <input id="c-title" type="text" name="title" maxlength="200" required
         placeholder="Sam &amp; Alex's Wedding" value="${escapeAttr(v.title)}">

  <label for="c-date">When is it?</label>
  <input id="c-date" type="date" name="eventDate" value="${escapeAttr(v.eventDate)}">
  <p class="hint">Optional. We'll remind you to share your link as it gets closer.</p>

  <label for="c-name">Your name</label>
  <input id="c-name" type="text" name="registrantName" maxlength="120" required value="${escapeAttr(v.registrantName)}">

  <label for="c-email">Your email</label>
  <input id="c-email" type="email" name="registrantEmail" required value="${escapeAttr(v.registrantEmail)}">
  <p class="hint">We email you a private link to manage your registry, and tell you when someone buys something. Your email is never shown to guests.</p>

  <label for="c-country">Where will your guests shop?</label>
  <select id="c-country" name="country">
    ${COUNTRIES.map((c) => `<option value="${escapeAttr(c.code)}"${(v.country || DEFAULT_COUNTRY) === c.code ? " selected" : ""}>${escapeHtml(c.label)}</option>`).join("")}
  </select>
  <p class="hint">When this store doesn't carry something, we'll suggest that country's stores, like Amazon and Walmart.</p>

  <label for="c-msg">A note for your guests</label>
  <textarea id="c-msg" name="message" maxlength="2000" placeholder="Optional">${escapeHtml(v.message)}</textarea>

  <div class="row" style="margin-top:20px">
    <button class="btn block" type="submit">Create my registry</button>
  </div>
</form>

<div class="note">
  <p style="margin:0"><strong>Already have one?</strong></p>
  <form method="post" action="${escapeAttr(data.actionUrl)}/resend" style="margin-top:10px">
    <label class="sr" for="c-resend">Your email</label>
    <input id="c-resend" type="email" name="email" placeholder="Your email" required>
    <div class="row" style="margin-top:10px">
      <button class="btn sm ghost" type="submit">Email me my link</button>
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
  results: { title: string; eventLabel: string; eventDate: Date | null; url: string; names: string }[];
  searched: boolean;
}): string {
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
      : `<ul class="items">${data.results
          .map(
            (r) => `<li class="item" style="grid-template-columns:1fr">
  <div>
    <p class="item-title"><a href="${escapeAttr(r.url)}">${escapeHtml(r.title)}</a></p>
    <p class="item-meta">${escapeHtml(r.eventLabel)}${r.eventDate ? ` &middot; ${new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeZone: "UTC" }).format(r.eventDate)}` : ""}</p>
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
