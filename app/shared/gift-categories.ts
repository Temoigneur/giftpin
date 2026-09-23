/**
 * Gift categories a registrant can file each registry item under. The guest
 * page groups items by these. Original list, written for Giftpin — not copied
 * from any other registry's taxonomy. Not a `.server` file so both the
 * registrant page and the guest page can share it.
 *
 * `value` is what is stored in RegistryItem.category; never rename one without
 * a data migration. Order here is the order groups appear on the guest page.
 */
export const GIFT_CATEGORIES = [
  { value: "kitchen", label: "Kitchen" },
  { value: "dining", label: "Dining & Entertaining" },
  { value: "bed-bath", label: "Bed & Bath" },
  { value: "home-decor", label: "Home & Décor" },
  { value: "furniture", label: "Furniture & Storage" },
  { value: "electronics", label: "Electronics" },
  { value: "experiences", label: "Experiences & Cash Funds" },
  { value: "misc", label: "Miscellaneous" },
] as const;

export type GiftCategoryValue = (typeof GIFT_CATEGORIES)[number]["value"];

export function isGiftCategory(value: unknown): value is GiftCategoryValue {
  return typeof value === "string" && GIFT_CATEGORIES.some((c) => c.value === value);
}

export function giftCategoryLabel(value: string | null | undefined): string {
  return GIFT_CATEGORIES.find((c) => c.value === value)?.label ?? "Miscellaneous";
}
