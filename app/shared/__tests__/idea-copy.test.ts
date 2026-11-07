import { describe, expect, it } from "vitest";
import { LOCALES } from "../i18n";
import { EVENT_TYPES } from "../settings";
import { ideaGuideFor } from "../registry-ideas";
import { IDEA_COPY, ideaText } from "../idea-copy";

/** Every string the ideas guides show, across all occasions. */
function allStrings(): string[] {
  const set = new Set<string>();
  for (const e of [...EVENT_TYPES.map((x) => x.value), "other"]) {
    const g = ideaGuideFor(e);
    set.add(g.title);
    set.add(g.intro);
    for (const grp of g.groups) {
      set.add(grp.label);
      for (const sub of grp.subcategories) {
        set.add(sub.label);
        for (const item of sub.items) set.add(item.name);
      }
    }
  }
  return [...set];
}

describe("ideas guide translations", () => {
  const english = allStrings();
  for (const locale of LOCALES.filter((l) => l !== "en")) {
    it(`${locale} translates every string and has no stray keys`, () => {
      const dict = IDEA_COPY[locale as Exclude<typeof locale, "en">];
      expect(english.filter((s) => !dict[s]), `${locale} missing`).toEqual([]);
      expect(Object.keys(dict).filter((k) => !english.includes(k)), `${locale} unknown keys`).toEqual([]);
    });
  }

  it("leaves English alone and falls back for unknown text", () => {
    expect(ideaText("Stockpot", "en")).toBe("Stockpot");
    expect(ideaText("Stockpot", "de")).toBe("Suppentopf");
    expect(ideaText("Not a real idea", "de")).toBe("Not a real idea");
  });
});
