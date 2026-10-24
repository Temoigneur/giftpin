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
import { MARKETING_PATHS } from "../../routes/sitemap[.xml]";
import { PRO_PLAN_PRICE, PRO_TRIAL_DAYS } from "../../shared/plans";
import { videoEmbed } from "../layout";

const req = (url: string) => ({ request: new Request(url), params: {}, context: {} }) as never;

const LANDING: Record<string, () => Promise<Response>> = {
  "/gift-registry-app": giftRegistryAppLoader,
  "/baby-registry": babyRegistryLoader,
  "/home-goods-registry": homeGoodsLoader,
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

  it.each(["/", "/features", "/pricing", "/faq", "/gift-registry-app", "/wedding-registry", "/baby-registry", "/home-goods-registry", "/compare", "/setup", "/registry-guide"])("%s renders with the shared nav, footer and icon", async (path) => {
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
    for (const path of ["/", "/features", "/pricing", "/faq", "/gift-registry-app", "/wedding-registry", "/baby-registry", "/home-goods-registry", "/compare"]) {
      const html = (await page(path)).toLowerCase();
      expect(html).not.toContain("point of sale");
      expect(html).not.toContain(" pos ");
      expect(html).not.toContain("cash fund");
      expect(html).not.toContain("group gift");
      expect(html).not.toContain("/yr");
      expect(html).not.toContain("per year");
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
    for (const path of ["/", "/features", "/pricing", "/faq", "/gift-registry-app", "/wedding-registry", "/baby-registry", "/home-goods-registry", "/compare", "/setup", "/registry-guide"]) {
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
    };
    for (const p of MARKETING_PATHS) expect(existsSync(join(routes, file[p] ?? "missing")), p).toBe(true);
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
