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
  // Real screens with the buttons boxed and numbered in the images.
  const withShot = (sec: typeof get, at: number, keys: string[]): typeof get => ({
    ...sec,
    steps: sec.steps.map((st, i) =>
      i === at
        ? { ...st, ...(locale === "en" ? { img: keys.map((k) => ({ src: SHOTS[k].src, alt: SHOTS[k].alt.en })) } : { alts: keys.map((k) => SHOTS[k].alt[locale]) }) }
        : st,
    ),
  });
  // Put the left-menu click (a real shot of Giftpin's menu with the item boxed) before a step's own shots.
  const menuFirst = (sec: typeof get, at: number, key: string): typeof get => ({
    ...sec,
    steps: sec.steps.map((st, i) => {
      if (i !== at) return st;
      if (locale === "en") {
        const list = Array.isArray(st.img) ? st.img : st.img ? [st.img] : [];
        return { ...st, img: [{ src: SHOTS[key].src, alt: SHOTS[key].alt.en }, ...list] };
      }
      return { ...st, alts: [SHOTS[key].alt[locale], ...(st.alts ?? [])] };
    }),
  });
  // Put a real shot at a given position in a step's own list (en: images, others: alts).
  const insertShot = (sec: typeof get, at: number, pos: number, key: string): typeof get => ({
    ...sec,
    steps: sec.steps.map((st, i) => {
      if (i !== at) return st;
      if (locale === "en") {
        const list = Array.isArray(st.img) ? [...st.img] : st.img ? [st.img] : [];
        list.splice(pos, 0, { src: SHOTS[key].src, alt: SHOTS[key].alt.en });
        return { ...st, img: list };
      }
      const alts = [...(st.alts ?? [])];
      alts.splice(pos, 0, SHOTS[key].alt[locale]);
      return { ...st, alts };
    }),
  });
  // Replace one existing image in a step (the old Overview shot) with a new real one.
  const swapShot = (sec: typeof get, at: number, imgAt: number, key: string): typeof get => ({
    ...sec,
    steps: sec.steps.map((st, i) => {
      if (i !== at) return st;
      if (locale === "en") {
        const list = Array.isArray(st.img) ? [...st.img] : st.img ? [st.img] : [];
        list[imgAt] = { src: SHOTS[key].src, alt: SHOTS[key].alt.en };
        return { ...st, img: list };
      }
      const alts = [...(st.alts ?? [])];
      alts[imgAt] = SHOTS[key].alt[locale];
      return { ...st, alts };
    }),
  });
  const getWithShots = menuFirst(menuFirst(menuFirst(swapShot(withShot(get, 0, ["installStore", "installApprove"]), 1, 0, "overviewTheme"), 2, "navRegistries"), 1, "navOverview"), 1, "openApps");
  const saveWithShots = menuFirst(menuFirst(menuFirst(withShot(withShot(save, 0, ["themeSave"]), 1, ["settingsSaveTop", "settingsSaveBottom", "settingsSaveFunds"]), 1, "navSettings"), 2, "navInStore"), 2, "navPromotions");
  const manageKeys = ["manageSaveSettings", "manageSettingsSaved", "manageSaveShip", "manageShipSaved", "manageItemUpdate"];
  const saveAll = withShot(saveWithShots, 3, manageKeys);
  const setup: GuideDoc = { ...raw.setup, lede: s("setup_lede"), description: s("setup_desc"), sections: [hub, getWithShots, saveAll] };
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
      { title: s("gs1_t"), lede: s("gs1_lede"), steps: [step(s("g1_t"), [s("g1_i1"), s("g1_i2"), s("g1_i3")], ["find", "findResults"]), step(s("g2_t"), [s("g2_i1"), s("g2_i2")], ["sortFilter", "takenCare"])] },
      {
        title: s("gs2_t"),
        lede: s("gs2_lede"),
        tint: true,
        steps: [step(s("g3_t"), [s("g3_i1"), s("g3_i2")]), { ...step(s("g4_t"), [s("g4_i1"), s("g4_i2"), s("g4_i3")]), ...(locale === "en" ? { img: { src: GUEST_SHOT_SRC, alt: GUEST_SHOT_ALT.en } } : { alts: [GUEST_SHOT_ALT[locale]] }) }, step(s("g5_t"), [s("g5_i1"), s("g5_i2")], ["chip", "giftCardPage"])],
      },
      { title: s("gs3_t"), lede: s("gs3_lede"), steps: [step(s("g6_t"), [s("g6_i1"), s("g6_i2")], ["remind", "shareRow"])] },
    ],
    faqTitle: raw.registry.faqTitle,
    faq: [1, 2, 3].map((n) => ({ q: s(`q${n}`), a: s(`a${n}`) })),
  };

  const registry: GuideDoc = {
    ...raw.registry,
    sections: raw.registry.sections.map((sec, i) =>
      i === 2 ? { ...withShot(withShot(sec, 3, ["shipSetup"]), 1, ["partnerDialog", "prefsBar", "partnerForm", "partnerRemove"]), steps: [...withShot(withShot(sec, 3, ["shipSetup"]), 1, ["partnerDialog", "prefsBar", "partnerForm", "partnerRemove"]).steps, step(s("qr_t"), [s("qr_i1"), s("qr_i2")], ["qr", "mylink", "myregs"])] } : i === 3 ? withShot(sec, 0, manageKeys) : sec,
    ),
  };

  const withPanel: typeof more = {
    ...more,
    steps: more.steps.map((st, i) => (i === 2 ? { ...st, items: [s("flow_i0"), ...st.items] } : i === 1 ? { ...st, ...(locale === "en" ? { img: { src: SHOTS.panel.src, alt: SHOTS.panel.alt.en } } : { alts: [SHOTS.panel.alt[locale]] }) } : st)),
  };
  const makeS = menuFirst(withShot(withShot(withShot(withShot(make, 1, ["extItems"]), 2, ["soldOut"]), 4, ["privacy"]), 5, ["perks"]), 0, "navSettings");
  const moreS = menuFirst(menuFirst(withShot(withShot(withShot(withShot(withPanel, 3, ["language"]), 0, ["import"]), 2, ["flow"]), 1, ["productPanel", "orderPanel", "customerPanel"]), 3, "navSettings"), 0, "importPath");
  const proS = insertShot(insertShot(menuFirst(withShot(withShot(withShot(withShot(withShot(pro, 0, ["navPlan", "planFree", "cancelPro"]), 3, ["navSettings", "afterEvent", "emails", "runNow"]), 4, ["navPromotions", "newPromotion", "yourPromotions", "navDiscounts", "discountsList"]), 5, ["navAnalytics", "analytics", "navRegistries", "exportCsv"]), 6, ["navInStore", "inStore", "posSettings", "posSettingsChannels", "posSettingsBack", "posProducts", "posProductRow", "posPublishing", "posPublishDialog", "posProductSave", "posMenu", "posEdit", "posAddTile", "posTile", "posPhoneSearch", "barProducts", "barRow", "barChip", "barField", "barSave", "scanCam", "scanType", "scanFound", "scanDone"]), 2, "navSettings"), 1, 0, "giftPath"), 1, 2, "orderPath");
  // One run in the order a store owner does things: Pro-only steps sit after Start Pro, and the Languages step follows the look-and-language step.
  const [mkOcc, mkExt, mkSold, mkLook, mkPriv, mkPerks] = makeS.steps;
  const [moImport, moPanels, moFlow, moLang] = moreS.steps;
  const [prStart, ...prRest] = proS.steps;
  const customizeSections = [
    { ...makeS, steps: [mkOcc, mkExt, mkSold, mkLook, moLang, mkPriv] },
    { ...moreS, steps: [moImport, moPanels] },
  ];
  const proSections = [{ ...proS, steps: [prStart, mkPerks, ...prRest, moFlow] }];
  return { ui: raw.ui, setup, customize: sub("c", customizeSections), pro: sub("p", proSections), registry, guest };
}
