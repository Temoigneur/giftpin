import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * attributeOrder() decides ship-to-registrant from the registry's setting when
 * the order arrives, not only from the cart line's `_rg_ship` flag. The live
 * test on 25 Sep 2026 (order 7317031420053) had no flag on the line because it
 * went into the cart before the registrant saved an address, so the address
 * was never rewritten.
 */

const graphql = vi.fn();

vi.mock("../../db.server", () => ({
  default: {
    shop: { findUnique: vi.fn() },
    registryItem: { findFirst: vi.fn() },
    registry: { findUnique: vi.fn() },
    $transaction: vi.fn(async () => undefined),
  },
}));
vi.mock("../../shopify.server", () => ({ unauthenticated: { admin: vi.fn(async () => ({ admin: { graphql } })) } }));
vi.mock("../../lib/queue.server", () => ({ registerHandler: vi.fn() }));
vi.mock("../../lib/email.server", () => ({ sendEmail: vi.fn() }));
vi.mock("../../lib/audit.server", () => ({ audit: vi.fn() }));
vi.mock("../registry.server", async (orig) => ({
  ...(await orig<typeof import("../registry.server")>()),
  logEvent: vi.fn(),
  touchRegistry: vi.fn(async () => undefined),
}));

import db from "../../db.server";
import { attributeOrder } from "../purchase.server";
import { signAttribution } from "../../lib/attribution";
import { encrypt } from "../../lib/crypto.server";

const ADDRESS = { firstName: "Maya", lastName: "Chen", address1: "1 Main St", city: "Toronto", provinceCode: "ON", countryCode: "CA", zip: "M5V 1A1" };

function registry(shipToRegistrant: boolean) {
  return {
    id: "reg_1",
    title: "Maya & Jared",
    eventDate: null,
    registrants: [],
    shipToRegistrant,
    shippingAddressEnc: shipToRegistrant ? encrypt(JSON.stringify(ADDRESS)) : null,
  };
}

function order(lines: { itemId: string; ship?: boolean }[]) {
  return {
    id: 1,
    admin_graphql_api_id: "gid://shopify/Order/1",
    line_items: lines.map((l, n) => ({
      id: 100 + n,
      quantity: 1,
      price: "10.00",
      properties: [
        { name: "_rg", value: signAttribution("reg_1", l.itemId) },
        ...(l.ship ? [{ name: "_rg_ship", value: "1" }] : []),
      ],
    })),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(db.shop.findUnique).mockResolvedValue({ id: "shop_1", currency: "CAD", settings: {} } as never);
  graphql
    .mockResolvedValueOnce({ json: async () => ({ data: { order: { displayFulfillmentStatus: "UNFULFILLED", shippingAddress: { provinceCode: "ON", countryCodeV2: "CA" } } } }) })
    .mockResolvedValueOnce({ json: async () => ({ data: { orderUpdate: { userErrors: [] } } }) });
});

describe("attributeOrder ship-to-registrant", () => {
  it("rewrites the address when the registry has it on, even without the cart flag", async () => {
    const reg = registry(true);
    vi.mocked(db.registryItem.findFirst).mockResolvedValue({ id: "item_1", registry: reg, desiredQty: 1 } as never);
    vi.mocked(db.registry.findUnique).mockResolvedValue(reg as never);

    await attributeOrder("shop.myshopify.com", order([{ itemId: "item_1" }]));

    expect(graphql).toHaveBeenCalledTimes(2);
    expect(graphql.mock.calls[1][1].variables.input.shippingAddress).toEqual(ADDRESS);
  });

  it("rewrites once per order, not once per registry line", async () => {
    const reg = registry(true);
    vi.mocked(db.registryItem.findFirst)
      .mockResolvedValueOnce({ id: "item_1", registry: reg, desiredQty: 1 } as never)
      .mockResolvedValueOnce({ id: "item_2", registry: reg, desiredQty: 1 } as never);
    vi.mocked(db.registry.findUnique).mockResolvedValue(reg as never);

    await attributeOrder("shop.myshopify.com", order([{ itemId: "item_1" }, { itemId: "item_2" }]));

    expect(graphql).toHaveBeenCalledTimes(2); // one status query + one orderUpdate
  });

  it("leaves the order alone when the registry has it off", async () => {
    vi.mocked(db.registryItem.findFirst).mockResolvedValue({ id: "item_1", registry: registry(false), desiredQty: 1 } as never);

    await attributeOrder("shop.myshopify.com", order([{ itemId: "item_1" }]));

    expect(graphql).not.toHaveBeenCalled();
  });
});
