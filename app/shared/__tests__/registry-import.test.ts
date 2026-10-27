import { describe, it, expect } from "vitest";
import { dateFrom, eventTypeFrom, isRecent, mapColumns, parseImport } from "../registry-import";
import { parseCsv, toCsv } from "../../lib/csv";

describe("parseCsv", () => {
  it("reads quoted cells, doubled quotes, commas and newlines inside quotes", () => {
    expect(parseCsv('a,"b, c","say ""hi""","two\nlines"\r\n\r\nx,y,,z\n')).toEqual([
      ["a", "b, c", 'say "hi"', "two\nlines"],
      ["x", "y", "", "z"],
    ]);
  });

  it("round-trips our own CSV exports", () => {
    const rows = [["Name", "Note"], ["Jo", "=SUM(1)"]];
    expect(parseCsv(toCsv(rows))).toEqual([["Name", "Note"], ["Jo", "'=SUM(1)"]]);
  });
});

describe("column matching", () => {
  it("matches common header names loosely", () => {
    const cols = mapColumns(["Registry Name", "E-mail", "First Name", "Last Name", "Variant SKU", "Qty Requested", "Qty Purchased", "Event Date"]);
    expect(cols).toMatchObject({ title: 0, email: 1, firstName: 2, lastName: 3, code: 4, wanted: 5, purchased: 6, eventDate: 7 });
  });
});

describe("parseImport", () => {
  const csv = [
    "Registry ID,Registry Name,Event Type,Event Date,Registrant,Email,SKU,Product,Quantity,Purchased",
    "1001,Baby Lee,Baby Shower,2027-02-14,Jo Lee,JO@example.com,CRIB-01,Crib sheet,2,1",
    "1001,Baby Lee,Baby Shower,2027-02-14,Jo Lee,jo@example.com,SWADDLE,Swaddle,1,0",
    "1001,Baby Lee,Baby Shower,2027-02-14,Jo Lee,jo@example.com,CRIB-01,Crib sheet,1,1",
    "1002,Sam & Alex,Wedding,6/12/2027,Sam,sam@example.com,,,,",
    "1003,No email,Wedding,,Pat,,MUG,Mug,1,0",
  ].join("\n");

  it("groups rows into registries and adds up repeated items", () => {
    const parsed = parseImport(csv);
    expect(parsed.error).toBeNull();
    expect(parsed.registries).toHaveLength(2);
    const [baby, wedding] = parsed.registries;
    expect(baby).toMatchObject({ title: "Baby Lee", eventType: "baby", email: "jo@example.com", registrantName: "Jo Lee" });
    expect(baby.eventDate?.toISOString()).toBe("2027-02-14T00:00:00.000Z");
    expect(baby.items).toEqual([
      { code: "CRIB-01", productTitle: "Crib sheet", wanted: 3, purchased: 2 },
      { code: "SWADDLE", productTitle: "Swaddle", wanted: 1, purchased: 0 },
    ]);
    // A registry with no items still comes across.
    expect(wedding).toMatchObject({ eventType: "wedding", items: [] });
    expect(wedding.eventDate?.toISOString()).toBe("2027-06-12T00:00:00.000Z");
    expect(parsed.problems).toEqual(["Row 6: no valid email, skipped."]);
  });

  it("refuses a file with no email column", () => {
    expect(parseImport("Registry Name,SKU\nBaby Lee,CRIB-01").error).toMatch(/email column/);
  });

  it("reads Shopify variant ids when the file has them", () => {
    const parsed = parseImport("Email,Variant ID\njo@example.com,gid://shopify/ProductVariant/42\njo@example.com,43");
    expect(parsed.registries[0].items.map((i) => i.code)).toEqual(["variant:42", "variant:43"]);
  });

  it("names a registry from the registrant when the file has no name", () => {
    expect(parseImport("Email,First Name\njo@example.com,Jo").registries[0].title).toBe("Jo's registry");
  });
});

describe("dates and occasions", () => {
  it("reads the common date shapes and nothing else", () => {
    expect(dateFrom("2027-02-14")?.toISOString()).toBe("2027-02-14T00:00:00.000Z");
    expect(dateFrom("2/14/2027")?.toISOString()).toBe("2027-02-14T00:00:00.000Z");
    expect(dateFrom("Feb 14, 2027")?.toISOString()).toBe("2027-02-14T00:00:00.000Z");
    expect(dateFrom("14/2/2027")).toBeNull();
    expect(dateFrom("soon")).toBeNull();
  });

  it("maps occasion words to our occasions", () => {
    expect(eventTypeFrom("Baby Registry")).toBe("baby");
    expect(eventTypeFrom("Bridal Shower")).toBe("bridal-shower");
    expect(eventTypeFrom("Wedding")).toBe("wedding");
    expect(eventTypeFrom("Something")).toBe("other");
  });

  it("treats a registry with no date, or a date within the last year, as recent", () => {
    const now = new Date("2026-10-24T00:00:00Z");
    expect(isRecent({ eventDate: null }, now)).toBe(true);
    expect(isRecent({ eventDate: new Date("2026-01-01T00:00:00Z") }, now)).toBe(true);
    expect(isRecent({ eventDate: new Date("2025-01-01T00:00:00Z") }, now)).toBe(false);
  });
});
