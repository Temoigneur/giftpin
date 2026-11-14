import { existsSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { setupHtml } from "../guides";
import { LOCALIZED_SHOTS, localizedShot } from "../guide-copy/localized-shots";

const PUBLIC = new URL("../../../public/guides/", import.meta.url).pathname;

describe("localized guide screenshots", () => {
  it("falls back to the English file when a locale has none", () => {
    expect(localizedShot("/guides/p21-nav-apps.png", "en")).toBe("/guides/p21-nav-apps.png");
    expect(localizedShot("/guides/not-listed.png", "es")).toBe("/guides/not-listed.png");
    expect(localizedShot("/brand/x.png", "es")).toBe("/brand/x.png");
  });

  it("uses the locale's file when listed", () => {
    const before = LOCALIZED_SHOTS.es;
    LOCALIZED_SHOTS.es = ["p21-nav-apps.png"];
    try {
      expect(localizedShot("/guides/p21-nav-apps.png", "es")).toBe("/guides/es/p21-nav-apps.png");
      expect(localizedShot("/guides/p21-nav-apps.png", "pt-BR")).toBe("/guides/p21-nav-apps.png");
    } finally {
      LOCALIZED_SHOTS.es = before;
    }
  });

  it("lists exactly the files on disk, each with an English counterpart", () => {
    for (const loc of ["fr", "es", "de", "pt-BR", "hi", "zh-CN", "zh-TW", "ja"] as const) {
      const dir = `${PUBLIC}${loc}/`;
      const onDisk = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".png")).sort() : [];
      expect([...(LOCALIZED_SHOTS[loc] ?? [])].sort(), loc).toEqual(onDisk);
      for (const f of onDisk) expect(existsSync(`${PUBLIC}${f}`), `${loc}/${f} has no English file`).toBe(true);
    }
  });

  it("the setup guide serves Spanish files to Spanish and English files to Portuguese", () => {
    expect(setupHtml("es")).toContain('src="/guides/es/p21-nav-apps.png"');
    expect(setupHtml("pt-BR")).toContain('src="/guides/p21-nav-apps.png"');
  });
});
