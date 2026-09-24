import {
  PRO_PLAN_DISPLAY_NAME,
  PRO_PLAN_PRICE,
  PRO_TRIAL_DAYS,
} from "../shared/plans";

/**
 * Public pricing page at giftpin.app/pricing — the URL for the Shopify
 * listing's "more pricing information" field. Static HTML resource route,
 * same pattern as `_index.tsx` and `privacy.tsx`: no auth, no session, and
 * no default export so the Response is sent as-is.
 *
 * Price, trial length and plan name come from `app/shared/plans.ts`, the same
 * constants the billing code uses, so this page can't quote a different
 * price from what Shopify charges. Keep the feature lists in step with
 * `app.billing.tsx` and the listing's pricing section.
 */
export const loader = async () => {
  return new Response(pricingHtml(), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
};

export function pricingHtml(): string {
  const price = `$${PRO_PLAN_PRICE.toFixed(2)}`;
  const name = PRO_PLAN_DISPLAY_NAME;
  const trial = `${PRO_TRIAL_DAYS}-day free trial`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Giftpin Pricing</title>
<meta name="description" content="Giftpin is free for unlimited gift registries. ${name} is ${price}/month with a ${trial}, and adds analytics, sales reports, your branding, automatic emails and priority support.">
<meta property="og:title" content="Giftpin Pricing">
<meta property="og:description" content="Free for unlimited registries. ${name}: ${price}/month, ${trial}.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://giftpin.app/pricing">
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
  body{
    margin:0; background:var(--bg); color:var(--ink);
    font-family:"Source Sans 3", -apple-system, Segoe UI, sans-serif;
    line-height:1.6; -webkit-font-smoothing:antialiased;
  }
  a{color:var(--accent)}
  .wrap{max-width:960px; margin:0 auto; padding-inline:16px;}
  .bar{display:flex; align-items:center; justify-content:space-between; padding-block:22px;}
  .brand{display:flex; align-items:center; gap:10px; text-decoration:none; color:var(--ink);
    font-family:"Fraunces", Georgia, serif; font-weight:600; font-size:22px;}
  .brand svg{width:30px; height:30px;}
  .bar nav{display:flex; gap:22px; font-size:15px;}
  .bar nav a{color:var(--ink-soft); text-decoration:none;}
  .bar nav a:hover, .bar nav a[aria-current]{color:var(--accent);}
  .head{text-align:center; padding-block:40px 36px;}
  .eyebrow{font-size:13px; letter-spacing:.08em; text-transform:uppercase;
    color:var(--accent); font-weight:700; margin:0 0 12px;}
  h1, h2, h3{font-family:"Fraunces", Georgia, serif; font-weight:600; letter-spacing:-0.01em;}
  h1{font-size:clamp(32px,5vw,48px); line-height:1.1; margin:0 0 14px;}
  .lede{font-size:19px; color:var(--ink-soft); max-width:52ch; margin:0 auto;}
  .plans{display:grid; grid-template-columns:1fr 1fr; gap:20px; align-items:stretch;}
  .plan{background:var(--surface); border:1px solid var(--line); border-radius:18px;
    padding:30px; display:flex; flex-direction:column;}
  .plan.pro{border:2px solid var(--accent);}
  .plan .top{display:flex; justify-content:space-between; align-items:baseline; gap:12px;}
  .plan h2{font-size:26px; margin:0;}
  .badge{font-size:12px; font-weight:700; color:var(--accent); background:var(--accent-soft);
    border-radius:999px; padding:3px 10px; white-space:nowrap;}
  .price{margin:14px 0 4px; font-size:44px; font-weight:700; line-height:1;
    font-variant-numeric:tabular-nums;}
  .price small{font-size:17px; font-weight:600; color:var(--ink-soft);}
  .sub{color:var(--ink-soft); font-size:15px; margin:0 0 20px; min-height:24px;}
  .plan ul{list-style:none; margin:0 0 24px; padding:0; display:grid; gap:10px; flex:1; align-content:start;}
  .plan li{display:grid; grid-template-columns:20px 1fr; gap:10px; font-size:16px;}
  .plan li svg{width:20px; height:20px; color:var(--accent); margin-top:3px;}
  .plan li span small{display:block; color:var(--ink-soft); font-size:14px;}
  .btn{display:block; text-align:center; padding:13px 22px; border-radius:999px; text-decoration:none;
    font-weight:700; background:var(--accent); color:var(--accent-ink); border:2px solid var(--accent);}
  .btn:hover{opacity:.92}
  .btn.ghost{background:transparent; color:var(--accent);}
  .note{text-align:center; font-size:14px; color:var(--ink-soft); margin:18px 0 0;}
  .faq{padding-block:64px 24px;}
  .faq h2{font-size:28px; margin:0 0 20px;}
  .faq dl{margin:0; display:grid; gap:0;}
  .faq dt{font-weight:700; font-size:17px; padding-top:18px; border-top:1px solid var(--line);}
  .faq dd{margin:6px 0 18px; color:var(--ink-soft); max-width:70ch;}
  footer{margin-top:48px; border-top:1px solid var(--line); padding-block:28px; color:var(--ink-soft); font-size:14px;}
  footer .in{display:flex; justify-content:space-between; flex-wrap:wrap; gap:12px;}
  @media (max-width:760px){
    .plans{grid-template-columns:1fr;}
    .bar nav{gap:14px;}
    .bar nav .hide-sm{display:none;}
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
      <a class="hide-sm" href="/#how">How it works</a>
      <a href="/pricing" aria-current="page">Pricing</a>
      <a href="mailto:support@giftpin.app">Contact</a>
    </nav>
  </header>

  <div class="head">
    <p class="eyebrow">Pricing</p>
    <h1>Free to start. Upgrade when you want more.</h1>
    <p class="lede">Every store gets unlimited gift registries at no cost. ${name} adds analytics, sales reports, your own branding, automatic emails and priority support.</p>
  </div>

  <div class="plans">
    <section class="plan" aria-labelledby="free-h">
      <div class="top"><h2 id="free-h">Free</h2></div>
      <p class="price">$0 <small>/ month</small></p>
      <p class="sub">No card needed.</p>
      <ul>
        ${check}<span>Unlimited registries and items</span></li>
        ${check}<span>Items from your store and from other online shops</span></li>
        ${check}<span>Your closest matching product suggested beside outside items</span></li>
        ${check}<span>Weddings, baby showers, birthdays, holidays and more</span></li>
        ${check}<span>Guests reserve gifts, so nothing is bought twice</span></li>
        ${check}<span>Gifts credited to the right registry, including through Shop Pay</span></li>
        ${check}<span>Overview dashboard of registries and gifts</span></li>
        ${check}<span>Email support</span></li>
      </ul>
      <a class="btn ghost" href="mailto:support@giftpin.app?subject=Giftpin%20early%20access">Get early access</a>
    </section>

    <section class="plan pro" aria-labelledby="pro-h">
      <div class="top"><h2 id="pro-h">${name}</h2><span class="badge">${trial}</span></div>
      <p class="price">${price} <small>/ month</small></p>
      <p class="sub">Billed in USD through your Shopify invoice.</p>
      <ul>
        ${check}<span>Everything in Free</span></li>
        ${check}<span>Registry analytics<small>Registries, items and gifts over 30 days, 90 days or 12 months, with revenue, new customers, where gifts were bought and registries by occasion.</small></span></li>
        ${check}<span>Registry sales report<small>Revenue, orders, new customers and average order from registries, month by month.</small></span></li>
        ${check}<span>Your branding on registry pages<small>Your logo, colours and font, with the "Powered by Giftpin" credit removed.</small></span></li>
        ${check}<span>CSV export of registries and purchases</span></li>
        ${check}<span>Completion discount<small>After the event, the registrant gets a single-use code for your products still on their list. You choose the percentage and how long it lasts.</small></span></li>
        ${check}<span>Automatic registry emails<small>A reminder before the event to guests who opt in, an alert when most items are gone, and a thank-you reminder listing who gave what.</small></span></li>
        ${check}<span>Priority email support<small>Replies within one business day.</small></span></li>
      </ul>
      <a class="btn" href="mailto:support@giftpin.app?subject=Giftpin%20early%20access">Get early access</a>
    </section>
  </div>
  <p class="note">Giftpin is on its way to the Shopify App Store. Tell us you're interested and we'll write when it's live.</p>

  <section class="faq" aria-labelledby="faq-h">
    <h2 id="faq-h">Questions</h2>
    <dl>
      <dt>How am I billed for ${name}?</dt>
      <dd>Through Shopify. The ${price} monthly charge appears on your regular Shopify invoice, in US dollars. There's no separate card to add.</dd>

      <dt>How does the free trial work?</dt>
      <dd>You get ${name} free for ${PRO_TRIAL_DAYS} days. Cancel before it ends and you won't be charged.</dd>

      <dt>Can I cancel or switch back to Free?</dt>
      <dd>Yes, any time, from the Plan page inside the app. Your registries and their items stay exactly as they are.</dd>

      <dt>How is the Free plan paid for?</dt>
      <dd>When a guest buys a registry item from another website, Giftpin may earn a small affiliate commission from that retailer. It never changes the guest's price, it's disclosed on the registry page, and it never applies to purchases from your own store.</dd>

      <dt>Does Giftpin take a cut of my sales?</dt>
      <dd>No. Neither plan adds a fee to your own product sales.</dd>

      <dt>Is there a limit on registries or guests?</dt>
      <dd>No. Both plans include unlimited registries, items and guests.</dd>
    </dl>
  </section>
</div>

<footer>
  <div class="wrap in">
    <span>© Giftpin</span>
    <span><a href="/">Home</a> · <a href="/privacy">Privacy policy</a> · <a href="mailto:support@giftpin.app">support@giftpin.app</a></span>
  </div>
</footer>
</body>
</html>
`;
}

const check = `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
