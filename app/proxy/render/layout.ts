/**
 * Guest page rendering.
 *
 * Hand-written HTML strings, not React. The guest is on a phone, on cellular,
 * opening a link from a group chat, and has never heard of this app. Every
 * kilobyte of framework is a kilobyte spent before they see the gifts. The
 * whole page, CSS inlined, lands in well under 50KB and needs no hydration.
 *
 * A note on `Content-Type: application/liquid`: setting it would make Shopify
 * render this inside the merchant's theme, inheriting their header, fonts and
 * colours. Tempting, and it's the right end state. It also couples us to every
 * theme's quirks and adds a render hop. We ship plain HTML with merchant brand
 * tokens for MVP and offer theme-wrapping as an opt-in setting once we've seen
 * what real themes do to us.
 */

import { brandFont, type PageBranding } from "../../shared/branding";

export function escapeHtml(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

export function escapeAttr(value: string | null | undefined): string {
  return escapeHtml(value);
}

/** JSON destined for an inline <script>. Prevents `</script>` breakouts. */
export function jsonForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export interface LayoutOptions {
  title: string;
  description?: string;
  accentColor: string;
  indexable: boolean;
  shopName: string;
  /** Rendered into <head>; used for og: tags on shareable pages. */
  head?: string;
  bodyClass?: string;
  /**
   * Pro feature ("branding removal", pricing confirmed 22 Sep 2026 — see
   * app/routes/app.billing.tsx). Defaults to shown, so call sites that don't
   * pass it (create/manage/find pages, as of this change) keep today's
   * behavior.
   */
  hidePoweredBy?: boolean;
  /**
   * Pro branding (logo, page colours, font, no "Powered by Giftpin"). Null or
   * absent for Free shops — the caller decides, see brandingFor() in
   * app/proxy/router.server.ts.
   */
  branding?: PageBranding | null;
}

export function layout(options: LayoutOptions, body: string): string {
  const accent = safeColor(options.accentColor);
  const branding = options.branding ?? null;
  const hidePoweredBy = options.hidePoweredBy || branding?.hidePoweredBy;
  const font = brandFont(branding?.font);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${escapeHtml(options.title)}</title>
${options.description ? `<meta name="description" content="${escapeAttr(options.description)}">` : ""}
${options.indexable ? "" : '<meta name="robots" content="noindex,nofollow,noarchive">'}
<meta name="referrer" content="no-referrer">
${
  font.google
    ? `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${font.google}&display=swap">`
    : ""
}
<style>${baseStyles(accent)}${branding ? brandStyles(branding) : ""}</style>
${options.head ?? ""}
</head>
<body class="${escapeAttr(options.bodyClass ?? "")}">
<div class="wrap">
${
  branding?.logoUrl
    ? `<a class="brand-logo" href="/"><img src="${escapeAttr(branding.logoUrl)}" alt="${escapeAttr(options.shopName)}"></a>`
    : ""
}
${body}
</div>
<footer class="foot">
  <p>Registry by <strong>${escapeHtml(options.shopName)}</strong></p>
  ${hidePoweredBy ? "" : `<p class="powered-by">Powered by Giftpin</p>`}
</footer>
</body>
</html>`;
}

/** Never interpolate a merchant-supplied string into CSS unchecked. */
function safeColor(value: string, fallback = "#1a1a1a"): string {
  return /^#[0-9a-fA-F]{3,8}$/.test(value) ? value : fallback;
}

/**
 * Pro colour and font overrides, appended after baseStyles so they win.
 *
 * Page colours replace BOTH the light and the dark-mode palette: a merchant
 * who picks a cream background means cream on every phone, and a half-applied
 * palette (their background with our dark-mode text colour) is unreadable.
 * Card, muted and line colours are mixed from the chosen pair so they stay
 * legible whatever the pair is. Every value here was validated on save
 * (cleanHexColor / BRAND_FONTS), and safeColor runs again as a backstop.
 */
function brandStyles(branding: PageBranding): string {
  let css = "";
  if (branding.backgroundColor || branding.textColor) {
    const bg = safeColor(branding.backgroundColor ?? "", "#fbfbfa");
    const ink = safeColor(branding.textColor ?? "", "#1a1a1a");
    const vars = `--bg:${bg};--ink:${ink};--card:color-mix(in srgb,${bg} 93%,${ink});--muted:color-mix(in srgb,${ink} 65%,${bg});--line:color-mix(in srgb,${ink} 15%,${bg})`;
    css += `\n:root{${vars}}\n@media (prefers-color-scheme:dark){:root{${vars}}}`;
  }
  const font = brandFont(branding.font);
  if (font.value !== "system") css += `\nbody{font-family:${font.stack}}`;
  if (branding.logoUrl) css += `\n.brand-logo{display:block;margin:0 auto 20px;text-align:center}.brand-logo img{max-height:64px;max-width:220px;width:auto;height:auto}`;
  return css;
}

function baseStyles(accent: string): string {
  return `
:root{--accent:${accent};--bg:#fbfbfa;--card:#fff;--ink:#1a1a1a;--muted:#6b6b6b;--line:#e6e4e1;--radius:14px}
@media (prefers-color-scheme:dark){:root{--bg:#151515;--card:#1f1f1f;--ink:#f2f2f0;--muted:#a3a3a0;--line:#333}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:680px;margin:0 auto;padding:24px 16px 48px}
h1{font-size:26px;line-height:1.25;margin:0 0 6px;letter-spacing:-.01em}
h2{font-size:17px;margin:32px 0 12px;letter-spacing:-.005em}
p{margin:0 0 12px}
a{color:inherit}
.sub{color:var(--muted);font-size:15px;margin:0 0 4px}
.hero{margin-bottom:24px}
.hero-img{width:100%;aspect-ratio:16/7;object-fit:cover;border-radius:var(--radius);margin-bottom:16px;background:var(--line)}
.hero-art{width:100%;aspect-ratio:16/7;border-radius:var(--radius);margin-bottom:16px;overflow:hidden;background:var(--card)}
.hero-art svg{width:100%;height:100%;display:block}
.hero-painting{object-position:72% 50%}
.note{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:14px 16px;margin:16px 0;font-size:15px}
.progress{height:6px;background:var(--line);border-radius:99px;overflow:hidden;margin:14px 0 6px}
.progress>i{display:block;height:100%;background:var(--accent);border-radius:99px;transition:width .3s}

/* --- items ------------------------------------------------------------- */
.items{list-style:none;padding:0;margin:0;display:grid;gap:12px}
.item{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:14px;display:grid;grid-template-columns:84px 1fr;gap:14px;align-items:start}
.item.done{opacity:.5}
.item.held{border-style:dashed}
.item-img{width:84px;height:84px;object-fit:contain;border-radius:10px;background:var(--bg)}
.item-img.ph{display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:11px;text-align:center;padding:6px}
.item-title{font-weight:600;margin:0 0 4px;font-size:16px;line-height:1.35}
.item-meta{color:var(--muted);font-size:13px;margin:0 0 10px}
.item-note{font-size:14px;color:var(--muted);font-style:italic;margin:0 0 10px}
.price{font-variant-numeric:tabular-nums;font-weight:600}

/* External items are visually secondary on purpose. The merchant's own
   catalog is the anchor of the registry; everything else is completeness. */
.src{display:inline-flex;align-items:center;gap:4px;font-size:12px;color:var(--muted);border:1px solid var(--line);border-radius:99px;padding:2px 8px;margin-left:6px;vertical-align:middle}
.src.live{color:var(--accent);border-color:var(--accent)}

/* --- controls ---------------------------------------------------------- */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:var(--accent);color:#fff;border:1px solid var(--accent);border-radius:10px;padding:11px 18px;font-size:15px;font-weight:600;cursor:pointer;text-decoration:none;min-height:44px;font-family:inherit}
.btn:disabled{opacity:.45;cursor:default}
.btn.ghost{background:transparent;color:var(--ink);border-color:var(--line)}
.btn.sm{padding:8px 14px;font-size:14px;min-height:38px}
.btn.block{width:100%}
.row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.qty{width:62px;padding:9px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--ink);font-size:15px;font-family:inherit}
input[type=text],input[type=email],input[type=url],input[type=date],input[type=password],textarea,select{width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink);font-size:16px;font-family:inherit}
textarea{min-height:88px;resize:vertical}
label{display:block;font-size:14px;font-weight:600;margin:16px 0 6px}
.hint{font-size:13px;color:var(--muted);margin:6px 0 0;font-weight:400}
.err{background:#fdecea;border:1px solid #f5b5ae;color:#8c1d13;padding:12px 14px;border-radius:10px;margin:16px 0;font-size:14px}
.ok{background:#e8f5ea;border:1px solid #a8d5b1;color:#1c5128;padding:12px 14px;border-radius:10px;margin:16px 0;font-size:14px}
@media (prefers-color-scheme:dark){.err{background:#3a1f1c;border-color:#6b322c;color:#f5b5ae}.ok{background:#1b2f20;border-color:#356b3f;color:#a8d5b1}}
.foot{text-align:center;color:var(--muted);font-size:13px;padding:0 16px 32px}
.powered-by{font-size:11px;opacity:.7;margin:2px 0 0}
.share{display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));margin:12px 0}

/* --- ideas guide, Not sure what to add (every occasion) ---------------- */
details.note{padding:14px 16px}
details.note summary{cursor:pointer;list-style:none;font-size:15px}
details.note summary::-webkit-details-marker{width:0;height:0;opacity:0;margin:0}
details.note summary::before{content:'+  ';color:var(--accent);font-weight:700}
details.note [open]>summary::before,details.note[open]>summary::before{content:'–  '}
details.ideas{background:var(--card);background:color-mix(in srgb,var(--accent) 7%,var(--card));border-color:color-mix(in srgb,var(--accent) 22%,var(--line));padding:16px 18px}
details.ideas>summary{display:flex;align-items:center;gap:14px}
details.note.ideas>summary::before,details.note.ideas[open]>summary::before{content:none}
details.ideas[open]>summary{padding-bottom:4px}
.ideas-icon{flex:none;display:grid;place-items:center;width:44px;height:44px;border-radius:50%;color:var(--accent);background:color-mix(in srgb,var(--accent) 12%,transparent)}
.ideas-text{flex:1;min-width:0}
.ideas-q{display:block;font-size:17px;font-weight:600;line-height:1.3;letter-spacing:-.005em}
.ideas-t{display:block;font-size:14px;color:var(--muted);margin-top:1px}
.ideas-cta{flex:none;display:inline-flex;align-items:center;gap:6px;background:var(--accent);color:#fff;border-radius:999px;padding:8px 14px;font-size:14px;font-weight:600}
.ideas-cta svg{transition:transform .2s}
details.ideas[open] .ideas-cta svg{transform:rotate(180deg)}
details.ideas[open] .ideas-cta-open,details.ideas:not([open]) .ideas-cta-close{display:none}
details.ideas>summary:hover .ideas-cta{filter:brightness(1.08)}
details.ideas>summary:focus-visible{outline:2px solid var(--accent);outline-offset:4px;border-radius:8px}
@media (max-width:420px){.ideas-cta-label{display:none}.ideas-cta{padding:10px}}
.cat-fallback{margin:12px 0 4px;padding:10px 12px;border:1px dashed var(--line);border-radius:8px}
.owner-link{margin:28px 0 0;font-size:14px}
.match{margin:6px 0 8px;padding:8px 10px;border:1px dashed var(--line);border-radius:8px}
.store-link{font-size:13px}
.match-dialog{width:min(520px,calc(100vw - 32px));max-height:calc(100vh - 48px);overflow:auto;border:1px solid var(--line);border-radius:var(--radius);background:var(--card);color:var(--ink);padding:16px 18px}
.match-dialog::backdrop{background:rgba(0,0,0,.45)}
.md-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}
.md-head h2{margin:0;font-size:18px}
.md-head .dismiss{background:none;border:0;color:var(--muted);font-size:24px;line-height:1;cursor:pointer;padding:4px}
.md-card{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-top:1px solid var(--line)}
.md-card{flex-wrap:wrap}
.md-info{flex:1;min-width:0}
.md-warn{flex-basis:100%;margin:0}
.md-foot{margin-top:12px;display:flex;gap:8px;flex-wrap:wrap}
.cat-group{margin:26px 0 0}
.cat-head{font-size:18px;margin:0 0 10px}
.cat-select{min-width:0;max-width:100%;width:auto}
.cat-room{border-top:1px solid var(--line);padding:8px 0 2px;margin-top:6px}
.cat-room summary{font-weight:600;font-size:14px}
.cat-room[open]{padding-bottom:8px}
.cat-sub{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);margin:10px 0 4px}
.cat-grid{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 4px}
.cat-chip{display:inline-flex;align-items:center;background:var(--bg);border:1px solid var(--line);border-radius:999px;padding:6px 12px;font-size:13px;text-decoration:none;color:var(--ink)}
a.cat-chip:hover,a.cat-chip:focus-visible{border-color:var(--accent);color:var(--accent)}
.cat-chip--add{color:var(--muted);font-style:italic}
.update-banner:not([hidden]){display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--accent);border-radius:var(--radius);padding:10px 12px;margin:0 0 16px;font-size:14px}
.update-banner span{flex:1}
.update-banner .dismiss{background:none;border:0;color:var(--muted);font-size:20px;line-height:1;cursor:pointer;padding:4px}
.empty{text-align:center;padding:44px 20px;color:var(--muted)}
.sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media (max-width:420px){.item{grid-template-columns:64px 1fr;gap:12px}.item-img{width:64px;height:64px}h1{font-size:22px}}

/* --- desktop ------------------------------------------------------------
   The single 680px column is sized for phones, where most guests open the
   link. On a wide screen it left two-thirds of the window empty, so from
   960px up the page widens and item lists go two across. Phones and tablets
   below the breakpoint render exactly as before. */
@media (min-width:960px){
.wrap{max-width:1120px;padding:32px 32px 56px}
h1{font-size:30px}
.hero-img{aspect-ratio:16/5}
.hero-art{aspect-ratio:auto;height:300px;display:flex;justify-content:center;background:color-mix(in srgb,var(--accent) 6%,var(--card))}
.hero-art svg{width:auto;height:100%}
.hero-art svg>rect:first-child{display:none}
.items{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.duo{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:16px 0}
.duo>.note{margin:0}
.duo>.note:only-child{grid-column:1/-1}
.fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:24px}
.fields>.full{grid-column:1/-1}
}
`;
}

export function formatMoney(amount: number, currency: string | null): string {
  if (!Number.isFinite(amount) || amount <= 0) return "";
  try {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: currency || "CAD",
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export function htmlResponse(body: string, headers: Headers, status = 200): Response {
  return new Response(body, { status, headers });
}

/** Where a store match points on the merchant's own storefront. */
export function storeMatchHref(m: { kind: "product" | "search"; title: string; handle: string | null }): string {
  return m.kind === "product" && m.handle
    ? `/products/${encodeURIComponent(m.handle)}`
    : `/search?q=${encodeURIComponent(m.title)}&type=product`;
}
