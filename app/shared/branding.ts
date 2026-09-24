/**
 * Pro branding for the guest pages: logo, page colours and font.
 *
 * Shared (not `.server`) because the admin settings form renders the font
 * list and runs the same validation the server does (CLAUDE.md hard rule 2).
 *
 * The accent colour stays a Free setting (ShopSettings.accentColor). These are
 * the Pro extras on top of it, stored in the same `Shop.settings` JSON, so no
 * schema change. They are only applied to a page when the shop is on Pro —
 * see brandingFor() in app/proxy/router.server.ts — so a shop that downgrades
 * keeps its saved values but goes back to the default look.
 */

export interface BrandFont {
  value: string;
  label: string;
  /** CSS font-family stack. */
  stack: string;
  /** Google Fonts family spec for the css2 API, or null for a local stack. */
  google: string | null;
}

export const BRAND_FONTS: BrandFont[] = [
  {
    value: "system",
    label: "Default (the guest's device font)",
    stack: `-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif`,
    google: null,
  },
  { value: "georgia", label: "Classic serif (Georgia)", stack: `Georgia,"Times New Roman",serif`, google: null },
  { value: "playfair", label: "Playfair Display", stack: `"Playfair Display",Georgia,serif`, google: "Playfair+Display:wght@400;600;700" },
  { value: "cormorant", label: "Cormorant Garamond", stack: `"Cormorant Garamond",Georgia,serif`, google: "Cormorant+Garamond:wght@400;600;700" },
  { value: "lora", label: "Lora", stack: `Lora,Georgia,serif`, google: "Lora:wght@400;600;700" },
  { value: "montserrat", label: "Montserrat", stack: `Montserrat,Arial,sans-serif`, google: "Montserrat:wght@400;600;700" },
  { value: "poppins", label: "Poppins", stack: `Poppins,Arial,sans-serif`, google: "Poppins:wght@400;600;700" },
  { value: "dmsans", label: "DM Sans", stack: `"DM Sans",Arial,sans-serif`, google: "DM+Sans:wght@400;600;700" },
];

export function brandFont(value: string | null | undefined): BrandFont {
  return BRAND_FONTS.find((f) => f.value === value) ?? BRAND_FONTS[0];
}

/** What a guest page needs to apply Pro branding. All fields already validated. */
export interface PageBranding {
  logoUrl: string | null;
  backgroundColor: string | null;
  textColor: string | null;
  font: string;
  hidePoweredBy: boolean;
}

const HEX6 = /^#[0-9a-fA-F]{6}$/;

/** "" for anything that isn't a 6-digit hex colour, so a bad value means "default". */
export function cleanHexColor(value: unknown): string {
  const s = String(value ?? "").trim();
  return HEX6.test(s) ? s.toLowerCase() : "";
}

/**
 * "" for anything that isn't a plain https image URL. The logo is rendered as
 * an <img src>, so no javascript:/data: URLs, and nothing that could break
 * out of the attribute (it's escaped on render too).
 */
export function cleanLogoUrl(value: unknown): string {
  const s = String(value ?? "").trim();
  if (!s || s.length > 2048) return "";
  try {
    const url = new URL(s);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

/** WCAG contrast ratio between two #rrggbb colours (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Default page colours when a merchant sets only one of the pair. */
export const DEFAULT_BACKGROUND = "#fbfbfa";
export const DEFAULT_TEXT = "#1a1a1a";
