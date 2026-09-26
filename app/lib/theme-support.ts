/**
 * Does a theme support Giftpin's app blocks?
 *
 * App blocks only work in Online Store 2.0 themes (JSON templates), and only in
 * sections whose schema accepts `{"type": "@app"}` blocks. This is the check
 * Shopify's onboarding guidance describes: read the theme's product template,
 * find its main section, and look for `@app` in that section's schema.
 *
 * Pure helpers only (no GraphQL), so they can be unit tested and imported from
 * the admin UI if needed. The fetching lives in app/models/themes.server.ts.
 */

export type ThemeSupport =
  /** JSON templates, and the product page's main section accepts app blocks. */
  | "supported"
  /** JSON templates, but the product page's main section doesn't accept app blocks. */
  | "no-product-blocks"
  /** No templates/product.json: a vintage (pre-2.0) theme. */
  | "vintage"
  /** We couldn't tell (missing scope, API error, unexpected file contents). */
  | "unknown";

/** JSON templates may open with a comment block that JSON.parse rejects. */
function stripJsonComments(content: string): string {
  return content.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

/**
 * The section type of the template's main section (e.g. "main-product"), or
 * null if there isn't an obvious one.
 */
export function mainSectionType(templateJson: string): string | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonComments(templateJson));
  } catch {
    return null;
  }
  const sections = (parsed as { sections?: Record<string, { type?: unknown }> })?.sections;
  if (!sections || typeof sections !== "object") return null;

  const entries = Object.entries(sections).filter(
    (entry): entry is [string, { type: string }] => typeof entry[1]?.type === "string",
  );
  const main =
    entries.find(([id]) => id === "main") ??
    entries.find(([, section]) => section.type.startsWith("main"));
  return main ? main[1].type : null;
}

/** Whether a section file's schema accepts app blocks. */
export function sectionAcceptsAppBlocks(sectionLiquid: string): boolean {
  return /"type"\s*:\s*"@app"/.test(sectionLiquid);
}

/** "gid://shopify/OnlineStoreTheme/123" → "123". */
export function themeNumericId(gid: string): string {
  return gid.split("/").pop() ?? gid;
}
