import { describe, it, expect, vi, beforeEach } from "vitest";

const graphql = vi.fn();
const findFirst = vi.fn();
const update = vi.fn();
const addInternalItem = vi.fn();
const removeItem = vi.fn();

vi.mock("../../db.server", () => ({ default: { registryItem: { findFirst, findUnique: vi.fn(), update } } }));
vi.mock("../../shopify.server", () => ({ unauthenticated: { admin: async () => ({ admin: { graphql } }) } }));
vi.mock("../queue.server", () => ({ registerHandler: vi.fn() }));
vi.mock("../../models/item.server", () => {
  class ItemError extends Error {}
  return { addInternalItem, removeItem, ItemError };
});

const { getMatchPreview, applyMatchChoice } = await import("../store-match.server");

const reply = (data: unknown) => ({ json: async () => data });
const item = (over: Record<string, unknown> = {}) => ({
  id: "i1", registryId: "r1", desiredQty: 1, note: null, purchasedQty: 0, purchases: [],
  storeMatchStatus: "suggested", storeMatchTitle: "snowboard", storeMatchProductGid: null, storeMatchVariantGid: null,
  registry: { shop: { domain: "s.myshopify.com", currency: "CAD" } },
  ...over,
});
const node = (n: number) => ({
  id: `gid://shopify/Product/${n}`, title: `Snowboard ${n}`, handle: `board-${n}`,
  featuredMedia: { preview: { image: { url: "https://cdn.example/x.png" } } },
  variants: { nodes: [{ id: `gid://shopify/ProductVariant/${n}`, price: "699.95" }] },
});

beforeEach(() => vi.clearAllMocks());

describe("getMatchPreview", () => {
  it("returns the store's products of that kind for a category suggestion", async () => {
    findFirst.mockResolvedValue(item());
    graphql.mockResolvedValue(reply({ data: { products: { nodes: [node(1), node(2)] } } }));
    const p = await getMatchPreview("r1", "i1");
    expect(p.kind).toBe("search");
    expect(p.products).toHaveLength(2);
    expect(p.products[0]).toMatchObject({ title: "Snowboard 1", handle: "board-1", imageUrl: "https://cdn.example/x.png" });
    expect(p.products[0].price).toContain("699.95");
    expect(graphql.mock.calls[0][1].variables.query).toBe("status:active AND snowboard");
  });

  it("drops products that only mention the word in their description (the gift card)", async () => {
    findFirst.mockResolvedValue(item());
    const giftCard = { ...node(9), title: "Gift Card", productType: "giftcard" };
    graphql.mockResolvedValue(reply({ data: { products: { nodes: [giftCard, node(1), { ...node(2), title: "Wax", productType: "Snowboards" }] } } }));
    const p = await getMatchPreview("r1", "i1");
    expect(p.products.map((x) => x.title)).toEqual(["Snowboard 1", "Wax"]);
  });

  it("only sends a clean word into the search query", async () => {
    findFirst.mockResolvedValue(item({ storeMatchTitle: 'snow" OR status:draft' }));
    graphql.mockResolvedValue(reply({ data: { products: { nodes: [] } } }));
    await getMatchPreview("r1", "i1");
    expect(graphql.mock.calls[0][1].variables.query).toBe("status:active AND snoworstatusdraft");
  });

  it("never hands the browser a non-https image address", async () => {
    findFirst.mockResolvedValue(item());
    const bad = { ...node(1), featuredMedia: { preview: { image: { url: "javascript:alert(1)" } } } };
    graphql.mockResolvedValue(reply({ data: { products: { nodes: [bad] } } }));
    expect((await getMatchPreview("r1", "i1")).products[0].imageUrl).toBeNull();
  });

  it("shows the one suggested product for a product match", async () => {
    findFirst.mockResolvedValue(item({ storeMatchTitle: "Snowboard 5", storeMatchProductGid: "gid://shopify/Product/5" }));
    graphql.mockResolvedValue(reply({ data: { product: { ...node(5), status: "ACTIVE" } } }));
    const p = await getMatchPreview("r1", "i1");
    expect(p.kind).toBe("product");
    expect(p.products).toHaveLength(1);
  });

  it("refuses when there is no suggestion, and surfaces search errors instead of an empty list", async () => {
    findFirst.mockResolvedValue(item({ storeMatchStatus: "none" }));
    await expect(getMatchPreview("r1", "i1")).rejects.toThrow();
    findFirst.mockResolvedValue(item());
    graphql.mockResolvedValue(reply({ errors: [{ message: "Access denied" }] }));
    await expect(getMatchPreview("r1", "i1")).rejects.toThrow(/preview failed/);
  });
});

describe("applyMatchChoice swap", () => {
  it("swaps to the product the registrant picked from a category suggestion", async () => {
    findFirst.mockResolvedValue(item());
    graphql.mockResolvedValue(reply({ data: { product: { ...node(7), status: "ACTIVE" } } }));
    addInternalItem.mockResolvedValue({ item: {}, duplicate: false });
    await applyMatchChoice({ registryId: "r1", itemId: "i1", action: "swap", productGid: "gid://shopify/Product/7" });
    expect(addInternalItem).toHaveBeenCalledWith(expect.objectContaining({ productGid: "gid://shopify/Product/7", variantGid: "gid://shopify/ProductVariant/7" }));
    expect(removeItem).toHaveBeenCalledWith("i1", "r1");
  });

  it("rejects a malformed product id, and a swap with nothing chosen", async () => {
    findFirst.mockResolvedValue(item());
    await expect(applyMatchChoice({ registryId: "r1", itemId: "i1", action: "swap", productGid: "../../evil" })).rejects.toThrow();
    await expect(applyMatchChoice({ registryId: "r1", itemId: "i1", action: "swap" })).rejects.toThrow();
    expect(addInternalItem).not.toHaveBeenCalled();
  });

  it("does not swap to a product that is no longer active", async () => {
    findFirst.mockResolvedValue(item());
    graphql.mockResolvedValue(reply({ data: { product: { ...node(7), status: "ARCHIVED" } } }));
    await expect(applyMatchChoice({ registryId: "r1", itemId: "i1", action: "swap", productGid: "gid://shopify/Product/7" })).rejects.toThrow();
    expect(removeItem).not.toHaveBeenCalled();
  });

  it("refuses to swap something that has been bought", async () => {
    findFirst.mockResolvedValue(item({ purchasedQty: 1 }));
    await expect(applyMatchChoice({ registryId: "r1", itemId: "i1", action: "swap", productGid: "gid://shopify/Product/7" })).rejects.toThrow(/already bought/);
    expect(removeItem).not.toHaveBeenCalled();
  });
});
