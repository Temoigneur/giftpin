import { FAQ_GROUPS, faqJsonLd, faqList } from "./faq-copy";
import { finalCta, icon, sitePage } from "./layout";

/** giftpin.app/faq: every question, grouped. */
export function faqHtml(): string {
  const body = `
<section class="hero page-hero">
  <div class="wrap">
    <p class="eyebrow">${icon("sparkle")} FAQ</p>
    <h1>Questions, <span class="grad-text">answered.</span></h1>
    <p class="lede">Can't find what you need? Email <a class="light-link" href="mailto:support@giftpin.app">support@giftpin.app</a> and a real person will write back.</p>
  </div>
</section>

<section class="sec">
  <div class="wrap faq-layout">
    <nav class="toc" aria-label="Topics">
      ${FAQ_GROUPS.map((g) => `<a href="#${g.id}">${g.title}</a>`).join("")}
    </nav>
    <div>
      ${FAQ_GROUPS.map(
        (g) => `<section class="grp" id="${g.id}" aria-labelledby="${g.id}-h">
        <h2 id="${g.id}-h">${g.title}</h2>
        ${faqList(g.items)}
      </section>`,
      ).join("")}
    </div>
  </div>
</section>

${finalCta()}
`;

  return sitePage({
    path: "/faq",
    nav: "faq",
    title: "Giftpin FAQ",
    description:
      "Answers about Giftpin, the Shopify gift registry app: setup, gifts from other stores, duplicate-gift protection, Shop Pay and express checkout, plans, billing and privacy.",
    body,
    css: CSS,
    jsonLd: [faqJsonLd(FAQ_GROUPS.flatMap((g) => g.items))],
  });
}

const CSS = `
.light-link{color:#9fe9f7}
.faq-layout{display:grid; grid-template-columns:220px 1fr; gap:clamp(24px,5vw,64px); align-items:start; max-width:1040px}
.toc{position:sticky; top:96px; display:grid; gap:4px}
.toc a{color:var(--ink-soft); text-decoration:none; font-weight:600; padding:8px 14px; border-radius:10px; border-left:3px solid transparent}
.toc a:hover{color:var(--ink); background:var(--tint); border-left-color:var(--accent)}
.grp{scroll-margin-top:92px}
.grp + .grp{margin-top:56px}
.grp h2{font-size:clamp(26px,3.4vw,34px); margin-bottom:20px}
@media (max-width:820px){
  .faq-layout{grid-template-columns:1fr}
  .toc{position:static; display:flex; flex-wrap:wrap; gap:8px}
  .toc a{border:1px solid var(--line); border-radius:99px; padding:7px 14px; font-size:14px}
}
`;
