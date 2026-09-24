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

export const SHOP_SETTINGS_DEFAULTS: ShopSettings = {
  eventTypes: ["wedding", "baby", "birthday", "housewarming", "graduation"],
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

export const EVENT_TYPES: { value: string; label: string }[] = [
  { value: "wedding", label: "Wedding" },
  { value: "baby", label: "Baby shower" },
  { value: "birthday", label: "Birthday" },
  { value: "housewarming", label: "Housewarming" },
  { value: "graduation", label: "Graduation" },
  { value: "anniversary", label: "Anniversary" },
  { value: "corporate", label: "Corporate gifting" },
  { value: "other", label: "Something else" },
];

export function eventTypeLabel(value: string): string {
  return EVENT_TYPES.find((t) => t.value === value)?.label ?? "Registry";
}
