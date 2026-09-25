/**
 * The store's ext-add endpoint, shared with the Chrome extension (see
 * extAddAction in app/proxy/router.server.ts). Same request bodies as
 * browser-extension/popup.js.
 */
import type { Connection } from "./connection";

export type Product = {
  title: string;
  url: string;
  imageUrl: string | null;
  price: string | null;
  currency: string | null;
};

export type AddResult =
  | { kind: "added" }
  | { kind: "duplicate"; itemId: string; currentQty: number }
  | { kind: "error"; message: string };

async function post(conn: Connection, body: Record<string, unknown>) {
  try {
    const response = await fetch(`${conn.proxyBase}/ext-add`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ token: conn.token, ...body }),
    });
    return (await response.json()) as {
      ok?: boolean;
      duplicate?: boolean;
      itemId?: string;
      currentQty?: number;
      error?: string;
    };
  } catch {
    return null;
  }
}

export async function addItem(conn: Connection, product: Product, qty: number): Promise<AddResult> {
  const result = await post(conn, { ...product, qty });
  if (!result) return { kind: "error", message: "Couldn't add that. Check your connection and try again." };
  if (result.ok && result.duplicate && result.itemId) {
    return { kind: "duplicate", itemId: result.itemId, currentQty: result.currentQty ?? 1 };
  }
  if (result.ok) return { kind: "added" };
  return { kind: "error", message: result.error || "Couldn't add that." };
}

export async function confirmQty(conn: Connection, itemId: string, qty: number): Promise<AddResult> {
  const result = await post(conn, { itemId, confirmQty: qty });
  if (result?.ok) return { kind: "added" };
  return { kind: "error", message: result?.error || "Couldn't update that. Please try again." };
}
