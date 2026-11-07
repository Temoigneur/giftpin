import type { Locale } from "../shared/i18n";
import { siteVars } from "./plans-copy";
import { SITE_COPY, fill, type QA } from "./site-copy";

/**
 * Questions and answers for `/faq`, and the billing group reused on
 * `/pricing`. The words live in site-copy/<language>.ts (English is the
 * source); answers are HTML. Every claim here should be true of what's on
 * main today (CLAUDE.md hard rule 1): if a feature changes, change it there.
 * Prices, trial days and the gift card fee are filled from app/shared/plans.ts.
 */
export type { QA };
export type FaqGroup = { id: string; title: string; items: QA[] };

const GROUP_IDS = ["start", "registrants", "checkout", "billing", "privacy"] as const;
export type FaqGroupId = (typeof GROUP_IDS)[number];

const fillQA = (list: QA[], locale: Locale): QA[] => {
  const vars = siteVars(locale);
  return list.map((i) => ({ q: fill(i.q, vars), a: fill(i.a, vars) }));
};

export function faqGroups(locale: Locale): FaqGroup[] {
  const faq = SITE_COPY[locale].faq;
  return GROUP_IDS.map((id) => ({ id, title: faq[id].title, items: fillQA(faq[id].items, locale) }));
}

export const billingFaq = (locale: Locale): QA[] => fillQA(SITE_COPY[locale].faq.billing.items, locale);

export function faqList(items: QA[]): string {
  return `<div class="faq">${items
    .map((i) => `<details><summary>${i.q}</summary><div class="a">${i.a}</div></details>`)
    .join("")}</div>`;
}

/** schema.org FAQPage, so search results can show the answers. */
export function faqJsonLd(items: QA[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a.replace(/<[^>]+>/g, "").replace(/&rarr;/g, "→").replace(/&amp;/g, "&") },
    })),
  };
}
