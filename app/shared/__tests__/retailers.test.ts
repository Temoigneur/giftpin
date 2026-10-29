import { describe, it, expect } from "vitest";
import { retailerSearchLinks, normalizeCountry, COUNTRIES, DEFAULT_COUNTRY } from "../retailers";
import { renderManagePage } from "../../proxy/render/manage-page";
import { renderCreatePage } from "../../proxy/render/create-page";

describe("retailer links by country", () => {
  it("defaults to the United States (.com), not Canada", () => {
    expect(DEFAULT_COUNTRY).toBe("US");
    for (const c of [undefined, null, "", "zz", "FR"]) {
      const urls = retailerSearchLinks(c).map((r) => r.url).join(" ");
      expect(urls).toContain("https://www.target.com/s?searchTerm={q}");
      expect(urls).not.toContain(".ca");
    }
  });

  it("uses each country's own sites", () => {
    expect(retailerSearchLinks("US")[0].url).toContain("target.com");
    expect(retailerSearchLinks("CA")[0].url).toContain("crateandbarrel.ca");
    expect(retailerSearchLinks("gb")[0].url).toContain("argos.co.uk");
    expect(retailerSearchLinks("AU")[0].url).toContain("kmart.com.au");
  });

  it("leads with home and kitchen stores for the US and Canada, since most registries are weddings", () => {
    const names = (c: string) => retailerSearchLinks(c).map((r) => r.name);
    for (const c of ["US", "CA"]) {
      expect(names(c)).toEqual(expect.arrayContaining(["Crate & Barrel", "Williams Sonoma"]));
      expect(names(c)).toContain("Google Shopping");
      // HomeSense sells in-store only, so there's no search page to link to.
      expect(names(c).join(" ")).not.toMatch(/homesense/i);
    }
    expect(names("US")).not.toContain("Walmart");
    const ca = retailerSearchLinks("CA").map((r) => r.url).join(" ");
    expect(ca).toContain("canadiantire.ca/en/search-results.html?q={q}");
    expect(ca).not.toMatch(/crateandbarrel\.com|williams-sonoma\.com/);
  });

  it("never links to Amazon, which can't pay commission on merchants' storefronts", () => {
    for (const c of COUNTRIES) {
      expect(retailerSearchLinks(c.code).map((r) => r.url).join(" ")).not.toMatch(/amazon\./);
    }
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
  const manage = (country?: string | null, affiliateLinkWrapperBase?: string | null) =>
    renderManagePage({
      affiliateLinkWrapperBase,
      registryId: "r", title: "T", message: null, eventType: "wedding", eventDate: null, privacy: "unlisted",
      country, items: [], shopName: "Shop", accentColor: "#2f5d50", currency: "CAD",
      shareUrl: "https://x/r/a", actionUrl: "/apps/registry", token: "tok", manageUrl: "https://x/m",
      externalItemsAllowed: true, storeSearchUrl: "/collections/all", gifts: [],
    } as never);

  it("a Canadian-currency shop with no country chosen still links to .com stores", () => {
    const html = manage(null);
    expect(html).toContain("crateandbarrel.com/search?query=");
    expect(html).not.toContain("crateandbarrel.ca");
  });

  it("uses the registry's chosen country, and shows it selected in settings", () => {
    const html = manage("CA");
    expect(html).toContain("crateandbarrel.ca/search?query=");
    expect(html).toContain('<option value="CA" selected>');
  });

  it("hands the affiliate wrapper to the ideas guide only when one is configured", () => {
    expect(manage(null)).toContain('"affiliateBase":null');
    expect(manage(null, "https://go.example.com/?u=")).toContain('"affiliateBase":"https://go.example.com/?u="');
  });

  it("the create form offers the countries with United States selected", () => {
    const html = renderCreatePage({ shopName: "S", accentColor: "#000", actionUrl: "/apps/registry", enabledEventTypes: [] });
    expect(html).toContain('<option value="US" selected>');
    expect(html).toContain('<option value="CA">');
  });
});
