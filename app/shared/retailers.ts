/**
 * Where to send a registrant when the hosting store doesn't carry something:
 * plain outbound search pages, chosen by the registry's country so a shopper
 * lands on their own market's sites. `{q}` is replaced with the search term.
 *
 * Not a `.server` file: the manage page script and the create form both use it.
 *
 * No Amazon (29 Sep 2026, Ben): Amazon Associates only pays on sites the
 * publisher owns, and these links sit on merchants' storefronts, so Amazon
 * links can never earn Giftpin anything. The US list leads with Target.
 * Links are wrapped for affiliate credit on the manage page when
 * AFFILIATE_LINK_WRAPPER_BASE is set (see app/lib/affiliate.ts).
 */

export interface Retailer {
  name: string;
  url: string;
}

export const DEFAULT_COUNTRY = "US";

export const COUNTRIES: { code: string; label: string }[] = [
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
  { code: "GB", label: "United Kingdom" },
  { code: "AU", label: "Australia" },
];

const RETAILERS: Record<string, Retailer[]> = {
  US: [
    { name: "Target", url: "https://www.target.com/s?searchTerm={q}" },
    { name: "Walmart", url: "https://www.walmart.com/search?q={q}" },
    { name: "Wayfair", url: "https://www.wayfair.com/keyword.php?keyword={q}" },
    { name: "Etsy", url: "https://www.etsy.com/search?q={q}" },
    { name: "Google Shopping", url: "https://www.google.com/search?tbm=shop&q={q}" },
  ],
  CA: [
    { name: "Walmart.ca", url: "https://www.walmart.ca/search?q={q}" },
    { name: "Wayfair.ca", url: "https://www.wayfair.ca/keyword.php?keyword={q}" },
    { name: "Etsy", url: "https://www.etsy.com/ca/search?q={q}" },
    { name: "Google Shopping", url: "https://www.google.com/search?tbm=shop&q={q}" },
  ],
  GB: [
    { name: "Argos", url: "https://www.argos.co.uk/search/{q}/" },
    { name: "John Lewis", url: "https://www.johnlewis.com/search?search-term={q}" },
    { name: "Wayfair.co.uk", url: "https://www.wayfair.co.uk/keyword.php?keyword={q}" },
    { name: "Etsy", url: "https://www.etsy.com/uk/search?q={q}" },
    { name: "Google Shopping", url: "https://www.google.co.uk/search?tbm=shop&q={q}" },
  ],
  AU: [
    { name: "Kmart", url: "https://www.kmart.com.au/search/?searchTerm={q}" },
    { name: "Big W", url: "https://www.bigw.com.au/search?q={q}" },
    { name: "Etsy", url: "https://www.etsy.com/au/search?q={q}" },
    { name: "Google Shopping", url: "https://www.google.com.au/search?tbm=shop&q={q}" },
  ],
};

/** A supported country code, or the default. Accepts any case; never throws. */
export function normalizeCountry(value: unknown): string {
  const code = String(value ?? "").trim().toUpperCase();
  return code in RETAILERS ? code : DEFAULT_COUNTRY;
}

export function retailerSearchLinks(country: unknown): Retailer[] {
  return RETAILERS[normalizeCountry(country)];
}
