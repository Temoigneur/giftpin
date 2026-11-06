import { registerHandler, enqueue } from "./queue.server";
import { t, tn, tNoun, type MessageKey } from "../shared/i18n";
import { withLocale } from "./i18n.server";
import db from "../db.server";
import { settingsFor } from "../models/shop.server";

/**
 * Transactional email.
 *
 * "Someone bought your gift" is a product moment, not a notification — it is
 * the thing the registrant screenshots and shows their partner. Treat
 * deliverability as a feature: real sending domain, SPF and DKIM, day one.
 *
 * Resend over HTTPS, no SDK. Without RESEND_API_KEY, mail goes to stdout so
 * local development needs no account.
 */

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

async function deliver(mail: Mail): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || "Giftpin <onboarding@resend.dev>";

  if (!key) {
    console.log(`\n[mail] → ${mail.to}\n[mail] ${mail.subject}\n${mail.text}\n`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [mail.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    }),
  });

  if (!response.ok) {
    // Thrown so BullMQ retries with backoff.
    throw new Error(`Resend responded ${response.status}: ${await response.text()}`);
  }
}

// ---------------------------------------------------------------------------
// Templates
//
// Deliberately plain. Registry mail lands in personal inboxes on phones; a
// heavy HTML template buys nothing and costs deliverability.
// ---------------------------------------------------------------------------

function shell(heading: string, body: string, cta?: { label: string; url: string }): string {
  const button = cta
    ? `<p style="margin:28px 0"><a href="${escapeAttr(cta.url)}" style="background:#1a1a1a;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:600">${escapeHtml(cta.label)}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f6f6f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a">
<div style="max-width:520px;margin:0 auto;padding:32px 24px">
<h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(heading)}</h1>
<div style="font-size:15px;line-height:1.6;color:#3d3d3d">${body}</div>
${button}
</div></body></html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function escapeAttr(value: string): string {
  return escapeHtml(value);
}

// Template data is assembled by each job handler; shapes vary per template.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TemplateFn = (data: Record<string, any>) => Mail;

type Vars = Record<string, string | number>;

/** `t()` for an `Html` message: string vars are escaped, `raw` ones are trusted markup. */
function h(key: MessageKey, vars: Vars = {}, raw: Vars = {}): string {
  const safe: Vars = {};
  for (const [k, v] of Object.entries(vars)) safe[k] = typeof v === "string" ? escapeHtml(v) : v;
  return t(key, { ...safe, ...raw });
}

const strong = (value: string) => `<strong>${escapeHtml(value)}</strong>`;

/** "From Sam." etc. `buyerLine` (already written) wins, for callers that predate `buyer`. */
function buyerText(d: Record<string, any>, anonymousKey: "email.buyer.anonymous" | "email.buyer.anonymousContribution"): string {
  if (typeof d.buyerLine === "string" && d.buyerLine) return d.buyerLine;
  const buyer = d.buyer as { hidden?: boolean; name?: string | null } | undefined;
  if (buyer?.hidden) return t("email.buyer.hidden");
  if (buyer?.name) return t("email.buyer.named", { name: buyer.name });
  return t(anonymousKey);
}

const templates: Record<string, TemplateFn> = {
  /** Magic link — the only way a registrant gets back into their registry. */
  "registry-link": (d) => ({
    to: d.to,
    // A wish list's title usually says "wish list" already ("Sam's Wish List").
    subject: tNoun("email.link.subject", d.eventType, { title: d.registryTitle }),
    text: tNoun("email.link.text", d.eventType, { url: d.url }),
    html: shell(
      tNoun("email.link.heading", d.eventType),
      `<p>${t("email.link.useHtml")}</p>
         <p style="color:#6b6b6b;font-size:13px">${tNoun("email.link.noteHtml", d.eventType)}</p>`,
      { label: tNoun("email.link.cta", d.eventType), url: d.url },
    ),
  }),

  /** "My registries": one link to every registry this email holds at the store. */
  "registry-account": (d) => {
    const titles: string[] = Array.isArray(d.titles) ? d.titles.map(String) : [];
    const shopName = String(d.shopName ?? t("email.account.defaultShop"));
    return {
      to: d.to,
      subject: t("email.account.subject", { shop: shopName }),
      text: `${t("email.account.text", { shop: shopName, url: d.url })}\n\n${titles.map((x) => `- ${x}`).join("\n")}\n\n${t("email.account.textNote")}`,
      html: shell(
        t("email.account.heading"),
        `<p>${h("email.account.introHtml", { shop: shopName })}</p>
         <ul>${titles.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
         <p style="color:#6b6b6b;font-size:13px">${t("email.account.noteHtml")}</p>`,
        { label: t("email.account.cta"), url: d.url },
      ),
    };
  },

  /** A registrant added their partner. Their own link, so it can be revoked. */
  "registry-partner": (d) => {
    const named = Boolean(d.inviterName);
    const form = named ? "named" : "unnamed";
    const vars = { name: String(d.inviterName ?? ""), title: d.registryTitle, shop: d.shopName };
    return {
      to: d.to,
      subject: t(`email.partner.subject.${form}`, vars),
      text: `${t(`email.partner.lead.${form}`, vars)} ${t("email.partner.then")}\n\n${t("email.partner.open", { url: d.url })}\n\n${t("email.partner.textNote")}`,
      html: shell(
        t(`email.partner.heading.${form}`, vars),
        `<p>${h(`email.partner.lead.${form}`, { name: vars.name, shop: vars.shop }, { title: strong(vars.title) })} ${t("email.partner.then")}</p>
       <p style="color:#6b6b6b;font-size:13px">${t("email.partner.noteHtml")}</p>`,
        { label: t("email.partner.cta"), url: d.url },
      ),
    };
  },

  /** The moment that sells the app. */
  "gift-purchased": (d) => {
    const buyer = buyerText(d, "email.buyer.anonymous");
    return {
      to: d.to,
      subject: t("email.purchased.subject", { item: d.itemTitle }),
      text: tNoun("email.purchased.text", d.eventType, { buyer, item: d.itemTitle, qty: d.qty, desired: d.desiredQty, url: d.url }),
      html: shell(
        t("email.purchased.heading"),
        `<p><strong>${escapeHtml(d.itemTitle)}</strong></p>
         <p>${escapeHtml(buyer)}</p>
         ${d.buyerMessage ? `<blockquote style="margin:16px 0;padding:12px 16px;background:#fff;border-left:3px solid #ddd;border-radius:4px">${escapeHtml(d.buyerMessage)}</blockquote>` : ""}`,
        { label: tNoun("email.purchased.cta", d.eventType), url: d.url },
      ),
    };
  },

  /** A guest chipped in toward a group gift or fund (SPIKE-C.md). */
  "gift-contribution": (d) => {
    const money = d.amount ? `${Number(d.amount).toFixed(2)} ${d.currency}` : t("email.contribution.moneyFallback");
    const where = t(d.sentToRegistrant ? "email.contribution.where.toRegistrant" : "email.contribution.where.toGuest");
    const buyer = buyerText(d, "email.buyer.anonymousContribution");
    return {
      to: d.to,
      subject: t("email.contribution.subject", { item: d.itemTitle }),
      text: tNoun("email.contribution.text", d.eventType, { money, item: d.itemTitle, buyer, where, url: d.url }),
      html: shell(
        t("email.contribution.heading"),
        `<p>${h("email.contribution.leadHtml", {}, { money: strong(money), item: strong(d.itemTitle) })}</p>
         <p>${escapeHtml(buyer)}</p>
         <p style="color:#6b6b6b;font-size:13px">${escapeHtml(where)}</p>`,
        { label: tNoun("email.contribution.cta", d.eventType), url: d.url },
      ),
    };
  },

  /** Sent to a guest who clicked through to an external retailer. */
  "claim-followup": (d) => ({
    to: d.to,
    subject: t("email.followup.subject", { item: d.itemTitle }),
    text: t("email.followup.text", { domain: d.domain, item: d.itemTitle, confirmUrl: d.confirmUrl, releaseUrl: d.releaseUrl }),
    html: shell(
      t("email.followup.heading"),
      `<p>${h("email.followup.bodyHtml", {}, { domain: strong(d.domain), item: strong(d.itemTitle) })}</p>`,
      { label: t("email.followup.cta"), url: d.confirmUrl },
    ).replace(
      "</div></body>",
      `<p style="font-size:13px"><a href="${escapeAttr(d.releaseUrl)}" style="color:#6b6b6b">${escapeHtml(t("email.followup.release"))}</a></p></div></body>`,
    ),
  }),

  /** Nudge before the event so leftover items get bought. */
  "event-reminder": (d) => ({
    to: d.to,
    subject: tn("email.eventReminder.subject", d.remaining, { title: d.registryTitle }),
    text: tn("email.eventReminder.text", d.remaining, { url: d.url }),
    html: shell(
      t("email.eventReminder.heading"),
      `<p>${h("email.eventReminder.bodyHtml_" + (d.remaining === 1 ? "one" : "other") as MessageKey, {}, { n: `<strong>${d.remaining}</strong>` })}</p>`,
      { label: t("email.eventReminder.cta"), url: d.url },
    ),
  }),

  // -------------------------------------------------------------------------
  // Pro automations — see app/models/automations.server.ts
  // -------------------------------------------------------------------------

  /** To a guest who asked to be reminded. Must always carry the unsubscribe link. */
  "guest-event-reminder": (d) => {
    const when = inDays(d.days);
    const left = d.remaining > 0 ? tn("email.guestReminder.left", d.remaining) : t("email.guestReminder.none");
    return {
      to: d.to,
      subject: t("email.guestReminder.subject", { title: d.registryTitle, when }),
      text: t("email.guestReminder.text", { title: d.registryTitle, when, left, url: d.url, shop: d.shopName, unsubscribe: d.unsubscribeUrl }),
      html: withFooter(
        shell(
          t("email.guestReminder.subject", { title: d.registryTitle, when }),
          `<p>${t("email.guestReminder.introHtml")}</p>
         <p>${d.remaining > 0 ? h(("email.guestReminder.leftHtml_" + (d.remaining === 1 ? "one" : "other")) as MessageKey, {}, { n: `<strong>${d.remaining}</strong>` }) : t("email.guestReminder.noneHtml")}</p>`,
          { label: t("email.guestReminder.cta"), url: d.url },
        ),
        h("email.guestReminder.footerHtml", { shop: d.shopName }, {
          link: `<a href="${escapeAttr(d.unsubscribeUrl)}" style="color:#6b6b6b">${escapeHtml(t("email.guestReminder.stop"))}</a>`,
        }),
      ),
    };
  },

  /** Registrant: most of the list is bought, so add more before late guests arrive. */
  "most-gone": (d) => ({
    to: d.to,
    subject: t("email.mostGone.subject", { fulfilled: d.fulfilled, total: d.total, title: d.registryTitle }),
    text: tNoun("email.mostGone.text", d.eventType, { fulfilled: d.fulfilled, total: d.total, url: d.url }),
    html: shell(
      tNoun("email.mostGone.heading", d.eventType),
      `<p>${tNoun("email.mostGone.countHtml", d.eventType, { fulfilled: d.fulfilled, total: d.total })}</p>
         <p>${t("email.mostGone.moreHtml")}</p>`,
      { label: t("email.mostGone.cta"), url: d.url },
    ),
  }),

  /** Registrant, a few days after the event. */
  "thank-you-reminder": (d) => {
    const gifts = (d.gifts as { item: string; from: string }[]) ?? [];
    const more = d.moreCount > 0 ? `\n${t("email.thankYou.more", { n: d.moreCount })}` : "";
    return {
      to: d.to,
      subject: t("email.thankYou.subject"),
      text: t("email.thankYou.text", { list: gifts.map((g) => `- ${g.item}: ${g.from}`).join("\n"), more, csvUrl: d.csvUrl, url: d.url }),
      html: shell(
        t("email.thankYou.subject"),
        `<p>${h("email.thankYou.introHtml", {}, { title: strong(d.registryTitle) })}</p>
         <ul style="padding-left:18px">${gifts.map((g) => `<li><strong>${escapeHtml(g.item)}</strong>: ${escapeHtml(g.from)}</li>`).join("")}</ul>
         ${d.moreCount > 0 ? `<p>${escapeHtml(t("email.thankYou.more", { n: d.moreCount }))}</p>` : ""}
         <p style="font-size:13px"><a href="${escapeAttr(d.url)}" style="color:#6b6b6b">${escapeHtml(t("email.thankYou.open"))}</a></p>`,
        { label: t("email.thankYou.cta"), url: d.csvUrl },
      ),
    };
  },

  /** Registrant, after the event: the completion discount. */
  "completion-discount": (d) => ({
    to: d.to,
    subject: t("email.discount.subject", { percent: d.percent, title: d.registryTitle }),
    text: t("email.discount.text", {
      title: d.registryTitle,
      shop: d.shopName,
      code: d.code,
      percent: d.percent,
      items: d.remaining > 0 ? tn("email.discount.items", d.remaining) : "",
      ends: d.endsOn,
      url: d.url,
    }),
    html: shell(
      t("email.discount.heading", { percent: d.percent }),
      `<p>${h("email.discount.introHtml", { shop: d.shopName }, { title: strong(d.registryTitle) })}</p>
       <p style="font-size:22px;font-weight:700;letter-spacing:1px;background:#fff;border:1px dashed #bbb;border-radius:8px;padding:14px;text-align:center">${escapeHtml(d.code)}</p>
       <p style="color:#6b6b6b;font-size:13px">${h("email.discount.noteHtml", { percent: d.percent, ends: d.endsOn })}</p>`,
      { label: t("email.discount.cta"), url: d.url },
    ),
  }),
};

function inDays(days: number): string {
  if (days <= 0) return t("email.when.today");
  if (days === 1) return t("email.when.tomorrow");
  if (days === 14) return t("email.when.twoWeeks");
  return tn("email.when.days", days);
}

function withFooter(html: string, footer: string): string {
  return html.replace(
    "</div></body>",
    `<p style="font-size:12px;color:#6b6b6b;margin-top:32px">${footer}</p></div></body>`,
  );
}

/** Queue an email. Returns immediately; delivery and retries happen in the worker. */
export async function sendEmail(
  template: keyof typeof templates,
  to: string,
  data: Record<string, unknown>,
): Promise<void> {
  await enqueue("send-email", { template, to, data });
}

/**
 * The language an email goes out in: the store's, found from the store address
 * every link in it starts with (absoluteProxyUrl builds them all from the shop
 * domain). Looked up when the job runs, so a language the merchant just
 * switched to applies to mail still waiting in the queue. Anything unexpected
 * is English.
 */
async function localeForMail(data: Record<string, unknown>): Promise<string> {
  const link = [data.url, data.confirmUrl].find((v) => typeof v === "string") as string | undefined;
  if (!link) return "en";
  try {
    const domain = new URL(link).hostname;
    const shop = await db.shop.findUnique({ where: { domain }, select: { settings: true } });
    return shop ? settingsFor(shop).language : "en";
  } catch {
    return "en";
  }
}

registerHandler("send-email", async ({ template, to, data }) => {
  const build = templates[template];
  if (!build) {
    console.warn(`[mail] unknown template "${template}"`);
    return;
  }
  const locale = await localeForMail(data);
  await deliver(withLocale(locale, () => build({ ...data, to })));
});

export const __testables = { templates, shell, escapeHtml };
