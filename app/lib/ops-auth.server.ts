import crypto from "node:crypto";

/**
 * HTTP Basic auth for Giftpin's own ops view (/ops). The password is the
 * OPS_PASSWORD env var; any username is accepted. With OPS_PASSWORD unset or
 * shorter than 16 characters the page doesn't exist at all (404), so shipping
 * this code changes nothing until Ben sets a long random password on Railway.
 *
 * "denied" → 401 with a Basic challenge, so the browser shows its login box.
 */
export type OpsAuth = "ok" | "disabled" | "denied";

export const OPS_MIN_PASSWORD_LENGTH = 16;

export function checkOpsAuth(authorization: string | null, password: string | undefined): OpsAuth {
  if (!password || password.length < OPS_MIN_PASSWORD_LENGTH) return "disabled";
  if (!authorization?.startsWith("Basic ")) return "denied";

  let supplied: string;
  try {
    const decoded = Buffer.from(authorization.slice(6).trim(), "base64").toString("utf8");
    const colon = decoded.indexOf(":");
    if (colon < 0) return "denied";
    supplied = decoded.slice(colon + 1);
  } catch {
    return "denied";
  }

  // Compare digests so the comparison is constant-time whatever the lengths.
  const a = crypto.createHash("sha256").update(supplied).digest();
  const b = crypto.createHash("sha256").update(password).digest();
  return crypto.timingSafeEqual(a, b) ? "ok" : "denied";
}
