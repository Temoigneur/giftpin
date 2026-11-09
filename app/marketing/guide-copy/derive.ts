import type { Locale } from "../../shared/i18n";
import type { GuideCopy, GuideDoc, RawGuideCopy, Step } from "./types";
import type { Extra } from "./extra";
import { GUEST_SHOT_ALT, GUEST_SHOT_SRC } from "./guest-shots";
import { SHOTS } from "./shots";

/**
 * Splits one language's original guide copy into the five guides:
 * /setup (hub + install + Save buttons), /setup/customize, /setup/pro,
 * /registry-guide and /guest-guide. Images stay with the steps they were
 * written for; the new steps carry none, so every language has the same shape.
 */
export function derive(raw: RawGuideCopy, x: Extra, locale: Locale): GuideCopy {
  const s = (k: string) => x[k] as string;
  const h1 = (k: string) => {
    const [a, b] = x[k] as [string, string];
    return `${a}<br><span class="grad-text">${b}</span>`;
  };
  const [get, save, make, pro, more] = raw.setup.sections;

  const hub = {
    title: s("hub_t"),
    lede: s("hub_lede"),
    steps: [1, 2, 3, 4].map((n): Step => ({ title: s(`hub${n}_t`), items: [s(`hub${n}_i`)] })),
  };
  const setup: GuideDoc = { ...raw.setup, lede: s("setup_lede"), description: s("setup_desc"), sections: [hub, get, save] };
  const sub = (p: string, sections: GuideDoc["sections"]): GuideDoc => ({
    ...raw.setup,
    eyebrow: s(`${p}_eyebrow`),
    h1: h1(`${p}_h1`),
    lede: s(`${p}_lede`),
    metaTitle: s(`${p}_meta`),
    description: s(`${p}_desc`),
    sections,
    faq: [],
  });

  const step = (t: string, items: string[], shots: string[] = []): Step => {
    if (!shots.length) return { title: t, items };
    return locale === "en"
      ? { title: t, items, img: shots.map((k) => ({ src: SHOTS[k].src, alt: SHOTS[k].alt.en })) }
      : { title: t, items, alts: shots.map((k) => SHOTS[k].alt[locale]) };
  };
  const guest: GuideDoc = {
    eyebrow: s("g_eyebrow"),
    h1: h1("g_h1"),
    lede: s("g_lede"),
    metaTitle: s("g_meta"),
    description: s("g_desc"),
    sections: [
      { title: s("gs1_t"), lede: s("gs1_lede"), steps: [step(s("g1_t"), [s("g1_i1"), s("g1_i2"), s("g1_i3")], ["find"]), step(s("g2_t"), [s("g2_i1"), s("g2_i2")])] },
      {
        title: s("gs2_t"),
        lede: s("gs2_lede"),
        tint: true,
        steps: [step(s("g3_t"), [s("g3_i1"), s("g3_i2")]), { ...step(s("g4_t"), [s("g4_i1"), s("g4_i2"), s("g4_i3")]), ...(locale === "en" ? { img: { src: GUEST_SHOT_SRC, alt: GUEST_SHOT_ALT.en } } : { alts: [GUEST_SHOT_ALT[locale]] }) }, step(s("g5_t"), [s("g5_i1"), s("g5_i2")], ["chip"])],
      },
      { title: s("gs3_t"), lede: s("gs3_lede"), steps: [step(s("g6_t"), [s("g6_i1"), s("g6_i2")], ["remind"])] },
    ],
    faqTitle: raw.registry.faqTitle,
    faq: [1, 2, 3].map((n) => ({ q: s(`q${n}`), a: s(`a${n}`) })),
  };

  const registry: GuideDoc = {
    ...raw.registry,
    sections: raw.registry.sections.map((sec, i) => (i === 2 ? { ...sec, steps: [...sec.steps, step(s("qr_t"), [s("qr_i1"), s("qr_i2")], ["qr", "mylink", "myregs"])] } : sec)),
  };

  const withPanel: typeof more = {
    ...more,
    steps: more.steps.map((st, i) => (i === 1 ? { ...st, ...(locale === "en" ? { img: { src: SHOTS.panel.src, alt: SHOTS.panel.alt.en } } : { alts: [SHOTS.panel.alt[locale]] }) } : st)),
  };
  return { ui: raw.ui, setup, customize: sub("c", [make, withPanel]), pro: sub("p", [pro]), registry, guest };
}
