import { describe, expect, it } from "vitest";
import { MANAGE_CLICK_METRICS, STAT_METRICS, adminSectionOf, isLikelyBot, statDay } from "../stats";

describe("isLikelyBot", () => {
  it("lets real phone and desktop browsers through", () => {
    expect(isLikelyBot("Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1")).toBe(false);
    expect(isLikelyBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36")).toBe(false);
  });

  it("skips crawlers and the link previews a shared registry link triggers", () => {
    for (const ua of [
      "Googlebot/2.1 (+http://www.google.com/bot.html)",
      "WhatsApp/2.23.20.0",
      "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
      "TelegramBot (like TwitterBot)",
      "curl/8.4.0",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36",
    ]) {
      expect(isLikelyBot(ua), ua).toBe(true);
    }
  });

  it("treats a missing user agent as a bot", () => {
    expect(isLikelyBot(null)).toBe(true);
    expect(isLikelyBot("")).toBe(true);
  });
});

describe("statDay", () => {
  it("is UTC midnight of the given moment", () => {
    expect(statDay(new Date("2026-11-02T23:59:59.999Z")).toISOString()).toBe("2026-11-02T00:00:00.000Z");
    expect(statDay(new Date("2026-11-03T00:00:00.000Z")).toISOString()).toBe("2026-11-03T00:00:00.000Z");
  });
});

describe("adminSectionOf", () => {
  it("maps admin paths to a fixed list of sections", () => {
    expect(adminSectionOf("/app")).toBe("overview");
    expect(adminSectionOf("/app/")).toBe("overview");
    expect(adminSectionOf("/app/registries")).toBe("registries");
    expect(adminSectionOf("/app/registries/abc123")).toBe("registries");
    expect(adminSectionOf("/app/in-store")).toBe("in-store");
    expect(adminSectionOf("/app/whatever-new")).toBe("other");
    expect(adminSectionOf("/somewhere")).toBe("other");
  });
});

describe("MANAGE_CLICK_METRICS", () => {
  it("only knows share, copy and qr, and none of them is an inherited property", () => {
    expect(Object.keys(MANAGE_CLICK_METRICS).sort()).toEqual(["copy", "qr", "share"]);
    expect(MANAGE_CLICK_METRICS.share).toBe(STAT_METRICS.registryShare);
    expect(Object.hasOwn(MANAGE_CLICK_METRICS, "toString")).toBe(false);
  });
});
