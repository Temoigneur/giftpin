import { describe, expect, it } from "vitest";
import { mainSectionType, sectionAcceptsAppBlocks, themeNumericId } from "../theme-support";

describe("mainSectionType", () => {
  it("finds the main section in a Dawn-style template, comment header and all", () => {
    const template = `/*
 * ------------------------------------------------------------
 * IMPORTANT: The contents of this file are auto-generated.
 * ------------------------------------------------------------
 */
{
  "sections": {
    "main": { "type": "main-product", "blocks": {} },
    "related": { "type": "related-products" }
  },
  "order": ["main", "related"]
}`;
    expect(mainSectionType(template)).toBe("main-product");
  });

  it("falls back to a main-* section type when the id isn't 'main'", () => {
    const template = JSON.stringify({ sections: { "product-hero": { type: "main-product-hero" } }, order: [] });
    expect(mainSectionType(template)).toBe("main-product-hero");
  });

  it("returns null for unparseable or sectionless templates", () => {
    expect(mainSectionType("not json")).toBeNull();
    expect(mainSectionType("{}")).toBeNull();
  });
});

describe("sectionAcceptsAppBlocks", () => {
  it("spots an @app block type in the schema", () => {
    expect(sectionAcceptsAppBlocks(`{% schema %}{"blocks": [{ "type" : "@app" }]}{% endschema %}`)).toBe(true);
    expect(sectionAcceptsAppBlocks(`{% schema %}{"blocks": [{"type": "text"}]}{% endschema %}`)).toBe(false);
  });
});

describe("themeNumericId", () => {
  it("strips the gid prefix", () => {
    expect(themeNumericId("gid://shopify/OnlineStoreTheme/123456")).toBe("123456");
  });
});
