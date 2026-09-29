/**
 * Default hero artwork for the guest registry page, shown whenever the
 * registrant hasn't uploaded their own cover photo (`coverImageUrl`).
 * Built for Ben's request (23 Sep 2026: "a nice background image
 * appropriate for each of the different registries ... make it classy").
 *
 * Deliberately original, hand-drawn line art rather than a stock photo or
 * an AI-generated raster image: no licensing question, no external asset
 * to host or fetch (fits the guest page's "no external scripts or
 * stylesheets" budget — see registry-page.test.ts), and it scales crisply
 * at any size. Every shape below is composed from plain SVG primitives
 * (paths, ellipses, rects) — nothing traced or copied from another source.
 *
 * Rendered inline in the page body (not as an <img src="data:...">), so it
 * inherits the page's CSS custom properties directly — `var(--accent)`
 * automatically matches each merchant's own brand color, and the artwork
 * adapts to light/dark mode for free along with the rest of the page.
 *
 * Not a `.server` file — `registry-page.ts` (bundled for the browser, not
 * a loader/action) imports this directly, same reasoning as
 * `app/shared/settings.ts` and `app/shared/wedding-categories.ts`.
 */

const VIEWBOX = "0 0 400 175";

/** A champagne coupe, drawn upright with its base at the local origin. */
function coupe(x: number, y: number, rotateDeg: number): string {
  return `<g transform="translate(${x} ${y}) rotate(${rotateDeg})" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="0" cy="0" rx="15" ry="3" />
    <line x1="0" y1="0" x2="0" y2="-46" />
    <path d="M -27 -80 C -31 -61 -9 -48 0 -46 C 9 -48 31 -61 27 -80" />
    <ellipse cx="0" cy="-80" rx="27" ry="5.5" />
  </g>`;
}

/** Three small rising bubbles above a point, for the champagne "clink". */
function bubbles(x: number, y: number): string {
  return `<g fill="var(--accent)" opacity="0.55">
    <circle cx="${x - 6}" cy="${y}" r="2.6" />
    <circle cx="${x + 5}" cy="${y - 12}" r="2" />
    <circle cx="${x - 1}" cy="${y - 24}" r="1.6" />
  </g>`;
}

/** A simple tiered cake, base-anchored at (x, y). */
function tieredCake(x: number, y: number): string {
  return `<g stroke="var(--accent)" stroke-width="2" fill="var(--accent)" fill-opacity="0.08">
    <rect x="${x - 38}" y="${y - 20}" width="76" height="20" rx="3" />
    <rect x="${x - 27}" y="${y - 37}" width="54" height="17" rx="3" />
    <rect x="${x - 15}" y="${y - 51}" width="30" height="14" rx="3" />
    <circle cx="${x}" cy="${y - 58}" r="3" fill="var(--accent)" stroke="none" fill-opacity="0.9" />
  </g>`;
}

function weddingArt(): string {
  return `<svg viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="400" height="175" fill="var(--accent)" opacity="0.06" />
  <circle cx="70" cy="35" r="70" fill="var(--accent)" opacity="0.05" />
  ${coupe(128, 150, -16)}
  ${coupe(198, 150, 16)}
  ${bubbles(163, 66)}
  ${tieredCake(300, 152)}
  <path d="M 40 150 h 320" stroke="var(--accent)" stroke-width="1" opacity="0.2" />
</svg>`;
}

function babyArt(): string {
  return `<svg viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="400" height="175" fill="var(--accent)" opacity="0.06" />
  <circle cx="330" cy="40" r="80" fill="var(--accent)" opacity="0.05" />
  <path d="M 150 60 A 34 34 0 1 0 150 128 A 26 26 0 1 1 150 60 Z" fill="var(--accent)" fill-opacity="0.15" stroke="var(--accent)" stroke-width="2" />
  <g fill="var(--accent)" opacity="0.75">
    <path d="M 220 70 l 3 8 8 1 -6 5 2 8 -7 -4 -7 4 2 -8 -6 -5 8 -1 Z" />
    <path d="M 255 105 l 2 5 5 1 -4 3 1 5 -4 -2 -4 2 1 -5 -4 -3 5 -1 Z" />
    <path d="M 200 115 l 2 4 4 1 -3 3 1 4 -4 -2 -4 2 1 -4 -3 -3 4 -1 Z" />
  </g>
</svg>`;
}

function birthdayArt(): string {
  const cake = tieredCake(200, 152);
  return `<svg viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="400" height="175" fill="var(--accent)" opacity="0.06" />
  <circle cx="90" cy="40" r="70" fill="var(--accent)" opacity="0.05" />
  ${cake}
  <g stroke="var(--accent)" stroke-width="2" fill="none" stroke-linecap="round">
    <line x1="188" y1="101" x2="188" y2="88" /><path d="M 188 88 q 3 -6 0 -10" />
    <line x1="200" y1="101" x2="200" y2="86" /><path d="M 200 86 q 3 -6 0 -10" />
    <line x1="212" y1="101" x2="212" y2="88" /><path d="M 212 88 q 3 -6 0 -10" />
  </g>
  <g fill="var(--accent)" opacity="0.5">
    <circle cx="120" cy="70" r="3" /><circle cx="300" cy="60" r="2.5" />
    <circle cx="290" cy="100" r="2" /><circle cx="130" cy="110" r="2.5" />
  </g>
</svg>`;
}

function housewarmingArt(): string {
  return `<svg viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="400" height="175" fill="var(--accent)" opacity="0.06" />
  <circle cx="320" cy="45" r="75" fill="var(--accent)" opacity="0.05" />
  <g stroke="var(--accent)" stroke-width="2.5" fill="none" stroke-linejoin="round" stroke-linecap="round">
    <path d="M 150 150 V 95 H 250 V 150" />
    <path d="M 138 100 L 200 55 L 262 100" />
    <rect x="216" y="115" width="22" height="35" />
    <circle cx="222" cy="132" r="1.6" fill="var(--accent)" stroke="none" />
  </g>
  <g stroke="var(--accent)" stroke-width="2" fill="none" stroke-linecap="round">
    <path d="M 100 150 C 100 130 90 122 78 122 C 90 122 100 112 100 96" />
    <path d="M 100 150 C 100 135 108 128 116 128" />
  </g>
</svg>`;
}

function graduationArt(): string {
  return `<svg viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="400" height="175" fill="var(--accent)" opacity="0.06" />
  <circle cx="90" cy="130" r="75" fill="var(--accent)" opacity="0.05" />
  <g stroke="var(--accent)" stroke-width="2.5" fill="none" stroke-linejoin="round" stroke-linecap="round">
    <path d="M 150 70 L 220 45 L 290 70 L 220 95 Z" fill="var(--accent)" fill-opacity="0.1" />
    <ellipse cx="220" cy="82" rx="34" ry="9" />
    <line x1="286" y1="72" x2="286" y2="98" />
    <circle cx="286" cy="103" r="4" fill="var(--accent)" stroke="none" />
  </g>
  <g stroke="var(--accent)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 70 100 h 60 v 45 a 30 8 0 0 1 -60 0 Z" fill="var(--accent)" fill-opacity="0.08" />
    <path d="M 70 100 a 30 8 0 0 0 60 0" />
    <path d="M 100 116 l 22 -10" opacity="0.5" />
  </g>
</svg>`;
}

function anniversaryArt(): string {
  return `<svg viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="400" height="175" fill="var(--accent)" opacity="0.06" />
  <circle cx="200" cy="60" r="80" fill="var(--accent)" opacity="0.05" />
  <g stroke="var(--accent)" stroke-width="3" fill="none">
    <circle cx="184" cy="88" r="30" />
    <circle cx="216" cy="88" r="30" />
  </g>
  <g stroke="var(--accent)" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.55">
    <path d="M 150 150 q 20 -18 50 -6" />
    <path d="M 250 150 q -20 -18 -50 -6" />
  </g>
</svg>`;
}

function corporateArt(): string {
  return `<svg viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="400" height="175" fill="var(--accent)" opacity="0.06" />
  <circle cx="300" cy="130" r="70" fill="var(--accent)" opacity="0.05" />
  <g stroke="var(--accent)" stroke-width="2.5" fill="var(--accent)" fill-opacity="0.08" stroke-linejoin="round">
    <rect x="150" y="90" width="100" height="65" />
    <path d="M 150 112 h 100" />
    <rect x="188" y="90" width="24" height="65" fill-opacity="0.15" />
  </g>
</svg>`;
}

function generalArt(): string {
  return `<svg viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="400" height="175" fill="var(--accent)" opacity="0.06" />
  <circle cx="110" cy="45" r="75" fill="var(--accent)" opacity="0.05" />
  <g stroke="var(--accent)" stroke-width="2.5" fill="var(--accent)" fill-opacity="0.08" stroke-linejoin="round" stroke-linecap="round">
    <rect x="160" y="90" width="80" height="60" rx="3" />
    <path d="M 160 112 h 80" />
    <rect x="192" y="90" width="16" height="60" fill-opacity="0.2" />
    <path d="M 200 90 C 180 90 178 68 192 66 C 182 60 190 46 200 58 C 210 46 218 60 208 66 C 222 68 220 90 200 90 Z" />
  </g>
</svg>`;
}

const EVENT_ART: Record<string, () => string> = {
  wedding: weddingArt,
  engagement: weddingArt,
  "bridal-shower": weddingArt,
  baby: babyArt,
  christening: babyArt,
  birthday: birthdayArt,
  "coming-of-age": birthdayArt,
  graduation: graduationArt,
  college: graduationArt,
  housewarming: housewarmingArt,
  anniversary: anniversaryArt,
  corporate: corporateArt,
  other: generalArt,
};

/**
 * Painted raster banners that replace the line art above for every event
 * type. Files live in `public/art/` and are served from the app's own
 * origin, so callers pass that origin (SHOPIFY_APP_URL) as `assetBase` —
 * the guest page itself is served on the shop's domain through the app
 * proxy, so a relative path wouldn't resolve. All of these are Ben's own
 * Midjourney images (29 Sep 2026, modern minimalist "New Yorker cover"
 * style, subject centred so the phone crop keeps it). Bump the filename
 * when replacing a file so browsers don't keep a cached copy.
 */
const EVENT_PAINTINGS: Record<string, { widths: number[]; path: (w: number) => string; position?: string }> = {
  wedding: { widths: [1024, 1952], path: (w) => `/art/wedding-v4-${w}.webp` },
  engagement: { widths: [1024, 1952], path: (w) => `/art/engagement-v1-${w}.webp` },
  "bridal-shower": { widths: [1024, 1952], path: (w) => `/art/bridal-shower-v1-${w}.webp` },
  baby: { widths: [1024, 1952], path: (w) => `/art/baby-v1-${w}.webp` },
  christening: { widths: [1024, 1952], path: (w) => `/art/christening-v1-${w}.webp` },
  // The cake sits right of centre; shift the phone crop so the balloons aren't clipped.
  birthday: { widths: [1024, 1952], path: (w) => `/art/birthday-v1-${w}.webp`, position: "62% 50%" },
  "coming-of-age": { widths: [1024, 1952], path: (w) => `/art/coming-of-age-v1-${w}.webp` },
  graduation: { widths: [1024, 1952], path: (w) => `/art/graduation-v1-${w}.webp` },
  college: { widths: [1024, 1952], path: (w) => `/art/college-v1-${w}.webp` },
  housewarming: { widths: [1024, 1952], path: (w) => `/art/housewarming-v1-${w}.webp` },
  anniversary: { widths: [1024, 1952], path: (w) => `/art/anniversary-v1-${w}.webp` },
  retirement: { widths: [1024, 1952], path: (w) => `/art/retirement-v1-${w}.webp` },
  holiday: { widths: [1024, 1952], path: (w) => `/art/holiday-v1-${w}.webp` },
  "new-pet": { widths: [1024, 1952], path: (w) => `/art/new-pet-v1-${w}.webp` },
  fundraiser: { widths: [1024, 1952], path: (w) => `/art/fundraiser-v1-${w}.webp` },
  corporate: { widths: [1024, 1952], path: (w) => `/art/corporate-v1-${w}.webp` },
  other: { widths: [1024, 1952], path: (w) => `/art/other-v1-${w}.webp` },
};

/**
 * `<img>` hero for the event type's painted banner (an unrecognized type gets
 * the "other" banner), or null (use `eventHeroArt` instead) when no asset
 * base is known.
 */
export function eventHeroImage(eventType: string, assetBase: string | null | undefined): string | null {
  const painting = EVENT_PAINTINGS[eventType] ?? EVENT_PAINTINGS.other;
  const base = (assetBase ?? "").replace(/\/+$/, "");
  if (!painting || !/^https?:\/\//.test(base)) return null;
  const largest = painting.widths[painting.widths.length - 1];
  const srcset = painting.widths.map((w) => `${base}${painting.path(w)} ${w}w`).join(", ");
  const style = painting.position ? ` style="object-position:${painting.position}"` : "";
  return `<img class="hero-img hero-painting"${style} src="${base}${painting.path(largest)}" srcset="${srcset}" sizes="(min-width:960px) 1056px, 100vw" alt="" loading="eager" decoding="async">`;
}

/** Inline SVG hero art for the given `eventType`. Falls back to a generic gift motif for an unrecognized value. */
export function eventHeroArt(eventType: string): string {
  return (EVENT_ART[eventType] ?? generalArt)();
}
