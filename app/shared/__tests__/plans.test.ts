import { describe, expect, it } from "vitest";
import {
  FOUNDING_OFFER_SHORTENED_AT,
  FOUNDING_OFFER_SLOTS,
  FOUNDING_OFFER_STARTS_AT,
  foundingTrialDays,
  isFoundingSlot,
} from "../plans";

describe("founding offer", () => {
  it("has 11 spots (10 plus the one Ben used to demo Pro)", () => {
    expect(FOUNDING_OFFER_SLOTS).toBe(11);
    expect(isFoundingSlot(FOUNDING_OFFER_SHORTENED_AT, 10)).toBe(true);
    expect(isFoundingSlot(FOUNDING_OFFER_SHORTENED_AT, 11)).toBe(false);
  });

  it("keeps the free year for stores installed before the change, even if they upgrade later", () => {
    expect(foundingTrialDays(FOUNDING_OFFER_STARTS_AT)).toBe(365);
    expect(foundingTrialDays(new Date(FOUNDING_OFFER_SHORTENED_AT.getTime() - 1))).toBe(365);
  });

  it("gives stores installed from the change on 180 days", () => {
    expect(foundingTrialDays(FOUNDING_OFFER_SHORTENED_AT)).toBe(180);
    expect(foundingTrialDays(new Date("2026-12-01T00:00:00Z"))).toBe(180);
  });
});
