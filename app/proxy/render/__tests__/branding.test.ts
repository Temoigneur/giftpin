import { describe, it, expect } from "vitest";
import { layout } from "../layout";
import { renderSimplePage } from "../create-page";
import type { PageBranding } from "../../../shared/branding";

const base = { title: "T", accentColor: "#123456", indexable: false, shopName: "Maple & Oak" };

function branding(overrides: Partial<PageBranding> = {}): PageBranding {
  return { logoUrl: null, backgroundColor: null, textColor: null, font: "system", hidePoweredBy: true, ...overrides };
}

describe("Pro branding in the guest page layout", () => {
  it("Free (no branding): default look, credit shown, no logo or web font", () => {
    const html = layout(base, "<p>body</p>");
    expect(html).toContain("Powered by Giftpin");
    expect(html).not.toContain("brand-logo");
    expect(html).not.toContain("fonts.googleapis.com");
  });

  it("removes the credit on every page that gets branding, not just the registry page", () => {
    const html = renderSimplePage({ shopName: "Maple & Oak", accentColor: "#123456", branding: branding() }, "Hi", "There");
    expect(html).not.toContain("Powered by Giftpin");
  });

  it("renders the logo, escaped, linking to the storefront", () => {
    const html = layout({ ...base, branding: branding({ logoUrl: 'https://cdn.shopify.com/logo.png?a="x"' }) }, "");
    expect(html).toContain('<a class="brand-logo" href="/"><img src="https://cdn.shopify.com/logo.png?a=&quot;x&quot;" alt="Maple &amp; Oak"></a>');
  });

  it("applies page colours to both light and dark mode, filling in the missing one", () => {
    const html = layout({ ...base, branding: branding({ backgroundColor: "#fbf7f2" }) }, "");
    const vars = "--bg:#fbf7f2;--ink:#1a1a1a;";
    expect(html.split(vars)).toHaveLength(3);
    expect(html).toMatch(/@media \(prefers-color-scheme:dark\)\{:root\{--bg:#fbf7f2/);
  });

  it("never interpolates a bad colour into CSS", () => {
    const html = layout({ ...base, branding: branding({ backgroundColor: "red;}</style><script>", textColor: null }) }, "");
    expect(html).not.toContain("<script>");
    expect(html).toContain("--bg:#fbfbfa;");
  });

  it("loads a Google font only when one is picked, and unknown fonts fall back to the default", () => {
    const serif = layout({ ...base, branding: branding({ font: "playfair" }) }, "");
    expect(serif).toContain("https://fonts.googleapis.com/css2?family=Playfair+Display");
    expect(serif).toContain('body{font-family:"Playfair Display",Georgia,serif}');

    const unknown = layout({ ...base, branding: branding({ font: "comic-sans" }) }, "");
    expect(unknown).not.toContain("fonts.googleapis.com");
    expect(unknown).not.toContain("body{font-family:");
  });
});
