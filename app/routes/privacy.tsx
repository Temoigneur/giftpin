import type { LoaderFunctionArgs } from "react-router";

/**
 * Public, unauthenticated privacy-policy page served from the app's own
 * production domain — added 20 Sep 2026 so the App Store / Web Store /
 * Edge Add-ons "privacy policy URL" field points at something that's
 * guaranteed to be up whenever a reviewer or a real user clicks it,
 * rather than depending on Ben's local dev server or a separately-hosted
 * page's own sharing settings. No Shopify auth, no session, no proxy HMAC
 * — plain HTML, same as any static marketing page. Deploys with the rest
 * of the app (Railway `web` service); live at `/privacy` the moment this
 * ships to production, independent of whether `npm run dev` is running.
 *
 * Content mirrors the version published as a Claude artifact — keep both
 * in sync if either changes materially.
 */
export const loader = async (_args: LoaderFunctionArgs) => {
  return new Response(HTML, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};

const HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Giftpin Privacy Policy</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Source+Sans+3:wght@400;600;700&display=swap">
<style>
  :root{
    --bg:#fbfaf7; --surface:#ffffff; --ink:#1f2320; --ink-soft:#565f5a;
    --line:#e4e1d8; --accent:#3f6b52; --accent-soft:#e8efe9; --code-bg:#f1efe7;
  }
  @media (prefers-color-scheme: dark){
    :root:not([data-theme="light"]){
      --bg:#15181a; --surface:#1c2023; --ink:#eceeec; --ink-soft:#a7b0ab;
      --line:#2c3236; --accent:#7fb996; --accent-soft:#20302a; --code-bg:#20242a;
    }
  }
  *{box-sizing:border-box}
  body{
    margin:0; background:var(--bg); color:var(--ink);
    font-family:"Source Sans 3", -apple-system, Segoe UI, sans-serif;
    line-height:1.6; padding-block:48px; padding-inline:16px;
  }
  .page{max-width:720px; margin:0 auto;}
  header.top{margin-bottom:40px;}
  .eyebrow{
    font-size:13px; letter-spacing:.08em; text-transform:uppercase;
    color:var(--accent); font-weight:600; margin:0 0 10px;
  }
  h1{
    font-family:"Fraunces", Georgia, serif; font-weight:600;
    font-size:clamp(28px,5vw,40px); line-height:1.15; margin:0 0 12px;
    letter-spacing:-0.01em;
  }
  .meta{color:var(--ink-soft); font-size:14px; margin:0;}
  .lede{
    font-size:17px; color:var(--ink-soft); margin:24px 0 0;
    padding:16px 18px; background:var(--surface); border:1px solid var(--line);
    border-radius:10px;
  }
  nav.toc{
    background:var(--surface); border:1px solid var(--line); border-radius:10px;
    padding:18px 20px; margin:32px 0; font-size:14px;
  }
  nav.toc p{margin:0 0 8px; font-weight:600; color:var(--ink-soft); font-size:12px;
    text-transform:uppercase; letter-spacing:.06em;}
  nav.toc ol{margin:0; padding-left:20px; columns:2; column-gap:24px;}
  nav.toc li{margin-bottom:6px; break-inside:avoid;}
  nav.toc a{color:var(--ink); text-decoration:none; border-bottom:1px solid var(--line);}
  nav.toc a:hover{border-color:var(--accent); color:var(--accent);}
  section{margin:40px 0;}
  h2{
    font-family:"Fraunces", Georgia, serif; font-weight:600;
    font-size:22px; margin:0 0 14px; padding-top:8px;
    border-top:1px solid var(--line);
    display:flex; align-items:baseline; gap:10px;
  }
  h2 .num{color:var(--accent); font-variant-numeric:tabular-nums; font-size:15px;
    font-family:"Source Sans 3", sans-serif; font-weight:700;}
  p{margin:0 0 14px; max-width:65ch;}
  ul{margin:0 0 14px; padding-left:22px;}
  li{margin-bottom:6px; max-width:62ch;}
  strong{color:var(--ink); font-weight:600;}
  .callout{
    background:var(--accent-soft); border:1px solid var(--line);
    border-left:3px solid var(--accent); border-radius:8px;
    padding:14px 16px; font-size:15px; margin:16px 0;
  }
  code{
    background:var(--code-bg); padding:1px 6px; border-radius:4px;
    font-size:0.9em; font-family:ui-monospace, Menlo, monospace;
  }
  a{color:var(--accent);}
  footer{
    margin-top:56px; padding-top:24px; border-top:1px solid var(--line);
    color:var(--ink-soft); font-size:13px;
  }
  @media (max-width:480px){
    nav.toc ol{columns:1;}
  }
</style>
</head>
<body>
<div class="page">
  <header class="top">
    <p class="eyebrow">Giftpin · Gift Registry for Shopify</p>
    <h1>Privacy Policy</h1>
    <p class="meta">Effective 20 September 2026</p>
    <p class="lede">Giftpin is a gift-registry app for Shopify stores. This
      page explains what information the app and its browser extension
      handle, why, and what happens to it — for merchants who install
      Giftpin, and for the guests who use a registry it creates.</p>
  </header>

  <nav class="toc" aria-label="Table of contents">
    <p>On this page</p>
    <ol>
      <li><a href="#overview">Who this covers</a></li>
      <li><a href="#registry-data">Registry &amp; guest data</a></li>
      <li><a href="#product-data">Product data from other stores</a></li>
      <li><a href="#extension">Browser extension</a></li>
      <li><a href="#orders">Order &amp; purchase data</a></li>
      <li><a href="#sharing">Sharing &amp; affiliate links</a></li>
      <li><a href="#retention">Retention &amp; deletion</a></li>
      <li><a href="#security">Security</a></li>
      <li><a href="#children">Children's privacy</a></li>
      <li><a href="#rights">Your choices &amp; rights</a></li>
      <li><a href="#changes">Changes to this policy</a></li>
      <li><a href="#contact">Contact</a></li>
    </ol>
  </nav>

  <section id="overview">
    <h2><span class="num">01</span>Who this covers</h2>
    <p>Giftpin is installed by a <strong>merchant</strong> on their Shopify
      store. A <strong>registrant</strong> (the person the registry is for)
      creates and manages a registry through the merchant's storefront.
      A <strong>guest</strong> views a registry link, claims, and buys gifts.
      This policy covers all three, and applies wherever Giftpin
      operates — the Shopify app itself, the guest-facing registry page,
      and the optional browser extension.</p>
  </section>

  <section id="registry-data">
    <h2><span class="num">02</span>Registry &amp; guest data</h2>
    <p>When a registrant creates a registry, Giftpin stores what they enter
      directly: names, an event label and date, an optional message and
      cover image, and any items they add. If ship-to-registrant is used, it
      stores the shipping address the registrant enters into Giftpin's own
      form — never one pulled from a Shopify customer record.</p>
    <p>A registry's guest-facing page is deliberately minimal: it shows
      first names only, never a registrant's surname, email, phone number,
      or address.</p>
    <p>When a guest claims or buys an item, Giftpin records that a
      claim/purchase happened and, where the checkout provides it, a first
      name to attribute the gift to ("From Taylor") — not a full identity
      profile of the guest.</p>
  </section>

  <section id="product-data">
    <h2><span class="num">03</span>Product data from other stores</h2>
    <p>Giftpin's core feature is letting a registry hold gifts from <em>any</em>
      store, not only the merchant's. For an item from another site,
      Giftpin reads that page's own publicly displayed information — title,
      image, price — the same data shown to any visitor, via the page's
      standard product metadata (JSON-LD, Open Graph, or similar). This is
      read-only display data:</p>
    <ul>
      <li>It is <strong>not</strong> imported into the merchant's product
        catalog.</li>
      <li>It does <strong>not</strong> let the merchant sell that product.</li>
      <li>Every such item links back out to its original store for the
        actual purchase — Giftpin never processes that payment.</li>
    </ul>
  </section>

  <section id="extension">
    <h2><span class="num">04</span>Browser extension</h2>
    <p>Giftpin's optional browser extension reads the current page's
      already-rendered product information only when a registrant clicks
      the extension icon — never in the background, never on pages they
      don't actively choose. It sends what it reads to the registrant's own
      registry, authenticated by the same private "manage" link/token the
      registrant already has; the extension introduces no separate login or
      credential. Its only network permission is to the merchant's own
      Shopify store domain — it does not send data anywhere else.</p>
  </section>

  <section id="orders">
    <h2><span class="num">05</span>Order &amp; purchase data</h2>
    <p>To attribute a purchase back to the right registry item — including
      through Shop Pay, Apple Pay, Google Pay, or the Shop app — Giftpin
      reads limited fields from the merchant's own order webhooks
      (for example, a buyer's first name and whether they're a first-time
      customer). It does not read a customer's email or address back from
      Shopify's Admin API; a ship-to-registrant address is written to an
      order, never read from one.</p>
  </section>

  <section id="sharing">
    <h2><span class="num">06</span>Sharing &amp; affiliate links</h2>
    <p>Giftpin does not sell personal data. Some outbound links to other
      retailers may carry a standard affiliate parameter: if a guest buys
      through that link, the retailer may pay Giftpin a small referral
      commission. This never changes the price the guest pays, is never
      billed to the merchant, and is disclosed on the registry page itself.
      Beyond that referral relationship (standard to how affiliate links
      work everywhere), Giftpin does not share registry or guest data with
      third parties except service providers needed to run the app
      (hosting, database, and email delivery), each bound to use it only to
      provide that service.</p>
  </section>

  <section id="retention">
    <h2><span class="num">07</span>Retention &amp; deletion</h2>
    <p>Registry data is kept for as long as the registry (and the
      merchant's Giftpin installation) is active. When a merchant
      uninstalls Giftpin, or a registrant requests deletion, associated
      data is removed in line with Shopify's mandatory data-protection
      webhooks (<code>customers/redact</code>, <code>shop/redact</code>).</p>
  </section>

  <section id="security">
    <h2><span class="num">08</span>Security</h2>
    <p>Data moves over encrypted connections (HTTPS) end to end. A
      registry's "manage" access is protected by a private, unguessable
      token rather than a shared password — treat that link the way you'd
      treat a password, and don't share it publicly.</p>
  </section>

  <section id="children">
    <h2><span class="num">09</span>Children's privacy</h2>
    <p>Giftpin is not directed at children and is not knowingly used to
      collect information from anyone under 13.</p>
  </section>

  <section id="rights">
    <h2><span class="num">10</span>Your choices &amp; rights</h2>
    <p>A registrant can edit or delete registry items, or ask to have their
      registry removed entirely, at any time through their manage link or
      by contacting us below. Depending on where you live, you may have
      additional rights over your personal data (for example, under GDPR or
      CCPA/CPRA) — contact us to exercise them.</p>
  </section>

  <section id="changes">
    <h2><span class="num">11</span>Changes to this policy</h2>
    <p>If this policy changes in a way that affects what data is collected
      or how it's used, the effective date at the top of this page will be
      updated. Material changes will be noted to merchants through the
      Shopify Partner Dashboard or the app itself.</p>
  </section>

  <section id="contact">
    <h2><span class="num">12</span>Contact</h2>
    <p>Questions about this policy or your data can be sent to
      <a href="mailto:privacy@giftpin.app">privacy@giftpin.app</a>.</p>
    <div class="callout">This address is a filtered alias of the developer's
      own inbox — no separate support system to sign into, everything lands
      in one place.</div>
  </section>

  <footer>
    Giftpin is developed independently and distributed on the Shopify App
    Store. This policy describes Giftpin's own data handling and is
    separate from Shopify's own privacy policy, which also applies to your
    use of the Shopify platform.
  </footer>
</div>
</body>
</html>
`;
