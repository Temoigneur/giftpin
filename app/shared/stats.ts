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
  /** A registrant pressed Share (phone share sheet, or the email/text list) on their manage page. */
  registryShare: "registry_share",
  /** A registrant copied their guest link on the manage page. */
  registryLinkCopy: "registry_link_copy",
  /** A registrant opened the QR code for their guest link. */
  registryQrOpen: "registry_qr_open",
} as const;

/**
 * Sections of the embedded admin, counted when a merchant opens one, so
 * Giftpin's /ops view shows which parts of the app stores actually use.
 * Anything else under /app counts as "other".
 */
export const ADMIN_SECTIONS = ["overview", "registries", "promotions", "analytics", "in-store", "settings", "billing", "import", "other"] as const;
export type AdminSection = (typeof ADMIN_SECTIONS)[number];

/** The section an admin path belongs to: "/app" is overview, "/app/registries/abc" is registries. */
export function adminSectionOf(pathname: string): AdminSection {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "app") return "other";
  const head = parts[1] ?? "overview";
  return (ADMIN_SECTIONS as readonly string[]).includes(head) ? (head as AdminSection) : "other";
}

export type StatMetric = (typeof STAT_METRICS)[keyof typeof STAT_METRICS] | `admin_view_${AdminSection}`;

/** Registrant clicks the manage page reports by name (POST /track). Anything else is ignored. */
export const MANAGE_CLICK_METRICS: Record<string, StatMetric> = {
  share: STAT_METRICS.registryShare,
  copy: STAT_METRICS.registryLinkCopy,
  qr: STAT_METRICS.registryQrOpen,
};

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
