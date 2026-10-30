import { describe, it, expect } from "vitest";
import { EVENT_TYPES, OPT_IN_EVENT_TYPES, isDatelessOccasion, listNoun, mergeSettings } from "../settings";

/**
 * `eventTypes` is an explicit allow-list, so occasions added after a merchant
 * saved their settings must still switch on (24 Sep 2026), while occasions
 * the merchant saw and unticked stay off.
 */
describe("mergeSettings event types", () => {
  const all = EVENT_TYPES.map((t) => t.value);

  it("enables every occasion except the opt-in ones for a shop that never saved settings", () => {
    expect(mergeSettings({}).eventTypes).toEqual(all.filter((v) => !OPT_IN_EVENT_TYPES.includes(v)));
    expect(mergeSettings({}).eventTypes).not.toContain("wishlist");
  });

  it("never switches on the wish list occasion for an existing shop", () => {
    expect(mergeSettings({ eventTypes: ["wedding"] }).eventTypes).not.toContain("wishlist");
    const known = all.filter((v) => v !== "wishlist");
    expect(mergeSettings({ eventTypes: known, eventTypesKnown: known }).eventTypes).not.toContain("wishlist");
  });

  it("keeps the wish list occasion on once a merchant ticks it", () => {
    expect(mergeSettings({ eventTypes: ["wishlist"], eventTypesKnown: all }).eventTypes).toEqual(["wishlist"]);
  });

  it("switches on occasions added since a pre-existing shop last saved", () => {
    const { eventTypes } = mergeSettings({ eventTypes: ["wedding"] });
    expect(eventTypes).toContain("wedding");
    expect(eventTypes).toContain("engagement");
    expect(eventTypes).toContain("retirement");
    // Existed before, so the merchant chose to switch it off.
    expect(eventTypes).not.toContain("birthday");
    expect(eventTypes).not.toContain("baby");
  });

  it("keeps an occasion off once the merchant has seen it and unticked it", () => {
    const { eventTypes } = mergeSettings({ eventTypes: ["wedding"], eventTypesKnown: all });
    expect(eventTypes).toEqual(["wedding"]);
  });
});

describe("wish list occasion", () => {
  it("has no date and is called a wish list", () => {
    expect(isDatelessOccasion("wishlist")).toBe(true);
    expect(isDatelessOccasion("holiday")).toBe(false);
    expect(listNoun("wishlist")).toBe("wish list");
    expect(listNoun("wedding")).toBe("registry");
    expect(listNoun(undefined)).toBe("registry");
  });
});
