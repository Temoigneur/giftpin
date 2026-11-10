import { describe, expect, it } from "vitest";
import { GUIDE_COPY } from "../guide-copy";
import type { GuideDoc } from "../guide-copy";
import { LOCALES, hasMessage, type Locale } from "../../shared/i18n";
import { loader as setupLoader } from "../../routes/setup";
import { loader as registryGuideLoader } from "../../routes/registry-guide";
import { loader as setupCustomizeLoader } from "../../routes/setup_.customize";
import { loader as setupProLoader } from "../../routes/setup_.pro";
import { loader as guestGuideLoader } from "../../routes/guest-guide";
import { renderFor, sitePage } from "../layout";
import { siteLocaleFromRequest } from "../chrome-copy";

const VARS = new Set(["trialDays", "proName", "price", "feePct", "holdDays"]);
const tokens = (s: string) => [...s.matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1]).sort();
const bolds = (s: string) => (s.match(/<b>/g) ?? []).length;
const links = (s: string) => (s.match(/<a /g) ?? []).length;

const KINDS = ["setup", "customize", "pro", "registry", "guest"] as const;
const OTHERS = LOCALES.filter((l) => l !== "en");

const get = async (loader: (a: never) => Response | Promise<Response>, path: string, opts: { query?: string; cookie?: string } = {}) => {
  const request = new Request(`https://giftpin.app${path}${opts.query ?? ""}`, opts.cookie ? { headers: { cookie: opts.cookie } } : undefined);
  const res = await loader({ request, params: {}, context: {} } as never);
  return { res, html: await res.text() };
};

describe("guide translations", () => {
  for (const kind of KINDS) {
    const en: GuideDoc = GUIDE_COPY.en[kind];
    for (const locale of OTHERS) {
      const doc: GuideDoc = GUIDE_COPY[locale][kind];

      it(`${kind} guide in ${locale} has the same shape as English`, () => {
        expect(doc.sections.length).toBe(en.sections.length);
        expect(doc.faq.length).toBe(en.faq.length);
        en.sections.forEach((sec, i) => {
          const other = doc.sections[i];
          expect(other.tint, `${locale} ${kind} section ${i} tint`).toBe(sec.tint);
          expect(other.steps.length, `${locale} ${kind} section ${i} steps`).toBe(sec.steps.length);
          sec.steps.forEach((st, j) => {
            const o = other.steps[j];
            expect(o.id, `${locale} step "${st.title}" id`).toBe(st.id);
            expect(o.items.length, `${locale} step "${st.title}" items`).toBe(st.items.length);
            const imgs = st.img ? (Array.isArray(st.img) ? st.img.length : 1) : 0;
            expect(o.alts?.length ?? 0, `${locale} step "${st.title}" alts`).toBe(imgs);
            st.items.forEach((item, k) => {
              expect(tokens(o.items[k]), `${locale} "${st.title}" item ${k} labels`).toEqual(tokens(item));
              expect(bolds(o.items[k]), `${locale} "${st.title}" item ${k} bold count`).toBe(bolds(item));
              expect(links(o.items[k]), `${locale} "${st.title}" item ${k} links`).toBe(links(item));
            });
          });
        });
      });
    }

    it(`${kind} guide only uses labels that exist`, () => {
      for (const locale of LOCALES) {
        for (const sec of GUIDE_COPY[locale][kind].sections)
          for (const st of sec.steps) for (const item of st.items) for (const k of tokens(item)) expect(VARS.has(k) || hasMessage(k), `${locale}: ${k}`).toBe(true);
      }
    });
  }

  it("non-English steps carry no images of their own (they reuse English ones)", () => {
    for (const locale of OTHERS) for (const kind of KINDS) for (const sec of GUIDE_COPY[locale][kind].sections) for (const st of sec.steps) expect(st.img).toBeUndefined();
  });
});

describe("guide pages in each language", () => {
  const MARKERS: Record<Locale, string> = {
    en: "Where the Save buttons are",
    fr: "Où se trouvent les boutons Enregistrer",
    es: "Dónde están los botones Guardar",
    de: "Wo die Speichern-Buttons sind",
    "pt-BR": "Onde ficam os botões Salvar",
    hi: "सेव बटन कहाँ हैं",
    "zh-CN": "保存按钮在哪里",
    "zh-TW": "儲存按鈕在哪裡",
    ja: "保存ボタンの場所",
  };

  for (const locale of LOCALES) {
    it(`/setup?lang=${locale} renders in ${locale}, with every label filled in`, async () => {
      const { res, html } = await get(setupLoader, "/setup", { query: locale === "en" ? "" : `?lang=${locale}` });
      expect(res.status).toBe(200);
      expect(html).toContain(`<html lang="${locale}">`);
      expect(html).toContain(MARKERS[locale]);
      expect(html).not.toContain("{{");
      expect(html).not.toContain("undefined");
      // The label comes from the app's own dictionary for that language.
      expect(html).toContain("<b>" + { en: "Save", fr: "Enregistrer", es: "Guardar", de: "Speichern", "pt-BR": "Salvar", hi: "सेव करें", "zh-CN": "保存", "zh-TW": "儲存", ja: "保存" }[locale] + "</b>");
      // Screenshots are shared, with the right-language alt text.
      expect(html).toContain("/guides/m3-overview-theme.png");
    });

    it(`/registry-guide?lang=${locale} renders in ${locale}`, async () => {
      const { html } = await get(registryGuideLoader, "/registry-guide", { query: locale === "en" ? "" : `?lang=${locale}` });
      expect(html).toContain(`<html lang="${locale}">`);
      expect(html).not.toContain("{{");
      expect(html).toContain("/guides/r1-start.png");
    });

    it(`/setup/customize, /setup/pro and /guest-guide?lang=${locale} render in ${locale} with every label filled in`, async () => {
      const query = locale === "en" ? "" : `?lang=${locale}`;
      for (const [loader, path] of [[setupCustomizeLoader, "/setup/customize"], [setupProLoader, "/setup/pro"], [guestGuideLoader, "/guest-guide"]] as const) {
        const { res, html } = await get(loader, path, { query });
        expect(res.status, path).toBe(200);
        expect(html, path).toContain(`<html lang="${locale}">`);
        expect(html, path).not.toContain("{{");
        expect(html, path).not.toContain("undefined");
      }
    });
  }

  it("states a canonical URL per language and links the others with hreflang", async () => {
    const { html } = await get(setupLoader, "/setup", { query: "?lang=de" });
    expect(html).toContain('<link rel="canonical" href="https://giftpin.app/setup?lang=de">');
    for (const l of LOCALES) expect(html).toContain(`hreflang="${l}"`);
    expect(html).toContain('hreflang="x-default" href="https://giftpin.app/setup"');
  });

  it("the Pro guide quotes the price, trial and fee from the billing constants", async () => {
    const { html } = await get(setupProLoader, "/setup/pro", { query: "?lang=fr" });
    expect(html).toContain("14 jours");
    expect(html).toContain("$9.99");
    expect(html).toContain("2 %");
  });
});

describe("language choice that follows the visitor", () => {
  const req = (url: string, cookie?: string) => new Request(url, cookie ? { headers: { cookie } } : undefined);

  it("reads ?lang= first, then the cookie, otherwise English", () => {
    expect(siteLocaleFromRequest(req("https://giftpin.app/setup?lang=fr"))).toBe("fr");
    expect(siteLocaleFromRequest(req("https://giftpin.app/setup", "giftpin-lang=de"))).toBe("de");
    expect(siteLocaleFromRequest(req("https://giftpin.app/setup", "a=1; giftpin-lang=pt-BR; b=2"))).toBe("pt-BR");
    expect(siteLocaleFromRequest(req("https://giftpin.app/setup?lang=es", "giftpin-lang=de"))).toBe("es");
    expect(siteLocaleFromRequest(req("https://giftpin.app/setup?lang=en", "giftpin-lang=de"))).toBe("en");
    expect(siteLocaleFromRequest(req("https://giftpin.app/setup"))).toBe("en");
    expect(siteLocaleFromRequest(req("https://giftpin.app/setup?lang=xx", "giftpin-lang=zz"))).toBe("en");
  });

  it("a page whose body isn't translated keeps the translated frame but says it is English", async () => {
    // Every giftpin.app page is translated now except the standalone privacy policy, so build a bare page.
    const request = new Request("https://giftpin.app/x", { headers: { cookie: "giftpin-lang=de" } });
    const res = renderFor(request, () => sitePage({ path: "/features", nav: "features", title: "T", description: "D", body: "<p>Body</p>" }));
    const html = await res.text();
    expect(html).toContain("Zum Inhalt springen");
    expect(html).toContain("Preise");
    expect(html).toContain("Datenschutzerklärung");
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<link rel="canonical" href="https://giftpin.app/features">');
    expect(html).toContain('href="/pricing?lang=de"');
  });

  it("the language menu lists every language with a flag, and each link works without JavaScript", async () => {
    const { html } = await get(setupLoader, "/setup", { cookie: "giftpin-lang=fr" });
    expect(html).toContain('class="lang-menu"');
    for (const [l, name] of [["en", "English"], ["fr", "Français"], ["es", "Español"], ["de", "Deutsch"], ["pt-BR", "Português (Brasil)"], ["hi", "हिन्दी"], ["zh-CN", "简体中文"], ["zh-TW", "繁體中文"], ["ja", "日本語"]]) {
      expect(html).toContain(`href="/setup?lang=${l}"`);
      expect(html).toContain(`<span>${name}</span>`);
    }
    expect(html.match(/class="flag"/g)?.length).toBeGreaterThanOrEqual(18);
    expect(html).toContain('aria-current="true"');
  });

  it("the cookie is set when a language is picked, and caches are told the page varies by it", async () => {
    const { res, html } = await get(setupLoader, "/setup");
    expect(res.headers.get("Vary")).toBe("Cookie");
    expect(html).toContain("giftpin-lang=");
  });

  it("two requests in a row never leak a language into each other", async () => {
    const a = await get(setupLoader, "/setup", { query: "?lang=fr" });
    const b = await get(setupLoader, "/setup");
    expect(a.html).toContain('<html lang="fr">');
    expect(b.html).toContain('<html lang="en">');
    expect(b.html).toContain("Skip to content");
  });
});
