import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * In-store registry mode (Pro). The pieces worth pinning down: what a staff
 * search turns into, that a held item never reads as available at the
 * counter (CLAUDE.md hard rule #5), that POS gets the real app-signed `_rg`
 * token, and that staff-created registries email the customer, not staff.
 */

vi.mock("../../db.server", () => ({
  default: {
    registry: { findMany: vi.fn(), create: vi.fn() },
    registryItem: { findFirst: vi.fn() },
    registryEvent: { create: vi.fn() },
  },
}));

vi.mock("../../lib/email.server", () => ({ sendEmail: vi.fn() }));
vi.mock("../flow.server", () => ({ queueFlowTrigger: vi.fn() }));

import db from "../../db.server";
import { sendEmail } from "../../lib/email.server";
import { blindIndex } from "../../lib/crypto.server";
import { verifyAttribution } from "../../lib/attribution";
import {
  createRegistryInStore,
  parseStaffQuery,
  posLineProperties,
  searchRegistriesForStaff,
  toStaffItem,
} from "../instore.server";
import type { DisplayItem } from "../item.server";

beforeEach(() => vi.clearAllMocks());

describe("parseStaffQuery", () => {
  it("treats blank input as no search", () => {
    expect(parseStaffQuery("  ")).toEqual({ kind: "empty" });
    expect(parseStaffQuery(null)).toEqual({ kind: "empty" });
  });

  it("recognises an email, lowercased", () => {
    expect(parseStaffQuery(" Sam@Example.com ")).toEqual({ kind: "email", email: "sam@example.com" });
  });

  it("reduces a pasted registry link to its slug", () => {
    expect(parseStaffQuery("https://shop.example/apps/registry/r/abc_123?pw=x")).toEqual({
      kind: "text",
      text: "abc_123",
    });
  });

  it("passes names through", () => {
    expect(parseStaffQuery("Sam Lee")).toEqual({ kind: "text", text: "Sam Lee" });
  });
});

describe("searchRegistriesForStaff", () => {
  it("does not query for an empty search", async () => {
    expect(await searchRegistriesForStaff("shop_1", "")).toEqual([]);
    expect(db.registry.findMany).not.toHaveBeenCalled();
  });

  it("searches email through the blind index, never plaintext", async () => {
    vi.mocked(db.registry.findMany).mockResolvedValue([]);
    await searchRegistriesForStaff("shop_1", "sam@example.com");
    const where = vi.mocked(db.registry.findMany).mock.calls[0][0]!.where;
    expect(where).toMatchObject({
      shopId: "shop_1",
      status: "active",
      registrants: { some: { emailHash: blindIndex("sam@example.com") } },
    });
    expect(JSON.stringify(where)).not.toContain("sam@example.com");
  });

  it("scopes to the shop and summarises progress", async () => {
    vi.mocked(db.registry.findMany).mockResolvedValue([
      {
        id: "reg_1",
        slug: "abc",
        title: "Sam & Alex",
        eventType: "wedding",
        eventDate: new Date("2026-10-10T00:00:00Z"),
        registrants: [{ name: "Sam" }, { name: "Alex" }],
        items: [
          { desiredQty: 2, purchasedQty: 1 },
          { desiredQty: 1, purchasedQty: 1 },
        ],
      },
    ] as never);
    const [row] = await searchRegistriesForStaff("shop_1", "sam");
    expect(vi.mocked(db.registry.findMany).mock.calls[0][0]!.where).toMatchObject({ shopId: "shop_1" });
    expect(row).toMatchObject({ names: "Sam & Alex", eventDate: "2026-10-10", itemsLeft: 1, wanted: 3, bought: 2 });
  });
});

function display(overrides: Partial<DisplayItem>): DisplayItem {
  return {
    id: "item_1",
    sourceType: "internal",
    title: "Kettle",
    imageUrl: null,
    price: 50,
    currency: "CAD",
    desiredQty: 1,
    purchasedQty: 0,
    claimedQty: 0,
    remainingQty: 1,
    note: null,
    category: null,
    storeMatch: null,
    variantGid: "gid://shopify/ProductVariant/456",
    externalUrl: null,
    externalDomain: null,
    isExternal: false,
    isStale: false,
    availability: "unknown",
    fulfilled: false,
    ...overrides,
  };
}

describe("toStaffItem", () => {
  it("lets POS sell a still-wanted item from this store", () => {
    expect(toStaffItem(display({}))).toMatchObject({ sellable: true, variantId: 456 });
  });

  it("does not sell an item a guest is holding", () => {
    const item = toStaffItem(display({ claimedQty: 1, remainingQty: 0 }));
    expect(item.sellable).toBe(false);
    expect(item.remainingQty).toBe(0);
  });

  it("does not sell a bought item or one from another store", () => {
    expect(toStaffItem(display({ purchasedQty: 1, remainingQty: 0 })).sellable).toBe(false);
    expect(
      toStaffItem(display({ sourceType: "web", variantGid: null, externalDomain: "example.com" })).sellable,
    ).toBe(false);
  });
});

describe("posLineProperties", () => {
  it("returns a `_rg` token the real verifier accepts, and no ship flag", async () => {
    vi.mocked(db.registryItem.findFirst).mockResolvedValue({
      id: "item_1",
      registryId: "reg_1",
      variantGid: "gid://shopify/ProductVariant/456",
    } as never);

    const line = await posLineProperties("shop_1", "item_1");
    expect(line?.variantId).toBe(456);
    expect(verifyAttribution(line?.properties._rg)).toEqual({ r: "reg_1", i: "item_1" });
    expect(line?.properties._rg_ship).toBeUndefined();
    expect(vi.mocked(db.registryItem.findFirst).mock.calls[0][0]!.where).toMatchObject({
      id: "item_1",
      sourceType: "internal",
      registry: { shopId: "shop_1", status: "active" },
    });
  });

  it("returns null for an item that isn't this shop's", async () => {
    vi.mocked(db.registryItem.findFirst).mockResolvedValue(null);
    expect(await posLineProperties("shop_1", "nope")).toBeNull();
  });
});

describe("createRegistryInStore", () => {
  const shop = { id: "shop_1", domain: "demo.myshopify.com" };

  it("rejects missing details without writing", async () => {
    const result = await createRegistryInStore(shop, { title: "x", registrantName: "Sam", registrantEmail: "nope" }, "pos");
    expect(result.ok).toBe(false);
    expect(db.registry.create).not.toHaveBeenCalled();
  });

  it("creates the registry and emails the manage link to the customer", async () => {
    vi.mocked(db.registry.create).mockResolvedValue({ id: "reg_1", slug: "abc", title: "Sam & Alex" } as never);

    const result = await createRegistryInStore(
      shop,
      {
        title: "Sam & Alex",
        registrantName: "Sam",
        registrantEmail: "sam@example.com",
        eventType: "not-a-type",
        eventDate: "2026-10-10",
      },
      "pos",
    );

    expect(result).toEqual({
      ok: true,
      registryId: "reg_1",
      slug: "abc",
      title: "Sam & Alex",
      publicUrl: "https://demo.myshopify.com/apps/registry/r/abc",
    });
    expect(vi.mocked(db.registry.create).mock.calls[0][0].data).toMatchObject({
      shopId: "shop_1",
      eventType: "other",
      eventDate: new Date("2026-10-10T00:00:00Z"),
    });
    expect(sendEmail).toHaveBeenCalledWith(
      "registry-link",
      "sam@example.com",
      expect.objectContaining({ url: expect.stringContaining("https://demo.myshopify.com/apps/registry/manage?t=") }),
    );
    // The manage link is the customer's credential; staff only get the guest page.
    expect(JSON.stringify(result)).not.toContain("manage");
  });
});
