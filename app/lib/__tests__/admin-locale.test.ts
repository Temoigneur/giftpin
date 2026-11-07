import { describe, expect, it } from "vitest";
import { adminLocale } from "../admin-locale.server";

const req = (url: string, acceptLanguage?: string) =>
  new Request(url, { headers: acceptLanguage ? { "accept-language": acceptLanguage } : {} });

describe("adminLocale", () => {
  it("uses Shopify's locale parameter first", () => {
    expect(adminLocale(req("https://x.test/app?locale=fr", "de"))).toBe("fr");
  });

  it("maps regional Shopify locales to ours", () => {
    expect(adminLocale(req("https://x.test/app?locale=pt-PT"))).toBe("pt-BR");
    expect(adminLocale(req("https://x.test/app?locale=fr-CA"))).toBe("fr");
    expect(adminLocale(req("https://x.test/app?locale=es-MX"))).toBe("es");
  });

  it("falls back to Accept-Language, highest q first", () => {
    expect(adminLocale(req("https://x.test/app", "en;q=0.5, de;q=0.9"))).toBe("de");
  });

  it("skips languages it doesn't have and takes the next supported one", () => {
    expect(adminLocale(req("https://x.test/app", "ja, es;q=0.8"))).toBe("es");
  });

  it("stops at English when it outranks anything supported", () => {
    expect(adminLocale(req("https://x.test/app", "en-GB, fr;q=0.5"))).toBe("en");
  });

  it("is English with no signal at all", () => {
    expect(adminLocale(req("https://x.test/app"))).toBe("en");
    expect(adminLocale(req("https://x.test/app?locale=xx"))).toBe("en");
  });
});

describe("adminLocale with a store language", () => {
  it("uses the store's language over Shopify's and the browser's", () => {
    expect(adminLocale(req("https://x.test/app?locale=fr", "es"), "de")).toBe("de");
  });

  it("treats English as no choice, so the Shopify admin language still applies", () => {
    expect(adminLocale(req("https://x.test/app?locale=fr"), "en")).toBe("fr");
  });
});
