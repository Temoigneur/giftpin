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
  let score = Math.max(dice, overlap);

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
export function searchTerms(title: string, max = 6): string[] {
  const tokens = titleTokens(title);
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

  let best: string | null = null;
  let bestCount = 0;
  for (const [token, count] of counts) {
    if (count > bestCount || (count === bestCount && best !== null && token.length > best.length)) {
      best = token;
      bestCount = count;
    }
  }
  // A word that turns up in only one of many results is probably a coincidence.
  if (best && candidateTitles.length >= 4 && bestCount < 2) return null;
  return best;
}
