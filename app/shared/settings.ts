/**
 * Pure, isomorphic definitions shared by the server and the admin UI.
 *
 * Deliberately NOT a `.server` module: React Router strips server code only
 * from `loader`, `action`, `middleware` and `headers`. Anything a component
 * body touches gets bundled for the browser, so constants the admin renders —
 * event types, setting defaults — must live somewhere with no database import
 * behind it. Everything with a Prisma dependency stays in models/shop.server.ts.
 */

import type { ContributionProduct } from "./contributions";
import { GIFT_CARD_LISTING_DEFAULTS, type GiftCardListing } from "./gift-card-listing";

export interface ShopSettings {
  /** Event types the merchant has switched on. */
  eventTypes: string[];
  /** Every event type that existed when these settings were last saved (see mergeSettings). */
  eventTypesKnown: string[];
  /**
   * External items: off | on | capped.
   *
   * Defaults to "on". The completeness is the point — a registrant who can't
   * put everything in one list goes and builds it somewhere else, and then the
   * merchant gets nothing at all.
   */
  externalItems: "off" | "on" | "capped";
  /** When externalItems is "capped", the maximum share of items that may be external. */
  externalItemsCapPercent: number;
  /** Merchant branding for the guest page. */
  accentColor: string;
  buttonLabel: string;
  /**
   * Let registrants opt into being listed in find-a-registry. On by default
   * since 2 Nov 2026 (Ben): off, a registrant could pick "Listed publicly" and
   * the store's Find a gift registry link still said there was no search. Each
   * registry stays unlisted unless its owner picks "Listed publicly".
   */
  findARegistryEnabled: boolean;
  /** Hide who gave what until the event date. */
  hideBuyerUntilEvent: boolean;
  /**
   * Gift card product guests buy to chip in toward a group gift or fund
   * (Pro). Null until the merchant picks one. See app/shared/contributions.ts.
   */
  contributionProduct: ContributionProduct | null;
  /**
   * List this store's gift cards on giftpin.app (Pro). Sells the same gift
   * card product as contributionProduct. See app/shared/gift-card-listing.ts.
   */
  giftCardListing: GiftCardListing;

  // Pro automations (app/models/automations.server.ts). Ignored on Free.
  /**
   * After the event, give the registrant a one-time discount code on what's
   * left on their list. Off by default: it costs the merchant margin, so it's
   * their call to switch on.
   */
  completionDiscountEnabled: boolean;
  /** Percentage off, 5 to 50. */
  completionDiscountPercent: number;
  /** How long the code works, in days. */
  completionDiscountValidDays: number;
  /** Remind the registrant to send thank-yous, a couple of days after the event. */
  thankYouReminderEmails: boolean;
  /** Email guests who asked to be reminded two weeks before the event. */
  guestEventReminderEmails: boolean;
  /** Tell the registrant when most of their list has been bought. */
  mostGoneAlertEmails: boolean;
  /**
   * Pro branding (see app/shared/branding.ts). Saved for any plan, applied to
   * guest pages only while the shop is on Pro. "" means "use the default".
   */
  logoUrl: string;
  backgroundColor: string;
  textColor: string;
  /** A BRAND_FONTS value. */
  fontFamily: string;
  /**
   * Store products that are sold out (Shopify's availableForSale is false).
   * "show": guests see them marked sold out, with no Add to cart button.
   * "hide": they're left off the guest page until they're back in stock.
   * Either way the item stays on the registry; nothing is ever deleted, so a
   * restock brings it straight back. See app/lib/stock.ts.
   */
  soldOutItems: "show" | "hide";
  /**
   * Registry perks (Pro): one perk per line, shown to registrants on the
   * create and manage pages. See app/shared/perks.ts.
   */
  registryPerks: string;
  /**
   * Registry promotions (Pro): the Shopify discount node ids of this store's
   * registry sales and coupons. Shopify holds everything else, in each
   * discount's own metafield. See app/shared/promotions.ts.
   */
  promotionIds: string[];
}

export const EVENT_TYPES: { value: string; label: string }[] = [
  { value: "wedding", label: "Wedding" },
  { value: "engagement", label: "Engagement" },
  { value: "bridal-shower", label: "Bridal shower" },
  { value: "baby", label: "Baby shower" },
  { value: "christening", label: "Baptism or christening" },
  { value: "birthday", label: "Birthday" },
  { value: "coming-of-age", label: "Bar or bat mitzvah, quinceañera, sweet 16" },
  { value: "graduation", label: "Graduation" },
  { value: "college", label: "Off to college" },
  { value: "housewarming", label: "Housewarming" },
  { value: "anniversary", label: "Anniversary" },
  { value: "retirement", label: "Retirement" },
  { value: "holiday", label: "Christmas and holidays" },
  { value: "new-pet", label: "New pet" },
  { value: "fundraiser", label: "Charity or fundraiser" },
  { value: "corporate", label: "Corporate gifting" },
  { value: "wishlist", label: "Wish list" },
  { value: "other", label: "Something else" },
];

/**
 * Occasions a merchant has to switch on in Settings: new shops start without
 * them, and mergeSettings() never switches them on for existing shops.
 * "wishlist" is a shareable list with no event date (built 29 Oct 2026), a
 * seasonal angle rather than a registry, so it's each store's call.
 */
export const OPT_IN_EVENT_TYPES = ["wishlist"];

/**
 * Occasions with no event date: the create and manage forms hide the date
 * field and the server stores none, so date-based emails (guest reminders,
 * thank-you, completion discount) never fire for them.
 */
const DATELESS_EVENT_TYPES = ["wishlist"];

export function isDatelessOccasion(eventType: string): boolean {
  return DATELESS_EVENT_TYPES.includes(eventType);
}

/** What guests and emails call the list: "wish list" for a wish list, otherwise "registry". */
export function listNoun(eventType: string | null | undefined): "wish list" | "registry" {
  return eventType === "wishlist" ? "wish list" : "registry";
}

/**
 * The event types that existed before 24 Sep 2026. A shop whose saved
 * settings predate `eventTypesKnown` was choosing from exactly this list, so
 * anything outside it is an occasion it has never seen and gets switched on.
 */
const LEGACY_EVENT_TYPES = [
  "wedding",
  "baby",
  "birthday",
  "housewarming",
  "graduation",
  "anniversary",
  "corporate",
  "other",
];

export const SHOP_SETTINGS_DEFAULTS: ShopSettings = {
  eventTypes: EVENT_TYPES.map((t) => t.value).filter((v) => !OPT_IN_EVENT_TYPES.includes(v)),
  eventTypesKnown: EVENT_TYPES.map((t) => t.value),
  externalItems: "on",
  externalItemsCapPercent: 60,
  accentColor: "#1a1a1a",
  buttonLabel: "Add to registry",
  findARegistryEnabled: true,
  hideBuyerUntilEvent: false,
  contributionProduct: null,
  giftCardListing: GIFT_CARD_LISTING_DEFAULTS,
  completionDiscountEnabled: false,
  completionDiscountPercent: 15,
  completionDiscountValidDays: 60,
  thankYouReminderEmails: true,
  guestEventReminderEmails: true,
  mostGoneAlertEmails: true,
  logoUrl: "",
  backgroundColor: "",
  textColor: "",
  fontFamily: "system",
  soldOutItems: "show",
  registryPerks: "",
  promotionIds: [],
};

export const COMPLETION_DISCOUNT_PERCENT_RANGE = { min: 5, max: 50 } as const;
export const COMPLETION_DISCOUNT_DAYS_RANGE = { min: 7, max: 365 } as const;


/**
 * Merges stored settings over the defaults, and switches on any occasion added
 * to EVENT_TYPES since the merchant last saved. `eventTypes` is an explicit
 * allow-list, so without this a new occasion would stay hidden from every
 * existing shop until the merchant happened to find and tick it. An occasion
 * the merchant has seen and unticked stays off, and an OPT_IN_EVENT_TYPES
 * occasion is never switched on here.
 */
export function mergeSettings(stored: Partial<ShopSettings>): ShopSettings {
  const merged = { ...SHOP_SETTINGS_DEFAULTS, ...stored };
  if (!stored.eventTypes) return merged;
  const known = new Set(stored.eventTypesKnown ?? LEGACY_EVENT_TYPES);
  const added = EVENT_TYPES.map((t) => t.value).filter((v) => !known.has(v) && !OPT_IN_EVENT_TYPES.includes(v));
  return {
    ...merged,
    eventTypes: [...stored.eventTypes, ...added.filter((v) => !stored.eventTypes!.includes(v))],
    eventTypesKnown: EVENT_TYPES.map((t) => t.value),
  };
}

export function eventTypeLabel(value: string): string {
  return EVENT_TYPES.find((t) => t.value === value)?.label ?? "Registry";
}
