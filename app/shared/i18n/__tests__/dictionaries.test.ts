import { describe, expect, it } from "vitest";
import { LOCALES, __testables } from "../index";

const { DICTIONARIES } = __testables;
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("translations", () => {
  const en = DICTIONARIES.en as Record<string, string>;
  for (const locale of LOCALES.filter((l) => l !== "en")) {
    const dict = DICTIONARIES[locale] as Record<string, string>;
    it(`${locale} has exactly the English keys`, () => {
      expect(Object.keys(dict).sort()).toEqual(Object.keys(en).sort());
    });
    it(`${locale} keeps every {placeholder} and no empty text`, () => {
      for (const [key, text] of Object.entries(dict)) {
        expect(text.trim(), key).not.toBe("");
        expect(placeholders(text), key).toEqual(placeholders(en[key]));
      }
    });
  }
});
