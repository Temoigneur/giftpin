import { describe, expect, it } from "vitest";
import { IDEA_MATCH_JS } from "../idea-match";

type Product = { title: string; type?: string; tags?: string[] | string; url?: string };

// Evaluate the exact string the manage page ships, so there's no second copy.
const gpIdeaMatch = new Function(`${IDEA_MATCH_JS}; return gpIdeaMatch;`)() as (
  term: string,
  products: Product[],
) => Product[];

const titles = (term: string, products: Product[]) => gpIdeaMatch(term, products).map((p) => p.title);

describe("gpIdeaMatch (ideas guide store search, 29 Oct 2026)", () => {
  // What Shopify's predictive search really hands back for "Stockpot" in a
  // store without one: anything whose words start with "sto".
  const noStockpot: Product[] = [
    { title: "Storage Basket" },
    { title: "Stoneware Mug" },
    { title: "Stool, Oak" },
    { title: "The Videographer Snowboard" },
    { title: "Stockholm Throw Pillow" },
  ];

  it("returns nothing when the store has no stockpot (Ben's report)", () => {
    expect(titles("Stockpot", noStockpot)).toEqual([]);
  });

  it("finds a real stockpot, whether written as one word or two", () => {
    expect(titles("Stockpot", [...noStockpot, { title: "8 qt Stainless Stockpot" }])).toEqual(["8 qt Stainless Stockpot"]);
    expect(titles("Stockpot", [{ title: "Enamel Stock Pot" }])).toEqual(["Enamel Stock Pot"]);
    expect(titles("stock pot", [{ title: "Stockpot with Lid" }])).toEqual(["Stockpot with Lid"]);
  });

  it("matches whole words only, never a fragment", () => {
    expect(titles("Mugs", [{ title: "Smuggler's Bag" }, { title: "Mugwort Tea" }])).toEqual([]);
    expect(titles("Grill", [{ title: "Grillade Spice" }])).toEqual([]);
  });

  it("treats singular and plural as the same word", () => {
    expect(titles("Mugs", [{ title: "Ceramic Mug" }])).toEqual(["Ceramic Mug"]);
    expect(titles("Wine glasses", [{ title: "Crystal Wine Glass" }])).toEqual(["Crystal Wine Glass"]);
    expect(titles("Knife set", [{ title: "Chef's Knives, 5 piece" }])).toEqual(["Chef's Knives, 5 piece"]);
    expect(titles("Bowls", [{ title: "Serving Bowl" }])).toEqual(["Serving Bowl"]);
  });

  it("requires every key word of a multi-word idea", () => {
    const list = [{ title: "Hand Towel" }, { title: "Stand Mixer, Red" }, { title: "Hand Mixer" }, { title: "Mixing Bowls" }];
    expect(titles("Stand mixer", list)).toEqual(["Stand Mixer, Red"]);
    expect(titles("Dutch oven", [{ title: "Oven Mitts" }, { title: "Dutch Baby Pan" }])).toEqual([]);
  });

  it("ignores filler words like set, and, of", () => {
    expect(titles("Flatware set", [{ title: "Gold Flatware" }])).toEqual(["Gold Flatware"]);
    expect(titles("king sheet set", [{ title: "Percale Sheets, King" }, { title: "Queen Sheet Set" }])).toEqual(["Percale Sheets, King"]);
  });

  it("accepts a match on product type or tags, ranked below a title match", () => {
    const list: Product[] = [
      { title: "Le Creuset 8 qt", type: "Stockpot" },
      { title: "Classic Stockpot" },
      { title: "Big Pot", tags: ["stockpot", "kitchen"] },
    ];
    const found = titles("Stockpot", list);
    expect(found[0]).toBe("Classic Stockpot");
    expect(found.slice(1).sort()).toEqual(["Big Pot", "Le Creuset 8 qt"]);
  });

  it("ranks the tightest, in-order title first", () => {
    const list = [
      { title: "Large Stainless Steel Hand Crafted Coffee Maker Carafe Replacement" },
      { title: "Maker of Coffee" },
      { title: "Coffee Maker" },
    ];
    expect(titles("Coffee maker", list)[0]).toBe("Coffee Maker");
    expect(titles("Coffee maker", list)).toHaveLength(3);
  });

  it("ignores accents and case", () => {
    expect(titles("Serving platter", [{ title: "SERVING PLATTÉR" }])).toEqual(["SERVING PLATTÉR"]);
  });

  it("copes with junk input", () => {
    expect(gpIdeaMatch("Stockpot", null as unknown as Product[])).toEqual([]);
    expect(titles("Stockpot", [{ title: "" }, null as unknown as Product])).toEqual([]);
  });
});
