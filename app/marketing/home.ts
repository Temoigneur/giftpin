import { EVENT_TYPES } from "../shared/settings";
import { APP_STORE_URL, SITE_URL } from "./config";
import { FAQ_GROUPS, faqList } from "./faq-copy";
import { cta, demoVideo, esc, finalCta, icon, sitePage } from "./layout";
import { FOUNDING_OFFER, PRICE, PRO_FEATURES, PRO_NAME, TRIAL } from "./plans-copy";

/** giftpin.app home page. */
export function homeHtml(): string {
  const c = cta();
  const occasions = EVENT_TYPES.filter((t) => t.value !== "other");
  const faqPicks = [
    FAQ_GROUPS[1].items[1],
    FAQ_GROUPS[2].items[0],
    FAQ_GROUPS[3].items[3],
    FAQ_GROUPS[3].items[1],
  ];

  const body = `
<section class="hero home-hero">
  <div class="wrap hh">
    <div class="hh-copy">
      <p class="eyebrow">${icon("sparkle")} The gift registry app for Shopify</p>
      <h1>One registry.<br>Every store.<br><span class="grad-text">Your checkout first.</span></h1>
      <p class="lede">Your customers put everything they want on one registry, from your shelves and from any shop online. Giftpin puts your matching products right beside the rest. Guests get one link. You get the sale.</p>
      <div class="cta-row">
        <a class="btn dark lg" href="${esc(c.href)}">${c.label} ${icon("arrow")}</a>
        <a class="btn ghost-band lg" href="#demo">${icon("play")} Watch the demo</a>
      </div>
      <ul class="proof">
        <li>${icon("check")} Free plan with unlimited registries</li>
        <li>${icon("check")} ${PRO_NAME} ${TRIAL}</li>
        <li>${icon("check")} Billed through Shopify</li>
        <li>${icon("check")} Made in Canada</li>
      </ul>
      ${FOUNDING_OFFER ? `<p class="founding">${icon("star")} ${esc(FOUNDING_OFFER)}</p>` : ""}
    </div>

    <div class="hh-art" aria-label="Example registry" role="img">
      <div class="reg">
        <div class="reg-hd">
          <span class="av">M&amp;T</span>
          <div><strong>Maya &amp; Theo's Wedding</strong><span>24 gifts from 6 stores</span></div>
        </div>
        <div class="bar-lab"><span>62% gifted</span><span>9 left</span></div>
        <div class="prog"><i></i></div>
        <div class="it">
          <span class="th t1">${icon("gift")}</span>
          <div><strong>Stand mixer</strong><span class="src mine">${icon("store")} Your store</span></div>
          <span class="st give">Give this</span>
        </div>
        <div class="it">
          <span class="th t2">${icon("heart")}</span>
          <div><strong>Cast-iron Dutch oven</strong><span class="src">${icon("globe")} Another shop</span></div>
          <span class="st held">May be taken</span>
        </div>
        <div class="it">
          <span class="th t3">${icon("sparkle")}</span>
          <div><strong>Linen bedding set</strong><span class="src mine">${icon("store")} Your store</span></div>
          <span class="st done">${icon("check")} Gifted</span>
        </div>
      </div>
      <div class="toast t-a">${icon("card")}<div><strong>Paid with Shop Pay</strong><span>Credited to Maya &amp; Theo</span></div></div>
      <div class="toast t-b">${icon("bell")}<div><strong>New gift!</strong><span>Linen bedding set</span></div></div>
    </div>
  </div>

  <div class="wrap pay">
    <p>Every gift credited to the right registry, however guests pay</p>
    <ul><li>Shop Pay</li><li>Apple Pay</li><li>Google Pay</li><li>Shop app</li><li>Standard checkout</li></ul>
  </div>
</section>

<section class="sec" id="your-store">
  <div class="wrap spot">
    <div class="rise">
      <p class="eyebrow">${icon("store")} Built for merchants</p>
      <h2>Other registries send customers elsewhere. <span class="grad-text">Giftpin sends them back.</span></h2>
      <p class="lede" style="margin:18px 0 32px">A registry locked to one catalog makes couples and parents look elsewhere for the rest. Giftpin lets them add anything, then looks in your catalog first and puts your product right beside it.</p>
      <ol class="pts">
        <li><span class="n">1</span><div><h3>Start from your shelves</h3><p>Shoppers browse your store from inside their registry, and wedding registries get room-by-room ideas that open a search of your catalog.</p></div></li>
        <li><span class="n">2</span><div><h3>Your product appears beside theirs</h3><p>When someone adds an item from another shop, Giftpin searches your catalog and shows your closest match right next to it.</p></div></li>
        <li><span class="n">3</span><div><h3>One tap to switch to yours</h3><p>They swap in your product, and guests buy it through your checkout. Suggestions are the shopper's choice, and guests only see the ones they keep.</p></div></li>
      </ol>
    </div>
    <div class="rise">
      <div class="match-card">
        <p class="mc-lab">Added from another shop</p>
        <div class="it flat">
          <span class="th t2">${icon("heart")}</span>
          <div><strong>Cast-iron Dutch oven</strong><span class="src">${icon("globe")} Another shop</span></div>
        </div>
        <div class="match">
          <p class="mc-lab accent">${icon("sparkle")} Similar item in your store</p>
          <div class="it flat">
            <span class="th t1">${icon("gift")}</span>
            <div><strong>Enameled casserole pot</strong><span class="src mine">${icon("store")} Your store</span></div>
            <span class="st give">Use this instead</span>
          </div>
        </div>
      </div>
      <p class="fine-print">Illustration with example products. Giftpin only reads your catalog to find a match; nothing in your store is changed.</p>
    </div>
  </div>
</section>

<section class="sec tint" id="any-registry">
  <div class="wrap spot">
    <div class="rise">
      <p class="eyebrow">${icon("link")} Already registered somewhere else?</p>
      <h2>Your Add to registry button works with <span class="grad-text">the registry they already have.</span></h2>
      <p class="lede" style="margin:18px 0 32px">Plenty of shoppers arrive with a registry on Babylist or a wedding site. Instead of losing them, your product page asks <em>Which registry?</em> and sends the gift wherever their list lives.</p>
      <ol class="pts">
        <li><span class="n">1</span><div><h3>Your store's registry</h3><p>The usual one tap onto a Giftpin registry, credited to you when guests buy.</p></div></li>
        <li><span class="n">2</span><div><h3>Their Babylist registry</h3><p>Added through Babylist's own add-to-Babylist script, with the size or colour they picked. It only loads when a shopper chooses it.</p></div></li>
        <li><span class="n">3</span><div><h3>Any registry that takes a link</h3><p>Giftpin copies the product link, with the variant they chose, and tells them where to paste it, or to use that site's own button, like Add to Zola.</p></div></li>
      </ol>
    </div>
    <div class="rise">
      <div class="match-card picker-card">
        <p class="mc-lab">Your product page</p>
        <div class="it flat">
          <span class="th t1">${icon("gift")}</span>
          <div><strong>Organic cotton swaddle set</strong><span class="src mine">${icon("store")} Your store</span></div>
        </div>
        <div class="match">
          <p class="mc-lab accent">${icon("gift")} Which registry?</p>
          <div class="choices"><span class="solid">My store registry</span><span>My Babylist registry</span><span>Another registry (copy link)</span></div>
        </div>
      </div>
      <p class="fine-print">Illustration. Both extra choices are off until you tick them in the button's settings, on Free and ${PRO_NAME}. Giftpin isn't affiliated with Babylist or Zola, and it doesn't track purchases made from registries on other sites.</p>
    </div>
  </div>
</section>

<section class="sec" id="how">
  <div class="wrap">
    <div class="sec-head center rise">
      <p class="eyebrow">How it works</p>
      <h2>Three steps. One link. Zero duplicate toasters.</h2>
      <p class="lede">Nothing for guests to sign up for, and nothing for them to install.</p>
    </div>
    <div class="grid-3 steps">
      <div class="card rise"><span class="big-n">1</span><h3>Start a registry</h3><p>Right from your store. Pick the occasion, name it, done. The registrant gets a private link by email to manage it, no account needed.</p></div>
      <div class="card rise"><span class="big-n">2</span><h3>Add anything</h3><p>Your products with one tap on the Add to registry button, and anything from any other shop by pasting a link. Your closest matches are suggested along the way.</p></div>
      <div class="card rise"><span class="big-n">3</span><h3>Share and celebrate</h3><p>Guests open one page and pick a gift, and it's marked so nobody buys it twice. The registrant hears about every gift and keeps a who-gave-what list.</p></div>
    </div>
  </div>
</section>

<section class="sec tint" id="demo">
  <div class="wrap">
    <div class="sec-head center rise">
      <p class="eyebrow">${icon("play")} Demo</p>
      <h2>See Giftpin in action</h2>
      <p class="lede">Watch a registry come together, from the first item to the thank-you list.</p>
    </div>
    <div class="rise demo-frame">${demoVideo()}</div>
  </div>
</section>

<section class="sec" id="features">
  <div class="wrap">
    <div class="sec-head rise">
      <p class="eyebrow">Features</p>
      <h2>Everything a registry needs, on the free plan.</h2>
      <p class="lede">Unlimited registries, items and guests. No per-registry fees and no fee on your product sales.</p>
    </div>
    <div class="bento">
      <div class="card wide rise">
        <span class="chip-ico">${icon("globe")}</span>
        <h3>Any store, one list</h3>
        <p>Your products, a boutique's candles and a big-box stroller, all on one page. Registrants paste a product link and Giftpin fills in the photo, name and price.</p>
        <div class="stores" aria-hidden="true"><span class="mine">Your store</span><span>Home goods shop</span><span>Big-box retailer</span><span>Local boutique</span><span>Handmade marketplace</span></div>
      </div>
      <div class="card rise">
        <span class="chip-ico">${icon("shield")}</span>
        <h3>No duplicate gifts</h3>
        <p>The moment a guest goes to buy, the registry shows <em>Someone may be buying this</em>. If they don't, it comes back.</p>
      </div>
      <div class="card rise">
        <span class="chip-ico">${icon("card")}</span>
        <h3>Credited through every checkout</h3>
        <p>Shop Pay, Apple Pay, Google Pay and the Shop app skip the cart. Giftpin still credits every gift to the right registry.</p>
      </div>
      <div class="card rise">
        <span class="chip-ico">${icon("truck")}</span>
        <h3>Ships straight to them</h3>
        <p>When the registrant saves an address, gifts bought from your store go right to their door. Guests never see it.</p>
      </div>
      <div class="card rise">
        <span class="chip-ico">${icon("bulb")}</span>
        <h3>Ideas that fill the list</h3>
        <p>Room-by-room ideas for weddings and an ideas guide for every other occasion, each opening a search of your catalog.</p>
      </div>
      <div class="card rise">
        <span class="chip-ico">${icon("list")}</span>
        <h3>Thank-you cards made easy</h3>
        <p>A who-gave-what list the registrant can download as a spreadsheet, so nobody gets missed.</p>
      </div>
      <div class="card wide rise">
        <span class="chip-ico">${icon("puzzle")}</span>
        <h3>Drops into your theme, no code</h3>
        <p>Add Giftpin's blocks in the theme editor: an Add to registry button on product pages, and registry links for anywhere else. Registry pages live on your own domain.</p>
        <div class="blocks" aria-hidden="true"><span class="solid">${icon("gift")} Add to registry</span><span>Create a gift registry</span><span>Find a gift registry</span><span>Manage my gift registry</span></div>
      </div>
    </div>
    <p class="more rise"><a href="/features">See every feature ${icon("arrow")}</a></p>
  </div>
</section>

<section class="sec" id="occasions">
  <div class="wrap">
    <div class="sec-head center rise">
      <p class="eyebrow">${icon("heart")} Occasions</p>
      <h2>Weddings are just the start.</h2>
      <p class="lede">${occasions.length} occasions ready on day one, each with its own gift ideas guide. You choose which ones your store offers.</p>
    </div>
    <div class="occ rise">${occasions.map((o) => `<span>${esc(o.label)}</span>`).join("")}</div>
  </div>
</section>

<section class="sec pro-sec">
  <div class="wrap">
    <div class="pro-card rise">
      <div class="pro-copy">
        <p class="eyebrow">${icon("sparkle")} ${PRO_NAME}</p>
        <h2>Turn registries into <span class="grad-text">repeat revenue.</span></h2>
        <p class="lede">See what registries earn you, make every page look like your store, and let Giftpin follow up with guests and registrants on its own.</p>
        <p class="pro-price"><strong>${PRICE}</strong> / month <span>${TRIAL}</span></p>
        <div class="cta-row"><a class="btn light" href="/pricing">Compare plans ${icon("arrow")}</a></div>
      </div>
      <ul class="pro-list">
        ${PRO_FEATURES.map((f) => `<li>${icon(f.icon)}<div><strong>${esc(f.title)}</strong><span>${esc(f.detail)}</span></div></li>`).join("")}
      </ul>
    </div>
  </div>
</section>

<section class="sec tint">
  <div class="wrap">
    <div class="sec-head center rise">
      <p class="eyebrow">${icon("lock")} Honest by design</p>
      <h2>Good for guests. Good for you.</h2>
    </div>
    <div class="grid-3">
      <div class="card rise"><span class="chip-ico">${icon("percent")}</span><h3>No fee on your sales</h3><p>Neither plan takes a cut of your own product sales. Pro is a flat ${PRICE} a month, billed through Shopify.</p></div>
      <div class="card rise"><span class="chip-ico">${icon("shield")}</span><h3>Disclosed, never hidden</h3><p>Giftpin may earn a small commission when a guest buys from another website. It's disclosed on the registry page and never changes the guest's price.</p></div>
      <div class="card rise"><span class="chip-ico">${icon("lock")}</span><h3>Your store stays yours</h3><p>Giftpin reads your catalog to suggest products. It never edits your products, prices or inventory.</p></div>
    </div>
  </div>
</section>

<section class="sec" id="trust">
  <div class="wrap">
    <div class="sec-head center rise">
      <p class="eyebrow">${icon("heart")} New on the Shopify App Store</p>
      <h2>Don't take our word for it. <span class="grad-text">Check for yourself.</span></h2>
      <p class="lede">Giftpin is new, so there aren't many reviews yet. Here's what you can see before you install, and how easy it is to walk away.</p>
    </div>
    <div class="grid-3">
      <div class="card rise"><span class="chip-ico">${icon("shield")}</span><h3>Reviewed by Shopify</h3><p>Giftpin passed Shopify's app review before it was listed on the <a href="${esc(APP_STORE_URL)}">Shopify App Store</a>, and runs on Shopify's own billing.</p></div>
      <div class="card rise"><span class="chip-ico">${icon("play")}</span><h3>Watch the whole thing first</h3><p>The <a href="#demo">demo video</a> shows a real registry from the first item to the thank-you list. No sign-up needed to watch.</p></div>
      <div class="card rise"><span class="chip-ico">${icon("bolt")}</span><h3>Free to try, easy to leave</h3><p>The Free plan has no time limit. ${PRO_NAME} starts with a ${TRIAL}, and you cancel from Shopify like any other app.</p></div>
      <div class="card rise"><span class="chip-ico">${icon("heart")}</span><h3>Made in Canada by its founders</h3><p>Giftpin is built by two co-founders, not a faceless agency. When you write in, the people who built it answer.</p></div>
      <div class="card rise"><span class="chip-ico">${icon("mail")}</span><h3>Help setting it up</h3><p>Follow the <a href="/setup">setup guide</a>, or email <a href="mailto:support@giftpin.app">support@giftpin.app</a> and we'll help you get the button on your product pages.</p></div>
      <div class="card rise"><span class="chip-ico">${icon("lock")}</span><h3>Privacy you can read</h3><p>See exactly what Giftpin stores about registrants and guests, and why, in the <a href="/privacy">privacy policy</a>.</p></div>
    </div>
  </div>
</section>

<section class="sec tint">
  <div class="wrap faq-teaser">
    <div class="rise">
      <p class="eyebrow">FAQ</p>
      <h2>Questions, answered.</h2>
      <p class="lede" style="margin:16px 0 24px">Still curious? Email <a href="mailto:support@giftpin.app">support@giftpin.app</a> and a real person will write back.</p>
      <a class="btn ghost" href="/faq">All questions ${icon("arrow")}</a>
    </div>
    <div class="rise">${faqList(faqPicks)}</div>
  </div>
</section>

${finalCta()}
`;

  return sitePage({
    path: "/",
    nav: "home",
    title: "Giftpin: gift registries with items from any store, for Shopify",
    description:
      "Giftpin is the Shopify gift registry that isn't limited to your catalog. Customers add gifts from any store, Giftpin suggests your matching products, and every purchase is credited correctly, even through Shop Pay.",
    body,
    css: CSS,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Giftpin Gift Registry",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Shopify",
        url: SITE_URL,
        offers: [
          { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
          { "@type": "Offer", name: PRO_NAME, price: PRICE.slice(1), priceCurrency: "USD" },
        ],
      },
    ],
  });
}

const CSS = `
.home-hero{padding-top:clamp(40px,7vw,88px)}
.hh{display:grid; grid-template-columns:1.05fr .95fr; gap:clamp(32px,5vw,72px); align-items:center}
.hh h1{margin:4px 0 22px}
.hh .lede{margin-bottom:32px}
.proof{list-style:none; padding:0; margin:28px 0 0; display:flex; flex-wrap:wrap; gap:10px 22px; font-size:15px; color:var(--band-soft)}
.proof li{display:flex; align-items:center; gap:6px}
.proof .i{width:18px; height:18px; color:var(--blue)}
.hh-art{position:relative; padding:64px 8px 40px}
.reg{background:#fff; color:#15142e; border-radius:24px; padding:22px; box-shadow:0 40px 80px -30px rgba(30,64,175,.45), 0 0 0 1px rgba(21,20,46,.06);
  transform:rotate(-1.5deg); animation:bob 7s ease-in-out infinite}
@keyframes bob{50%{transform:rotate(-1.5deg) translateY(-8px)}}
.reg-hd{display:flex; gap:12px; align-items:center; margin-bottom:18px}
.reg-hd strong{display:block; font-family:"Bricolage Grotesque",sans-serif; font-size:20px; line-height:1.2}
.reg-hd div span{font-size:13px; color:#6b6a8c}
.av{width:46px; height:46px; border-radius:50%; background:linear-gradient(135deg,#2563eb,#9333ea); color:#fff; font-weight:800; font-size:14px; display:grid; place-items:center; flex:none}
.bar-lab{display:flex; justify-content:space-between; font-size:13px; font-weight:700; color:#6b6a8c; margin-bottom:6px}
.prog{height:8px; background:#eeecfb; border-radius:99px; overflow:hidden; margin-bottom:8px}
.prog i{display:block; height:100%; width:62%; background:var(--grad); border-radius:99px; animation:fill 2.2s cubic-bezier(.2,.7,.2,1) both .3s}
@keyframes fill{from{width:8%}}
.it{display:flex; align-items:center; gap:12px; padding:12px 0; border-top:1px solid #eeecf6}
.it.flat{border-top:0; padding:6px 0}
.it strong{display:block; font-size:15px; line-height:1.3}
.th{width:48px; height:48px; border-radius:14px; display:grid; place-items:center; flex:none; color:#fff}
.th .i{width:24px; height:24px}
.t1{background:linear-gradient(135deg,#22d3ee,#3b82f6)} .t2{background:linear-gradient(135deg,#f472b6,#a855f7)} .t3{background:linear-gradient(135deg,#3b82f6,#a855f7)}
.src{display:inline-flex; align-items:center; gap:4px; font-size:12.5px; color:#6b6a8c; font-weight:600}
.src .i{width:14px; height:14px}
.src.mine{color:#5b2fd6}
.st{margin-left:auto; font-size:12.5px; font-weight:700; padding:6px 12px; border-radius:99px; white-space:nowrap; display:inline-flex; align-items:center; gap:4px}
.st .i{width:14px; height:14px}
.st.give{background:#181638; color:#fff}
.st.held{background:#fff4dc; color:#8a5a00}
.st.done{background:#e3f8ee; color:#11714a}
.toast{position:absolute; display:flex; align-items:center; gap:10px; background:rgba(33,31,77,.92); color:#fff; border:1px solid rgba(255,255,255,.14);
  backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); padding:10px 16px 10px 12px; border-radius:16px; box-shadow:0 18px 40px -16px rgba(0,0,0,.7); font-size:13px}
.toast .i{width:32px; height:32px; padding:6px; border-radius:10px; background:var(--grad)}
.toast strong{display:block; font-size:14px}
.toast span{color:var(--night-soft)}
.t-a{top:0; right:-10px; animation:pop .6s cubic-bezier(.2,.9,.3,1.3) both 1s, float 6s ease-in-out infinite 1.6s}
.t-b{bottom:0; left:-18px; animation:pop .6s cubic-bezier(.2,.9,.3,1.3) both 1.8s, float 6s ease-in-out infinite 2.4s}
@keyframes pop{from{opacity:0; transform:scale(.7) translateY(10px)}}
@keyframes float{50%{transform:translateY(-6px)}}
.pay{padding-block:56px 44px; text-align:center}
.pay p{font-size:14px; font-weight:600; color:var(--band-soft); margin-bottom:16px}
.pay ul{list-style:none; padding:0; margin:0; display:flex; flex-wrap:wrap; justify-content:center; gap:10px}
.pay li{border:1px solid var(--band-line); background:var(--band-chip); border-radius:999px; padding:8px 18px; font-weight:700; font-size:15px; color:var(--band-ink)}
@media (max-width:900px){
  .hh{grid-template-columns:1fr}
  .hh-art{max-width:480px; margin-inline:auto; width:100%}
  .t-a{right:0} .t-b{left:0}
}
@media (max-width:420px){.toast{font-size:12px; padding:8px 12px 8px 8px} .toast strong{font-size:13px} .st{padding:5px 9px}}

.spot{display:grid; grid-template-columns:1.1fr .9fr; gap:clamp(32px,6vw,80px); align-items:center}
.pts{list-style:none; margin:0; padding:0; display:grid; gap:22px}
.pts li{display:grid; grid-template-columns:40px 1fr; gap:16px}
.pts .n{width:40px; height:40px; border-radius:12px; background:var(--grad); color:#fff; font-weight:800; display:grid; place-items:center}
.pts h3{margin:6px 0 4px; font-size:19px}
.pts p{color:var(--ink-soft); font-size:16px}
.match-card{background:#fff; color:#15142e; border:1px solid var(--line); border-radius:24px; padding:22px; box-shadow:var(--shadow)}
.mc-lab{font-size:12px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:#6b6a8c; margin-bottom:6px; display:flex; align-items:center; gap:6px}
.mc-lab.accent{color:#5b2fd6}
.mc-lab .i{width:16px; height:16px}
.match{margin-top:14px; border-radius:18px; padding:16px; background:linear-gradient(#f6f3ff,#f6f3ff) padding-box, var(--grad) border-box; border:2px solid transparent}
.fine-print{font-size:13px; color:var(--ink-soft); margin-top:14px}
@media (max-width:900px){.spot{grid-template-columns:1fr}}

.steps .card{position:relative; overflow:hidden}
.big-n{font-family:"Bricolage Grotesque",sans-serif; font-weight:800; font-size:64px; line-height:1; background:var(--grad-text); -webkit-background-clip:text; background-clip:text; color:transparent; display:block}

.demo-frame{max-width:980px; margin:0 auto}

.choices{display:grid; gap:8px; margin-top:8px}
.choices span{font-size:14px; font-weight:700; padding:10px 14px; border-radius:10px; border:1.5px solid #15142e; color:#15142e; text-align:center}
.choices .solid{background:#15142e; color:#fff}

.bento{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:20px}
.bento .wide{grid-column:span 2; position:relative; overflow:hidden}
.blocks{display:flex; flex-wrap:wrap; gap:8px; margin-top:20px}
.blocks span{display:inline-flex; align-items:center; gap:6px; font-size:13.5px; font-weight:700; padding:9px 16px; border-radius:10px; border:1.5px solid var(--ink); color:var(--ink)}
.blocks .solid{background:var(--ink); color:var(--bg)}
.blocks .i{width:16px; height:16px}
.stores{display:flex; flex-wrap:wrap; gap:8px; margin-top:20px}
.stores span{font-size:13px; font-weight:700; padding:6px 12px; border-radius:99px; border:1px solid var(--line); color:var(--ink-soft)}
.stores .mine{background:var(--grad); color:#fff; border-color:transparent}
.card:hover{border-color:color-mix(in srgb,var(--accent) 45%,var(--line))}
.more{margin-top:32px; text-align:center; font-weight:700}
.more a{display:inline-flex; align-items:center; gap:6px; text-decoration:none}
.more .i{width:18px; height:18px}
@media (max-width:900px){.bento{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:640px){.bento{grid-template-columns:1fr} .bento .wide{grid-column:auto}}

.occ{display:flex; flex-wrap:wrap; justify-content:center; gap:12px; max-width:920px; margin:0 auto}
.occ span{padding:10px 20px; border-radius:999px; background:var(--surface); border:1px solid var(--line); font-weight:700; font-size:15px; transition:all .2s}
.occ span:hover{background:var(--grad); color:#fff; border-color:transparent; transform:translateY(-2px)}

.pro-sec{padding-top:0}
.pro-card{background:var(--night); color:var(--night-ink); border-radius:32px; padding:clamp(28px,5vw,64px); display:grid; grid-template-columns:1fr 1.1fr; gap:clamp(28px,5vw,64px);
  position:relative; overflow:hidden; isolation:isolate; box-shadow:var(--shadow)}
.pro-card::before{content:""; position:absolute; inset:0; z-index:-1; background:radial-gradient(520px 360px at 0% 0%, rgba(34,211,238,.25), transparent 60%), radial-gradient(620px 420px at 100% 100%, rgba(168,85,247,.35), transparent 60%)}
.pro-card .eyebrow{color:#9fe9f7}
.pro-card .grad-text{background:var(--grad); -webkit-background-clip:text; background-clip:text}
.pro-card .lede{color:var(--night-soft); margin:18px 0 26px; font-size:18px}
.pro-price{font-size:17px; color:var(--night-soft); margin-bottom:26px}
.pro-price strong{font-family:"Bricolage Grotesque",sans-serif; font-size:48px; color:#fff; letter-spacing:-.02em}
.pro-price span{display:inline-block; margin-left:10px; font-size:13px; font-weight:700; padding:4px 12px; border-radius:99px; background:rgba(34,211,238,.14); color:#9fe9f7; vertical-align:middle}
.pro-list{list-style:none; margin:0; padding:0; display:grid; gap:18px; align-content:center}
.pro-list li{display:grid; grid-template-columns:40px 1fr; gap:14px}
.pro-list .i{width:40px; height:40px; padding:9px; border-radius:12px; background:rgba(255,255,255,.08); color:#9fe9f7}
.pro-list strong{display:block; color:#fff}
.pro-list span{font-size:15px; color:var(--night-soft)}
@media (max-width:900px){.pro-card{grid-template-columns:1fr}}

.faq-teaser{display:grid; grid-template-columns:.8fr 1.2fr; gap:clamp(28px,5vw,64px); align-items:start}
@media (max-width:900px){.faq-teaser{grid-template-columns:1fr}}
`;
