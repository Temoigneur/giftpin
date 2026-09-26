/**
 * Connecting the app to one registry, the same way the Chrome extension does
 * (see browser-extension/popup.js): the registrant pastes or shares their
 * private manage link once. Its token is the only credential, checked by the
 * store's ext-verify endpoint and kept in the phone's secure storage.
 */
import * as SecureStore from "expo-secure-store";

export type Connection = { proxyBase: string; token: string; title: string };

const STORAGE_KEY = "giftpin_connection";

/** Manage link → where to send requests and the token, or null if it isn't one. */
export function parseManageLink(raw: string): { proxyBase: string; token: string } | null {
  try {
    const url = new URL(raw.trim());
    const token = url.searchParams.get("t");
    if (!token) return null;
    // Keep everything up to the proxy's own base path (e.g. ".../apps/registry"),
    // so this still works if a merchant renamed the proxy path.
    const path = url.pathname.replace(/\/manage\/?$/, "");
    return { proxyBase: url.origin + path, token };
  } catch {
    return null;
  }
}

/** A guest share link (…/r/slug) pasted where the manage link should go. */
export function looksLikeShareLink(raw: string): boolean {
  return /\/r\/[^/?#]+/.test(raw) && !raw.includes("t=");
}

export async function verify(parsed: { proxyBase: string; token: string }): Promise<Connection> {
  let result: { ok?: boolean; title?: string; error?: string } | null = null;
  try {
    const response = await fetch(`${parsed.proxyBase}/ext-verify?t=${encodeURIComponent(parsed.token)}`, {
      headers: { Accept: "application/json" },
    });
    const text = await response.text();
    try {
      result = JSON.parse(text);
    } catch {
      // An HTML page instead of JSON: almost always the storefront password
      // page (dev and pre-launch stores). The Chrome extension gets past it
      // with the browser's cookies; the app has none.
      throw new Error(
        "Your store sent back a web page instead of an answer. If the store has a storefront password, the app can't connect until it's removed.",
      );
    }
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("Your store")) throw e;
    throw new Error("Couldn't reach your store. Check your connection and try again.");
  }
  if (!result?.ok) {
    throw new Error(result?.error || "That link isn't working. Ask for a new one from your registry.");
  }
  return { ...parsed, title: result.title || "Your registry" };
}

export async function loadConnection(): Promise<Connection | null> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Connection) : null;
  } catch {
    return null;
  }
}

export async function saveConnection(conn: Connection): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(conn));
}

export async function clearConnection(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}
