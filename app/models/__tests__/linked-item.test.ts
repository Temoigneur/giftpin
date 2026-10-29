import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * addLinkedItem — the paste box's add step (25 Sep 2026). Stores what the
 * registrant confirmed, the same way the browser extension does, so a store
 * that blocks our page read still ends up with a proper item on the list.
 */

const registryFind = vi.fn();
const itemCreate = vi.fn();
const enqueue = vi.fn();

vi.mock("../../db.server", () => ({
  default: {
    registry: { findUnique: registryFind, update: vi.fn().mockResolvedValue({ version: 2 }) },
    registryItem: { create: itemCreate, findFirst: vi.fn(), update: vi.fn() },
    registryEvent: { create: vi.fn() },
  },
}));
vi.mock("../../lib/queue.server", () => ({ enqueue, registerHandler: vi.fn() }));
vi.mock("../../lib/cache.server", () => ({ cache: () => ({ del: async () => {} }), registryCacheKey: (id: string, v: number) => `${id}:${v}` }));

const { addLinkedItem, addNamedItem } = await import("../item.server");

const registry = (over: Record<string, unknown> = {}) => ({
  id: "reg_1",
  shop: { domain: "maple.myshopify.com", currency: "CAD", settings: {} },
  items: [] as { sourceType: string; externalUrl: string | null }[],
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  registryFind.mockResolvedValue(registry());
  itemCreate.mockImplementation(async ({ data }) => ({ id: "item_new", ...data }));
});

describe("addLinkedItem", () => {
  it("stores the confirmed title, photo, price and canonical link", async () => {
    const r = await addLinkedItem({
      registryId: "reg_1",
      url: "https://williams-sonoma.ca/products/le-creuset-signature-fry-pan?utm_source=google",
      title: "Le Creuset Signature Fry Pan",
      imageUrl: "https://assets.example/pan.jpg",
      price: "189.95",
      note: "grey or purple is fine",
    });
    expect(r.duplicate).toBe(false);
    const data = itemCreate.mock.calls[0][0].data;
    expect(data).toMatchObject({
      sourceType: "manual",
      snapshotTitle: "Le Creuset Signature Fry Pan",
      snapshotImageUrl: "https://assets.example/pan.jpg",
      snapshotPrice: "189.95",
      snapshotCurrency: "CAD",
      note: "grey or purple is fine",
    });
    expect(data.externalUrl).toContain("williams-sonoma.ca/products/le-creuset-signature-fry-pan");
    expect(data.externalUrl).not.toContain("utm_source");
  });

  it("records a store match found at look-up, so guests can see it straight away", async () => {
    await addLinkedItem({
      registryId: "reg_1", url: "https://sportchek.ca/p/kit.html", title: "Snowboard kit",
      storeMatch: { storeMatchStatus: "kept", storeMatchProductGid: "gid://shopify/Product/1", storeMatchVariantGid: "gid://shopify/ProductVariant/1", storeMatchTitle: "Shreddy Board", storeMatchHandle: "shreddy" },
    });
    expect(itemCreate.mock.calls[0][0].data).toMatchObject({ storeMatchStatus: "kept", storeMatchHandle: "shreddy" });
  });

  it("drops a non-https photo", async () => {
    await addLinkedItem({ registryId: "reg_1", url: "https://x.example/p", title: "Vase", imageUrl: "javascript:alert(1)" });
    expect(itemCreate.mock.calls[0][0].data.snapshotImageUrl).toBeNull();
  });

  it("reports a link that is already on the list instead of adding it again", async () => {
    registryFind.mockResolvedValue(registry({ items: [{ id: "old", sourceType: "manual", externalUrl: "https://x.example/p" }] }));
    const r = await addLinkedItem({ registryId: "reg_1", url: "https://x.example/p?utm_source=a", title: "Vase" });
    expect(r.duplicate).toBe(true);
    expect(itemCreate).not.toHaveBeenCalled();
  });

  it("respects a store that only allows its own products", async () => {
    registryFind.mockResolvedValue(registry({ shop: { domain: "maple.myshopify.com", currency: "CAD", settings: { externalItems: "off" } } }));
    await expect(addLinkedItem({ registryId: "reg_1", url: "https://x.example/p", title: "Vase" })).rejects.toThrow(/own collection/);
    expect(itemCreate).not.toHaveBeenCalled();
  });

  it("needs a name", async () => {
    await expect(addLinkedItem({ registryId: "reg_1", url: "https://x.example/p", title: "  " })).rejects.toThrow(/name/);
  });
});

/** addNamedItem — an experience idea from the manage page's ideas guide (29 Oct 2026). */
describe("addNamedItem", () => {
  it("adds an experience by name, with no link needed", async () => {
    await addNamedItem({ registryId: "reg_1", title: "Hot air balloon ride", price: "250", currency: "CAD" });
    expect(itemCreate.mock.calls[0][0].data).toMatchObject({
      sourceType: "manual",
      snapshotTitle: "Hot air balloon ride",
      externalUrl: null,
      snapshotPrice: "250",
    });
  });

  it("keeps a booking link when there is one", async () => {
    await addNamedItem({ registryId: "reg_1", title: "Cooking class", url: "https://cookschool.example/gift?utm_source=x" });
    expect(itemCreate.mock.calls[0][0].data.externalUrl).toBe("https://cookschool.example/gift");
  });

  it("respects a store that only allows its own products", async () => {
    registryFind.mockResolvedValue(registry({ shop: { domain: "maple.myshopify.com", currency: "CAD", settings: { externalItems: "off" } } }));
    await expect(addNamedItem({ registryId: "reg_1", title: "Spa day" })).rejects.toThrow(/own collection/);
    expect(itemCreate).not.toHaveBeenCalled();
  });

  it("respects the store's cap on outside items", async () => {
    registryFind.mockResolvedValue(registry({
      shop: { domain: "maple.myshopify.com", currency: "CAD", settings: { externalItems: "capped", externalItemsCapPercent: 50 } },
      items: [{ sourceType: "manual", externalUrl: null }],
    }));
    await expect(addNamedItem({ registryId: "reg_1", title: "Spa day" })).rejects.toThrow(/mostly items from elsewhere/);
  });
});
