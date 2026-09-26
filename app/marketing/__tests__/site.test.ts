import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loader as homeLoader } from "../../routes/_index";
import { loader as featuresLoader } from "../../routes/features";
import { loader as faqLoader } from "../../routes/faq";
import { loader as pricingLoader } from "../../routes/pricing";
import { loader as weddingLoader } from "../../routes/wedding-registry";
import { loader as compareLoader } from "../../routes/compare";
import { MARKETING_PATHS } from "../../routes/sitemap[.xml]";
import { PRO_PLAN_PRICE, PRO_TRIAL_DAYS } from "../../shared/plans";
import { videoEmbed } from "../layout";

const req = (url: string) => ({ request: new Request(url), params: {}, context: {} }) as never;

async function page(path: string): Promise<string> {
  const res =
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

  it.each(["/", "/features", "/pricing", "/faq", "/wedding-registry", "/compare"])("%s renders with the shared nav, footer and icon", async (path) => {
    const html = await page(path);
    expect(html).toContain('href="/pricing"');
    expect(html).toContain('href="/privacy"');
    expect(html).toContain("/brand/giftpin-icon-64.png");
    expect(html).toContain(`<link rel="canonical" href="https://giftpin.app${path}">`);
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
    for (const path of ["/", "/features", "/pricing", "/faq", "/wedding-registry", "/compare"]) {
      const html = (await page(path)).toLowerCase();
      expect(html).not.toContain("point of sale");
      expect(html).not.toContain(" pos ");
      expect(html).not.toContain("cash fund");
      expect(html).not.toContain("group gift");
      expect(html).not.toContain("/yr");
      expect(html).not.toContain("per year");
    }
  });

  it("embeds the demo video", async () => {
    const html = await page("/");
    expect(html).toContain("youtube-nocookie.com/embed/3TeeSK2ZH0o");
    expect(html).not.toContain("Demo video coming soon");
  });

  it("every image the pages reference ships in public/", async () => {
    const pub = join(__dirname, "../../../public");
    for (const path of ["/", "/features", "/pricing", "/faq", "/wedding-registry", "/compare"]) {
      const html = await page(path);
      for (const m of html.matchAll(/(?:src|href|content)="(?:https:\/\/giftpin\.app)?(\/brand\/[^"]+)"/g)) {
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
      "/wedding-registry": "wedding-registry.tsx",
      "/compare": "compare.tsx",
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
