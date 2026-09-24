import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

/**
 * Root route, two jobs:
 *
 * 1. Shopify always embeds the app at the bare domain root, regardless of
 *    where the admin UI actually lives (`/app` here) — so requests carrying
 *    Shopify's handshake params (shop, host, embedded, hmac, id_token,
 *    session, timestamp) are forwarded to `/app`, preserving every query
 *    param that authenticate.admin() in app.tsx's loader needs.
 * 2. Everything else (a person typing giftpin.app into a browser) gets the
 *    public marketing page below — static HTML, no auth, no session.
 */
const SHOPIFY_PARAMS = [
  "shop",
  "host",
  "embedded",
  "hmac",
  "id_token",
  "session",
  "timestamp",
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  if (SHOPIFY_PARAMS.some((p) => url.searchParams.has(p))) {
    throw redirect(`/app${url.search}`);
  }
  return new Response(HTML, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
};

// Deliberately no default export: a route module without one is a *resource
// route*, so the Response above is sent as-is instead of being wrapped as
// loader data for React to render (which produced a blank page).

const HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Giftpin — Gift registries with items from any store</title>
<meta name="description" content="Giftpin lets shoppers build gift registries with items from any store, while suggesting your closest products alongside. A gift registry app for Shopify.">
<meta property="og:title" content="Giftpin — Gift registries with items from any store">
<meta property="og:description" content="Weddings, baby showers, birthdays and holidays. Add items from any website, share one link, and bring guests back to your store.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://giftpin.app/">
<meta name="theme-color" content="#3f6b52">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%233f6b52'/%3E%3Cpath d='M32 12c-8 0-14 6-14 14 0 10 14 26 14 26s14-16 14-26c0-8-6-14-14-14z' fill='%23fbfaf7'/%3E%3Ccircle cx='32' cy='26' r='6' fill='%233f6b52'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Source+Sans+3:wght@400;600;700&display=swap">
<style>
  :root{
    --bg:#fbfaf7; --surface:#ffffff; --ink:#1f2320; --ink-soft:#565f5a;
    --line:#e4e1d8; --accent:#3f6b52; --accent-ink:#ffffff;
    --accent-soft:#e8efe9; --warm:#f3ece0;
  }
  @media (prefers-color-scheme: dark){
    :root:not([data-theme="light"]){
      --bg:#15181a; --surface:#1c2023; --ink:#eceeec; --ink-soft:#a7b0ab;
      --line:#2c3236; --accent:#7fb996; --accent-ink:#0f1a14;
      --accent-soft:#20302a; --warm:#211f1a;
    }
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{
    margin:0; background:var(--bg); color:var(--ink);
    font-family:"Source Sans 3", -apple-system, Segoe UI, sans-serif;
    line-height:1.6; -webkit-font-smoothing:antialiased;
  }
  a{color:var(--accent)}
  .wrap{max-width:1040px; margin:0 auto; padding-inline:16px;}
  /* top bar */
  .bar{display:flex; align-items:center; justify-content:space-between; padding-block:22px;}
  .brand{display:flex; align-items:center; gap:10px; text-decoration:none; color:var(--ink);
    font-family:"Fraunces", Georgia, serif; font-weight:600; font-size:22px;}
  .brand svg{width:30px; height:30px;}
  .bar nav{display:flex; gap:22px; font-size:15px;}
  .bar nav a{color:var(--ink-soft); text-decoration:none;}
  .bar nav a:hover{color:var(--accent);}
  /* hero */
  .hero{padding-block:56px 72px; display:grid; gap:48px; align-items:center;
    grid-template-columns:1.1fr .9fr;}
  .eyebrow{font-size:13px; letter-spacing:.08em; text-transform:uppercase;
    color:var(--accent); font-weight:700; margin:0 0 14px;}
  h1{font-family:"Fraunces", Georgia, serif; font-weight:600;
    font-size:clamp(34px,5.6vw,58px); line-height:1.08; letter-spacing:-0.02em; margin:0 0 20px;}
  h1 em{font-style:normal; color:var(--accent);}
  .lede{font-size:19px; color:var(--ink-soft); max-width:46ch; margin:0 0 30px;}
  .cta{display:flex; flex-wrap:wrap; gap:12px; align-items:center;}
  .btn{display:inline-block; padding:13px 22px; border-radius:999px; text-decoration:none;
    font-weight:600; font-size:16px; border:1px solid var(--accent);
    background:var(--accent); color:var(--accent-ink);}
  .btn:hover{opacity:.92}
  .btn.ghost{background:transparent; color:var(--accent);}
  .note{font-size:14px; color:var(--ink-soft); margin:16px 0 0;}
  /* registry mock */
  .mock{background:var(--surface); border:1px solid var(--line); border-radius:18px;
    padding:22px; box-shadow:0 18px 40px -22px rgba(31,35,32,.35);}
  .mock .hd{display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;}
  .mock h3{font-family:"Fraunces", Georgia, serif; font-size:20px; margin:0;}
  .mock .sub{color:var(--ink-soft); font-size:14px; margin:0 0 16px;}
  .tag{font-size:12px; font-weight:700; color:var(--accent); background:var(--accent-soft);
    padding:3px 10px; border-radius:999px;}
  .row{display:flex; align-items:center; gap:14px; padding:12px 0; border-top:1px solid var(--line);}
  .thumb{width:46px; height:46px; border-radius:10px; background:var(--warm);
    display:grid; place-items:center; flex:none;}
  .thumb svg{width:24px; height:24px; color:var(--accent);}
  .row .t{font-weight:600; font-size:15px; line-height:1.3;}
  .row .s{font-size:13px; color:var(--ink-soft);}
  .row .st{margin-left:auto; font-size:12px; font-weight:700; color:var(--ink-soft);
    border:1px solid var(--line); border-radius:999px; padding:3px 10px; white-space:nowrap;}
  .row .st.on{color:var(--accent); border-color:var(--accent); background:var(--accent-soft);}
  /* sections */
  section{padding-block:64px;}
  section.alt{background:var(--warm); border-block:1px solid var(--line);}
  h2{font-family:"Fraunces", Georgia, serif; font-weight:600;
    font-size:clamp(26px,3.6vw,36px); line-height:1.15; letter-spacing:-0.01em; margin:0 0 14px;}
  .sec-lede{color:var(--ink-soft); font-size:18px; max-width:58ch; margin:0 0 40px;}
  .steps{display:grid; grid-template-columns:repeat(3,1fr); gap:20px; counter-reset:s;}
  .step{background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:24px;}
  .step::before{counter-increment:s; content:counter(s); display:grid; place-items:center;
    width:32px; height:32px; border-radius:50%; background:var(--accent-soft);
    color:var(--accent); font-weight:700; margin-bottom:14px;}
  .step h3, .card h3{font-family:"Fraunces", Georgia, serif; font-size:20px; margin:0 0 8px;}
  .step p, .card p{margin:0; color:var(--ink-soft); font-size:16px;}
  .cards{display:grid; grid-template-columns:repeat(3,1fr); gap:20px;}
  .card{background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:24px;}
  .card svg{width:28px; height:28px; color:var(--accent); margin-bottom:12px;}
  .two{display:grid; grid-template-columns:1fr 1fr; gap:20px;}
  .pane{background:var(--surface); border:1px solid var(--line); border-radius:16px; padding:30px;}
  .pane h3{font-family:"Fraunces", Georgia, serif; font-size:24px; margin:0 0 6px;}
  .pane .who{font-size:13px; letter-spacing:.06em; text-transform:uppercase;
    color:var(--accent); font-weight:700; margin:0 0 10px;}
  .pane ul{margin:14px 0 0; padding-left:20px; color:var(--ink-soft);}
  .pane li{margin-bottom:8px;}
  .occasions{display:flex; flex-wrap:wrap; gap:10px; margin-top:8px;}
  .occasions span{border:1px solid var(--line); background:var(--surface); border-radius:999px;
    padding:8px 16px; font-weight:600; font-size:15px;}
  /* your-store spotlight */
  .spot{display:grid; grid-template-columns:1fr 1fr; gap:48px; align-items:center;}
  .pts{list-style:none; margin:0; padding:0; display:grid; gap:20px;}
  .pts li{display:grid; grid-template-columns:34px 1fr; gap:14px;}
  .pts .n{display:grid; place-items:center; width:34px; height:34px; border-radius:50%;
    background:var(--accent); color:var(--accent-ink); font-weight:700; font-size:15px;}
  .pts h3{font-family:"Fraunces", Georgia, serif; font-size:19px; margin:2px 0 4px;}
  .pts p{margin:0; color:var(--ink-soft); font-size:16px;}
  .match{margin-top:12px; border:1px solid var(--accent); background:var(--accent-soft);
    border-radius:12px; padding:14px 16px;}
  .match .lab{font-size:12px; font-weight:700; letter-spacing:.06em; text-transform:uppercase;
    color:var(--accent); margin:0 0 8px;}
  .match .r{display:flex; align-items:center; gap:12px; flex-wrap:wrap;}
  .match .t{font-weight:600; font-size:15px; line-height:1.3;}
  .match .s{font-size:13px; color:var(--ink-soft);}
  .match .go{margin-left:auto; font-size:13px; font-weight:700; color:var(--accent-ink);
    background:var(--accent); border-radius:999px; padding:6px 14px; white-space:nowrap;}
  .fine{font-size:14px; color:var(--ink-soft); margin:14px 0 0;}
  .final{text-align:center;}
  .final .lede{margin-inline:auto;}
  .final .cta{justify-content:center;}
  footer{border-top:1px solid var(--line); padding-block:30px; color:var(--ink-soft); font-size:14px;}
  footer .in{display:flex; flex-wrap:wrap; gap:14px 28px; justify-content:space-between;}
  footer a{color:var(--ink-soft);}
  footer a:hover{color:var(--accent);}
  @media (max-width:860px){
    .hero{grid-template-columns:1fr; padding-block:32px 48px;}
    .steps, .cards, .two, .spot{grid-template-columns:1fr;}
    .spot{gap:32px;}
    .bar nav{display:none;}
  }
</style>
</head>
<body>
<div class="wrap">
  <header class="bar">
    <a class="brand" href="/">
      <svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#3f6b52"/><path d="M32 12c-8 0-14 6-14 14 0 10 14 26 14 26s14-16 14-26c0-8-6-14-14-14z" fill="#fbfaf7"/><circle cx="32" cy="26" r="6" fill="#3f6b52"/></svg>
      Giftpin
    </a>
    <nav>
      <a href="#your-store">Your store first</a>
      <a href="#how">How it works</a>
      <a href="#features">Features</a>
      <a href="#merchants">For stores</a>
      <a href="/pricing">Pricing</a>
      <a href="mailto:support@giftpin.app">Contact</a>
    </nav>
  </header>

  <div class="hero">
    <div>
      <p class="eyebrow">Gift registry for Shopify</p>
      <h1>Build a gift registry with items from <em>any store</em>.</h1>
      <p class="lede">Shoppers can build gift registries with gifts from your store and other online shops, then share a single link with their guests. Giftpin keeps your products in front of them at every step, suggesting your closest matching products beside items they add from elsewhere.</p>
      <div class="cta">
        <a class="btn" href="mailto:support@giftpin.app?subject=Giftpin%20early%20access">Get early access</a>
        <a class="btn ghost" href="#how">See how it works</a>
      </div>
      <p class="note">Coming soon to the Shopify App Store.</p>
    </div>

    <div class="mock" aria-label="Example registry">
      <div class="hd"><h3>April &amp; Jordan's Wedding</h3><span class="tag">Wedding</span></div>
      <p class="sub">Shared with one link · items from 4 stores</p>
      <div class="row">
        <div class="thumb"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l-1 8a5 5 0 0 1-10 0z"/><path d="M12 16v5M8 21h8"/></svg></div>
        <div><div class="t">Crystal wine glasses, set of 6</div><div class="s">From the shop that sent you here</div></div>
        <span class="st on">Available</span>
      </div>
      <div class="row">
        <div class="thumb"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="9" width="16" height="11" rx="2"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></svg></div>
        <div><div class="t">Cast-iron Dutch oven</div><div class="s">Added from another website</div></div>
        <span class="st on">Available</span>
      </div>
      <div class="row">
        <div class="thumb"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18M5 12v7h14v-7M12 12V5M12 5c-2-3-6-2-5 1 .5 1.5 3 2 5 2zM12 5c2-3 6-2 5 1-.5 1.5-3 2-5 2z"/></svg></div>
        <div><div class="t">Linen bedding set</div><div class="s">Reserved by a guest</div></div>
        <span class="st">Reserved</span>
      </div>
    </div>
  </div>
</div>

<section id="your-store">
  <div class="wrap">
    <div class="spot">
      <div>
        <p class="eyebrow">Built for merchants</p>
        <h2>Your store gets the first look at every gift.</h2>
        <p class="sec-lede" style="margin-bottom:28px">Other registry apps let shoppers wander off to other shops. Giftpin does the opposite: whatever they add, it looks in your catalog first and puts your product right beside it.</p>
        <ol class="pts">
          <li><span class="n">1</span><div><h3>Start from your shelves</h3><p>Inside "Add items", shoppers browse your store, and wedding registries get room-by-room ideas (kitchen, bath and more) that open a search of your catalog.</p></div></li>
          <li><span class="n">2</span><div><h3>Your product appears beside theirs</h3><p>When a shopper adds an item from another site, by pasting a link or using the browser extension, Giftpin searches your catalog and, when it finds a close match, shows it next to the item.</p></div></li>
          <li><span class="n">3</span><div><h3>One tap to switch to yours</h3><p>They can swap the outside item for your product, and guests then buy it in one tap from your checkout. Suggestions are the shopper's choice, and guests only see the ones they keep.</p></div></li>
        </ol>
      </div>
      <div>
        <div class="mock" aria-label="Example of a store suggestion">
          <div class="hd"><h3>Your list</h3><span class="tag">Example</span></div>
          <p class="sub">A gift added from another website</p>
          <div class="row" style="border-top:0; padding-top:4px">
            <div class="thumb"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="9" width="16" height="11" rx="2"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></svg></div>
            <div><div class="t">Cast-iron Dutch oven</div><div class="s">Added from another website</div></div>
          </div>
          <div class="match">
            <p class="lab">Similar item in your store</p>
            <div class="r">
              <div class="thumb"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l-1 8a5 5 0 0 1-10 0z"/><path d="M12 16v5M8 21h8"/></svg></div>
              <div><div class="t">Enameled casserole pot</div><div class="s">Available in your store</div></div>
              <span class="go">Use this instead</span>
            </div>
          </div>
        </div>
        <p class="fine">Illustration with example products. Giftpin looks for a similar product in your own catalog and only ever reads it; nothing is changed in your store.</p>
      </div>
    </div>
  </div>
</section>

<section id="how" class="alt">
  <div class="wrap">
    <h2>Three steps, one shareable link</h2>
    <p class="sec-lede">No accounts to create for guests, and nothing to install for them either.</p>
    <div class="steps">
      <div class="step"><h3>Start a registry</h3><p>A shopper creates a registry for a wedding, baby shower, birthday or holiday right from your store.</p></div>
      <div class="step"><h3>Add anything</h3><p>They add products from your catalog, and from other online shops, and Giftpin suggests your closest matching products beside items they add from outside.</p></div>
      <div class="step"><h3>Share the link</h3><p>Guests open one page, pick a gift, and mark it reserved so nobody buys the same thing twice.</p></div>
    </div>
  </div>
</section>

<section id="features">
  <div class="wrap">
    <h2>Made for the moments people gift</h2>
    <p class="sec-lede">Registries for the occasions your customers already shop for.</p>
    <div class="occasions" style="margin-bottom:40px">
      <span>Weddings</span><span>Baby showers</span><span>Birthdays</span><span>Holidays</span>
    </div>
    <div class="cards">
      <div class="card">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>
        <h3>Items from any store</h3>
        <p>Shoppers aren't limited to one catalog. Add a product from your store or paste a link, or use the Giftpin Chrome extension (coming soon) to add a product from nearly any website in one click.</p>
      </div>
      <div class="card">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1"/></svg>
        <h3>Share with a link or email</h3>
        <p>One clean link works in a text, a group chat or an invitation. Guests can also share it by email.</p>
      </div>
      <div class="card">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12v8H4v-8M2 7h20v5H2zM12 22V7M12 7c-2-4-6-3-5.5 0S12 7 12 7zM12 7c2-4 6-3 5.5 0S12 7 12 7z"/></svg>
        <h3>No double gifts</h3>
        <p>Guests reserve an item so the registry always shows what's still available.</p>
      </div>
    </div>
  </div>
</section>

<section id="merchants" class="alt">
  <div class="wrap">
    <h2>Good for shoppers. Better for your store.</h2>
    <p class="sec-lede">Registry traffic is high-intent traffic. Giftpin sends it to you.</p>
    <div class="two">
      <div class="pane">
        <p class="who">For shoppers</p>
        <h3>Build the list they really want</h3>
        <ul>
          <li>Add items from your store and from other online shops</li>
          <li>A Chrome extension (coming soon) to add products from any website in one click</li>
          <li>Registries for weddings, baby showers, birthdays and holidays</li>
          <li>One link to share with everyone</li>
        </ul>
      </div>
      <div class="pane">
        <p class="who">For merchants</p>
        <h3>Keep the guests coming back</h3>
        <ul>
          <li>Every registry page links back to your store</li>
          <li>Suggests your similar products next to every item from another store</li>
          <li>A dashboard of what's been bought and what's still needed</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="final">
  <div class="wrap">
    <h2>Bring gift registries to your store</h2>
    <p class="lede">Giftpin is on its way to the Shopify App Store. Tell us you're interested and we'll write when it's live.</p>
    <div class="cta">
      <a class="btn" href="mailto:support@giftpin.app?subject=Giftpin%20early%20access">Get early access</a>
    </div>
  </div>
</section>

<footer>
  <div class="wrap in">
    <span>© Giftpin</span>
    <span><a href="/pricing">Pricing</a> · <a href="/privacy">Privacy policy</a> · <a href="mailto:support@giftpin.app">support@giftpin.app</a></span>
  </div>
</footer>
</body>
</html>
`;
