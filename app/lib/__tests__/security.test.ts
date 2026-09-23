import { describe, it, expect, beforeAll } from "vitest";
import crypto from "node:crypto";
import {
  encrypt,
  decrypt,
  tryDecrypt,
  signToken,
  verifyToken,
  blindIndex,
  randomSlug,
  hashPassword,
  verifyPassword,
} from "../crypto.server";
import { computeProxySignature, authenticateProxyRequest, ProxyAuthError } from "../proxy.server";
import { escapeHtml, jsonForScript } from "../../proxy/render/layout";

const SECRET = "test-shared-secret";

beforeAll(() => {
  process.env.SHOPIFY_API_SECRET = SECRET;
});

describe("encryption at rest", () => {
  it("round-trips", () => {
    const plaintext = "sam@example.com";
    expect(decrypt(encrypt(plaintext))).toBe(plaintext);
  });

  it("produces a different ciphertext every time", () => {
    // A deterministic ciphertext would let anyone with database access tell
    // which registrants share an email address.
    expect(encrypt("same")).not.toBe(encrypt("same"));
  });

  it("refuses to decrypt tampered ciphertext", () => {
    const payload = encrypt("secret");
    const parts = payload.split(".");
    parts[3] = Buffer.from("tampered").toString("base64url");
    expect(() => decrypt(parts.join("."))).toThrow();
  });

  it("tryDecrypt returns null instead of throwing, so one bad row can't 500 a page", () => {
    expect(tryDecrypt("garbage")).toBeNull();
    expect(tryDecrypt(null)).toBeNull();
    expect(tryDecrypt(encrypt("fine"))).toBe("fine");
  });

  it("blind index is deterministic and case-insensitive", () => {
    expect(blindIndex("Sam@Example.com ")).toBe(blindIndex("sam@example.com"));
    expect(blindIndex("a@b.com")).not.toBe(blindIndex("c@d.com"));
  });
});

describe("signed tokens", () => {
  it("enforces purpose separation", () => {
    const token = signToken({ p: "manage", r: "reg_1" });
    expect(verifyToken(token, "manage")).toMatchObject({ r: "reg_1" });
    expect(verifyToken(token, "cart")).toBeNull();
    expect(verifyToken(token, "claim")).toBeNull();
  });

  it("enforces expiry", () => {
    const expired = signToken({ p: "manage", r: "reg_1" }, -10);
    expect(verifyToken(expired, "manage")).toBeNull();

    const live = signToken({ p: "manage", r: "reg_1" }, 60);
    expect(verifyToken(live, "manage")).toMatchObject({ r: "reg_1" });
  });

  it("rejects a signature from a different key", () => {
    const token = signToken({ p: "manage", r: "reg_1" });
    const body = token.split(".")[0];
    const forged = crypto.createHmac("sha256", "wrong-key").update(body).digest("base64url");
    expect(verifyToken(`${body}.${forged}`, "manage")).toBeNull();
  });
});

describe("passwords", () => {
  it("verifies a correct password and rejects a wrong one", () => {
    const stored = hashPassword("our-wedding-2027");
    expect(verifyPassword("our-wedding-2027", stored)).toBe(true);
    expect(verifyPassword("wrong", stored)).toBe(false);
  });

  it("salts, so two identical passwords hash differently", () => {
    expect(hashPassword("same")).not.toBe(hashPassword("same"));
  });

  it("rejects a malformed stored value rather than throwing", () => {
    expect(verifyPassword("x", "nonsense")).toBe(false);
    expect(verifyPassword("x", "")).toBe(false);
  });
});

describe("registry slugs", () => {
  it("is unguessable and free of lookalike characters", () => {
    const slug = randomSlug(12);
    expect(slug).toHaveLength(12);
    expect(slug).toMatch(/^[a-z2-9]+$/);
    // No 0/o/1/l/i — these get read aloud and retyped.
    expect(slug).not.toMatch(/[01lio]/);
  });

  it("does not collide across a large sample", () => {
    const slugs = new Set(Array.from({ length: 5000 }, () => randomSlug(12)));
    expect(slugs.size).toBe(5000);
  });
});

// ---------------------------------------------------------------------------
// App proxy
// ---------------------------------------------------------------------------

function signedProxyUrl(params: Record<string, string>, path = "/proxy/r/abc123"): string {
  const query = new URLSearchParams(params);
  const signature = computeProxySignature(query, SECRET);
  query.set("signature", signature);
  return `https://app.example.com${path}?${query.toString()}`;
}

function baseParams(overrides: Record<string, string> = {}) {
  return {
    shop: "demo-store.myshopify.com",
    path_prefix: "/apps/registry",
    timestamp: String(Math.floor(Date.now() / 1000)),
    logged_in_customer_id: "",
    ...overrides,
  };
}

describe("app proxy authentication", () => {
  it("computes a signature matching Shopify's documented scheme", () => {
    // Sorted, `key=value`, array values comma-joined, concatenated with NO
    // separator — not a normal query string. Getting this wrong fails open.
    const query = new URLSearchParams("extra=1&extra=2&shop=x.myshopify.com&timestamp=1317327555");
    const expected = crypto
      .createHmac("sha256", SECRET)
      .update("extra=1,2shop=x.myshopify.comtimestamp=1317327555")
      .digest("hex");
    expect(computeProxySignature(query, SECRET)).toBe(expected);
  });

  it("accepts a correctly signed request", () => {
    const ctx = authenticateProxyRequest(new Request(signedProxyUrl(baseParams())));
    expect(ctx.shop).toBe("demo-store.myshopify.com");
    expect(ctx.path).toBe("r/abc123");
    expect(ctx.loggedInCustomerId).toBeNull();
  });

  it("rejects a missing or wrong signature", () => {
    const unsigned = `https://app.example.com/proxy/r/x?${new URLSearchParams(baseParams())}`;
    expect(() => authenticateProxyRequest(new Request(unsigned))).toThrow(ProxyAuthError);

    const query = new URLSearchParams(baseParams());
    query.set("signature", "0".repeat(64));
    expect(() =>
      authenticateProxyRequest(new Request(`https://app.example.com/proxy/r/x?${query}`)),
    ).toThrow(ProxyAuthError);
  });

  it("rejects a request whose parameters were tampered with after signing", () => {
    const url = new URL(signedProxyUrl(baseParams()));
    url.searchParams.set("shop", "attacker.myshopify.com");
    expect(() => authenticateProxyRequest(new Request(url.toString()))).toThrow(ProxyAuthError);
  });

  it("rejects a replayed request from hours ago", () => {
    const stale = baseParams({ timestamp: String(Math.floor(Date.now() / 1000) - 7200) });
    expect(() => authenticateProxyRequest(new Request(signedProxyUrl(stale)))).toThrow(ProxyAuthError);
  });

  it("rejects a malformed shop domain", () => {
    const bad = baseParams({ shop: "evil.com" });
    expect(() => authenticateProxyRequest(new Request(signedProxyUrl(bad)))).toThrow(ProxyAuthError);
  });

  it("reads logged_in_customer_id when present", () => {
    const ctx = authenticateProxyRequest(
      new Request(signedProxyUrl(baseParams({ logged_in_customer_id: "9001" }))),
    );
    expect(ctx.loggedInCustomerId).toBe("9001");
  });

  it("honours a merchant-renamed path prefix", () => {
    // Merchants can rename this in their admin, so nothing may hardcode it.
    const ctx = authenticateProxyRequest(
      new Request(signedProxyUrl(baseParams({ path_prefix: "/apps/gift-list" }))),
    );
    expect(ctx.pathPrefix).toBe("/apps/gift-list");
  });
});

// ---------------------------------------------------------------------------
// Output escaping — the guest page interpolates registrant-supplied strings
// ---------------------------------------------------------------------------

describe("HTML escaping", () => {
  it("neutralises a script tag in a registry title", () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
    );
  });

  it("escapes attribute-breaking quotes", () => {
    expect(escapeHtml(`" onload="evil()`)).toBe("&quot; onload=&quot;evil()");
  });

  it("handles null and undefined without printing them", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });

  it("prevents a </script> breakout in inline JSON", () => {
    const payload = jsonForScript({ title: "</script><script>alert(1)</script>" });
    expect(payload).not.toContain("</script>");
    expect(JSON.parse(payload).title).toBe("</script><script>alert(1)</script>");
  });
});
