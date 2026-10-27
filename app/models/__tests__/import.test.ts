import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Registry import. What matters: bought counts survive the move (a gift
 * already given must never look available again, CLAUDE.md hard rule #5),
 * importing the same file twice makes no doubles, and an item that can't be
 * matched to exactly one product is reported rather than guessed.
 */

vi.mock("../../db.server", () => ({
  default: {
    registry: { findMany: vi.fn() },
    registryItem: { createMany: vi.fn() },
  },
}));
vi.mock("../../lib/email.server", () => ({ sendEmail: vi.fn() }));
vi.mock("../../lib/catalog.server", () => ({ findVariantsByCodes: vi.fn(), getVariant: vi.fn() }));
vi.mock("../registry.server", () => ({
  createRegistry: vi.fn(async (input: { title: string }) => ({ id: `reg_${input.title}`, title: input.title })),
  logEvent: vi.fn(),
  mintManageToken: vi.fn(() => "tok"),
}));

import db from "../../db.server";
import { sendEmail } from "../../lib/email.server";
import { findVariantsByCodes } from "../../lib/catalog.server";
import { createRegistry } from "../registry.server";
import { blindIndex } from "../../lib/crypto.server";
import { previewImport, runImport } from "../import.server";

const shop = { id: "shop_1", domain: "baby.myshopify.com", currency: "CAD" };
const variant = (id: string, sku: string) => ({
  variantGid: `gid://shopify/ProductVariant/${id}`,
  productGid: "gid://shopify/Product/1",
  title: sku,
  imageUrl: null,
  price: "20.00",
  availableForSale: true,
  barcode: null,
  sku,
});

const csv = [
  "Registry Name,Email,SKU,Quantity,Purchased,Event Date",
  "Baby Lee,jo@example.com,CRIB-01,1,3,2027-02-14",
  "Baby Lee,jo@example.com,GONE,1,0,2027-02-14",
  "Baby Lee,jo@example.com,TWIN,1,0,2027-02-14",
  "Old one,old@example.com,CRIB-01,1,0,2019-01-01",
].join("\n");

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(db.registry.findMany).mockResolvedValue([]);
  vi.mocked(findVariantsByCodes).mockResolvedValue(
    new Map([
      ["CRIB-01", [variant("1", "CRIB-01")]],
      // Two products share this code: ambiguous, so it's reported, not guessed.
      ["TWIN", [variant("2", "TWIN"), variant("3", "TWIN")]],
    ]),
  );
});

describe("registry import", () => {
  it("previews without writing anything", async () => {
    const plan = await previewImport(shop, csv, { recentOnly: true, emailRegistrants: false });
    expect(plan).toMatchObject({ registries: 1, items: 1, skippedOld: 1, skippedExisting: 0 });
    expect(plan.unmatched.map((u) => u.code)).toEqual(["GONE", "TWIN"]);
    expect(createRegistry).not.toHaveBeenCalled();
    expect(db.registryItem.createMany).not.toHaveBeenCalled();
  });

  it("keeps bought counts, never wanting fewer than were bought", async () => {
    const done = await runImport(shop, csv, { recentOnly: true, emailRegistrants: false });
    expect(done.created).toBe(1);
    const data = vi.mocked(db.registryItem.createMany).mock.calls[0][0]!.data as { desiredQty: number; purchasedQty: number }[];
    expect(data).toEqual([expect.objectContaining({ variantGid: "gid://shopify/ProductVariant/1", purchasedQty: 3, desiredQty: 3 })]);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("skips registries already in Giftpin, so a second import makes no doubles", async () => {
    vi.mocked(db.registry.findMany).mockResolvedValue([
      { title: "Baby Lee", registrants: [{ emailHash: blindIndex("jo@example.com") }] },
    ] as never);
    const done = await runImport(shop, csv, { recentOnly: true, emailRegistrants: true });
    expect(done).toMatchObject({ created: 0, skippedExisting: 1 });
    expect(createRegistry).not.toHaveBeenCalled();
  });

  it("emails registrants their link only when asked", async () => {
    const done = await runImport(shop, csv, { recentOnly: false, emailRegistrants: true });
    expect(done.created).toBe(2);
    expect(sendEmail).toHaveBeenCalledWith(
      "registry-link",
      "jo@example.com",
      expect.objectContaining({ url: "https://baby.myshopify.com/apps/registry/manage?t=tok" }),
    );
  });
});
