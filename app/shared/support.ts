/**
 * Support contact. Pro includes priority support: replies within one
 * business day. The subject line carries the plan and shop domain so Pro
 * emails can be spotted (and filtered) in the inbox without asking the
 * merchant which store they're on.
 */
export const SUPPORT_EMAIL = "support@giftpin.app";
export const PRO_SUPPORT_PROMISE = "Replies within one business day";

export function supportMailto(shopDomain: string, pro: boolean): string {
  const subject = `${pro ? "[Pro] " : ""}Giftpin help: ${shopDomain}`;
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
