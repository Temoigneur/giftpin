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
}

export const SHOP_SETTINGS_DEFAULTS: ShopSettings = {
  eventTypes: ["wedding", "baby", "birthday", "housewarming", "graduation"],
  externalItems: "on",
  externalItemsCapPercent: 60,
  accentColor: "#1a1a1a",
  buttonLabel: "Add to registry",
  findARegistryEnabled: false,
  hideBuyerUntilEvent: false,
  completionDiscountEnabled: false,
  completionDiscountPercent: 15,
  completionDiscountValidDays: 60,
  thankYouReminderEmails: true,
  guestEventReminderEmails: true,
  mostGoneAlertEmails: true,
};

export const COMPLETION_DISCOUNT_PERCENT_RANGE = { min: 5, max: 50 } as const;
export const COMPLETION_DISCOUNT_DAYS_RANGE = { min: 7, max: 365 } as const;

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
