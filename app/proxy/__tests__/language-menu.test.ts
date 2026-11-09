import { describe, expect, it } from "vitest";
import { languageMenuHtml, withLanguageMenu } from "../language-menu";
import { LOCALES, currentLocale } from "../../shared/i18n";
import { withLocale, overrideLocale } from "../../lib/i18n.server";

const base = { pathPrefix: "/apps/registry", path: "r/abc", current: "fr" as const, label: "Langue" };

describe("language menu", () => {
  it("links every other language to the same page, and drops Shopify's signing params", () => {
    const q = new URLSearchParams("shop=x.myshopify.com&timestamp=1&signature=s&path_prefix=%2Fapps%2Fregistry&src=registry&lang=de");
    const html = languageMenuHtml({ ...base, query: q });
    expect(html).toContain('href="/apps/registry/r/abc?src=registry&amp;lang=ja"');
    expect(html).not.toMatch(/signature|timestamp|myshopify/);
    expect((html.match(/<a /g) ?? []).length).toBe(LOCALES.length - 1);
    expect(html).toContain('<b lang="fr">Français</b>');
  });

  it("handles the shop's root page", () => {
    const html = languageMenuHtml({ ...base, path: "", query: new URLSearchParams() });
    expect(html).toContain('href="/apps/registry?lang=en"');
  });

  it("sits inside the footer, and pages without one are untouched", () => {
    expect(withLanguageMenu("<footer><p>x</p></footer>", "<p>M</p>")).toBe("<footer><p>x</p><p>M</p>\n</footer>");
    expect(withLanguageMenu("<main>no footer</main>", "<p>M</p>")).toBe("<main>no footer</main>");
  });
});

describe("a visitor's ?lang", () => {
  it("is not overridden by the registry's own language", () => {
    withLocale("en", () => { overrideLocale("fr"); expect(currentLocale()).toBe("fr"); });
    withLocale("ja", () => { overrideLocale("fr"); expect(currentLocale()).toBe("ja"); }, true);
  });
});
