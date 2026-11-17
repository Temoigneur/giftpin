import { describe, it, expect, vi } from "vitest";

vi.mock("../../shopify.server", () => ({ unauthenticated: { admin: vi.fn() } }));

import { barcodeForms, cleanCode, fetchVariantStock, findVariantsByCode, searchTermsFor, variantMatchesCode } from "../catalog.server";

function graphql(data: unknown) {
  const calls: { query: string; variables: Record<string, unknown> }[] = [];
  const fn = vi.fn(async (query: string, options?: { variables?: Record<string, unknown> }) => {
    calls.push({ query, variables: options?.variables ?? {} });
    return new Response(JSON.stringify({ data }));
  });
  return { fn, calls };
}

const node = (overrides: Record<string, unknown> = {}) => ({
  id: "gid://shopify/ProductVariant/1",
  title: "Default Title",
  barcode: "0012345678905",
  sku: "CRIB-01",
  price: "49.00",
  availableForSale: true,
  image: null,
  product: { id: "gid://shopify/Product/9", title: "Crib sheet", status: "ACTIVE", featuredMedia: { preview: { image: { url: "https://cdn/x.jpg" } } } },
  ...overrides,
});

describe("barcode and SKU codes", () => {
  it("only lets safe codes into a search query", () => {
    expect(cleanCode(" 012345678905 ")).toBe("012345678905");
    expect(cleanCode('12" OR status:draft')).toBeNull();
    expect(cleanCode("")).toBeNull();
    expect(cleanCode("x".repeat(65))).toBeNull();
  });

  it("searches a UPC and its EAN form, since Shopify's barcode search is exact", () => {
    // Checked live 24 Oct 2026: barcode:012345678905 doesn't find 0012345678905.
    expect(barcodeForms("012345678905")).toEqual(["012345678905", "0012345678905"]);
    expect(barcodeForms("0012345678905")).toEqual(["0012345678905", "012345678905"]);
    expect(barcodeForms("CRIB-01")).toEqual(["CRIB-01"]);
    expect(searchTermsFor(["CRIB-01"])).toEqual(['barcode:"CRIB-01"', 'sku:"CRIB-01"']);
  });

  it("matches a variant by either barcode form or by SKU, ignoring SKU case", () => {
    const v = { barcode: "0012345678905", sku: "CRIB-01" };
    expect(variantMatchesCode(v, "012345678905")).toBe(true);
    expect(variantMatchesCode(v, "crib-01")).toBe(true);
    expect(variantMatchesCode(v, "999")).toBe(false);
  });
});

describe("findVariantsByCode", () => {
  it("returns active products only, with the product's image as a fallback", async () => {
    const { fn } = graphql({
      productVariants: {
        nodes: [node(), node({ id: "gid://shopify/ProductVariant/2", product: { ...node().product, status: "DRAFT" } })],
      },
    });
    const found = await findVariantsByCode("shop.myshopify.com", "012345678905", fn);
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ variantGid: "gid://shopify/ProductVariant/1", title: "Crib sheet", imageUrl: "https://cdn/x.jpg" });
  });

  it("doesn't search for an unsafe code at all", async () => {
    const { fn } = graphql({ productVariants: { nodes: [] } });
    expect(await findVariantsByCode("shop.myshopify.com", "a b", fn)).toEqual([]);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe("fetchVariantStock", () => {
  it("treats a Draft or Archived product as not for sale, whatever its inventory says", async () => {
    const v = (n: number, status: string) => ({ id: `gid://shopify/ProductVariant/${n}`, availableForSale: true, product: { status } });
    const { fn } = graphql({ nodes: [v(1, "DRAFT"), v(2, "ARCHIVED"), v(3, "ACTIVE"), v(4, "UNLISTED")] });
    const stock = await fetchVariantStock("shop.myshopify.com", [1, 2, 3, 4].map((n) => `gid://shopify/ProductVariant/${n}`), fn);
    expect([1, 2, 3, 4].map((n) => stock?.get(`gid://shopify/ProductVariant/${n}`))).toEqual([false, false, true, true]);
  });

  it("reads availableForSale per variant", async () => {
    const { fn } = graphql({ nodes: [{ id: "gid://shopify/ProductVariant/1", availableForSale: false }, null] });
    const stock = await fetchVariantStock("shop.myshopify.com", ["gid://shopify/ProductVariant/1", "gid://shopify/ProductVariant/2"], fn);
    expect(stock?.get("gid://shopify/ProductVariant/1")).toBe(false);
    expect(stock?.has("gid://shopify/ProductVariant/2")).toBe(false);
  });

  it("fails soft to null so the page still renders", async () => {
    const fn = vi.fn(async () => new Response(JSON.stringify({ errors: [{ message: "Throttled" }] })));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await fetchVariantStock("shop.myshopify.com", ["gid://shopify/ProductVariant/1"], fn)).toBeNull();
  });
});
