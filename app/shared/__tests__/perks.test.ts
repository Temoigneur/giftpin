import { describe, it, expect } from "vitest";
import { PERKS_MAX_LINES, PERK_MAX_LENGTH, cleanPerks, perkLines, registrantPerks } from "../perks";

describe("registry perks", () => {
  it("cleans what the merchant typed: bullets, blanks and length", () => {
    const text = "- Free gift wrapping\n\n  • 10% off after the event  \r\n" + "x".repeat(300);
    expect(perkLines(text)).toEqual(["Free gift wrapping", "10% off after the event", "x".repeat(PERK_MAX_LENGTH)]);
    expect(cleanPerks(Array.from({ length: 10 }, (_, i) => `Perk ${i}`).join("\n")).split("\n")).toHaveLength(PERKS_MAX_LINES);
    expect(cleanPerks(null)).toBe("");
  });

  it("shows nothing on Free", () => {
    expect(
      registrantPerks({ pro: false, registryPerks: "Free gift wrapping", completionDiscountEnabled: true, completionDiscountPercent: 15 }),
    ).toEqual([]);
  });

  it("lists the completion discount when it's on, so the two never disagree", () => {
    expect(
      registrantPerks({ pro: true, registryPerks: "Free gift wrapping", completionDiscountEnabled: true, completionDiscountPercent: 15 }),
    ).toEqual(["Free gift wrapping", "15% off our products still on your list after your event"]);
    expect(
      registrantPerks({ pro: true, registryPerks: "Free gift wrapping", completionDiscountEnabled: false, completionDiscountPercent: 15 }),
    ).toEqual(["Free gift wrapping"]);
  });

  it("doesn't add the discount twice when the merchant already wrote it", () => {
    expect(
      registrantPerks({ pro: true, registryPerks: "20% off what's left after your event", completionDiscountEnabled: true, completionDiscountPercent: 20 }),
    ).toEqual(["20% off what's left after your event"]);
  });
});
