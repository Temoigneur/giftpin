import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SAVED_ITEMS_STORAGE_KEY } from "../storage-keys";

describe("Save for later (heart button)", () => {
  const js = readFileSync("extensions/registry-button/assets/giftpin-saved.js", "utf8");

  it("uses the same localStorage key as the shared constant", () => {
    const match = js.match(/var SAVED_KEY = "([^"]+)"/);
    expect(match?.[1]).toBe(SAVED_ITEMS_STORAGE_KEY);
  });

  it("builds the list with textContent, never innerHTML", () => {
    expect(js).not.toMatch(/innerHTML/);
  });

  it("ships both app blocks with their schemas", () => {
    for (const name of ["save-for-later", "saved-items"]) {
      const liquid = readFileSync(`extensions/registry-button/blocks/${name}.liquid`, "utf8");
      expect(liquid).toContain("{% schema %}");
      expect(liquid).toContain("giftpin-saved.js");
    }
  });
});

describe("Saved items → Add to registry", () => {
  it("links to the product with the same parameter the button script reads", () => {
    const saved = readFileSync("extensions/registry-button/assets/giftpin-saved.js", "utf8");
    const button = readFileSync("extensions/registry-button/assets/giftpin.js", "utf8");
    expect(saved).toContain("?giftpin_add=1");
    expect(button).toContain('get("giftpin_add") === "1"');
  });
});
