import { describe, it, expect } from "vitest";
import { matchScore, bestMatch, searchTerms, sharedNoun, MATCH_THRESHOLD } from "../store-match";

const cand = (id: string, title: string) => ({ id, title, handle: id, variantId: "v" + id });

describe("matchScore", () => {
  it("scores a retailer's long title against the store's short one as a match", () => {
    const s = matchScore(
      "KitchenAid Artisan Series 5 Quart Tilt-Head Stand Mixer, KSM150PS",
      "KitchenAid Artisan Tilt-Head Stand Mixer",
    );
    expect(s).toBeGreaterThanOrEqual(MATCH_THRESHOLD);
  });

  it("does not match unrelated products that share one generic word", () => {
    expect(matchScore("Cast Iron Dutch Oven 5.5 Qt", "Ceramic Coffee Mug")).toBeLessThan(MATCH_THRESHOLD);
    expect(matchScore("Bath Towel Set", "Bath Bomb Gift Box")).toBeLessThan(MATCH_THRESHOLD);
  });

  it("treats two different model numbers as different products", () => {
    expect(matchScore("Acme Blender BV1000", "Acme Blender BV2000")).toBeLessThan(MATCH_THRESHOLD);
  });

  it("treats a shared model number as a strong match", () => {
    expect(matchScore("Acme Pro Blender BV1000 Black", "Acme BV1000")).toBeGreaterThanOrEqual(0.9);
  });

  it("is safe on empty and punctuation-only titles", () => {
    expect(matchScore("", "Stand Mixer")).toBe(0);
    expect(matchScore("!!!", "???")).toBe(0);
  });
});

describe("bestMatch", () => {
  it("returns the highest-scoring candidate over the threshold", () => {
    const hit = bestMatch(
      [cand("a", "Ceramic Coffee Mug"), cand("b", "Artisan Stand Mixer"), cand("c", "Stand Mixer Bowl")],
      "KitchenAid Artisan Stand Mixer",
    );
    expect(hit?.candidate.id).toBe("b");
  });

  it("returns null when nothing is close enough", () => {
    expect(bestMatch([cand("a", "Ceramic Coffee Mug")], "Stand Mixer")).toBeNull();
  });
});

describe("searchTerms", () => {
  it("returns only alphanumeric tokens, so they are safe to put in a search query", () => {
    const terms = searchTerms('Acme "Blender" (BV1000) -- OR status:draft');
    for (const t of terms) expect(t).toMatch(/^[a-z0-9]+$/);
  });

  it("puts model numbers first", () => {
    expect(searchTerms("Acme Professional Blender BV1000")[0]).toBe("bv1000");
  });
});

describe("sharedNoun", () => {
  const store = ["The Complete Snowboard", "The Collection Snowboard: Liquid", "The Videographer Snowboard", "Selling Plans Ski Wax"];

  it("finds the kind of product the store sells when no single product matches", () => {
    expect(sharedNoun("Burton Men's Instigator PurePop Camber Snowboard, Freestyle Boards - Amazon Canada", store)).toBe("snowboard");
  });

  it("returns null when nothing in the title is clearly shared", () => {
    expect(sharedNoun("Le Creuset Dutch Oven", store)).toBeNull();
  });

  it("ignores generic words like men and colours", () => {
    expect(sharedNoun("Men black", ["Mens Black Jacket", "Black Mens Hat"])).toBeNull();
  });

  it("ignores a word that turns up in only one of many results", () => {
    expect(sharedNoun("Foo Bar Widget", ["Widget A", "Thing B", "Thing C", "Thing D"])).toBeNull();
  });
});
