/**
 * Pure, isomorphic definitions shared by the server and the admin UI.
 *
 * Deliberately NOT a `.server` module: React Router strips server code only
 * from `loader`, `action`, `middleware` and `headers`. Anything a component
 * body touches gets bundled for the browser, so constants the admin renders —
 * event types, setting defaults — must live somewhere with no database import
 * behind it. Everything with a Prisma dependency stays in models/shop.server.ts.
 */

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
  /** Let registrants opt into being listed in find-a-registry. */
  findARegistryEnabled: boolean;
  /** Hide who gave what until the event date. */
  hideBuyerUntilEvent: boolean;
  /**
   * Pro branding (see app/shared/branding.ts). Saved for any plan, applied to
   * guest pages only while the shop is on Pro. "" means "use the default".
   */
  logoUrl: string;
  backgroundColor: string;
  textColor: string;
  /** A BRAND_FONTS value. */
  fontFamily: string;
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
  { value: "other", label: "Something else" },
];

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
  eventTypes: EVENT_TYPES.map((t) => t.value),
  eventTypesKnown: EVENT_TYPES.map((t) => t.value),
  externalItems: "on",
  externalItemsCapPercent: 60,
  accentColor: "#1a1a1a",
  buttonLabel: "Add to registry",
  findARegistryEnabled: false,
  hideBuyerUntilEvent: false,
  logoUrl: "",
  backgroundColor: "",
  textColor: "",
  fontFamily: "system",
};

/**
 * Merges stored settings over the defaults, and switches on any occasion added
 * to EVENT_TYPES since the merchant last saved. `eventTypes` is an explicit
 * allow-list, so without this a new occasion would stay hidden from every
 * existing shop until the merchant happened to find and tick it. An occasion
 * the merchant has seen and unticked stays off.
 */
export function mergeSettings(stored: Partial<ShopSettings>): ShopSettings {
  const merged = { ...SHOP_SETTINGS_DEFAULTS, ...stored };
  if (!stored.eventTypes) return merged;
  const known = new Set(stored.eventTypesKnown ?? LEGACY_EVENT_TYPES);
  const added = EVENT_TYPES.map((t) => t.value).filter((v) => !known.has(v));
  return {
    ...merged,
    eventTypes: [...stored.eventTypes, ...added.filter((v) => !stored.eventTypes!.includes(v))],
    eventTypesKnown: EVENT_TYPES.map((t) => t.value),
  };
}

export function eventTypeLabel(value: string): string {
  return EVENT_TYPES.find((t) => t.value === value)?.label ?? "Registry";
}
