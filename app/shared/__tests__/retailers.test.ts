import { describe, it, expect } from "vitest";
import { retailerSearchLinks, normalizeCountry, COUNTRIES, DEFAULT_COUNTRY } from "../retailers";
import { renderManagePage } from "../../proxy/render/manage-page";
import { renderCreatePage } from "../../proxy/render/create-page";

describe("retailer links by country", () => {
  it("defaults to the United States (.com), not Canada", () => {
    expect(DEFAULT_COUNTRY).toBe("US");
    for (const c of [undefined, null, "", "zz", "FR"]) {
      const urls = retailerSearchLinks(c).map((r) => r.url).join(" ");
      expect(urls).toContain("https://www.amazon.com/s?k={q}");
      expect(urls).not.toContain(".ca");
    }
  });

  it("uses each country's own sites", () => {
    expect(retailerSearchLinks("CA")[0].url).toContain("amazon.ca");
    expect(retailerSearchLinks("gb")[0].url).toContain("amazon.co.uk");
    expect(retailerSearchLinks("AU")[0].url).toContain("amazon.com.au");
  });

  it("every country has links that take the search term", () => {
    for (const c of COUNTRIES) {
      const links = retailerSearchLinks(c.code);
      expect(links.length).toBeGreaterThanOrEqual(4);
      for (const l of links) expect(l.url).toMatch(/^https:\/\/.*\{q\}/);
    }
  });

  it("normalises whatever the form sends", () => {
    expect(normalizeCountry("ca")).toBe("CA");
    expect(normalizeCountry("<script>")).toBe("US");
    expect(normalizeCountry(undefined)).toBe("US");
  });
});

describe("country choice in the pages", () => {
  const manage = (country?: string | null) =>
    renderManagePage({
      registryId: "r", title: "T", message: null, eventType: "wedding", eventDate: null, privacy: "unlisted",
      country, items: [], shopName: "Shop", accentColor: "#2f5d50", currency: "CAD",
      shareUrl: "https://x/r/a", actionUrl: "/apps/registry", token: "tok", manageUrl: "https://x/m",
      externalItemsAllowed: true, storeSearchUrl: "/collections/all", gifts: [],
    } as never);

  it("a Canadian-currency shop with no country chosen still links to .com stores", () => {
    const html = manage(null);
    expect(html).toContain("amazon.com/s?k=");
    expect(html).not.toContain("amazon.ca");
  });

  it("uses the registry's chosen country, and shows it selected in settings", () => {
    const html = manage("CA");
    expect(html).toContain("amazon.ca/s?k=");
    expect(html).toContain('<option value="CA" selected>');
  });

  it("the create form offers the countries with United States selected", () => {
    const html = renderCreatePage({ shopName: "S", accentColor: "#000", actionUrl: "/apps/registry", enabledEventTypes: [] });
    expect(html).toContain('<option value="US" selected>');
    expect(html).toContain('<option value="CA">');
  });
});
