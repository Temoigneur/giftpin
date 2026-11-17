import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Linked stores (multi-store registries, store-group.server.ts): an order on
 * store B may credit an item on a registry homed on store A, but only an item
 * store B sells (RegistryItem.sourceShopId = B). The Purchase row records the
 * selling store, which GDPR requests and refunds follow.
 */

const created: unknown[] = [];

vi.mock("../../db.server", () => ({
  default: {
    shop: { findUnique: vi.fn() },
    registryItem: { findFirst: vi.fn(), update: vi.fn() },
    registry: { findUnique: vi.fn() },
    purchase: {
      findFirst: vi.fn(async () => null),
      findMany: vi.fn(async () => []),
    },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        purchase: { create: vi.fn(async (args: unknown) => created.push(args)) },
        registryItem: { update: vi.fn() },
      }),
    ),
  },
}));
vi.mock("../../shopify.server", () => ({ unauthenticated: { admin: vi.fn() } }));
vi.mock("../../lib/queue.server", () => ({ registerHandler: vi.fn() }));
vi.mock("../../lib/email.server", () => ({ sendEmail: vi.fn() }));
vi.mock("../../lib/audit.server", () => ({ audit: vi.fn() }));
vi.mock("../flow.server", () => ({ queueFlowTrigger: vi.fn() }));
vi.mock("../gift-card-sale.server", () => ({ recordGiftCardSales: vi.fn(), voidGiftCardSales: vi.fn() }));
vi.mock("../registry.server", async (orig) => ({
  ...(await orig<typeof import("../registry.server")>()),
  logEvent: vi.fn(),
  touchRegistry: vi.fn(async () => undefined),
}));

import db from "../../db.server";
import { attributeOrder, voidPurchases } from "../purchase.server";
import { signAttribution } from "../../lib/attribution";

function order() {
  return {
    id: 1,
    admin_graphql_api_id: "gid://shopify/Order/1",
    currency: "USD",
    line_items: [
      { id: 100, quantity: 1, price: "25.00", properties: [{ name: "_rg", value: signAttribution("reg_1", "item_1") }] },
    ],
  };
}

function item(registryShopId: string) {
  return {
    id: "item_1",
    desiredQty: 1,
    sourceShopId: registryShopId === "shop_b" ? null : "shop_b",
    registry: {
      id: "reg_1",
      shopId: registryShopId,
      shop: { domain: `${registryShopId}.myshopify.com` },
      eventDate: null,
      registrants: [],
      shipToRegistrant: false,
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  created.length = 0;
  vi.mocked(db.shop.findUnique).mockResolvedValue({ id: "shop_b", currency: "USD", settings: {} } as never);
});

describe("attributeOrder across linked stores", () => {
  it("only looks for items the ordering store sells", async () => {
    vi.mocked(db.registryItem.findFirst).mockResolvedValue(null);
    await attributeOrder("shop_b.myshopify.com", order() as never);
    const where = vi.mocked(db.registryItem.findFirst).mock.calls[0][0]!.where!;
    expect(where).toMatchObject({ id: "item_1", registryId: "reg_1" });
    expect(where.OR).toEqual([
      { sourceShopId: null, registry: { shopId: "shop_b" } },
      { sourceShopId: "shop_b" },
    ]);
  });

  it("records the selling store on a sale into a linked store's registry", async () => {
    vi.mocked(db.registryItem.findFirst).mockResolvedValue(item("shop_a") as never);
    await attributeOrder("shop_b.myshopify.com", order() as never);
    expect(created).toHaveLength(1);
    expect((created[0] as { data: { shopId: string | null } }).data.shopId).toBe("shop_b");
  });

  it("leaves Purchase.shopId null on a sale on the registry's own store", async () => {
    vi.mocked(db.registryItem.findFirst).mockResolvedValue(item("shop_b") as never);
    await attributeOrder("shop_b.myshopify.com", order() as never);
    expect((created[0] as { data: { shopId: string | null } }).data.shopId).toBeNull();
  });
});

describe("voidPurchases across linked stores", () => {
  it("finds this store's own registries' purchases and the ones it sold into linked registries", async () => {
    await voidPurchases("shop_b.myshopify.com", "gid://shopify/Order/1", undefined, "refund");
    const where = vi.mocked(db.purchase.findMany).mock.calls[0][0]!.where!;
    expect(where.OR).toEqual([
      { shopId: null, item: { registry: { shop: { domain: "shop_b.myshopify.com" } } } },
      { shopId: "shop_b" },
    ]);
  });
});
