/**
 * Pure title matching for "is this outside item sold by the hosting store?".
 * No database, no network — so it is cheap to test. The Shopify search that
 * feeds candidates into it lives in store-match.server.ts.
 *
 * Deliberately conservative: a wrong suggestion costs the registrant's trust
 * more than a missed one costs the merchant a sale. Everything here is
 * labelled "similar item" in the UI, never "the same item", because we match
 * on titles, not product codes.
 */

export const MATCH_THRESHOLD = 0.6;

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "for", "of", "with", "in", "by", "to", "on",
  "new", "pack", "set", "piece", "pc", "pcs", "inch", "in.", "oz", "cm", "mm",
]);

export function titleTokens(title: string): string[] {
  const seen = new Set<string>();
  for (const raw of title.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").split(/[^a-z0-9]+/)) {
    if (raw.length < 2 || STOPWORDS.has(raw)) continue;
    seen.add(raw);
  }
  return [...seen];
}

/** A model number looks like KSM150PS or BV1000: letters and digits mixed, 4+ chars. */
function isModelToken(t: string): boolean {
  return t.length >= 4 && /[a-z]/.test(t) && /[0-9]/.test(t);
}

/** 0..1 similarity between two product titles. */
export function matchScore(a: string, b: string): number {
  const ta = titleTokens(a);
  const tb = titleTokens(b);
  if (ta.length === 0 || tb.length === 0) return 0;

  const sb = new Set(tb);
  const shared = ta.filter((t) => sb.has(t));
  if (shared.length === 0) return 0;

  const dice = (2 * shared.length) / (ta.length + tb.length);
  // Retailer titles are long and stuffed with keywords; the store's own title
  // is usually the short form. Let a full match of the shorter one count, but
  // only when the shorter one has enough words to be specific.
  const shorter = Math.min(ta.length, tb.length);
  const overlap = shorter >= 3 ? 0.85 * (shared.length / shorter) : 0;
  // A two-word store title ("Mandoline Slicer") inside a long retailer title
  // ("OXO Good Grips Chef's Mandoline Slicer 2.0") scores a low Dice and has
  // too few words for the overlap rule, so a real match was missed. When every
  // word of a two-word title appears in the other, count it as just above the
  // threshold. The registrant still confirms it as a "similar item".
  const shortTokens = ta.length <= tb.length ? ta : tb;
  const longSet = ta.length <= tb.length ? new Set(tb) : new Set(ta);
  const contained =
    shortTokens.length === 2 && shortTokens.every((t) => longSet.has(t)) ? MATCH_THRESHOLD + 0.05 : 0;
  let score = Math.max(dice, overlap, contained);

  const ma = ta.filter(isModelToken);
  const mb = tb.filter(isModelToken);
  if (ma.length > 0 && mb.length > 0) {
    const sharedModel = ma.some((t) => sb.has(t));
    if (sharedModel) score = Math.max(score, 0.95);
    else score *= 0.5; // both name a model, and they differ: different product
  }

  return Math.min(1, score);
}

export interface MatchCandidate {
  id: string;
  title: string;
  handle: string;
  variantId: string | null;
}

/** Best candidate at or above the threshold, or null. Ties go to the first. */
export function bestMatch<T extends MatchCandidate>(
  candidates: T[],
  title: string,
  threshold = MATCH_THRESHOLD,
): { candidate: T; score: number } | null {
  let best: { candidate: T; score: number } | null = null;
  for (const candidate of candidates) {
    const score = matchScore(title, candidate.title);
    if (score >= threshold && (!best || score > best.score)) best = { candidate, score };
  }
  return best;
}

/** Search keywords for Shopify's product search: distinctive tokens only, alphanumeric so nothing needs escaping. */
export function searchTerms(title: string, max = 10): string[] {
  // Ten, not six: a long retailer title has more brand and marketing words than
  // product words, and longest-first ranking was dropping the product noun
  // ("knife", "chef") before it reached the store search.
  // Short bare numbers ("66", "12" from "66-Piece ... Service for 12") match sizes
  // and counts all over a catalogue and bury the real results, so leave them out.
  const tokens = titleTokens(title).filter((t) => !/^[0-9]{1,3}$/.test(t));
  // Model numbers first (most specific), then the longest words.
  const ranked = [...tokens].sort((x, y) => Number(isModelToken(y)) - Number(isModelToken(x)) || y.length - x.length);
  return ranked.slice(0, max);
}

const GENERIC_WORDS = new Set([
  "men", "mens", "women", "womens", "kids", "boys", "girls", "unisex", "adult", "youth",
  "black", "white", "blue", "red", "green", "grey", "gray", "pink", "small", "medium", "large",
  "plus", "pro", "premium", "classic", "original", "collection", "series", "edition", "size",
  "amazon", "canada", "ships", "free", "with", "from", "your", "home",
]);

/**
 * When nothing in the store is the same product, find the product KIND the
 * store does sell ("snowboard", "blender"): the word from the outside item's
 * title that appears in the most of the store's search results. Returns null
 * when no such word is clear enough, so we suggest nothing rather than guess.
 */
export function sharedNoun(title: string, candidateTitles: string[]): string | null {
  const mine = new Set(titleTokens(title).filter((t) => t.length >= 4 && !GENERIC_WORDS.has(t) && !/[0-9]/.test(t)));
  if (mine.size === 0 || candidateTitles.length === 0) return null;

  const counts = new Map<string, number>();
  for (const candidate of candidateTitles) {
    const seen = new Set(titleTokens(candidate));
    for (const t of mine) if (seen.has(t)) counts.set(t, (counts.get(t) ?? 0) + 1);
  }

  let top = 0;
  for (const count of counts.values()) top = Math.max(top, count);
  if (top === 0) return null;
  // A word that turns up in only one of many results is probably a coincidence.
  const floor = candidateTitles.length >= 4 ? 2 : 1;
  if (top < floor) return null;
  // Words within one result of the most common count tie, and the longer one wins:
  // "dinnerware" (2 results) beats "service" (3 results) for a dish set, because
  // the longer word is usually the kind of product and the short one a modifier.
  let best: string | null = null;
  for (const [token, count] of counts) {
    if (count < Math.max(floor, top - 1)) continue;
    if (best === null || token.length > best.length || (token.length === best.length && count > (counts.get(best) ?? 0))) best = token;
  }
  return best;
}

/**
 * A product name guessed from a link's path, for the sites that refuse our
 * read (Walmart, Amazon, Target...) but put the name in the URL:
 * /en/ip/Corelle-Winter-Frost-White-66-Piece-Glass-Dinnerware-Set-Service-for-12/6000199815157
 * becomes "Corelle Winter Frost White 66 Piece Glass Dinnerware Set Service for 12".
 * Returns null when no path segment reads like a name (three or more words),
 * so an id-only link or a shop's home page guesses nothing.
 */
export function titleFromUrl(url: string): string | null {
  let path: string;
  try {
    path = new URL(url).pathname;
  } catch {
    return null;
  }
  let best: string | null = null;
  for (const raw of path.split("/")) {
    let seg: string;
    try {
      seg = decodeURIComponent(raw);
    } catch {
      continue;
    }
    seg = seg.replace(/\.[a-z]{2,5}$/i, "");
    const words = seg.split(/[-_+\s]+/).filter(Boolean);
    const alpha = words.filter((w) => /^[A-Za-z\u00c0-\u024f]{2,}$/.test(w));
    if (words.length < 3 || alpha.length < 3 || alpha.length < words.length / 2) continue;
    if (!best || words.length > best.split(" ").length) best = words.join(" ");
  }
  return best ? best.slice(0, 300) : null;
}

/**
 * Words shoppers use interchangeably for the same kind of product. Searching
 * for one searches them all, so "dinnerware" finds a plate set and "slow
 * cooker" finds a crockpot. Plurals are handled separately (`namesAnyKind`).
 * Add a group when a registry item is sold under several names.
 */
const KIND_GROUPS: string[][] = [
  ["dinnerware", "dinner", "plate", "dishes", "tableware", "settings", "dishware"],
  ["flatware", "silverware", "cutlery", "utensils"],
  ["glassware", "glass", "tumbler", "drinkware", "stemware", "goblet", "goblets", "wineglass"],
  ["mug", "cup", "teacup", "coffee"],
  ["bowl", "serving", "salad", "serveware", "platter"],
  ["cookware", "pot", "pan", "skillet", "saucepan", "stockpot", "saute", "dutch", "casserole"],
  ["bakeware", "baking", "bake", "sheet", "cake", "muffin", "loaf"],
  ["cooker", "crockpot", "multicooker", "slow", "pressure", "instant", "rice"],
  ["blender", "smoothie", "nutribullet", "juicer", "processor"],
  ["mixer", "kitchenaid", "whisk"],
  ["kettle", "teapot", "tea", "infuser"],
  ["coffeemaker", "espresso", "brewer", "coffee", "drip", "grinder"],
  ["toaster", "oven", "airfryer", "fryer", "broiler"],
  ["knife", "knives", "cutlery", "blade", "cleaver"],
  ["cutting", "board", "chopping", "butcher"],
  ["bedding", "sheets", "sheet", "duvet", "comforter", "quilt", "coverlet", "bedspread", "linens"],
  ["pillow", "cushion", "bolster"],
  ["blanket", "throw", "afghan"],
  ["towel", "towels", "washcloth", "bath"],
  ["rug", "mat", "carpet", "runner"],
  ["mattress", "topper", "protector"],
  ["lamp", "lighting", "lantern", "sconce"],
  ["vase", "planter", "pot", "jar"],
  ["frame", "photo", "picture", "album"],
  ["candle", "candles", "diffuser", "holder"],
  ["luggage", "suitcase", "carryon", "duffel"],
  ["vacuum", "cleaner", "mop", "robot"],
  ["grill", "barbecue", "bbq", "smoker"],
  ["cooler", "picnic", "thermos"],
  ["crib", "bassinet", "cot", "cradle"],
  ["stroller", "pram", "pushchair", "buggy"],
  ["carseat", "booster", "carrier"],
  ["monitor", "camera", "babycam"],
  ["diaper", "diapers", "nappy", "wipes"],
  ["bottle", "sippy", "feeding", "nursing"],
  ["toy", "toys", "plush", "blocks", "puzzle"],
  ["storage", "organizer", "basket", "bin", "container"],
  ["furniture", "chair", "sofa", "couch", "shelf"],
];

const GROUPS_BY_WORD = (() => {
  const m = new Map<string, Set<string>>();
  for (const g of KIND_GROUPS) {
    for (const w of g) {
      const set = m.get(w) ?? new Set<string>();
      for (const x of g) set.add(x);
      m.set(w, set);
    }
  }
  return m;
})();

const COLOUR_WORDS = new Set([
  "white", "black", "blue", "red", "green", "grey", "gray", "pink", "gold", "silver", "ivory", "cream",
  "brown", "yellow", "orange", "purple", "navy", "beige", "teal", "turquoise",
]);

/** The word plus its other names for the same kind of product (all groups it appears in). */
export function kindWords(term: string): string[] {
  const t = term.toLowerCase();
  const singular = t.endsWith("es") && GROUPS_BY_WORD.has(t.slice(0, -2)) ? t.slice(0, -2) : t.endsWith("s") && GROUPS_BY_WORD.has(t.slice(0, -1)) ? t.slice(0, -1) : t;
  const out = new Set<string>([t]);
  for (const w of GROUPS_BY_WORD.get(t) ?? GROUPS_BY_WORD.get(singular) ?? []) out.add(w);
  return [...out];
}

/** True when the product's title or type names the kind, or one of its other names. */
export function namesAnyKind(n: { title: string; productType?: string | null }, words: string[]): boolean {
  const hay = `${n.title} ${n.productType ?? ""}`.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ");
  return words.some((term) => hay.some((w) => w === term || w === `${term}s` || w === `${term}es`));
}

/**
 * How well a store product fits an outside item when we only know the kind of
 * product it is: a shared colour counts double (a white dish set before a
 * patterned one), any other shared distinctive word counts once. Small bare
 * numbers are ignored, so "12 Piece" doesn't pair with "Service for 12".
 */
export function contextScore(context: string, n: { title: string; productType?: string | null }): number {
  const mine = new Set(titleTokens(context).filter((t) => !/^[0-9]{1,3}$/.test(t)));
  let score = 0;
  for (const t of titleTokens(`${n.title} ${n.productType ?? ""}`)) {
    if (!mine.has(t) || /^[0-9]{1,3}$/.test(t)) continue;
    if (COLOUR_WORDS.has(t)) score += 2;
    else if (t.length >= 4) score += 1;
  }
  return score;
}

/** Distinctive words (not colours, not tiny numbers) the product shares with the outside item. */
function sharedWords(context: string, n: { title: string; productType?: string | null }): number {
  const mine = new Set(titleTokens(context).filter((t) => t.length >= 4 && !COLOUR_WORDS.has(t) && !GENERIC_WORDS.has(t)));
  let c = 0;
  for (const t of new Set(titleTokens(`${n.title} ${n.productType ?? ""}`))) if (mine.has(t)) c++;
  return c;
}

/**
 * The store's products for a kind of item, closest to the outside item first.
 * A product is a candidate when it names the kind or any of its other names
 * ("dinnerware", "plates", "place settings"), or shares a distinctive word with
 * the outside item. The outside item's own title decides the order: a shared
 * colour counts double, and a product naming the kind itself edges out one that
 * only uses another name when the scores are otherwise level.
 */
export function rankByContext<T extends { title: string; productType?: string | null }>(
  nodes: T[],
  term: string,
  context?: string,
): T[] {
  const words = kindWords(term);
  if (!context) return nodes.filter((n) => namesAnyKind(n, words));
  return nodes
    .map((n, i) => ({ n, i, named: namesAnyKind(n, words), shared: sharedWords(context, n) }))
    .filter((x) => x.named || x.shared > 0)
    .map((x) => ({ ...x, score: contextScore(context, x.n) + (namesAnyKind(x.n, [term]) ? 0.5 : 0) + (x.named ? 0.25 : 0) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map((x) => x.n);
}
