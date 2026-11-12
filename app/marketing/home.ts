import { EVENT_TYPES } from "../shared/settings";
import { t, type MessageKey } from "../shared/i18n";
import { SITE_URL, appStoreHref, holidayPromoOn } from "./config";
import { faqGroups, faqList } from "./faq-copy";
import { cta, demoVideo, esc, finalCta, icon, localeMeta, siteLocale, sitePage } from "./layout";
import { PRICE, PRO_NAME, foundingOffer, proFeatures, siteVars } from "./plans-copy";
import { SITE_COPY, fill } from "./site-copy";

/**
 * giftpin.app home page. The words live in site-copy/<language>.ts; this
 * file is layout and icons. Strings there are trusted HTML, so they are
 * not escaped again here. Must stay synchronous (CLAUDE.md hard rule 9).
 */
export function homeHtml(now: Date = new Date()): string {
  const loc = siteLocale();
  const k = SITE_COPY[loc].home;
  const vars = siteVars(loc);
  const f = (s: string) => fill(s, { ...vars, appStore: esc(appStoreHref("trust")) });
  const c = cta("hero");
  const occasions = EVENT_TYPES.filter((o) => o.value !== "other");
  const groups = faqGroups(loc);
  const byId = (id: string) => groups.find((g) => g.id === id)!.items;
  const faqPicks = [byId("registrants")[1], byId("checkout")[0], byId("billing")[3], byId("billing")[1]];
  const founding = foundingOffer(loc);
  const q = loc === "en" ? "" : `?lang=${loc}`;

  const body = `
${holidayPromoOn(now) ? `<p class="season"><a href="/holiday-wish-lists${q}">${icon("gift")} ${k.season} <span>${k.seeHow} ${icon("arrow")}</span></a></p>` : ""}
<section class="hero home-hero">
  <div class="wrap hh">
    <div class="hh-copy">
      <p class="eyebrow">${icon("sparkle")} ${k.eyebrow}</p>
      <h1>${k.h1a}<br>${k.h1b}<br><span class="grad-text">${k.h1c}</span></h1>
      <p class="lede">${k.lede}</p>
      <div class="cta-row">
        <a class="btn dark lg" href="${esc(c.href)}">${c.label} ${icon("arrow")}</a>
        <a class="btn ghost-band lg" href="#demo">${icon("play")} ${k.watchDemo}</a>
      </div>
      <ul class="proof">
        <li>${icon("check")} ${k.proofFree}</li>
        <li>${icon("check")} ${f(k.proofPro)}</li>
        <li>${icon("check")} ${k.proofBilled}</li>
        <li>${icon("check")} ${k.proofCanada}</li>
      </ul>
      ${founding ? `<p class="founding">${icon("star")} ${esc(founding)}</p>` : ""}
    </div>

    <div class="hh-art" aria-label="${esc(k.exampleLabel)}" role="img">
      <div class="reg">
        <div class="reg-hd">
          <span class="av">M&amp;T</span>
          <div><strong>${k.regName}</strong><span>${k.regSub}</span></div>
        </div>
        <div class="bar-lab"><span>${k.pctGifted}</span><span>${k.nLeft}</span></div>
        <div class="prog"><i></i></div>
        <div class="it">
          <span class="th t1">${icon("gift")}</span>
          <div><strong>${k.standMixer}</strong><span class="src mine">${icon("store")} ${k.yourStore}</span></div>
          <span class="st give">${k.giveThis}</span>
        </div>
        <div class="it">
          <span class="th t2">${icon("heart")}</span>
          <div><strong>${k.dutchOven}</strong><span class="src">${icon("globe")} ${k.anotherShop}</span></div>
          <span class="st held">${k.mayBeTaken}</span>
        </div>
        <div class="it">
          <span class="th t3">${icon("sparkle")}</span>
          <div><strong>${k.linenSet}</strong><span class="src mine">${icon("store")} ${k.yourStore}</span></div>
          <span class="st done">${icon("check")} ${k.gifted}</span>
        </div>
      </div>
      <div class="toast t-a">${icon("card")}<div><strong>${k.toastPaid}</strong><span>${k.toastCredited}</span></div></div>
      <div class="toast t-b">${icon("bell")}<div><strong>${k.toastNew}</strong><span>${k.linenSet}</span></div></div>
    </div>
  </div>

  <div class="wrap pay">
    <p>${k.payLine}</p>
    <ul><li>Shop Pay</li><li>Apple Pay</li><li>Google Pay</li><li>Shop app</li><li>${k.payStandard}</li></ul>
  </div>
</section>

<section class="sec" id="your-store">
  <div class="wrap spot">
    <div class="rise">
      <p class="eyebrow">${icon("store")} ${k.merchEyebrow}</p>
      <h2>${k.merchH2a} <span class="grad-text">${k.merchH2b}</span></h2>
      <p class="lede" style="margin:18px 0 32px">${k.merchLede}</p>
      <ol class="pts">
        <li><span class="n">1</span><div><h3>${k.merch1h}</h3><p>${k.merch1p}</p></div></li>
        <li><span class="n">2</span><div><h3>${k.merch2h}</h3><p>${k.merch2p}</p></div></li>
        <li><span class="n">3</span><div><h3>${k.merch3h}</h3><p>${k.merch3p}</p></div></li>
      </ol>
    </div>
    <div class="rise">
      <div class="match-card">
        <p class="mc-lab">${k.addedElsewhere}</p>
        <div class="it flat">
          <span class="th t2">${icon("heart")}</span>
          <div><strong>${k.dutchOven}</strong><span class="src">${icon("globe")} ${k.anotherShop}</span></div>
        </div>
        <div class="match">
          <p class="mc-lab accent">${icon("sparkle")} ${k.similarItem}</p>
          <div class="it flat">
            <span class="th t1">${icon("gift")}</span>
            <div><strong>${k.casserole}</strong><span class="src mine">${icon("store")} ${k.yourStore}</span></div>
            <span class="st give">${k.useInstead}</span>
          </div>
        </div>
      </div>
      <p class="fine-print">${k.illustration}</p>
    </div>
  </div>
</section>

<section class="sec tint" id="any-registry">
  <div class="wrap spot">
    <div class="rise">
      <p class="eyebrow">${icon("link")} ${k.anyEyebrow}</p>
      <h2>${k.anyH2a} <span class="grad-text">${k.anyH2b}</span></h2>
      <p class="lede" style="margin:18px 0 32px">${k.anyLede}</p>
      <ol class="pts">
        <li><span class="n">1</span><div><h3>${k.any1h}</h3><p>${k.any1p}</p></div></li>
        <li><span class="n">2</span><div><h3>${k.any2h}</h3><p>${k.any2p}</p></div></li>
        <li><span class="n">3</span><div><h3>${k.any3h}</h3><p>${k.any3p}</p></div></li>
      </ol>
    </div>
    <div class="rise">
      <div class="match-card picker-card">
        <p class="mc-lab">${k.yourProductPage}</p>
        <div class="it flat">
          <span class="th t1">${icon("gift")}</span>
          <div><strong>${k.swaddle}</strong><span class="src mine">${icon("store")} ${k.yourStore}</span></div>
        </div>
        <div class="match">
          <p class="mc-lab accent">${icon("gift")} ${k.whichRegistry}</p>
          <div class="choices"><span class="solid">${k.choiceMine}</span><span>${k.choiceBabylist}</span><span>${k.choiceOther}</span></div>
        </div>
      </div>
      <p class="fine-print">${f(k.anyFine)}</p>
    </div>
  </div>
</section>

<section class="sec" id="how">
  <div class="wrap">
    <div class="sec-head center rise">
      <p class="eyebrow">${k.howEyebrow}</p>
      <h2>${k.howH2}</h2>
      <p class="lede">${k.howLede}</p>
    </div>
    <div class="grid-3 steps">
      <div class="card rise"><span class="big-n">1</span><h3>${k.how1h}</h3><p>${k.how1p}</p></div>
      <div class="card rise"><span class="big-n">2</span><h3>${k.how2h}</h3><p>${k.how2p}</p></div>
      <div class="card rise"><span class="big-n">3</span><h3>${k.how3h}</h3><p>${k.how3p}</p></div>
    </div>
  </div>
</section>

<section class="sec tint" id="demo">
  <div class="wrap">
    <div class="sec-head center rise">
      <p class="eyebrow">${icon("play")} ${k.demoEyebrow}</p>
      <h2>${k.demoH2}</h2>
      <p class="lede">${k.demoLede}</p>
    </div>
    <div class="rise demo-frame">${demoVideo()}</div>
  </div>
</section>

<section class="sec" id="features">
  <div class="wrap">
    <div class="sec-head rise">
      <p class="eyebrow">${k.featEyebrow}</p>
      <h2>${k.featH2}</h2>
      <p class="lede">${k.featLede}</p>
    </div>
    <div class="bento">
      <div class="card wide rise">
        <span class="chip-ico">${icon("globe")}</span>
        <h3>${k.f1h}</h3>
        <p>${k.f1p}</p>
        <div class="stores" aria-hidden="true"><span class="mine">${k.yourStore}</span><span>${k.storeHome}</span><span>${k.storeBig}</span><span>${k.storeBoutique}</span><span>${k.storeHandmade}</span></div>
      </div>
      <div class="card rise">
        <span class="chip-ico">${icon("shield")}</span>
        <h3>${k.f2h}</h3>
        <p>${k.f2p}</p>
      </div>
      <div class="card rise">
        <span class="chip-ico">${icon("card")}</span>
        <h3>${k.f3h}</h3>
        <p>${k.f3p}</p>
      </div>
      <div class="card rise">
        <span class="chip-ico">${icon("truck")}</span>
        <h3>${k.f4h}</h3>
        <p>${k.f4p}</p>
      </div>
      <div class="card rise">
        <span class="chip-ico">${icon("bulb")}</span>
        <h3>${k.f5h}</h3>
        <p>${k.f5p}</p>
      </div>
      <div class="card rise">
        <span class="chip-ico">${icon("list")}</span>
        <h3>${k.f6h}</h3>
        <p>${k.f6p}</p>
      </div>
      <div class="card wide rise">
        <span class="chip-ico">${icon("puzzle")}</span>
        <h3>${k.f7h}</h3>
        <p>${k.f7p}</p>
        <div class="blocks" aria-hidden="true"><span class="solid">${icon("gift")} ${k.blockAdd}</span><span>${k.blockCreate}</span><span>${k.blockFind}</span><span>${k.blockManage}</span></div>
      </div>
    </div>
    <p class="more rise"><a href="/features${q}">${k.seeEvery} ${icon("arrow")}</a></p>
  </div>
</section>

<section class="sec" id="occasions">
  <div class="wrap">
    <div class="sec-head center rise">
      <p class="eyebrow">${icon("heart")} ${k.occEyebrow}</p>
      <h2>${k.occH2}</h2>
      <p class="lede">${fill(k.occLede, { n: occasions.length })}</p>
    </div>
    <div class="occ rise">${occasions.map((o) => `<span>${esc(loc === "en" ? o.label : t(`event.${o.value}` as MessageKey, undefined, loc))}</span>`).join("")}</div>
  </div>
</section>

<section class="sec pro-sec">
  <div class="wrap">
    <div class="pro-card rise">
      <div class="pro-copy">
        <p class="eyebrow">${icon("sparkle")} ${PRO_NAME}</p>
        <h2>${k.proH2a} <span class="grad-text">${k.proH2b}</span></h2>
        <p class="lede">${k.proLede}</p>
        <p class="pro-price"><strong>${PRICE}</strong> ${k.perMonth} <span>${esc(String(vars.trial))}</span></p>
        <div class="cta-row"><a class="btn light" href="/pricing${q}">${k.comparePlans} ${icon("arrow")}</a></div>
      </div>
      <ul class="pro-list">
        ${proFeatures(loc).map((p) => `<li>${icon(p.icon)}<div><strong>${esc(p.title)}</strong><span>${esc(p.detail)}</span></div></li>`).join("")}
      </ul>
    </div>
  </div>
</section>

<section class="sec tint">
  <div class="wrap">
    <div class="sec-head center rise">
      <p class="eyebrow">${icon("lock")} ${k.honestEyebrow}</p>
      <h2>${k.honestH2}</h2>
    </div>
    <div class="grid-3">
      <div class="card rise"><span class="chip-ico">${icon("percent")}</span><h3>${k.h1h}</h3><p>${f(k.h1p)}</p></div>
      <div class="card rise"><span class="chip-ico">${icon("shield")}</span><h3>${k.h2h}</h3><p>${k.h2p}</p></div>
      <div class="card rise"><span class="chip-ico">${icon("lock")}</span><h3>${k.h3h}</h3><p>${k.h3p}</p></div>
    </div>
  </div>
</section>

<section class="sec" id="trust">
  <div class="wrap">
    <div class="sec-head center rise">
      <p class="eyebrow">${icon("heart")} ${k.trustEyebrow}</p>
      <h2>${k.trustH2a} <span class="grad-text">${k.trustH2b}</span></h2>
      <p class="lede">${k.trustLede}</p>
    </div>
    <div class="grid-3">
      <div class="card rise"><span class="chip-ico">${icon("shield")}</span><h3>${k.t1h}</h3><p>${f(k.t1p)}</p></div>
      <div class="card rise"><span class="chip-ico">${icon("play")}</span><h3>${k.t2h}</h3><p>${k.t2p}</p></div>
      <div class="card rise"><span class="chip-ico">${icon("bolt")}</span><h3>${k.t3h}</h3><p>${f(k.t3p)}</p></div>
      <div class="card rise"><span class="chip-ico">${icon("heart")}</span><h3>${k.t4h}</h3><p>${k.t4p}</p></div>
      <div class="card rise"><span class="chip-ico">${icon("mail")}</span><h3>${k.t5h}</h3><p>${k.t5p}</p></div>
      <div class="card rise"><span class="chip-ico">${icon("lock")}</span><h3>${k.t6h}</h3><p>${k.t6p}</p></div>
    </div>
  </div>
</section>

<section class="sec tint">
  <div class="wrap faq-teaser">
    <div class="rise">
      <p class="eyebrow">${k.faqEyebrow}</p>
      <h2>${k.faqH2}</h2>
      <p class="lede" style="margin:16px 0 24px">${k.faqLede}</p>
      <a class="btn ghost" href="/faq${q}">${k.allQuestions} ${icon("arrow")}</a>
    </div>
    <div class="rise">${faqList(faqPicks)}</div>
  </div>
</section>

${finalCta(k.finalCta)}
`;

  return sitePage({
    path: "/",
    nav: "home",
    title: k.title,
    description: k.description,
    body,
    css: CSS,
    ...localeMeta("/"),
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
.season{margin:0; text-align:center; font-size:14.5px; font-weight:600; background:var(--band-chip); border-bottom:1px solid var(--band-line)}
.season a{display:inline-flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:6px; padding:10px 16px; color:var(--band-ink); text-decoration:none}
.season span{display:inline-flex; align-items:center; gap:4px; text-decoration:underline}
.season .i{width:16px; height:16px; flex:none}
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
