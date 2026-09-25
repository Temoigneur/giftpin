import { describe, it, expect } from "vitest";
import { signToken } from "../crypto.server";
import {
  signAttribution,
  verifyAttribution,
  attributedLines,
  readLineProperty,
  cartAddPayload,
  ATTRIBUTION_PROPERTY,
} from "../attribution";

/**
 * Attribution is the one thing in this app that must never be wrong. A registry
 * that undercounts produces a duplicate gift; one that overcounts tells a guest
 * something is taken when it isn't. Both are the failure the product exists to
 * prevent, so this file is deliberately paranoid.
 */

describe("signed cart tokens", () => {
  it("round-trips a registry and item id", () => {
    const token = signAttribution("reg_1", "item_1");
    expect(verifyAttribution(token)).toEqual({ r: "reg_1", i: "item_1" });
  });

  it("rejects a tampered payload", () => {
    const token = signAttribution("reg_1", "item_1");
    const [body, sig] = token.split(".");
    const forged = Buffer.from(
      JSON.stringify({ p: "cart", r: "reg_ATTACKER", i: "item_1" }),
      "utf8",
    ).toString("base64url");

    // This is the actual attack: a guest edits the cart property to credit a
    // different registry, inflating someone's numbers or claiming a gift.
    expect(verifyAttribution(`${forged}.${sig}`)).toBeNull();
    expect(body).not.toEqual(forged);
  });

  it("rejects a truncated or empty token", () => {
    expect(verifyAttribution("")).toBeNull();
    expect(verifyAttribution(null)).toBeNull();
    expect(verifyAttribution("nodot")).toBeNull();
    expect(verifyAttribution(".")).toBeNull();
  });

  it("rejects a token minted for a different purpose", () => {
    // A magic-link token must never work as a cart token, or a leaked share
    // link becomes a way to forge purchases.
    const manageToken = signToken({ p: "manage", r: "reg_1" });
    expect(verifyAttribution(manageToken)).toBeNull();
  });

  it("does not expire — carts sit for weeks", () => {
    const token = signAttribution("reg_1", "item_1");
    const payload = JSON.parse(Buffer.from(token.split(".")[0], "base64url").toString());
    expect(payload.e).toBeUndefined();
  });
});

describe("reading line item properties", () => {
  it("handles the array shape REST webhooks send", () => {
    const line = { id: 1, quantity: 1, properties: [{ name: "_rg", value: "abc" }] };
    expect(readLineProperty(line, "_rg")).toBe("abc");
  });

  it("handles the object shape", () => {
    const line = { id: 1, quantity: 1, properties: { _rg: "abc" } };
    expect(readLineProperty(line, "_rg")).toBe("abc");
  });

  it("returns null for missing or malformed properties", () => {
    expect(readLineProperty({ id: 1, quantity: 1 }, "_rg")).toBeNull();
    expect(readLineProperty({ id: 1, quantity: 1, properties: null }, "_rg")).toBeNull();
    expect(readLineProperty({ id: 1, quantity: 1, properties: [] }, "_rg")).toBeNull();
  });
});

describe("attributedLines", () => {
  const token = signAttribution("reg_1", "item_1");

  it("extracts a registry line and computes line total", () => {
    const lines = attributedLines([
      { id: 111, quantity: 2, price: "24.50", properties: [{ name: ATTRIBUTION_PROPERTY, value: token }] },
    ]);

    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      lineItemId: "111",
      registryId: "reg_1",
      itemId: "item_1",
      quantity: 2,
      amount: "49.00",
    });
  });

  it("ignores the guest's own non-registry items in a mixed cart", () => {
    // The normal case: a guest buys the gift and something for themselves.
    const lines = attributedLines([
      { id: 1, quantity: 1, price: "10.00", properties: [{ name: ATTRIBUTION_PROPERTY, value: token }] },
      { id: 2, quantity: 3, price: "99.00" },
      { id: 3, quantity: 1, price: "5.00", properties: [{ name: "engraving", value: "Sam" }] },
    ]);

    expect(lines).toHaveLength(1);
    expect(lines[0].lineItemId).toBe("1");
  });

  it("keeps two different registries on two lines separate", () => {
    const other = signAttribution("reg_2", "item_9");
    const lines = attributedLines([
      { id: 1, quantity: 1, properties: [{ name: ATTRIBUTION_PROPERTY, value: token }] },
      { id: 2, quantity: 1, properties: [{ name: ATTRIBUTION_PROPERTY, value: other }] },
    ]);

    expect(lines.map((l) => l.registryId)).toEqual(["reg_1", "reg_2"]);
  });

  it("drops lines whose token does not verify", () => {
    const lines = attributedLines([
      { id: 1, quantity: 1, properties: [{ name: ATTRIBUTION_PROPERTY, value: "garbage.sig" }] },
    ]);
    expect(lines).toHaveLength(0);
  });

  it("drops lines with a nonsensical quantity", () => {
    expect(
      attributedLines([
        { id: 1, quantity: 0, properties: [{ name: ATTRIBUTION_PROPERTY, value: token }] },
        { id: 2, quantity: -3, properties: [{ name: ATTRIBUTION_PROPERTY, value: token }] },
      ]),
    ).toHaveLength(0);
  });

  it("survives a missing price rather than inventing one", () => {
    const lines = attributedLines([
      { id: 1, quantity: 1, properties: [{ name: ATTRIBUTION_PROPERTY, value: token }] },
    ]);
    expect(lines[0].amount).toBeNull();
  });

  it("returns an empty array for an order with no line items", () => {
    expect(attributedLines(undefined)).toEqual([]);
    expect(attributedLines(null)).toEqual([]);
    expect(attributedLines([])).toEqual([]);
  });

  it("reads the ship-to-registrant flag", () => {
    const lines = attributedLines([
      {
        id: 1,
        quantity: 1,
        properties: [
          { name: ATTRIBUTION_PROPERTY, value: token },
          { name: "_rg_ship", value: "1" },
        ],
      },
    ]);
    expect(lines[0].shipToRegistrant).toBe(true);
  });
});

describe("cartAddPayload", () => {
  it("builds a payload Shopify's /cart/add.js accepts", () => {
    const payload = cartAddPayload("40000001", 2, "reg_1", "item_1");

    expect(payload.items).toHaveLength(1);
    expect(payload.items[0].id).toBe("40000001");
    expect(payload.items[0].quantity).toBe(2);
    // The leading underscore asks the theme to hide it. That is a convention,
    // not a platform guarantee — see the note in attribution.ts and row 15 of
    // SPIKE-A.md. What this asserts is that we send exactly one property.
    expect(Object.keys(payload.items[0].properties)).toEqual(["_rg"]);
    expect(verifyAttribution(payload.items[0].properties._rg)).toEqual({
      r: "reg_1",
      i: "item_1",
    });
  });

  it("only adds the ship flag when asked", () => {
    expect(cartAddPayload("1", 1, "r", "i").items[0].properties._rg_ship).toBeUndefined();
    expect(cartAddPayload("1", 1, "r", "i", true).items[0].properties._rg_ship).toBe("1");
  });

  it("names who the gift ships to in a visible line property, never the address", () => {
    const props = cartAddPayload("1", 1, "r", "i", true, "Maya & Jared").items[0].properties;
    expect(props["Gift ships to"]).toBe("Maya & Jared (their address, added after you order)");
    expect(cartAddPayload("1", 1, "r", "i", false, "Maya & Jared").items[0].properties["Gift ships to"]).toBeUndefined();
  });
});
