/**
 * Daily counter names (the DailyStat table). Plain constants with no server
 * imports, so admin UI code can use them too (CLAUDE.md hard rule #2).
 *
 * Every one of these is a COUNT. Nothing that identifies a visitor (IP,
 * cookie, user agent, customer id) is stored with them.
 */
export const STAT_METRICS = {
  /** A guest opened a registry page (bots and password prompts excluded). */
  registryView: "registry_view",
  /** The "start a registry" page was opened. */
  createPageView: "create_page_view",
  /** The find-a-registry page was opened. */
  findPageView: "find_page_view",
  /** A guest added one of the store's own products to their cart from a registry. */
  cartAdd: "cart_add",
  /** A guest clicked through from a registry to another store's product page. */
  externalClick: "external_click",
  /** The store's gift card page was opened. */
  giftCardPageView: "gift_card_page_view",
  /** Every order the store took, registry or not. `value` holds the total. */
  storeOrder: "store_order",
} as const;

export type StatMetric = (typeof STAT_METRICS)[keyof typeof STAT_METRICS];

/**
 * Crawlers, link unfurlers (WhatsApp, iMessage, Slack previews of a shared
 * registry link) and uptime checkers. A shared link is unfurled once per chat
 * it's pasted into, so without this a registry would look busier than it is.
 * Deliberately broad: missing a real view is better than inflating the number
 * the merchant decides to pay on.
 */
const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|facebookcatalog|whatsapp|telegram|discord|slack|skype|linkedin|pinterest|embedly|vkshare|quora link|outbrain|bitlybot|headless|lighthouse|pagespeed|curl|wget|python|node-fetch|axios|go-http|java\/|okhttp|monitor|uptime|pingdom/i;

/** True for a request that shouldn't count as a person's visit. No UA counts as a bot. */
export function isLikelyBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true;
  return BOT_PATTERN.test(userAgent);
}

/** UTC midnight of `d`, the key a DailyStat row is stored under. */
export function statDay(d: Date = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
