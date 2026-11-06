
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
export const loader = async () => {
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
<link rel="icon" type="image/png" sizes="64x64" href="/brand/giftpin-icon-64.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap">
<style>
  :root{
    --bg:#fbfaff; --surface:#ffffff; --ink:#15142e; --ink-soft:#57567a;
    --line:#e6e3f5; --accent:#6d3ae8; --accent-soft:#efeaff; --code-bg:#f3f1ff;
  }
  @media (prefers-color-scheme: dark){
    :root:not([data-theme="light"]){
      --bg:#0f0e26; --surface:#18173a; --ink:#eeedfb; --ink-soft:#aeacd2;
      --line:#2b2956; --accent:#b69cff; --accent-soft:#272257; --code-bg:#211f4d;
    }
  }
  *{box-sizing:border-box}
  body{
    margin:0; background:var(--bg); color:var(--ink);
    font-family:"Plus Jakarta Sans", -apple-system, Segoe UI, sans-serif;
    line-height:1.6; padding-block:48px; padding-inline:16px;
  }
  .page{max-width:720px; margin:0 auto;}
  header.top{margin-bottom:40px;}
  .home{display:inline-flex; align-items:center; gap:10px; margin-bottom:32px; color:var(--ink);
    text-decoration:none; font-family:"Bricolage Grotesque", sans-serif; font-weight:800; font-size:22px;}
  .home img{width:32px; height:32px; border-radius:9px;}
  .eyebrow{
    font-size:13px; letter-spacing:.08em; text-transform:uppercase;
    color:var(--accent); font-weight:600; margin:0 0 10px;
  }
  h1{
    font-family:"Bricolage Grotesque", sans-serif; font-weight:800;
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
    font-family:"Bricolage Grotesque", sans-serif; font-weight:800;
    font-size:22px; margin:0 0 14px; padding-top:8px;
    border-top:1px solid var(--line);
    display:flex; align-items:baseline; gap:10px;
  }
  h2 .num{color:var(--accent); font-variant-numeric:tabular-nums; font-size:15px;
    font-family:"Plus Jakarta Sans", sans-serif; font-weight:700;}
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
    <a class="home" href="/"><img src="/brand/giftpin-icon-64.png" alt="" width="32" height="32">Giftpin</a>
    <p class="eyebrow">Giftpin · Gift Registry for Shopify</p>
    <h1>Privacy Policy</h1>
    <p class="meta">Effective 23 September 2026</p>
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
      <li><a href="#merchants">For merchants: how we process customer data</a></li>
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
    <p>If a guest asks for a reminder before the event, Giftpin stores the
      email address they enter, encrypted, uses it only for that one
      reminder, and deletes it once the event has passed. Every reminder
      has a one-click unsubscribe link.</p>
    <p>Giftpin counts visits to registry pages and actions such as adding a
      gift to the cart, as daily totals per store and per registry, so the
      merchant can see how their registries are doing. These counts store no
      IP address, cookie, device identifier or anything else that could
      identify a visitor.</p>
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
      receives the merchant's <code>orders/create</code> webhook. From it,
      Giftpin uses:</p>
    <ul>
      <li>the buyer's <strong>first and last name</strong>, which is stored
        with the purchase so the registrant can see who a gift is from and
        say thank you (and can be hidden from the registrant until after the
        event if the merchant chooses);</li>
      <li>the buyer's <strong>Shopify customer ID</strong>, stored only so
        that one customer's name can be found and erased if they ask;</li>
      <li>whether it is the buyer's <strong>first order</strong> (worked out
        from the order count and stored as a yes/no), used for the
        merchant's "new customers" figure;</li>
      <li>the order's line items and totals, to credit the right gift.</li>
      <li>the order total of <strong>every</strong> order, added to a daily
        per-store sales total so the merchant can see what share of their
        sales came through registries. Nothing about the order or the buyer
        is kept for an order with no registry gift in it.</li>
    </ul>
    <p>Giftpin does not read or store a buyer's email address, phone number,
      or street address from Shopify. When a registrant has turned on
      ship-to-registrant, Giftpin writes the address the registrant entered
      into Giftpin's own form onto the matching order, and reads only that
      order's country and province/state code to check that the new address
      is in the same tax jurisdiction before changing it.</p>
  </section>

  <section id="sharing">
    <h2><span class="num">06</span>Sharing &amp; affiliate links</h2>
    <p>Giftpin does not sell personal data. Some outbound links to other
      retailers pass through an affiliate network's redirect (currently
      Sovrn Commerce) before reaching the retailer. That network may set its
      own cookies and see standard request details (such as IP address and
      browser) to track the referral, under its own privacy policy. When a
      guest clicks or buys through such a link, Giftpin may be paid a small
      referral fee or commission. This never changes the price the guest
      pays, is never billed to the merchant, and is disclosed on the
      registry page itself.
      Beyond that referral relationship (standard to how affiliate links
      work everywhere), Giftpin does not share registry or guest data with
      third parties except service providers needed to run the app
      (hosting, database, and email delivery), each bound to use it only to
      provide that service.</p>
  </section>

  <section id="retention">
    <h2><span class="num">07</span>Retention &amp; deletion</h2>
    <p>Giftpin keeps personal data only as long as it is needed. A daily
      automated job removes data once it passes these limits:</p>
    <ul>
      <li><strong>Buyer name and customer ID on a purchase:</strong> removed
        12 months after the registry's event date (or 12 months after the
        purchase, if the registry has no event date).</li>
      <li><strong>A registrant's shipping address:</strong> removed 90 days
        after the event date.</li>
      <li><strong>A registry</strong> and everything in it (registrant name
        and email, items, purchases): deleted 24 months after the event date
        if it has had no activity for 24 months, or after 36 months of no
        activity if it has no event date. A registrant can delete theirs
        sooner at any time.</li>
      <li><strong>Holds on items from other stores:</strong> removed 30 days
        after they end.</li>
      <li><strong>A guest's email for a pre-event reminder</strong> (only if
        they asked for one on the registry page): removed once the event
        date passes, or straight away if they unsubscribe.</li>
      <li><strong>Activity history for a registry:</strong> 24 months.</li>
      <li><strong>Internal audit records</strong> (a log of when the app
        accessed personal data, containing no names or emails): 12 months.</li>
      <li><strong>Technical records</strong> (webhook de-duplication ids,
        expired login sessions): 7 days.</li>
    </ul>
    <p>When a merchant uninstalls Giftpin, Shopify sends a
      <code>shop/redact</code> request 48 hours later and Giftpin erases all
      of that store's data; if that request never arrives, Giftpin erases the
      store's data itself 30 days after uninstall. When a customer asks a
      merchant to erase their data, Shopify sends
      <code>customers/redact</code> and Giftpin erases that customer's
      registries and buyer details. Encrypted database backups kept by our
      database provider roll off on the provider's own schedule, and deleted
      data is not restored into the live service.</p>
  </section>

  <section id="security">
    <h2><span class="num">08</span>Security</h2>
    <p>Data moves over encrypted connections (HTTPS) end to end, and our
      managed database provider encrypts stored data at rest. On top of that,
      registrant email addresses and shipping addresses are encrypted by
      Giftpin itself (AES-256-GCM) before they are stored, and registry
      passwords are stored only as salted hashes. A registry's "manage"
      access is protected by a private, unguessable token rather than a
      shared password — treat that link the way you'd treat a password, and
      don't share it publicly.</p>
    <p>Test and production data are kept in separate databases. Access to
      production systems is limited to the developer, and Giftpin keeps an
      audit log of each time the app itself decrypts or exports personal data
      (for example, to send a registrant an email or to answer a data
      request). Giftpin maintains a written security incident response plan.
      If personal data in Giftpin's care is confirmed to have been exposed,
      affected merchants will be told without undue delay and no later than
      72 hours after confirmation, with what happened, what data was
      involved, and what we are doing about it.</p>
  </section>

  <section id="merchants">
    <h2><span class="num">09</span>For merchants: how we process customer data</h2>
    <p>For personal data about a merchant's customers that Giftpin handles
      on the merchant's behalf, Giftpin acts as the merchant's service
      provider (a "processor"), and the merchant remains the controller. By
      installing Giftpin, the merchant and Giftpin agree that:</p>
    <ul>
      <li>Giftpin processes that data only to provide the registry features
        described in this policy, on the merchant's instructions given
        through the app and Shopify. It does not sell it, use it for its own
        marketing, or combine it with data from other merchants.</li>
      <li>Only the developer can access it, and is bound to keep it
        confidential.</li>
      <li>Giftpin uses these service providers to run the app: Railway
        (hosting), Neon (database), and Resend (transactional email). Each
        may only handle the data to provide its service. We will update this
        list here before adding another that handles customer data.</li>
      <li>Giftpin helps the merchant answer data-access and erasure requests
        by honouring Shopify's <code>customers/data_request</code>,
        <code>customers/redact</code> and <code>shop/redact</code> webhooks
        (Giftpin's response to a data request is prepared within the 30-day
        window Shopify sets).</li>
      <li>Retention, security and breach-notification commitments are as
        described in sections 07 and 08.</li>
      <li>This section forms part of the terms on which Giftpin is made
        available to merchants, alongside Shopify's Partner Program
        Agreement and the terms of the Shopify App Store.</li>
    </ul>
  </section>

  <section id="children">
    <h2><span class="num">10</span>Children's privacy</h2>
    <p>Giftpin is not directed at children and is not knowingly used to
      collect information from anyone under 13.</p>
  </section>

  <section id="rights">
    <h2><span class="num">11</span>Your choices &amp; rights</h2>
    <p>A registrant can edit or delete registry items, or ask to have their
      registry removed entirely, at any time through their manage link or
      by contacting us below. Depending on where you live, you may have
      additional rights over your personal data (for example, under GDPR or
      CCPA/CPRA) — contact us to exercise them.</p>
  </section>

  <section id="changes">
    <h2><span class="num">12</span>Changes to this policy</h2>
    <p>If this policy changes in a way that affects what data is collected
      or how it's used, the effective date at the top of this page will be
      updated. Material changes will be noted to merchants through the
      Shopify Partner Dashboard or the app itself.</p>
  </section>

  <section id="contact">
    <h2><span class="num">13</span>Contact</h2>
    <p>Questions about this policy or your data can be sent to
      <a href="mailto:privacy@giftpin.app">privacy@giftpin.app</a>.</p>
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
