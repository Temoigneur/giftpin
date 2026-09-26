import { describe, it, expect } from "vitest";
import { EVENT_TYPES, mergeSettings } from "../settings";

/**
 * `eventTypes` is an explicit allow-list, so occasions added after a merchant
 * saved their settings must still switch on (24 Sep 2026), while occasions
 * the merchant saw and unticked stay off.
 */
describe("mergeSettings event types", () => {
  const all = EVENT_TYPES.map((t) => t.value);

  it("enables every occasion for a shop that never saved settings", () => {
    expect(mergeSettings({}).eventTypes).toEqual(all);
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
