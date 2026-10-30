import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loader as homeLoader } from "../../routes/_index";
import { loader as featuresLoader } from "../../routes/features";
import { loader as faqLoader } from "../../routes/faq";
import { loader as pricingLoader } from "../../routes/pricing";
import { loader as weddingLoader } from "../../routes/wedding-registry";
import { loader as compareLoader } from "../../routes/compare";
import { loader as giftRegistryAppLoader } from "../../routes/gift-registry-app";
import { loader as babyRegistryLoader } from "../../routes/baby-registry";
import { loader as homeGoodsLoader } from "../../routes/home-goods-registry";
import { loader as setupLoader } from "../../routes/setup";
import { loader as registryGuideLoader } from "../../routes/registry-guide";
import { loader as holidayLoader } from "../../routes/holiday-wish-lists";
import { homeHtml } from "../home";
import { MARKETING_PATHS, SEASONAL_PATHS, loader as sitemapLoader } from "../../routes/sitemap[.xml]";
import { FOUNDING_OFFER_SLOTS, FOUNDING_OFFER_TRIAL_DAYS, PRO_PLAN_PRICE, PRO_TRIAL_DAYS } from "../../shared/plans";
import { HOLIDAY_PROMO_ENDS_AT, SHOW_FOUNDING_OFFER, holidayPromoOn } from "../config";
import { videoEmbed } from "../layout";

const req = (url: string) => ({ request: new Request(url), params: {}, context: {} }) as never;

const LANDING: Record<string, () => Promise<Response>> = {
  "/gift-registry-app": giftRegistryAppLoader,
  "/baby-registry": babyRegistryLoader,
  "/home-goods-registry": homeGoodsLoader,
  "/holiday-wish-lists": holidayLoader,
};

async function page(path: string): Promise<string> {
  const res = LANDING[path]
    ? await LANDING[path]()
    :
    path === "/"
      ? await homeLoader(req("https://giftpin.app/"))
      : path === "/features"
        ? await featuresLoader()
        : path === "/pricing"
          ? await pricingLoader()
          : path === "/wedding-registry"
            ? await weddingLoader()
            : path === "/compare"
              ? await compareLoader()
              : path === "/setup"
                ? await setupLoader()
                : path === "/registry-guide"
                  ? await registryGuideLoader()
                  : await faqLoader();
  expect(res.status).toBe(200);
  expect(res.headers.get("Content-Type")).toContain("text/html");
  return res.text();
}

describe("marketing site", () => {
  it("still forwards Shopify's embedded-app handshake from / to /app", async () => {
    await expect(homeLoader(req("https://giftpin.app/?shop=x.myshopify.com&host=abc"))).rejects.toMatchObject({
      status: 302,
    });
  });

  it.each(["/", "/features", "/pricing", "/faq", "/gift-registry-app", "/wedding-registry", "/baby-registry", "/home-goods-registry", "/compare", "/setup", "/registry-guide", "/holiday-wish-lists"])("%s renders with the shared nav, footer and icon", async (path) => {
    const html = await page(path);
    expect(html).toContain('href="/pricing"');
    expect(html).toContain('href="/privacy"');
    expect(html).toContain("/brand/giftpin-icon-64.png");
    expect(html).toContain(`<link rel="canonical" href="https://giftpin.app${path}">`);
  });

  it.each(["/", "/features", "/pricing", "/faq", "/gift-registry-app", "/wedding-registry", "/baby-registry", "/home-goods-registry", "/compare", "/setup"])("%s loads nothing from Skimlinks and doesn't mention it", async (path) => {
    const html = await page(path);
    expect(html.toLowerCase()).not.toContain("skim");
  });

  it("privacy policy no longer mentions Skimlinks", () => {
    const src = readFileSync(join(__dirname, "../../routes/privacy.tsx"), "utf8");
    expect(src.toLowerCase()).not.toContain("skim");
  });

  it("no longer mentions Sovrn on /faq", async () => {
    const html = (await page("/faq")).toLowerCase();
    expect(html).not.toContain("sovrn");
  });

  it("quotes the price and trial from the billing constants", async () => {
    for (const path of ["/", "/pricing"]) {
      const html = await page(path);
      expect(html).toContain(`$${PRO_PLAN_PRICE.toFixed(2)}`);
      expect(html).toContain(`${PRO_TRIAL_DAYS}-day free trial`);
    }
  });

  it("discloses the affiliate commission on the home page", async () => {
    const html = await page("/");
    expect(html).toContain("small commission");
    expect(html).toContain("never changes the guest's price");
  });

  it("doesn't advertise Pro features that aren't merged, or a yearly price that isn't set up", async () => {
    for (const path of ["/", "/features", "/pricing", "/faq", "/gift-registry-app", "/wedding-registry", "/baby-registry", "/home-goods-registry", "/compare", "/holiday-wish-lists"]) {
      const html = (await page(path)).toLowerCase();
      expect(html).not.toContain("point of sale");
      expect(html).not.toContain(" pos ");
      expect(html).not.toContain("cash fund");
      expect(html).not.toContain("group gift");
      expect(html).not.toContain("/yr");
      expect(html).not.toContain("per year");
    }
  });

  it("explains the Which registry? choice for Babylist and copy-link registries", async () => {
    for (const path of ["/", "/features", "/faq"]) {
      const html = await page(path);
      expect(html).toContain("Which registry?");
      expect(html).toContain("Babylist");
      expect(html).toContain("copy");
    }
    expect(await page("/")).toContain("Another registry (copy link)");
    expect(await page("/baby-registry")).toContain("Babylist");
  });

  it("never claims a Babylist partnership, Amazon support or the unreleased share-menu app", async () => {
    for (const path of ["/", "/features", "/pricing", "/faq", "/gift-registry-app", "/wedding-registry", "/baby-registry", "/home-goods-registry", "/compare", "/setup", "/registry-guide", "/holiday-wish-lists"]) {
      const html = (await page(path)).toLowerCase();
      expect(html).not.toContain("amazon");
      expect(html).not.toMatch(/babylist[^<.]{0,40}(partner|endorse|official|certified)/);
      expect(html).not.toMatch(/(partner|endorsed|official|certified)[^<.]{0,40}babylist/);
      expect(html).not.toMatch(/<img[^>]+babylist/);
      expect(html).not.toContain("share menu");
      expect(html).not.toContain("share sheet");
      expect(html).toContain("giftpin isn't affiliated with babylist or zola");
    }
  });

  it("shows honest trust signals and no made-up social proof", async () => {
    const home = await page("/");
    for (const s of ["Made in Canada", "Reviewed by Shopify", 'href="#demo"', "two co-founders"]) expect(home).toContain(s);
    for (const path of ["/", "/features", "/pricing", "/faq"]) {
      const html = (await page(path)).toLowerCase();
      expect(html).not.toContain("★");
      expect(html).not.toContain("testimonial");
      expect(html).not.toMatch(/\d[\d,]*\+? (merchants|installs|happy)|\d[\d,]*\+? stores (use|trust|love)/);
    }
  });

  it("quotes the founding offer from the billing constants, or hides it when switched off", async () => {
    for (const path of ["/", "/pricing"]) {
      const html = await page(path);
      const line = `first ${FOUNDING_OFFER_SLOTS} stores to install from 23 October 2026 get a ${FOUNDING_OFFER_TRIAL_DAYS}-day free trial`;
      if (SHOW_FOUNDING_OFFER) expect(html).toContain(line);
      else expect(html).not.toContain("Founding offer");
    }
  });

  it("setup guide walks through install, theme, settings and Pro, and is linked from every page", async () => {
    const html = await page("/setup");
    for (const label of ["Add button to product pages", "Add registry links", "Occasions", "Items from other stores", "Upgrade to Pro", "Automatically fulfill only the gift cards"]) {
      expect(html).toContain(label);
    }
    expect(await page("/")).toContain('href="/setup"');
  });

  it("registry guide covers starting, adding, the extension and sharing, and is linked from every page", async () => {
    const html = await page("/registry-guide");
    for (const label of ["Create my registry", "Email me my link", "Look it up", "Copy connection link", "Share with guests", "Who can see this", "Send gifts to me"]) {
      expect(html).toContain(label);
    }
    expect(await page("/")).toContain('href="/registry-guide"');
  });

  it("links the search landing pages from the footer of every page", async () => {
    const html = await page("/");
    for (const p of ["/gift-registry-app", "/wedding-registry", "/baby-registry", "/home-goods-registry", "/compare"]) expect(html).toContain(`href="${p}"`);
  });

  it("embeds the demo video", async () => {
    const html = await page("/");
    expect(html).toContain("youtube-nocookie.com/embed/EbJI5aFbeo4");
    expect(html).not.toContain("Demo video coming soon");
  });

  it("every image the pages reference ships in public/", async () => {
    const pub = join(__dirname, "../../../public");
    for (const path of ["/", "/features", "/pricing", "/faq", "/gift-registry-app", "/wedding-registry", "/baby-registry", "/home-goods-registry", "/compare", "/setup", "/registry-guide", "/holiday-wish-lists"]) {
      const html = await page(path);
      for (const m of html.matchAll(/(?:src|href|content)="(?:https:\/\/giftpin\.app)?(\/(?:brand|guides)\/[^"]+)"/g)) {
        expect(existsSync(join(pub, m[1])), m[1]).toBe(true);
      }
    }
  });

  it("sitemap only lists pages that have a route", () => {
    const routes = join(__dirname, "../../routes");
    const file: Record<string, string> = {
      "/": "_index.tsx",
      "/features": "features.tsx",
      "/pricing": "pricing.tsx",
      "/faq": "faq.tsx",
      "/gift-registry-app": "gift-registry-app.tsx",
      "/wedding-registry": "wedding-registry.tsx",
      "/baby-registry": "baby-registry.tsx",
      "/home-goods-registry": "home-goods-registry.tsx",
      "/compare": "compare.tsx",
      "/setup": "setup.tsx",
      "/registry-guide": "registry-guide.tsx",
      "/gift-cards": "gift-cards.tsx",
      "/privacy": "privacy.tsx",
      "/holiday-wish-lists": "holiday-wish-lists.tsx",
    };
    for (const p of [...MARKETING_PATHS, ...SEASONAL_PATHS]) expect(existsSync(join(routes, file[p] ?? "missing")), p).toBe(true);
  });
});

describe("holiday wish lists page", () => {
  it("pitches a shareable list, not a save-for-later button, and quotes the founding offer", async () => {
    const html = await page("/holiday-wish-lists");
    expect(html).toContain("nobody doubles up");
    expect(html).toContain("Is this a save-for-later wishlist button?");
    // The exact Settings label merchants tick.
    expect(html).toContain("tick Wish list under Occasions");
    if (SHOW_FOUNDING_OFFER) expect(html).toContain(`${FOUNDING_OFFER_TRIAL_DAYS}-day free trial`);
    expect(html.toLowerCase()).not.toContain("★");
    expect(html.toLowerCase()).not.toContain("testimonial");
  });

  it("shows the home banner, footer link and sitemap entry only until the promo ends", async () => {
    const before = new Date(HOLIDAY_PROMO_ENDS_AT.getTime() - 1000);
    expect(homeHtml(before)).toContain('class="season"');
    expect(homeHtml(HOLIDAY_PROMO_ENDS_AT)).not.toContain('class="season"');
    expect(HOLIDAY_PROMO_ENDS_AT.toISOString()).toBe("2026-12-27T05:00:00.000Z");
    const sitemap = await (await sitemapLoader()).text();
    expect(sitemap.includes("/holiday-wish-lists")).toBe(holidayPromoOn());
  });
});

describe("videoEmbed", () => {
  it("turns YouTube, Vimeo and direct files into players", () => {
    expect(videoEmbed("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(videoEmbed("https://youtu.be/dQw4w9WgXcQ")).toContain("embed/dQw4w9WgXcQ");
    expect(videoEmbed("https://vimeo.com/123456789")).toContain("player.vimeo.com/video/123456789");
    expect(videoEmbed("https://cdn.example.com/demo.mp4")).toContain("<video");
  });

  it("ignores anything it can't play, so the placeholder shows instead", () => {
    expect(videoEmbed("")).toBe("");
    expect(videoEmbed("https://example.com/not-a-video")).toBe("");
    expect(videoEmbed('https://x.com/a.mp4"><script>')).not.toContain("<script>");
  });
});
