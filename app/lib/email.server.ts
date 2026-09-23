import { registerHandler, enqueue } from "./queue.server";

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
  const from = process.env.MAIL_FROM || "Registro <onboarding@resend.dev>";

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

type TemplateFn = (data: Record<string, any>) => Mail;

const templates: Record<string, TemplateFn> = {
  /** Magic link — the only way a registrant gets back into their registry. */
  "registry-link": (d) => ({
    to: d.to,
    subject: `Your ${d.registryTitle} registry`,
    text: `Open your registry: ${d.url}\n\nThis link works for 30 days. Anyone with it can edit your registry, so keep it to yourself.`,
    html: shell(
      "Here's your registry",
      `<p>Use this link whenever you want to add items or see what's been bought.</p>
       <p style="color:#6b6b6b;font-size:13px">The link works for 30 days, and anyone who has it can edit your registry — so keep it to yourself. The <em>share</em> link you send to guests is different and is view-only.</p>`,
      { label: "Open my registry", url: d.url },
    ),
  }),

  /** The moment that sells the app. */
  "gift-purchased": (d) => ({
    to: d.to,
    subject: `Someone bought ${d.itemTitle}`,
    text: `${d.buyerLine}\n\n${d.itemTitle} — ${d.qty} of ${d.desiredQty}\n\nSee your registry: ${d.url}`,
    html: shell(
      "You've been given a gift",
      `<p><strong>${escapeHtml(d.itemTitle)}</strong></p>
       <p>${escapeHtml(d.buyerLine)}</p>
       ${d.buyerMessage ? `<blockquote style="margin:16px 0;padding:12px 16px;background:#fff;border-left:3px solid #ddd;border-radius:4px">${escapeHtml(d.buyerMessage)}</blockquote>` : ""}`,
      { label: "See your registry", url: d.url },
    ),
  }),

  /** Sent to a guest who clicked through to an external retailer. */
  "claim-followup": (d) => ({
    to: d.to,
    subject: `Did you buy ${d.itemTitle}?`,
    text: `You headed to ${d.domain} for "${d.itemTitle}". Let us know so nobody buys it twice:\n\nYes, I bought it: ${d.confirmUrl}\nNo, I didn't: ${d.releaseUrl}`,
    html: shell(
      "Did you end up buying it?",
      `<p>You headed to <strong>${escapeHtml(d.domain)}</strong> for <strong>${escapeHtml(d.itemTitle)}</strong>. We've held it on the registry so nobody buys it twice — but only for a little longer.</p>`,
      { label: "Yes, I bought it", url: d.confirmUrl },
    ).replace(
      "</div></body>",
      `<p style="font-size:13px"><a href="${escapeAttr(d.releaseUrl)}" style="color:#6b6b6b">No, I didn't buy it — put it back</a></p></div></body>`,
    ),
  }),

  /** Nudge before the event so leftover items get bought. */
  "event-reminder": (d) => ({
    to: d.to,
    subject: `${d.registryTitle} — ${d.remaining} items still unclaimed`,
    text: `Your event is coming up and ${d.remaining} items haven't been bought yet.\n\n${d.url}`,
    html: shell(
      "Your event is coming up",
      `<p><strong>${d.remaining}</strong> items on your registry haven't been bought yet. Now is a good time to share the link again, or trim anything you've changed your mind about.</p>`,
      { label: "Open my registry", url: d.url },
    ),
  }),
};

/** Queue an email. Returns immediately; delivery and retries happen in the worker. */
export async function sendEmail(
  template: keyof typeof templates,
  to: string,
  data: Record<string, unknown>,
): Promise<void> {
  await enqueue("send-email", { template, to, data });
}

registerHandler("send-email", async ({ template, to, data }) => {
  const build = templates[template];
  if (!build) {
    console.warn(`[mail] unknown template "${template}"`);
    return;
  }
  await deliver(build({ ...data, to }));
});

export const __testables = { templates, shell, escapeHtml };
