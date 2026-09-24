import { describe, it, expect } from "vitest";
import {
  attributedLines,
  contributionCartPayload,
  signAttribution,
  verifyAttribution,
  ATTRIBUTION_PROPERTY,
} from "../attribution";
import { toContributionProduct } from "../contribution-product.server";
import { contributionValue } from "../../shared/contributions";

/** Group gifting (SPIKE-C.md): the cart line and the webhook side of a chip-in. */

describe("contributionCartPayload", () => {
  it("puts the same verifiable _rg token on one gift card line, and never _rg_ship", () => {
    const payload = contributionCartPayload("555", "reg_1", "item_1", null);
    expect(payload.items).toHaveLength(1);
    const [line] = payload.items;
    expect(line).toMatchObject({ id: "555", quantity: 1 });
    expect(verifyAttribution(line.properties[ATTRIBUTION_PROPERTY])).toEqual({ r: "reg_1", i: "item_1" });
    expect(line.properties).not.toHaveProperty("_rg_ship");
    expect(line.properties).not.toHaveProperty("Recipient email");
  });

  it("adds recipient properties only when given them", () => {
    const payload = contributionCartPayload("555", "reg_1", "item_1", { "Recipient email": "c@example.com" });
    expect(payload.items[0].properties["Recipient email"]).toBe("c@example.com");
  });
});

describe("attributedLines on a gift card line", () => {
  it("carries the variant id and the gift_card flag through", () => {
    const [line] = attributedLines([
      {
        id: 1,
        quantity: 2,
        price: "25.00",
        variant_id: 555,
        gift_card: true,
        properties: [{ name: ATTRIBUTION_PROPERTY, value: signAttribution("reg_1", "item_1") }],
      },
    ]);
    expect(line).toMatchObject({ variantId: "555", giftCard: true, amount: "50.00", quantity: 2 });
  });

  it("defaults to not-a-gift-card when the field is absent", () => {
    const [line] = attributedLines([
      { id: 1, quantity: 1, properties: [{ name: ATTRIBUTION_PROPERTY, value: signAttribution("r", "i") }] },
    ]);
    expect(line.giftCard).toBe(false);
    expect(line.variantId).toBeNull();
  });
});

describe("contributionValue", () => {
  const variants = [{ id: "555", amount: 25 }];

  it("uses the order's own line amount", () => {
    expect(contributionValue({ amount: "50.00", quantity: 2, variantId: "555" }, variants)).toBe("50.00");
  });

  it("falls back to the configured denomination when the payload has no price", () => {
    expect(contributionValue({ amount: null, quantity: 3, variantId: "555" }, variants)).toBe("75.00");
    expect(contributionValue({ amount: null, quantity: 1, variantId: "999" }, variants)).toBeNull();
  });
});

describe("toContributionProduct", () => {
  it("refuses anything that isn't a gift card, so a normal product can't be picked", () => {
    expect(
      toContributionProduct({
        id: "gid://shopify/Product/1",
        title: "Mug",
        isGiftCard: false,
        variants: { nodes: [{ id: "gid://shopify/ProductVariant/9", price: "25.00" }] },
      }),
    ).toBeNull();
  });

  it("maps denominations from variant prices", () => {
    expect(
      toContributionProduct({
        id: "gid://shopify/Product/2",
        title: "Registry contribution",
        isGiftCard: true,
        variants: {
          nodes: [
            { id: "gid://shopify/ProductVariant/12", price: "100.00" },
            { id: "gid://shopify/ProductVariant/11", price: "25.00" },
          ],
        },
      }),
    ).toEqual({
      productGid: "gid://shopify/Product/2",
      title: "Registry contribution",
      variants: [
        { id: "11", amount: 25 },
        { id: "12", amount: 100 },
      ],
    });
  });
});
