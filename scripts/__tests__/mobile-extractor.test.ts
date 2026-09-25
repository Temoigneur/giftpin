/**
 * Drift guard for the phone app's copy of the extension's page reader
 * (CLAUDE.md hard rule #4). mobile-app/src/extract.generated.ts is generated
 * from browser-extension/popup.js; if someone edits one without re-running
 * `npm run sync-extractor` in mobile-app/, this fails.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GENERATED_TS, extractorSource, generatedModule } from "../../mobile-app/scripts/extractor-source.mjs";

describe("mobile app page reader", () => {
  it("is exactly the Chrome extension's extractProductMetadata()", () => {
    expect(readFileSync(GENERATED_TS, "utf8")).toBe(generatedModule());
  });

  it("captures the whole function, so it still parses on its own", () => {
    const source: string = extractorSource();
    expect(source.startsWith("function extractProductMetadata()")).toBe(true);
    expect(() => new Function(`return (${source})`)).not.toThrow();
  });
});
