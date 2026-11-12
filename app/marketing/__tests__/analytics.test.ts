// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { loader as homeLoader } from "../../routes/_index";
import { loader as pricingLoader } from "../../routes/pricing";
import { loader as setupLoader } from "../../routes/setup";
import { GA_MEASUREMENT_ID, appStoreHref } from "../config";
import { analyticsClicks } from "../layout";

type Loader = (args: never) => Response | Promise<Response>;
async function html(loader: Loader, url: string): Promise<string> {
  const res = await loader({ request: new Request(url), params: {}, context: {} } as never);
  return res.text();
}

describe("giftpin.app analytics", () => {
  it("loads GA4 with consent defaults set before the config call", async () => {
    const page = await html(homeLoader as Loader, "https://giftpin.app/");
    expect(page).toContain(`googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`);
    const consent = page.indexOf('gtag("consent","default"');
    const config = page.indexOf(`gtag("config","${GA_MEASUREMENT_ID}"`);
    expect(consent).toBeGreaterThan(-1);
    expect(config).toBeGreaterThan(consent);
    // Ads are never on, and EU/UK visitors start with analytics cookies off.
    expect(page).not.toMatch(/ad_storage:"granted"/);
    expect(page).toMatch(/analytics_storage:"denied",region:\[[^\]]*"DE"[^\]]*"GB"/);
  });

  it.each([
    ["/", homeLoader],
    ["/pricing", pricingLoader],
    ["/setup", setupLoader],
  ] as const)("tags every App Store link on %s with UTM parameters", async (path, loader) => {
    const page = await html(loader as Loader, `https://giftpin.app${path}`);
    const links = [...page.matchAll(/href="(https:\/\/apps\.shopify\.com[^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      const u = new URL(link);
      expect(u.searchParams.get("utm_source")).toBe("giftpin.app");
      expect(u.searchParams.get("utm_medium")).toBe("website");
      expect(u.searchParams.get("utm_content")).toBeTruthy();
    }
  });

  it("names the button in utm_content", () => {
    expect(new URL(appStoreHref("pricing_pro")).searchParams.get("utm_content")).toBe("pricing_pro");
  });
});

describe("click events", () => {
  function setup(body: string, lang = "en") {
    document.documentElement.lang = lang;
    document.body.innerHTML = body;
    const sent: [string, Record<string, unknown>][] = [];
    (window as unknown as { gtag: unknown }).gtag = (kind: string, name: string, params: Record<string, unknown>) => {
      if (kind === "event") sent.push([name, params]);
    };
    const src = analyticsClicks().replace(/<\/?script>/g, "");
    // eslint-disable-next-line no-new-func
    new Function(src)();
    return sent;
  }
  const click = (sel: string) => {
    const el = document.querySelector(sel) as HTMLElement;
    el.addEventListener("click", (e) => e.preventDefault(), { once: true });
    el.click();
  };

  it("sends one named event per kind of link, with where it sat and no typed text", () => {
    const sent = setup(`
      <header class="site-top"><a id="i1" href="${appStoreHref("header")}">Install</a>
        <details class="lang-menu"><summary id="lm">EN</summary><ul><li><a id="l1" href="/?lang=fr" data-lang="fr">FR</a></li></ul></details></header>
      <section class="hero"><a id="d1" href="#demo">Demo</a></section>
      <main><a id="s1" href="/setup?lang=fr#gift-cards">Setup</a><a id="p1" href="/pricing">Pricing</a>
        <a id="g1" href="https://shop.example/apps/registry/gift-card" data-store="shop.example">Buy</a>
        <div class="faq"><details><summary id="f1">Is it free?</summary><p>Yes</p></details></div></main>
      <footer class="foot"><a id="m1" href="mailto:support@giftpin.app">Email</a></footer>`);
    for (const id of ["i1", "lm", "l1", "d1", "s1", "p1", "g1", "f1", "m1"]) click(`#${id}`);
    expect(sent.map(([n]) => n)).toEqual([
      "install_click", "lang_menu_open", "lang_switch", "demo_click", "setup_link_click",
      "pricing_click", "gift_card_store_click", "faq_open", "contact_click",
    ]);
    expect(sent[0][1]).toMatchObject({ placement: "header", page_lang: "en" });
    expect(sent[2][1]).toMatchObject({ lang_from: "en", lang_to: "fr" });
    expect(sent[3][1]).toMatchObject({ placement: "hero" });
    expect(sent[4][1]).toMatchObject({ link_path: "/setup", placement: "body" });
    expect(sent[6][1]).toMatchObject({ store_host: "shop.example" });
    expect(sent[7][1]).toMatchObject({ placement: "faq", faq_question: "Is it free?" });
    expect(sent[8][1]).toMatchObject({ placement: "footer" });
  });

  it("ignores ordinary links", () => {
    const sent = setup(`<a id="x" href="/features">Features</a>`);
    click("#x");
    expect(sent).toEqual([]);
  });
});
