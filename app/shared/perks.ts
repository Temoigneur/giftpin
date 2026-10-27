/**
 * Registry perks (Pro): what a store offers people who register with it,
 * like "10% off what's left after your event" or "Free gift wrapping".
 *
 * The merchant types them in Settings, one per line. Shown to registrants on
 * the create page (to win the registry) and the manage page (to remind them).
 * Guests never see them. Pure, so the admin form and the proxy pages share it.
 */

export const PERKS_MAX_LINES = 6;
export const PERK_MAX_LENGTH = 120;
/** What the Settings field accepts in total, newlines included. */
export const PERKS_MAX_LENGTH = PERKS_MAX_LINES * (PERK_MAX_LENGTH + 1);

/** Cleans what the merchant typed: trimmed lines, no blanks, capped. */
export function cleanPerks(value: unknown): string {
  return perkLines(String(value ?? "")).join("\n");
}

export function perkLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim().slice(0, PERK_MAX_LENGTH))
    .filter(Boolean)
    .slice(0, PERKS_MAX_LINES);
}

/**
 * The perks registrants see. The completion discount is added for the
 * merchant when it's switched on, so the two can never disagree; a merchant
 * who already wrote their own line about it keeps just theirs.
 */
export function registrantPerks(input: {
  pro: boolean;
  registryPerks: string;
  completionDiscountEnabled: boolean;
  completionDiscountPercent: number;
}): string[] {
  if (!input.pro) return [];
  const lines = perkLines(input.registryPerks);
  if (input.completionDiscountEnabled && !lines.some((l) => /% ?off/i.test(l) && /left|remaining|after/i.test(l))) {
    lines.push(`${input.completionDiscountPercent}% off our products still on your list after your event`);
  }
  return lines.slice(0, PERKS_MAX_LINES + 1);
}
