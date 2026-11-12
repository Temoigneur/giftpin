import { APP_STORE_URL, DEMO_VIDEO_URL, GA_MEASUREMENT_ID, SITE_URL, appStoreHref, holidayPromoOn } from "./config";
import { CHROME, FLAGS, LANG_COOKIE, LOCALES, LOCALE_NAMES, siteLocaleFromRequest } from "./chrome-copy";
import type { Locale } from "../shared/i18n";

/**
 * Shared shell for the public marketing site (giftpin.app: `/`, `/features`,
 * `/pricing`, `/faq`). Each page is a resource route that returns
 * `sitePage(...)` as plain HTML: no React, no auth, no session, same as the
 * original `_index.tsx` and `pricing.tsx`.
 *
 * Colours come from the app icon (public/brand/, the tile-only gift icon
 * Ben picked 24 Sep 2026): pale ice blue for the header, hero and footer
 * bands, the tile's cyan-to-violet gradient for highlights, and deep navy for the few dark
 * accent blocks. In dark mode the bands turn navy. Not a
 * `.server` file, and imports nothing server-side (CLAUDE.md hard rule 2).
 */

export const SUPPORT = "support@giftpin.app";

const EARLY_ACCESS = `mailto:${SUPPORT}?subject=${encodeURIComponent("Giftpin early access")}`;

/**
 * The language the page being built is framed in (header, menu, footer,
 * install button). Set by `renderFor` around a synchronous render, so a page
 * function never has to be handed it. This is safe only because every page
 * builder is synchronous: nothing awaits between setting and resetting it, so
 * two requests can't interleave. Don't add an `await` inside a builder.
 */
let activeLocale: Locale = "en";
export function siteLocale(): Locale {
  return activeLocale;
}

/** Builds a page in the language its `?lang=` asked for. `render` must be synchronous. */
export function renderFor(request: Request, render: () => string): Response {
  const previous = activeLocale;
  activeLocale = siteLocaleFromRequest(request);
  try {
    return htmlResponse(render());
  } finally {
    activeLocale = previous;
  }
}

/**
 * Primary call to action: the App Store listing once it exists. `placement`
 * names the button in the link's utm_content and the install_click event.
 */
export function cta(placement = "body"): { href: string; label: string; note: string; isInstall: boolean } {
  const c = CHROME[activeLocale];
  return APP_STORE_URL
    ? { href: appStoreHref(placement), label: c.install, note: c.installNote, isInstall: true }
    : { href: EARLY_ACCESS, label: c.early, note: c.earlyNote, isInstall: false };
}

/**
 * The sitePage() options a translated page needs: its language, the
 * `?lang=` canonical and the hreflang links to every language of the page.
 */
export function localeMeta(path: string): { lang: string; query: string; alternates: { lang: string; href: string }[] } {
  const loc = activeLocale;
  return {
    lang: loc,
    query: loc === "en" ? "" : `?lang=${loc}`,
    alternates: [
      ...LOCALES.map((l) => ({ lang: l, href: `${SITE_URL}${path}${l === "en" ? "" : `?lang=${l}`}` })),
      { lang: "x-default", href: `${SITE_URL}${path}` },
    ],
  };
}

export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function htmlResponse(html: string): Response {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      // The language can come from a cookie, so a cache must not share one language's copy.
      Vary: "Cookie",
    },
  });
}

type NavKey = "home" | "features" | "pricing" | "setup" | "faq" | "guides";

export function sitePage(opts: {
  path: string;
  nav: NavKey;
  title: string;
  description: string;
  body: string;
  /** Page-specific CSS, appended after the shared stylesheet. */
  css?: string;
  jsonLd?: object[];
  /** Page language (the html lang attribute). Default English. */
  lang?: string;
  /** Appended to the canonical URL, e.g. "?lang=fr", for translated copies of a page. */
  query?: string;
  /** hreflang links to the other languages of this page. */
  alternates?: { lang: string; href: string }[];
}): string {
  const url = `${SITE_URL}${opts.path}${opts.query ?? ""}`;
  const c = cta("header");
  const m = cta("menu");
  const loc = activeLocale;
  const ch = CHROME[loc];
  // Keep the visitor's language as they move around the site.
  const q = loc === "en" ? "" : `?lang=${loc}`;
  const link = (key: NavKey, href: string, label: string) =>
    `<a href="${href}${q}"${opts.nav === key ? ' aria-current="page"' : ""}>${label}</a>`;
  const links = [
    link("features", "/features", ch.features),
    link("pricing", "/pricing", ch.pricing),
    link("setup", "/setup", ch.setupNav),
    link("faq", "/faq", ch.faq),
    `<a href="/${q}#demo">${ch.demo}</a>`,
  ].join("");
  // A menu of links rather than a <select>: a select can't show flags. Each link
  // works without JavaScript (?lang=), and a click also sets the cookie that
  // keeps the choice as the visitor moves around the site.
  const picker = () => `<details class="lang-menu">
  <summary aria-label="${esc(ch.language)}">${FLAGS[loc]}<span>${esc(LOCALE_NAMES[loc])}</span></summary>
  <ul>${LOCALES.map(
    (l) => `<li><a href="${opts.path}?lang=${l}" lang="${l}" hreflang="${l}" data-lang="${l}"${l === loc ? ' aria-current="true"' : ""}>${FLAGS[l]}<span>${esc(LOCALE_NAMES[l])}</span></a></li>`,
  ).join("")}</ul>
</details>`;
  const ld = (opts.jsonLd ?? [])
    .map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`)
    .join("\n");

  return `<!doctype html>
<html lang="${esc(opts.lang ?? "en")}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(opts.title)}</title>
<meta name="description" content="${esc(opts.description)}">
<link rel="canonical" href="${url}">
${(opts.alternates ?? []).map((a) => `<link rel="alternate" hreflang="${esc(a.lang)}" href="${esc(a.href)}">`).join("\n")}
<meta property="og:site_name" content="Giftpin">
<meta property="og:title" content="${esc(opts.title)}">
<meta property="og:description" content="${esc(opts.description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE_URL}/brand/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#eaf3fc">
<link rel="icon" type="image/png" sizes="64x64" href="/brand/giftpin-icon-64.png">
<link rel="apple-touch-icon" href="/brand/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
<style>${CSS}${opts.css ?? ""}</style>
<script>document.documentElement.classList.add("js")</script>
${analyticsHead()}
${ld}
</head>
<body>
<a class="skip" href="#main">${ch.skip}</a>
<header class="site-top">
  <div class="wrap bar">
    <a class="brand" href="/${q}" aria-label="${esc(ch.homeLabel)}"><img src="/brand/giftpin-icon-64.png" alt="" width="32" height="32">Giftpin</a>
    <nav class="links" aria-label="${esc(ch.navLabel)}">${links}</nav>
    ${picker()}
    <a class="btn sm dark hide-sm" href="${esc(c.href)}">${c.label}</a>
    <details class="menu">
      <summary aria-label="${esc(ch.menu)}">${icon("menu")}</summary>
      <nav aria-label="${esc(ch.navLabel)}">${links}${picker()}<a class="btn dark" href="${esc(m.href)}">${m.label}</a></nav>
    </details>
  </div>
</header>
<main id="main">
${opts.body}
</main>
<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <a class="brand" href="/"><img src="/brand/giftpin-icon-64.png" alt="" width="32" height="32">Giftpin</a>
        <p>${ch.tagline}</p>
      </div>
      <div><h3>${ch.product}</h3><a href="/features${q}">${ch.features}</a><a href="/pricing${q}">${ch.pricing}</a><a href="/${q}#demo">${ch.demo}</a><a href="/faq${q}">${ch.faq}</a></div>
      <div><h3>${ch.guides}</h3><a href="/setup${q}">${ch.setup}</a><a href="/registry-guide${q}">${ch.creating}</a><a href="/gift-registry-app${q}">${ch.app}</a><a href="/wedding-registry${q}">${ch.wedding}</a><a href="/baby-registry${q}">${ch.baby}</a><a href="/home-goods-registry${q}">${ch.home}</a><a href="/compare${q}">${ch.compare}</a><a href="/gift-cards${q}">${ch.giftCards}</a>${holidayPromoOn() ? `<a href="/holiday-wish-lists${q}">${ch.holiday}</a>` : ""}</div>
      <div><h3>${ch.company}</h3><a href="mailto:${SUPPORT}">${SUPPORT}</a><a href="/privacy${q}">${ch.privacy}</a></div>
    </div>
    <p class="fine">${ch.fine}</p>
  </div>
</footer>
<script>
(function(){
  var els=document.querySelectorAll(".rise");
  if(!("IntersectionObserver" in window)){els.forEach(function(e){e.classList.add("in")});return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}})},{rootMargin:"0px 0px -8% 0px"});
  els.forEach(function(e){io.observe(e)});
  document.querySelectorAll("a[data-lang]").forEach(function(a){
    a.addEventListener("click",function(){
      document.cookie="${LANG_COOKIE}="+a.getAttribute("data-lang")+"; path=/; max-age=31536000; SameSite=Lax";
    });
  });
  document.addEventListener("click",function(e){
    document.querySelectorAll(".lang-menu[open]").forEach(function(d){if(!d.contains(e.target))d.open=false});
  });
  document.querySelectorAll(".menu nav a").forEach(function(a){a.addEventListener("click",function(){a.closest("details").open=false})});
})();
</script>
${analyticsClicks()}
</body>
</html>
`;
}

/** Final gradient band shared by every page. */
export function finalCta(heading = "Give your customers the registry they actually want."): string {
  const c = cta("final");
  return `<section class="final">
  <div class="wrap rise">
    <h2>${heading}</h2>
    <p>${c.note}</p>
    <div class="cta-row center">
      <a class="btn light lg" href="${esc(c.href)}">${c.label}</a>
      <a class="btn ghost-light lg" href="/pricing${activeLocale === "en" ? "" : `?lang=${activeLocale}`}">${CHROME[activeLocale].seePricing}</a>
    </div>
  </div>
</section>`;
}

/**
 * EEA, UK and Swiss visitors: Google Analytics starts with analytics cookies
 * off (Consent Mode "denied"), because the site has no consent banner. Google
 * picks the region from the visitor's IP. Everyone else is counted normally,
 * unless their browser sends Global Privacy Control. Ads and ad
 * personalisation are off for everyone: the site runs no Google Ads tags.
 */
export const CONSENT_DENIED_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT",
  "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
];

/** The GA4 tag, with consent defaults set before it loads. Empty when GA_MEASUREMENT_ID is. */
export function analyticsHead(): string {
  if (!GA_MEASUREMENT_ID) return "";
  const id = esc(GA_MEASUREMENT_ID);
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
var gpOff=navigator.globalPrivacyControl===true;
gtag("consent","default",{ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",analytics_storage:gpOff?"denied":"granted"});
gtag("consent","default",{ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",analytics_storage:"denied",region:${JSON.stringify(CONSENT_DENIED_REGIONS)}});
gtag("js",new Date());
gtag("config","${id}",{allow_google_signals:false,allow_ad_personalization_signals:false});
</script>`;
}

/**
 * Click events for GA4 (see docs/analytics.md for the list and what to
 * register in GA). One delegated listener, so new buttons are covered without
 * touching this. Sends no names, emails or typed text: only which button, where
 * on the page, and the page's language. Placement comes from data-placement,
 * else the part of the page the link sits in.
 */
export function analyticsClicks(): string {
  if (!GA_MEASUREMENT_ID) return "";
  return `<script>
(function(){
  if(typeof gtag!=="function")return;
  var lang=document.documentElement.lang||"en";
  function ev(name,p){p=p||{};p.page_lang=lang;gtag("event",name,p);}
  function place(el){
    var d=el.getAttribute("data-placement");if(d)return d;
    var map=[[".site-top .menu","menu"],[".site-top","header"],[".final","final"],[".hero","hero"],[".foot","footer"],[".faq","faq"]];
    for(var i=0;i<map.length;i++){if(el.closest(map[i][0]))return map[i][1];}
    return "body";
  }
  function path(h){return h.split(/[?#]/)[0]||"/";}
  document.addEventListener("click",function(e){
    var t=e.target&&e.target.closest?e.target.closest("a,summary"):null;if(!t)return;
    if(t.tagName==="SUMMARY"){
      var d=t.parentElement;
      if(d&&!d.open&&d.closest(".faq"))ev("faq_open",{placement:place(t),faq_question:t.textContent.trim().slice(0,100)});
      else if(d&&!d.open&&d.classList.contains("lang-menu"))ev("lang_menu_open",{placement:place(d)});
      return;
    }
    var h=t.getAttribute("href")||"";
    if(h.indexOf("apps.shopify.com")>-1)ev("install_click",{placement:place(t)});
    else if(t.hasAttribute("data-lang"))ev("lang_switch",{lang_from:lang,lang_to:t.getAttribute("data-lang"),placement:place(t)});
    else if(t.hasAttribute("data-store"))ev("gift_card_store_click",{store_host:t.getAttribute("data-store")});
    else if(h.indexOf("mailto:")===0)ev("contact_click",{placement:place(t)});
    else if(/#demo$/.test(h))ev("demo_click",{placement:place(t)});
    else if(/^\\/(setup|registry-guide|guest-guide)(\\/|$|[?#])/.test(h))ev("setup_link_click",{placement:place(t),link_path:path(h)});
    else if(/^\\/pricing([?#]|$)/.test(h))ev("pricing_click",{placement:place(t)});
  });
})();
</script>`;
}

/**
 * The demo video slot. Empty DEMO_VIDEO_URL shows a placeholder in the same
 * 16:9 frame so the page layout doesn't move when the real video goes in.
 */
export function demoVideo(): string {
  const embed = videoEmbed(DEMO_VIDEO_URL);
  if (embed) return `<div class="video">${embed}</div>`;
  return `<div class="video placeholder" role="img" aria-label="Demo video coming soon">
  <div class="vp-glow"></div>
  <div class="vp-center">
    <span class="play">${icon("play")}</span>
    <strong>Demo video coming soon</strong>
    <span>A two-minute tour of a registry, from first item to thank-you list.</span>
  </div>
</div>`;
}

export function videoEmbed(url: string): string {
  if (!url) return "";
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) {
    return `<iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0" title="Giftpin demo" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
  }
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return `<iframe src="https://player.vimeo.com/video/${vimeo[1]}" title="Giftpin demo" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
  }
  if (/\.(mp4|webm)(\?|$)/i.test(url)) {
    return `<video src="${esc(url)}" controls playsinline preload="metadata" poster="/brand/og-image.png"></video>`;
  }
  return "";
}

const ICONS: Record<string, string> = {
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1"/>',
  gift: '<path d="M20 12v8H4v-8M2 7h20v5H2zM12 22V7M12 7c-2-4-6-3-5.5 0S12 7 12 7zM12 7c2-4 6-3 5.5 0S12 7 12 7z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>',
  truck: '<path d="M2 6h11v10H2zM13 9h4l4 4v3h-8"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  list: '<path d="M9 6h12M9 12h12M9 18h12"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
  store: '<path d="M3 9l1.5-5h15L21 9M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0zM5 13v8h14v-8"/><path d="M10 21v-5h4v5"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  report: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 17v-3M12 17v-6M15 17v-4"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.8 2-1.8 0-1.3-1.2-1.7-1.2-2.8 0-1 .8-1.4 1.8-1.4H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10.5" cy="7" r="1.2"/><circle cx="15.5" cy="7.5" r="1.2"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
  percent: '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>',
  headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/><path d="M19 20c0 1-1.5 2-4 2h-2"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  heart: '<path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  puzzle: '<path d="M4 8h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4H4z"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  scan: '<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/><path d="M8 8v8M11 8v8M14 8v8M17 8v8"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  box: '<path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5L12 12l9-4.5M12 12v9"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  dash: '<path d="M7 12h10"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
};

export function icon(name: keyof typeof ICONS | string): string {
  return `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] ?? ""}</svg>`;
}

const CSS = `
:root{
  --night:#181638; --night-2:#211f4d; --night-ink:#f2f1ff; --night-soft:#b9b7e0; --night-line:rgba(255,255,255,.12);
  --band:#eaf3fc; --band-glass:rgba(234,243,252,.85); --band-ink:#15142e; --band-soft:#4d5878; --band-line:rgba(21,20,46,.1); --band-dot:rgba(59,130,246,.18); --band-pill:#0e7490; --band-chip:rgba(255,255,255,.55);
  --bg:#fbfaff; --surface:#ffffff; --tint:#f3f1ff; --ink:#15142e; --ink-soft:#57567a; --line:#e6e3f5;
  --accent:#6d3ae8; --accent-soft:#efeaff;
  --cyan:#22d3ee; --blue:#3b82f6; --violet:#a855f7;
  --grad:linear-gradient(120deg,var(--cyan) 0%,var(--blue) 48%,var(--violet) 100%);
  --grad-text:linear-gradient(120deg,#0891b2 0%,#2563eb 48%,#9333ea 100%);
  --shadow:0 24px 60px -28px rgba(24,22,56,.45);
  --radius:20px;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --bg:#0f0e26; --surface:#18173a; --tint:#141334; --ink:#eeedfb; --ink-soft:#aeacd2; --line:#2b2956;
    --accent:#b69cff; --accent-soft:#272257; --shadow:0 24px 60px -28px rgba(0,0,0,.8);
    --band:#181638; --band-glass:rgba(24,22,56,.82); --band-ink:#f2f1ff; --band-soft:#b9b7e0; --band-line:rgba(255,255,255,.12); --band-dot:rgba(255,255,255,.14); --band-pill:#9fe9f7; --band-chip:rgba(255,255,255,.05); --grad-text:var(--grad);
  }
}
:root[data-theme="dark"]{
  --bg:#0f0e26; --surface:#18173a; --tint:#141334; --ink:#eeedfb; --ink-soft:#aeacd2; --line:#2b2956;
  --accent:#b69cff; --accent-soft:#272257; --shadow:0 24px 60px -28px rgba(0,0,0,.8);
  --band:#181638; --band-glass:rgba(24,22,56,.82); --band-ink:#f2f1ff; --band-soft:#b9b7e0; --band-line:rgba(255,255,255,.12); --band-dot:rgba(255,255,255,.14); --band-pill:#9fe9f7; --band-chip:rgba(255,255,255,.05); --grad-text:var(--grad);
}
*{box-sizing:border-box}
html{scroll-behavior:smooth; -webkit-text-size-adjust:100%}
body{margin:0; background:var(--bg); color:var(--ink); font-family:"Plus Jakarta Sans",-apple-system,"Segoe UI",sans-serif;
  font-size:17px; line-height:1.6; -webkit-font-smoothing:antialiased; overflow-x:hidden}
/* Scripts the Latin web fonts don't cover: system fonts, and line breaks that
   follow each language's rules (CJK has no spaces to break on). */
:lang(hi) body,:lang(hi) h1,:lang(hi) h2,:lang(hi) h3{font-family:"Noto Sans Devanagari","Nirmala UI","Kohinoor Devanagari","Mangal","Plus Jakarta Sans",sans-serif; line-height:1.7}
:lang(ja) body,:lang(ja) h1,:lang(ja) h2,:lang(ja) h3{font-family:"Hiragino Sans","Yu Gothic UI","Meiryo","Noto Sans JP",sans-serif; letter-spacing:0; line-break:strict; overflow-wrap:anywhere}
:lang(zh-CN) body,:lang(zh-CN) h1,:lang(zh-CN) h2,:lang(zh-CN) h3{font-family:"PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif; letter-spacing:0; line-break:strict; overflow-wrap:anywhere}
:lang(zh-TW) body,:lang(zh-TW) h1,:lang(zh-TW) h2,:lang(zh-TW) h3{font-family:"PingFang TC","Microsoft JhengHei","Noto Sans TC",sans-serif; letter-spacing:0; line-break:strict; overflow-wrap:anywhere}
:lang(ja) h1,:lang(ja) h2,:lang(ja) h3,:lang(zh-CN) h1,:lang(zh-CN) h2,:lang(zh-CN) h3,:lang(zh-TW) h1,:lang(zh-TW) h2,:lang(zh-TW) h3{line-height:1.25}
img{max-width:100%}
a{color:var(--accent)}
h1,h2,h3{font-family:"Bricolage Grotesque","Plus Jakarta Sans",sans-serif; letter-spacing:-.02em; line-height:1.08; margin:0}
h1{font-size:clamp(40px,7vw,76px); font-weight:800}
h2{font-size:clamp(30px,4.6vw,50px); font-weight:800}
h3{font-size:21px; font-weight:700; letter-spacing:-.01em; line-height:1.25}
p{margin:0}
.i{width:24px; height:24px; flex:none}
.wrap{max-width:1160px; margin:0 auto; padding-inline:16px}
@media (min-width:700px){.wrap{padding-inline:28px}}
.sr{position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap}
.lang-menu{position:relative; font-size:14px; font-weight:600}
.lang-menu summary{list-style:none; display:flex; align-items:center; gap:8px; cursor:pointer; padding:6px 10px; border:1px solid var(--line); border-radius:10px; background:var(--surface); color:var(--ink)}
.lang-menu summary::-webkit-details-marker{display:none}
.lang-menu summary::after{content:""; width:6px; height:6px; border-right:2px solid currentColor; border-bottom:2px solid currentColor; transform:rotate(45deg); margin:-3px 0 0 2px}
.lang-menu ul{position:absolute; right:0; top:calc(100% + 6px); z-index:60; margin:0; padding:6px; list-style:none; min-width:190px; max-height:calc(100vh - 90px); max-height:calc(100dvh - 90px); overflow-y:auto; background:var(--surface); border:1px solid var(--line); border-radius:12px; box-shadow:0 12px 32px -12px rgba(21,20,46,.35)}
.lang-menu li a{display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:8px; color:var(--ink); text-decoration:none}
.lang-menu li a:hover,.lang-menu li a[aria-current]{background:var(--tint)}
.flag{flex:none; border-radius:3px; overflow:hidden}
.menu .lang-menu{margin:10px 0}
.menu .lang-menu summary::after{margin-left:auto}
.menu .lang-menu summary{display:flex; width:auto; height:auto; place-items:initial; border-radius:10px; color:var(--ink)}
.menu .lang-menu ul{position:static; box-shadow:none; margin-top:6px}
.menu .lang-menu ul{display:grid; grid-template-columns:1fr 1fr; gap:2px; min-width:0}
.menu .lang-menu li a{padding:8px 6px}
.skip{position:absolute; left:-999px; top:8px; background:#fff; color:#000; padding:8px 12px; border-radius:8px; z-index:99}
.skip:focus{left:8px}
.grad-text{background:var(--grad-text); -webkit-background-clip:text; background-clip:text; color:transparent}
.eyebrow{display:inline-flex; align-items:center; gap:8px; font-size:13px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--accent); margin-bottom:16px}
.lede{font-size:clamp(18px,2vw,21px); color:var(--ink-soft); max-width:60ch}
.sec{padding-block:clamp(64px,10vw,120px)}
.sec.tint{background:var(--tint); border-block:1px solid var(--line)}
.sec-head{max-width:760px; margin-bottom:48px}
.sec-head.center{margin-inline:auto; text-align:center}
.sec-head.center .lede{margin-inline:auto}
.sec-head h2{margin-bottom:16px}

/* buttons */
.btn{display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:14px 24px; border-radius:999px; font-weight:700;
  font-size:16px; text-decoration:none; border:1.5px solid transparent; transition:transform .15s ease, box-shadow .15s ease, background .15s; white-space:nowrap}
.btn:hover{transform:translateY(-1px)}
.btn:focus-visible, a:focus-visible, summary:focus-visible{outline:3px solid var(--cyan); outline-offset:3px}
.btn.sm{padding:9px 18px; font-size:15px}
.btn.lg{padding:16px 30px; font-size:17px}
.btn.dark{background:var(--night); color:#fff; box-shadow:0 10px 30px -12px rgba(109,58,232,.7)}
.btn.light{background:#fff; color:var(--night); box-shadow:0 10px 30px -10px rgba(34,211,238,.45)}
.btn.ghost-light{color:#fff; border-color:rgba(255,255,255,.35)}
.btn.ghost-light:hover{border-color:#fff; background:rgba(255,255,255,.06)}
.btn.ghost{color:var(--ink); border-color:var(--line); background:var(--surface)}
.btn.ghost:hover{border-color:var(--accent)}
.btn.ghost-band{color:var(--band-ink); border-color:var(--band-line); background:transparent}
.btn.ghost-band:hover{border-color:var(--accent)}
.btn .i{width:18px; height:18px}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .btn.dark{background:#fff; color:var(--night)}}
:root[data-theme="dark"] .btn.dark{background:#fff; color:var(--night)}
.cta-row{display:flex; flex-wrap:wrap; gap:12px; align-items:center}
.cta-row.center{justify-content:center}

/* top bar */
.site-top{position:sticky; top:0; z-index:50; background:var(--band-glass); backdrop-filter:saturate(160%) blur(14px); -webkit-backdrop-filter:saturate(160%) blur(14px);
  border-bottom:1px solid var(--band-line); color:var(--band-ink)}
.bar{display:flex; align-items:center; gap:24px; height:68px}
.brand{display:inline-flex; align-items:center; gap:10px; color:inherit; text-decoration:none; font-family:"Bricolage Grotesque",sans-serif; font-weight:800; font-size:23px; letter-spacing:-.02em}
.brand img{width:32px; height:32px; border-radius:9px}
.site-top .links{display:flex; gap:28px; margin-left:auto; font-size:15px; font-weight:600}
.site-top .links a{color:var(--band-soft); text-decoration:none}
.site-top .links a:hover, .site-top .links a[aria-current]{color:var(--band-ink)}
.menu{display:none; margin-left:auto}
.menu summary{list-style:none; cursor:pointer; width:44px; height:44px; display:grid; place-items:center; border-radius:12px; color:var(--band-ink)}
.menu summary::-webkit-details-marker{display:none}
.menu[open] summary{background:var(--band-line)}
.menu nav{position:absolute; left:0; right:0; top:68px; background:var(--band); border-bottom:1px solid var(--band-line); padding:12px 16px 20px; display:grid; gap:4px; max-height:calc(100vh - 68px); max-height:calc(100dvh - 68px); overflow-y:auto; overscroll-behavior:contain; -webkit-overflow-scrolling:touch}
.menu nav a:not(.btn){color:var(--band-ink); text-decoration:none; font-weight:600; font-size:18px; padding:12px 4px; border-bottom:1px solid var(--band-line)}
.menu nav .btn{margin-top:14px}
@media (max-width:1240px){.site-top .links{gap:20px}}
/* Five top-bar links in the longer languages (es, pt-BR) need about 1060px. */
@media (max-width:1060px){.site-top .links, .hide-sm, .bar>.lang-menu{display:none} .menu{display:block}}

/* dark hero band */
.hero{position:relative; background:var(--band); color:var(--band-ink); overflow:hidden; isolation:isolate}
.hero::before{content:""; position:absolute; inset:0; z-index:-1;
  background:radial-gradient(600px 420px at 12% 8%, rgba(34,211,238,.28), transparent 60%),
             radial-gradient(700px 520px at 92% 88%, rgba(168,85,247,.34), transparent 60%),
             radial-gradient(500px 400px at 60% 30%, rgba(59,130,246,.18), transparent 60%)}
.hero::after{content:""; position:absolute; inset:0; z-index:-1; opacity:.5;
  background-image:radial-gradient(var(--band-dot) 1px, transparent 1px); background-size:26px 26px;
  -webkit-mask-image:linear-gradient(180deg,#000 0%,transparent 85%); mask-image:linear-gradient(180deg,#000 0%,transparent 85%)}
.hero .eyebrow{color:var(--band-pill); background:rgba(34,211,238,.12); border:1px solid rgba(34,211,238,.35); padding:6px 14px; border-radius:999px; text-transform:none; letter-spacing:0; font-size:14px}
.hero .lede{color:var(--band-soft)}
.page-hero{padding-block:clamp(56px,9vw,104px) clamp(56px,8vw,96px); text-align:center}
.page-hero h1{font-size:clamp(38px,6vw,64px); margin-bottom:18px}
.page-hero .lede{margin-inline:auto}
.founding{display:flex; gap:8px; align-items:flex-start; margin-top:18px; max-width:52ch; font-size:14.5px; font-weight:600; color:var(--band-ink); padding:12px 16px; border-radius:14px; border:1px solid var(--band-line); background:var(--band-chip)}
.founding .i{width:18px; height:18px; flex:none; margin-top:2px; color:var(--accent)}
.page-hero .founding{margin-inline:auto; text-align:left}

/* cards */
.card{background:var(--surface); border:1px solid var(--line); border-radius:var(--radius); padding:28px}
.card h3{margin:14px 0 8px}
.card p{color:var(--ink-soft); font-size:16px}
.chip-ico{display:inline-grid; place-items:center; width:48px; height:48px; border-radius:14px; color:#fff; background:var(--grad); box-shadow:0 10px 24px -12px rgba(59,130,246,.8)}
.chip-ico .i{width:24px; height:24px}
.grid-3{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:20px}
.grid-2{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:20px}
@media (max-width:900px){.grid-3{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:640px){.grid-3, .grid-2{grid-template-columns:1fr}}
.pro-tag{display:inline-block; font-size:11px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:#fff; background:var(--grad); border-radius:999px; padding:3px 9px; vertical-align:middle; margin-left:6px}

/* reveal */
.js .rise{opacity:0; transform:translateY(22px); transition:opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1)}
.js .rise.in{opacity:1; transform:none}
@media (prefers-reduced-motion: reduce){.js .rise{opacity:1; transform:none; transition:none} *{animation:none!important}}

/* video */
.video{position:relative; aspect-ratio:16/9; border-radius:24px; overflow:hidden; background:var(--night); box-shadow:var(--shadow);
  border:1px solid var(--line)}
.video iframe, .video video{position:absolute; inset:0; width:100%; height:100%; border:0}
.video.placeholder{display:grid; place-items:center; color:#fff; text-align:center; border:0}
.video.placeholder::before{content:""; position:absolute; inset:0; background:radial-gradient(520px 320px at 20% 20%, rgba(34,211,238,.35), transparent 60%), radial-gradient(600px 380px at 85% 90%, rgba(168,85,247,.45), transparent 60%)}
.vp-center{position:relative; display:grid; justify-items:center; gap:10px; padding:24px}
.vp-center span:last-child{color:var(--night-soft); font-size:15px; max-width:44ch}
.vp-center strong{font-family:"Bricolage Grotesque",sans-serif; font-size:clamp(20px,3vw,28px)}
.play{width:84px; height:84px; border-radius:50%; display:grid; place-items:center; background:#fff; color:var(--night); margin-bottom:8px;
  box-shadow:0 0 0 12px rgba(255,255,255,.1), 0 0 0 26px rgba(255,255,255,.05); animation:pulse 2.6s ease-in-out infinite}
.play .i{width:34px; height:34px; margin-left:5px}
@keyframes pulse{50%{box-shadow:0 0 0 16px rgba(255,255,255,.13), 0 0 0 34px rgba(255,255,255,.04)}}

/* final band */
.final{background:linear-gradient(120deg,#1e40af,#4338ca 50%,#6d28d9); color:#fff; text-align:center; padding-block:clamp(72px,10vw,120px); position:relative; overflow:hidden; isolation:isolate}
.final::before{content:""; position:absolute; inset:-40%; z-index:-1; background:conic-gradient(from 180deg at 50% 50%, rgba(34,211,238,.35), rgba(59,130,246,.3), rgba(168,85,247,.45), rgba(34,211,238,.35)); filter:blur(90px); animation:spin 24s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.final h2{max-width:18ch; margin:0 auto 18px}
.final p{color:rgba(255,255,255,.85); max-width:52ch; margin:0 auto 32px; font-size:18px}

/* footer */
.foot{background:var(--band); color:var(--band-soft); border-top:1px solid var(--band-line); padding-block:56px 32px; font-size:15px}
.foot .brand{color:var(--band-ink); margin-bottom:12px}
.foot-grid{display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:32px}
.foot-grid p{max-width:40ch}
.foot h3{font-family:"Plus Jakarta Sans",sans-serif; font-size:13px; letter-spacing:.08em; text-transform:uppercase; color:var(--band-ink); margin-bottom:12px}
.foot-grid a:not(.brand){display:block; color:var(--band-soft); text-decoration:none; padding-block:4px; overflow-wrap:anywhere}
.foot-grid a:not(.brand):hover{color:var(--accent)}
.foot .fine{margin-top:40px; padding-top:24px; border-top:1px solid var(--band-line); font-size:13px}
@media (max-width:700px){.foot-grid{grid-template-columns:1fr 1fr} .foot-grid>div:first-child{grid-column:1/-1}}

/* faq */
.faq{display:grid; gap:12px}
.faq details{background:var(--surface); border:1px solid var(--line); border-radius:16px; padding:0 22px; transition:border-color .2s}
.faq details[open]{border-color:var(--accent)}
.faq summary{cursor:pointer; list-style:none; padding:20px 0; font-weight:700; font-size:17px; display:flex; justify-content:space-between; gap:16px; align-items:center}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+"; font-size:26px; font-weight:400; line-height:1; color:var(--accent); transition:transform .2s; flex:none}
.faq details[open] summary::after{transform:rotate(45deg)}
.faq .a{padding:0 0 22px; color:var(--ink-soft); max-width:75ch}
.faq .a p+p{margin-top:10px}
`;
