import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dir = "extensions/registry-button/locales";
const read = (f: string) => JSON.parse(readFileSync(`${dir}/${f}`, "utf8")) as Record<string, Record<string, string>>;
const en = read("en.default.json");
const tokens = (s: string) => (s.match(/{{\s*\w+\s*}}/g) ?? []).map((t) => t.replace(/\s/g, "")).sort();
const files = readdirSync(dir).filter((f) => f.endsWith(".json") && !f.endsWith(".schema.json") && f !== "en.default.json");

describe("theme block locale files", () => {
  it("covers the nine storefront languages", () => {
    expect(files.sort()).toEqual(["de.json", "es.json", "fr.json", "hi.json", "ja.json", "pt-BR.json", "zh-CN.json", "zh-TW.json"]);
  });
  for (const f of files) {
    it(`${f} has every key and the same placeholders as English`, () => {
      const d = read(f);
      for (const sec of Object.keys(en)) {
        for (const k of Object.keys(en[sec])) {
          expect(d[sec]?.[k], `${sec}.${k}`).toBeTruthy();
          expect(tokens(d[sec][k]), `${sec}.${k}`).toEqual(tokens(en[sec][k]));
        }
      }
    });
  }
});

// Shopify parses blocks with Ruby Liquid, whose tokenizer ends an output tag at
// the FIRST "}" after "{{". A brace inside a quoted argument, such as
// `t: qty: '{qty}'`, cuts the tag short and `shopify app deploy` rejects the
// version ("was not properly terminated"). theme check does not catch this.
describe("theme block Liquid", () => {
  const blocksDir = "extensions/registry-button/blocks";
  for (const f of readdirSync(blocksDir).filter((n) => n.endsWith(".liquid"))) {
    it(`${f} has no "}" inside a {{ }} output tag`, () => {
      const src = readFileSync(`${blocksDir}/${f}`, "utf8");
      const bad: string[] = [];
      for (let i = src.indexOf("{{"); i !== -1; i = src.indexOf("{{", i + 2)) {
        const close = src.indexOf("}", i);
        if (src[close + 1] !== "}") bad.push(src.slice(i, close + 1));
      }
      expect(bad).toEqual([]);
    });
  }
});
