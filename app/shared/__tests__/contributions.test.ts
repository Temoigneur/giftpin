import { describe, it, expect } from "vitest";
import {
  cleanContributionVariants,
  fundState,
  giftCardRecipientProperties,
  isContributionLine,
} from "../contributions";

/**
 * Group gifting and cash funds (SPIKE-C.md). The dangerous mistakes here are
 * the ones that make an item look available when it isn't (CLAUDE.md hard
 * rule 5): a chip-in counted as a whole unit, or a real purchase of the item
 * counted as a mere chip-in.
 */

const internal = { sourceType: "internal", variantGid: "gid://shopify/ProductVariant/111" };
const fund = { sourceType: "fund", variantGid: null };

describe("isContributionLine", () => {
  it("counts anything credited to a fund as money toward it", () => {
    expect(isContributionLine(fund, { giftCard: false, variantId: "999" })).toBe(true);
    expect(isContributionLine(fund, { giftCard: true, variantId: "555" })).toBe(true);
  });

  it("treats a gift card line on a store item as a chip-in", () => {
    expect(isContributionLine(internal, { giftCard: true, variantId: "555" })).toBe(true);
  });

  it("falls back to the configured contribution variants when gift_card is missing", () => {
    expect(isContributionLine(internal, { giftCard: false, variantId: "555" }, new Set(["555"]))).toBe(true);
  });

  it("counts buying the item itself as a purchase, even when the item is a gift card", () => {
    // A registrant listed "a $50 gift card" as an ordinary item. Buying it is
    // buying it, not chipping in.
    expect(isContributionLine(internal, { giftCard: true, variantId: "111" })).toBe(false);
  });

  it("keeps today's behaviour for ordinary product lines", () => {
    expect(isContributionLine(internal, { giftCard: false, variantId: "111" })).toBe(false);
    expect(isContributionLine(internal, { giftCard: false, variantId: "222" })).toBe(false);
  });
});

describe("fundState", () => {
  it("is null when the item takes no chip-ins", () => {
    expect(fundState(null, 0)).toBeNull();
    expect(fundState(undefined, 0)).toBeNull();
    expect(fundState("0", 0)).toBeNull();
  });

  it("reads Prisma Decimal-like strings", () => {
    expect(fundState("1200.00", "340.00")).toEqual({
      goal: 1200,
      funded: 340,
      percent: 28,
      remaining: 860,
      complete: false,
    });
  });

  it("is complete at exactly the goal, and caps the bar when over-funded", () => {
    expect(fundState(500, 500)?.complete).toBe(true);
    const over = fundState(500, 650)!;
    expect(over.complete).toBe(true);
    expect(over.percent).toBe(100);
    expect(over.remaining).toBe(0);
  });
});

describe("cleanContributionVariants", () => {
  it("strips gids, drops junk and duplicates, sorts by amount", () => {
    expect(
      cleanContributionVariants([
        { id: "gid://shopify/ProductVariant/3", amount: "100.00" },
        { id: "1", amount: 25 },
        { id: "1", amount: 25 },
        { id: "nope", amount: 50 },
        { id: "4", amount: 0 },
        { id: "2", amount: "50" },
      ]),
    ).toEqual([
      { id: "1", amount: 25 },
      { id: "2", amount: 50 },
      { id: "3", amount: 100 },
    ]);
    expect(cleanContributionVariants("not a list")).toEqual([]);
  });
});

describe("giftCardRecipientProperties", () => {
  it("uses Shopify's recipient property names and trims the message to 200 chars", () => {
    const props = giftCardRecipientProperties({
      email: "couple@example.com",
      name: "Sam & Alex",
      message: `  ${"x".repeat(250)}  `,
    });
    expect(props["Recipient email"]).toBe("couple@example.com");
    expect(props["Recipient name"]).toBe("Sam & Alex");
    expect(props.__shopify_send_gift_card_to_recipient).toBe("true");
    expect(props.Message).toHaveLength(200);
  });

  it("omits an empty message", () => {
    expect(giftCardRecipientProperties({ email: "a@b.co", name: "Sam", message: "  " })).not.toHaveProperty("Message");
  });
});
