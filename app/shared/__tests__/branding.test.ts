import { describe, it, expect } from "vitest";
import { brandFont, cleanHexColor, cleanLogoUrl, contrastRatio } from "../branding";

describe("branding validation", () => {
  it("accepts only 6-digit hex colours", () => {
    expect(cleanHexColor("#FBF7F2")).toBe("#fbf7f2");
    expect(cleanHexColor(" #123abc ")).toBe("#123abc");
    expect(cleanHexColor("#fff")).toBe("");
    expect(cleanHexColor("red")).toBe("");
    expect(cleanHexColor(null)).toBe("");
  });

  it("accepts only https logo links", () => {
    expect(cleanLogoUrl("https://cdn.shopify.com/s/files/logo.png")).toBe("https://cdn.shopify.com/s/files/logo.png");
    expect(cleanLogoUrl("http://example.com/logo.png")).toBe("");
    expect(cleanLogoUrl("javascript:alert(1)")).toBe("");
    expect(cleanLogoUrl("data:image/png;base64,AAAA")).toBe("");
    expect(cleanLogoUrl("not a url")).toBe("");
    expect(cleanLogoUrl("")).toBe("");
  });

  it("falls back to the default font for unknown values", () => {
    expect(brandFont("lora").value).toBe("lora");
    expect(brandFont("nope").value).toBe("system");
  });

  it("computes WCAG contrast", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    expect(contrastRatio("#777777", "#ffffff")).toBeLessThan(4.5);
  });
});
