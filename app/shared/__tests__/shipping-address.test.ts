import { describe, it, expect } from "vitest";
import { parseShippingAddressForm, toMailingAddressInput, SHIPPING_COUNTRIES } from "../shipping-address";
import { COUNTRIES } from "../retailers";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [k, v] of Object.entries(values)) data.set(k, v);
  return data;
}

const VALID = {
  firstName: " Maya ",
  lastName: "Chen",
  address1: "1 Main St",
  city: "Toronto",
  countryCode: "ca",
  provinceCode: "on",
  zip: "m5v 1a1",
};

describe("parseShippingAddressForm", () => {
  it("returns a trimmed, upper-cased address ready for orderUpdate", () => {
    expect(parseShippingAddressForm(form(VALID))).toEqual({
      address: {
        firstName: "Maya",
        lastName: "Chen",
        address1: "1 Main St",
        city: "Toronto",
        countryCode: "CA",
        provinceCode: "ON",
        zip: "M5V 1A1",
      },
    });
  });

  it("keeps the optional apartment line and phone only when given", () => {
    const result = parseShippingAddressForm(form({ ...VALID, address2: "Unit 4", phone: "416 555 0100" }));
    expect(result).toMatchObject({ address: { address2: "Unit 4", phone: "416 555 0100" } });
  });

  it("rejects a half-filled address rather than writing it onto an order", () => {
    expect(parseShippingAddressForm(form({ ...VALID, address1: "  " }))).toEqual({ error: "missing" });
    expect(parseShippingAddressForm(form({ ...VALID, zip: "" }))).toEqual({ error: "missing" });
  });

  it("requires a province that belongs to the chosen country", () => {
    expect(parseShippingAddressForm(form({ ...VALID, provinceCode: "" }))).toEqual({ error: "region" });
    expect(parseShippingAddressForm(form({ ...VALID, provinceCode: "NY" }))).toEqual({ error: "region" });
  });

  it("needs no province for the UK", () => {
    const result = parseShippingAddressForm(form({ ...VALID, countryCode: "GB", provinceCode: "", zip: "sw1a 1aa" }));
    expect(result).toEqual({ address: expect.not.objectContaining({ provinceCode: expect.anything() }) });
  });

  it("rejects a country the form doesn't offer", () => {
    expect(parseShippingAddressForm(form({ ...VALID, countryCode: "JP" }))).toEqual({ error: "country" });
  });

  it("offers the same 13 countries as the registry country list", () => {
    expect(SHIPPING_COUNTRIES.map((c) => c.code).sort()).toEqual(COUNTRIES.map((c) => c.code).sort());
  });

  it("needs no region for France but does for Spain", () => {
    expect(parseShippingAddressForm(form({ ...VALID, countryCode: "FR", provinceCode: "", zip: "75001" }))).toHaveProperty("address");
    expect(parseShippingAddressForm(form({ ...VALID, countryCode: "ES", provinceCode: "", zip: "08001" }))).toEqual({ error: "region" });
    expect(parseShippingAddressForm(form({ ...VALID, countryCode: "ES", provinceCode: "B", zip: "08001" }))).toHaveProperty("address");
  });
});

describe("toMailingAddressInput", () => {
  it("drops unknown keys and renames the output-only countryCodeV2", () => {
    expect(toMailingAddressInput({ address1: "1 Main St", countryCodeV2: "CA", junk: "x" })).toEqual({
      address1: "1 Main St",
      countryCode: "CA",
    });
  });
});
