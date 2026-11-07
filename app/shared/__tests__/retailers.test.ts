import { describe, it, expect } from "vitest";
import { retailerSearchLinks, retailersByShelf, shelfForIdea, normalizeCountry, COUNTRIES, DEFAULT_COUNTRY, SHELVES } from "../retailers";
import { ideaGuideFor } from "../registry-ideas";
import { EVENT_TYPES } from "../settings";
import { LOCALES, intlTag, countryName } from "../i18n";
import { renderManagePage } from "../../proxy/render/manage-page";
import { renderCreatePage } from "../../proxy/render/create-page";

describe("retailer links by country", () => {
  it("defaults to the United States (.com), not Canada", () => {
    expect(DEFAULT_COUNTRY).toBe("US");
    for (const c of [undefined, null, "", "zz", "JP"]) {
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

describe("13 countries, stores by kind of product", () => {
  it("offers the 13 countries, each named in every language", () => {
    expect(COUNTRIES.map((c) => c.code)).toEqual(["US", "CA", "GB", "IE", "AU", "NZ", "DE", "AT", "FR", "ES", "PT", "MX", "BR"]);
    for (const c of COUNTRIES) {
      for (const l of LOCALES) {
        const name = countryName(c.code, c.label, l);
        expect(name.length, `${c.code} ${l}`).toBeGreaterThanOrEqual(2);
        expect(name, `${c.code} ${l} is a code`).not.toBe(c.code);
      }
    }
    expect(countryName("DE", "Germany", "de")).toBe("Deutschland");
    expect(countryName("BR", "Brazil", "pt-BR")).toBe("Brasil");
    expect(intlTag("fr")).toBeTruthy();
  });

  it("every country has a list for every shelf, with real links ending in a Google Shopping fallback", () => {
    for (const c of COUNTRIES) {
      const by = retailersByShelf(c.code);
      for (const shelf of SHELVES) {
        const list = by[shelf];
        expect(list.length, `${c.code} ${shelf}`).toBeGreaterThanOrEqual(3);
        expect(list.length, `${c.code} ${shelf}`).toBeLessThanOrEqual(6);
        expect(list[list.length - 1].name).toBe("Google Shopping");
        const names = list.map((r) => r.name);
        expect(new Set(names).size, `${c.code} ${shelf} repeats a store`).toBe(names.length);
        for (const r of list) expect(r.url, `${c.code} ${shelf} ${r.name}`).toMatch(/^https:\/\/[^/]+\/.*\{q\}/);
      }
    }
  });

  it("sends each country to its own market's sites", () => {
    const host = (c: string, shelf: "home" | "baby" | "toys" | "tech" | "pets" | "garden" = "home") =>
      retailerSearchLinks(c, shelf).map((r) => new URL(r.url.replace("{q}", "x")).host).join(" ");
    expect(host("DE")).toContain("otto.de");
    expect(host("FR", "tech")).toContain("fnac.com");
    expect(host("BR", "pets")).toContain("petz.com.br");
    expect(host("MX")).toContain("liverpool.com.mx");
    expect(host("US", "pets")).toContain("chewy.com");
    expect(host("AU", "garden")).toContain("bunnings.com.au");
    expect(host("DE")).not.toMatch(/\.com\.br|\.co\.uk/);
  });

  it("puts an idea on the right shelf", () => {
    expect(shelfForIdea("wedding", "Kitchen", "Cookware")).toBe("home");
    expect(shelfForIdea("wedding", "Tech & entertainment", "Gaming & games")).toBe("tech");
    expect(shelfForIdea("wedding", "Outdoor & patio", "Grilling")).toBe("garden");
    expect(shelfForIdea("baby", "Feeding", "Bottles")).toBe("baby");
    expect(shelfForIdea("new-pet", "Dogs & puppies", "Walks")).toBe("pets");
    expect(shelfForIdea("birthday", "Kids (4 to 7)", "Outdoor")).toBe("toys");
    expect(shelfForIdea("holiday", "Little kids (ages 1 to 3)", "Toys")).toBe("toys");
    expect(shelfForIdea("other", "Whatever", "Else")).toBe("home");
  });

  it("every idea in every guide lands on a shelf", () => {
    for (const e of [...EVENT_TYPES.map((x) => x.value), "other"]) {
      for (const g of ideaGuideFor(e).groups) {
        for (const sub of g.subcategories) expect(SHELVES).toContain(shelfForIdea(e, g.label, sub.label));
      }
    }
  });

  it("the manage page picks the stores by shelf and country", () => {
    const html = renderManagePage({
      registryId: "r", title: "T", message: null, eventType: "wedding", eventDate: null, privacy: "unlisted",
      country: "DE", items: [], shopName: "Shop", accentColor: "#2f5d50", currency: "EUR",
      shareUrl: "https://x/r/a", actionUrl: "/apps/registry", token: "tok", manageUrl: "https://x/m",
      externalItemsAllowed: true, storeSearchUrl: "/collections/all", gifts: [],
    } as never);
    expect(html).toContain("otto.de/suche/");
    expect(html).toContain("mediamarkt.de");
    expect(html).toContain('data-shelf="tech"');
    expect(html).toContain('data-shelf="garden"');
  });
});
