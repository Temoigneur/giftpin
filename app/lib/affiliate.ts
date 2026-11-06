/**
 * Outbound-link affiliate wrapping — Ben's 20 Sep 2026 reversal of the old
 * "no commission, ever" rule (see CLAUDE.md's "Resolved" section).
 *
 * Deliberately network-agnostic. The "auto-monetization" networks under
 * consideration (Sovrn Commerce, and Skimlinks until it turned Giftpin down on 29 Sep 2026) — and Walmart Creator, which
 * isn't one of those but still just redirects through its own domain — all
 * work the same simple way: prefix the real destination URL onto a redirect
 * endpoint of the network's own, e.g.
 *
 *   https://redirect.viglink.com/?key=<pubId>&u=<percent-encoded destination>
 *
 * AFFILIATE_LINK_WRAPPER_BASE (see .env.example) holds that endpoint up to
 * and including whatever query param takes the destination URL — e.g.
 * "https://redirect.viglink.com/?key=abc123&u=". Nothing here hardcodes one
 * network's URL shape, so whichever network Ben signs up with, wiring it in
 * is a one-line env var, not a code change.
 *
 * 6 Nov 2026: Sovrn Commerce approved Giftpin (incl. links shown on merchant
 * storefront domains, after Ben described that setup to them) for Open
 * Auction / CPC (their "CRTB", now called Link Optimization). The value is
 * "https://redirect.viglink.com/?key=<site API key>&u=", key from Sovrn
 * Commerce → Settings → giftpin.app row → key icon. CPC pays per click, so
 * the disclosure copy says "links ... may earn", not "buying ... may earn".
 *
 * Until that env var is set (no network signed up yet as of 20 Sep 2026),
 * `wrapAffiliateLink` is a no-op and every outbound link is untouched — so
 * this ships now without waiting on Ben's account signups, and turns on the
 * moment a real endpoint is configured.
 */

export function wrapAffiliateLink(
  url: string,
  wrapperBase: string | null | undefined,
): string {
  if (!wrapperBase) return url;
  try {
    // Guard against a malformed base producing an unusable link — fail open
    // to the original URL rather than sending a guest somewhere broken.
    new URL(wrapperBase.endsWith("=") ? wrapperBase + "x" : wrapperBase);
    return wrapperBase + encodeURIComponent(url);
  } catch {
    return url;
  }
}

export function affiliateEnabled(wrapperBase: string | null | undefined): boolean {
  return Boolean(wrapperBase);
}
