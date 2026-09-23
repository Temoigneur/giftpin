#!/usr/bin/env node
/**
 * Spike A helper — mints a real signed `_rg` token and prints the exact
 * browser-console snippet to paste on a cart page.
 *
 *   node scripts/spike-a.mjs <VARIANT_ID> [QTY]
 *   node scripts/spike-a.mjs --verify <TOKEN>
 *
 * Why a real token and not a placeholder: the token is ~120 characters of
 * base64url. Length and character set are exactly the kind of thing a
 * checkout path truncates or mangles, so the spike has to run against the real
 * shape or it proves nothing.
 *
 * The HMAC below is duplicated from app/lib/attribution.ts on purpose, so this
 * script runs with no build step and no database. `npm test` asserts the two
 * stay in agreement (scripts/__tests__/spike-a.test.ts), so the copy cannot
 * silently drift. app/lib/attribution.ts remains the source of truth.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

function loadSigningKey() {
  if (process.env.SIGNING_KEY) return process.env.SIGNING_KEY;

  // Read .env directly rather than pulling in a dependency.
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const match = line.match(/^\s*SIGNING_KEY\s*=\s*"?([^"\n]*)"?\s*$/);
      if (match && match[1]) return match[1];
    }
  }

  console.error(
    "SIGNING_KEY is not set, and no .env with one was found.\n" +
      'Generate one:  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"',
  );
  process.exit(1);
}

function keyBuffer() {
  const key = Buffer.from(loadSigningKey(), "base64");
  if (key.length !== 32) {
    console.error(`SIGNING_KEY must be 32 bytes base64 (got ${key.length}).`);
    process.exit(1);
  }
  return key;
}

function hmac(input) {
  return crypto.createHmac("sha256", keyBuffer()).update(input).digest("base64url");
}

function signAttribution(registryId, itemId) {
  const encoded = Buffer.from(
    JSON.stringify({ p: "cart", r: registryId, i: itemId }),
    "utf8",
  ).toString("base64url");
  return `${encoded}.${hmac(encoded)}`;
}

function verify(token) {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const encoded = token.slice(0, dot);
  const provided = token.slice(dot + 1);
  const expected = hmac(encoded);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    return payload.p === "cart" ? payload : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

if (args[0] === "--verify") {
  const token = args[1];
  if (!token) {
    console.error("Usage: node scripts/spike-a.mjs --verify <TOKEN>");
    process.exit(1);
  }
  const payload = verify(token);
  if (payload) {
    console.log("VALID  registry=%s  item=%s", payload.r, payload.i);
  } else {
    console.log("INVALID — signature, purpose or encoding is wrong");
    process.exit(1);
  }
  process.exit(0);
}

const variantId = args[0];
const qty = Number(args[1] ?? 1) || 1;

if (!variantId || !/^\d+$/.test(variantId)) {
  console.error(
    "Usage: node scripts/spike-a.mjs <VARIANT_ID> [QTY]\n\n" +
      "Get a numeric variant id from your dev store:\n" +
      "  curl -s https://YOUR-STORE.myshopify.com/products/YOUR-HANDLE.js | head -c 400\n",
  );
  process.exit(1);
}

const REGISTRY_ID = "reg_SPIKE_A";
const ITEM_ID = "ri_SPIKE_A";
const token = signAttribution(REGISTRY_ID, ITEM_ID);

const snippet = `
// --- Spike A: add to cart with the signed attribution property -------------
await fetch('/cart/add.js', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [{
      id: ${variantId},
      quantity: ${qty},
      properties: { '_rg': '${token}' }
    }]
  })
}).then(r => r.json()).then(r => console.log('ADDED', r));

// Record the cart token on EVERY run. It is the insurance for fallback (b) in
// spike-findings-and-protocols.md — server-side reconciliation on cart_token.
await fetch('/cart.js').then(r => r.json()).then(c => {
  console.log('CART TOKEN', c.token);
  console.log('LINE PROPERTIES', c.items.map(i => i.properties));
});
`.trim();

console.log("");
console.log("Token length: %d characters", token.length);
console.log("Registry id:  %s", REGISTRY_ID);
console.log("Item id:      %s", ITEM_ID);
console.log("");
console.log("Paste this into the browser console on your store's /cart page:");
console.log("");
console.log(snippet);
console.log("");
console.log("Expected on orders/create:  line_items[].properties._rg === the token above");
console.log("Verify a captured token:    node scripts/spike-a.mjs --verify '<token>'");
console.log("");
