import db from "../db.server";

/**
 * Audit trail for access to personal data.
 *
 * Every place the app decrypts or exports personal data on its own — sending a
 * registrant an email, rewriting an order's shipping address, answering a GDPR
 * data request, erasing a customer, or purging expired data — writes one row
 * here and one structured line to stdout (prefixed `[audit]`).
 *
 * Rules:
 *   - Never store the personal data itself, only what was touched and why.
 *   - Never throw. Losing an audit row is bad; failing a webhook because of it
 *     is worse, since Shopify would retry the whole delivery.
 *   - No foreign keys, so the trail survives deletion of the registry or shop it
 *     describes (that is exactly when you need it).
 *
 * Rows are pruned after 12 months by the retention job.
 */

export interface AuditEntry {
  /** Shop domain, when known. */
  shop?: string | null;
  /** Who or what did it, e.g. "system:notify-registrant", "shopify:gdpr". */
  actor: string;
  /** What happened, e.g. "email_decrypted", "shipping_address_read". */
  action: string;
  /** Id of the thing touched (registry id, customer id), never a name or email. */
  subject?: string | null;
  /** Small, non-identifying context. */
  detail?: Record<string, unknown>;
}

export async function audit(entry: AuditEntry): Promise<void> {
  try {
    console.log(
      JSON.stringify({
        type: "audit",
        at: new Date().toISOString(),
        shop: entry.shop ?? null,
        actor: entry.actor,
        action: entry.action,
        subject: entry.subject ?? null,
        detail: entry.detail ?? {},
      }),
    );
    await db.auditLog.create({
      data: {
        shop: entry.shop ?? null,
        actor: entry.actor,
        action: entry.action,
        subject: entry.subject ?? null,
        detail: (entry.detail ?? {}) as object,
      },
    });
  } catch (err) {
    console.error("[audit] failed to record entry:", (err as Error).message);
  }
}
