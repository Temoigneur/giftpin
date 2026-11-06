import { describe, it, expect } from "vitest";
import { renderManagePage, type ManagePageData } from "../manage-page";
import { renderGiftCardPage } from "../gift-card-page";
import { withLocale } from "../../../lib/i18n.server";
import { LOCALES } from "../../../shared/i18n";
import type { DisplayItem } from "../../../models/item.server";

/** The manage page's script is a JS string assembled from translations: one stray quote would break all of it. */
function data(): ManagePageData {
  return {
    chromeExtensionUrl: "https://chromewebstore.google.com/detail/giftpin/abc",
    registryId: "registry_1",
    title: "Sam & Alex",
    message: null,
    eventType: "wedding",
    eventDate: new Date("2027-06-14T00:00:00Z"),
    privacy: "unlisted",
    items: [] as DisplayItem[],
    shopName: "Maple & Clay",
    accentColor: "#2f5d50",
    currency: "CAD",
    shareUrl: "https://maple-clay.com/apps/registry/r/abc123",
    actionUrl: "/apps/registry",
    token: "tok_abc",
    manageUrl: "https://maple-clay.com/apps/registry/manage?t=tok_abc",
    externalItemsAllowed: true,
    storeSearchUrl: "/collections/all",
    gifts: [],
    scanner: true,
    contributions: { toRegistrant: false },
    partner: null,
    shipping: { enabled: false, address: null },
    setupStep: 1,
  };
}

describe.each(LOCALES)("manage page in %s", (locale) => {
  it("renders with every script parsing as JavaScript", () => {
    const html = withLocale(locale, () => renderManagePage(data()));
    expect(html).toContain(`lang="${locale}"`);
    const scripts = [...html.matchAll(/<script(?![^>]*type="application\/json")[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    expect(scripts.length).toBeGreaterThan(1);
    for (const code of scripts) expect(() => new Function(code)).not.toThrow();
    // The {placeholder} filler must reach the browser with its regex intact.
    expect(html).toContain("s.replace(/\\{(\\w+)\\}/g,");
  });

  it("renders the gift card page", () => {
    const html = withLocale(locale, () =>
      renderGiftCardPage({ shopName: "Maple & Clay", accentColor: "#000", currency: "CAD", amounts: [], blurb: "", token: "t" }),
    );
    expect(html).toContain("Maple &amp; Clay");
  });
});

describe("manage page language", () => {
  it("is translated when the store language is French", () => {
    const html = withLocale("fr", () => renderManagePage(data()));
    expect(html).toContain("Votre lien de partage");
    expect(html).not.toContain("Your share link");
  });
  it("stays English by default", () => {
    expect(renderManagePage(data())).toContain("Your share link");
  });
});
