import { describe, it, expect } from "vitest";
import { renderCreatePage } from "../create-page";
import { renderManagePage, type ManagePageData } from "../manage-page";
import { withLocale, overrideLocale } from "../../../lib/i18n.server";
import { registryLanguageFrom, currentLocale } from "../../../shared/i18n";

const base = { shopName: "Maple", accentColor: "#000", actionUrl: "/apps/registry", enabledEventTypes: ["wedding"] };

function manage(extra: Partial<ManagePageData> = {}): string {
  return renderManagePage({
    registryId: "r", title: "T", message: null, eventType: "wedding", eventDate: null, privacy: "unlisted",
    items: [], shopName: "Maple", accentColor: "#000", currency: "CAD", shareUrl: "https://x/r/a", actionUrl: "/a",
    token: "t", manageUrl: "https://x/m?t=t", externalItemsAllowed: true, storeSearchUrl: "/c", gifts: [], ...extra,
  });
}

describe("registryLanguageFrom", () => {
  it("is null unless the store allows a choice", () => {
    expect(registryLanguageFrom("fr", "en", false)).toBeNull();
  });
  it("is null for the store's own language, unknown values and blanks", () => {
    expect(registryLanguageFrom("en", "en", true)).toBeNull();
    expect(registryLanguageFrom("klingon", "en", true)).toBeNull();
    expect(registryLanguageFrom("", "en", true)).toBeNull();
  });
  it("keeps a different, valid language", () => {
    expect(registryLanguageFrom("pt-BR", "en", true)).toBe("pt-BR");
  });
});

describe("language picker", () => {
  it("is on the create page only when the store allows a choice", () => {
    expect(renderCreatePage(base)).not.toContain('name="language"');
    const html = renderCreatePage({ ...base, languageChoice: "es" });
    expect(html).toContain('name="language"');
    expect(html).toContain('<option value="es" selected>');
  });
  it("is on the manage page only when the store allows a choice, preselecting the registry's language", () => {
    expect(manage()).not.toContain('name="language"');
    const html = manage({ languageChoice: true, language: "de" });
    expect(html).toContain('<option value="de" selected>');
  });
});

describe("overrideLocale", () => {
  it("switches the rest of the request, and only that request", async () => {
    const a = withLocale("en", async () => {
      overrideLocale("fr");
      await new Promise((r) => setTimeout(r, 5));
      return currentLocale();
    });
    const b = withLocale("de", async () => {
      await new Promise((r) => setTimeout(r, 1));
      return currentLocale();
    });
    expect(await a).toBe("fr");
    expect(await b).toBe("de");
  });
  it("ignores a blank language and does nothing outside a request", () => {
    withLocale("es", () => {
      overrideLocale(null);
      expect(currentLocale()).toBe("es");
    });
    expect(() => overrideLocale("fr")).not.toThrow();
  });
});
