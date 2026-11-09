import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { buildThemeI18n } from "../build-theme-i18n.mjs";

const dir = path.join(process.cwd(), "extensions", "registry-button");

describe("theme block translations", () => {
  it("giftpin-i18n.js matches locales/*.json (run node scripts/build-theme-i18n.mjs)", () => {
    expect(readFileSync(path.join(dir, "assets", "giftpin-i18n.js"), "utf8")).toBe(buildThemeI18n());
  });

  it("every data-gp-t / data-gp-aria key used by a block exists in every locale", () => {
    const keys = new Set<string>();
    for (const f of ["add-to-registry", "save-for-later", "saved-items", "registry-links"]) {
      const src = readFileSync(path.join(dir, "blocks", `${f}.liquid`), "utf8");
      for (const m of src.matchAll(/data-gp-(?:t|aria)="([a-z_]+\.[a-z_]+)"/g)) keys.add(m[1]);
    }
    expect(keys.size).toBeGreaterThan(10);
    for (const lang of ["fr", "es", "de", "pt-BR", "hi", "zh-CN", "zh-TW", "ja"]) {
      const d = JSON.parse(readFileSync(path.join(dir, "locales", `${lang}.json`), "utf8"));
      for (const k of keys) {
        const [s, n] = k.split(".");
        expect(d[s]?.[n], `${lang} ${k}`).toBeTruthy();
      }
    }
  });
});
