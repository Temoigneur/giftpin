import { describe, expect, it } from "vitest";
import { languageForCountry } from "../store-language.server";

describe("languageForCountry", () => {
  it("maps single-language countries to a supported language", () => {
    expect(languageForCountry("DE")).toBe("de");
    expect(languageForCountry("fr")).toBe("fr");
    expect(languageForCountry("MX")).toBe("es");
    expect(languageForCountry("BR")).toBe("pt-BR");
    expect(languageForCountry("JP")).toBe("ja");
    expect(languageForCountry("cn")).toBe("zh-CN");
    expect(languageForCountry("TW")).toBe("zh-TW");
  });

  it("leaves multi-language and English countries alone", () => {
    for (const c of ["CA", "CH", "BE", "US", "GB", "IN", "HK", "SG", "AU", null, undefined, ""]) {
      expect(languageForCountry(c)).toBeNull();
    }
  });
});
