import { billingFaq, faqJsonLd, faqList } from "./faq-copy";
import { cta, esc, finalCta, icon, localeMeta, siteLocale, sitePage } from "./layout";
import { foundingOffer, freeFeatures, proFeatures, siteVars, PRICE, PRO_NAME } from "./plans-copy";
import { SITE_COPY, fill } from "./site-copy";

/**
 * giftpin.app/pricing: the URL for the Shopify listing's "more pricing
 * information" field. Price, trial and plan name come from
 * `app/shared/plans.ts` via plans-copy.ts, the same constants billing uses.
 * The words are in site-copy/<language>.ts. Synchronous (CLAUDE.md hard rule 9).
 */
export function pricingHtml(): string {
  const loc = siteLocale();
  const k = SITE_COPY[loc].pricing;
  const vars = siteVars(loc);
  const c = cta();
  const li = (t: string) => `<li>${icon("check")}<span>${t}</span></li>`;
  const free = freeFeatures(loc);
  const pro = proFeatures(loc);
  const faq = billingFaq(loc);
  const founding = foundingOffer(loc);
  const q = loc === "en" ? "" : `?lang=${loc}`;

  const row = (title: string, inFree: boolean) => {
    const yes = `<span class="yes">${icon("check")}<span class="sr">${k.included}</span></span>`;
    const no = `<span class="no">${icon("dash")}<span class="sr">${k.notIncluded}</span></span>`;
    return `<tr><th scope="row">${esc(title)}</th><td>${inFree ? yes : no}</td><td>${yes}</td></tr>`;
  };

  const body = `
<section class="hero page-hero pricing-hero">
  <div class="wrap">
    <p class="eyebrow">${icon("sparkle")} ${k.eyebrow}</p>
    <h1>${k.h1a}<br><span class="grad-text">${k.h1b}</span></h1>
    <p class="lede">${fill(k.lede, vars)}</p>
    ${founding ? `<p class="founding">${icon("star")} ${esc(founding)}</p>` : ""}
  </div>
</section>

<section class="plans-sec">
  <div class="wrap plans">
    <article class="plan rise" aria-labelledby="free-h">
      <h2 id="free-h">${k.free}</h2>
      <p class="for">${k.freeFor}</p>
      <p class="price">$0 <small>${k.perMonth}</small></p>
      <p class="sub">${k.noCard}</p>
      <a class="btn ghost block" href="${esc(c.href)}">${c.label}</a>
      <ul>${free.map((f) => li(esc(f.title))).join("")}</ul>
    </article>

    <article class="plan pro rise" aria-labelledby="pro-h">
      <div class="plan-top"><h2 id="pro-h">${PRO_NAME}</h2><span class="badge">${esc(String(vars.trial))}</span></div>
      <p class="for">${k.proFor}</p>
      <p class="price">${PRICE} <small>${k.perMonth}</small></p>
      <p class="sub">${k.billedUsd}</p>
      <a class="btn dark block" href="${esc(c.href)}">${c.isInstall ? fill(k.startTrial, vars) : c.label}</a>
      <ul>${li(`<strong>${k.everythingFree}</strong>`)}${pro.map((f) => li(`${esc(f.title)}<small>${esc(f.detail)}</small>`)).join("")}</ul>
    </article>
  </div>
  <p class="wrap note">${c.note}</p>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head center rise">
      <h2>${k.compareH2}</h2>
      <p class="lede">${k.compareLede}</p>
    </div>
    <div class="table-wrap rise">
      <table class="compare">
        <thead><tr><th scope="col">${k.feature}</th><th scope="col">${k.free}</th><th scope="col">${k.pro}</th></tr></thead>
        <tbody>
          <tr class="grp"><th scope="rowgroup" colspan="3">${k.registries}</th></tr>
          ${free.map((f) => row(f.title, true)).join("")}
          <tr class="grp"><th scope="rowgroup" colspan="3">${PRO_NAME}</th></tr>
          ${pro.map((f) => row(f.title, false)).join("")}
          <tr class="price-row"><th scope="row">${k.priceRow}</th><td>$0</td><td>${PRICE}${k.perMo}<br><small>${fill(k.afterTrial, vars)}</small></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

<section class="sec tint" id="faq">
  <div class="wrap narrow">
    <div class="sec-head center rise"><h2>${k.faqH2}</h2></div>
    <div class="rise">${faqList(faq)}</div>
    <p class="more rise"><a href="/faq${q}">${k.moreQuestions} ${icon("arrow")}</a></p>
  </div>
</section>

${finalCta(k.finalCta)}
`;

  return sitePage({
    path: "/pricing",
    nav: "pricing",
    title: k.title,
    description: fill(k.description, vars),
    body,
    css: CSS,
    ...localeMeta("/pricing"),
    jsonLd: [faqJsonLd(faq)],
  });
}

const CSS = `
.pricing-hero{padding-bottom:clamp(140px,16vw,200px)}
.plans-sec{margin-top:clamp(-170px,-13vw,-110px); position:relative}
.plans{display:grid; grid-template-columns:1fr 1fr; gap:24px; align-items:stretch; max-width:1000px}
.plan{background:var(--surface); border:1px solid var(--line); border-radius:28px; padding:clamp(24px,4vw,40px); box-shadow:var(--shadow); display:flex; flex-direction:column}
.plan.pro{background:linear-gradient(var(--surface),var(--surface)) padding-box, var(--grad) border-box; border:2px solid transparent}
.plan-top{display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap}
.plan h2{font-size:30px}
.plan .for{color:var(--ink-soft); margin:8px 0 18px; font-size:16px}
.badge{font-size:12.5px; font-weight:800; color:#fff; background:var(--grad); border-radius:999px; padding:5px 12px; white-space:nowrap}
.price{font-family:"Bricolage Grotesque",sans-serif; font-size:56px; font-weight:800; line-height:1; letter-spacing:-.03em; font-variant-numeric:tabular-nums}
.price small{font-family:"Plus Jakarta Sans",sans-serif; font-size:17px; font-weight:600; color:var(--ink-soft); letter-spacing:0}
.sub{color:var(--ink-soft); font-size:15px; margin:8px 0 22px}
.btn.block{display:flex; width:100%}
.plan ul{list-style:none; margin:26px 0 0; padding:26px 0 0; border-top:1px solid var(--line); display:grid; gap:12px}
.plan li{display:grid; grid-template-columns:22px 1fr; gap:10px; font-size:16px; font-weight:600}
.plan li .i{width:20px; height:20px; color:var(--accent); margin-top:2px}
.plan li small{display:block; font-weight:400; color:var(--ink-soft); font-size:14.5px; margin-top:2px}
.note{text-align:center; font-size:15px; color:var(--ink-soft); margin-top:24px}
@media (max-width:820px){.plans{grid-template-columns:1fr}}

.table-wrap{max-width:860px; margin:0 auto; overflow-x:auto; border:1px solid var(--line); border-radius:24px; background:var(--surface)}
.compare{width:100%; border-collapse:collapse; font-size:16px}
.compare th, .compare td{padding:14px 20px; text-align:left; border-bottom:1px solid var(--line)}
.compare thead th{font-family:"Bricolage Grotesque",sans-serif; font-size:19px; background:var(--tint)}
.compare td, .compare thead th:not(:first-child){text-align:center; width:110px}
.compare tbody th{font-weight:600}
.compare .grp th{font-size:12.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--accent); font-weight:800; background:var(--tint); padding-block:10px}
.compare tr:last-child th, .compare tr:last-child td{border-bottom:0}
.compare .price-row td{font-weight:800}
.compare small{font-weight:500; color:var(--ink-soft); font-size:12.5px}
.yes .i{width:22px; height:22px; color:#fff; background:var(--grad); border-radius:50%; padding:4px}
.no .i{width:20px; height:20px; color:var(--ink-soft); opacity:.6}
.sr{position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap}
@media (max-width:560px){.compare th, .compare td{padding:12px 12px} .compare td, .compare thead th:not(:first-child){width:64px} .compare{font-size:15px}}
.narrow{max-width:820px}
.more{margin-top:28px; text-align:center; font-weight:700}
.more a{display:inline-flex; align-items:center; gap:6px; text-decoration:none}
.more .i{width:18px; height:18px}
`;
