import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * attributeOrder() rewrites the shipping address only when the guest chose it
 * (the registry page's box sets `_rg_ship` on the cart line) and the
 * registrant still has ship-to-registrant on. Ben, 25 Sep 2026: a guest may
 * want the gift at their own door, so the app never overrides them silently.
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
  it("rewrites the address when the guest left the box ticked", async () => {
    const reg = registry(true);
    vi.mocked(db.registryItem.findFirst).mockResolvedValue({ id: "item_1", registry: reg, desiredQty: 1 } as never);
    vi.mocked(db.registry.findUnique).mockResolvedValue(reg as never);

    await attributeOrder("shop.myshopify.com", order([{ itemId: "item_1", ship: true }]));

    expect(graphql).toHaveBeenCalledTimes(2);
    expect(graphql.mock.calls[1][1].variables.input.shippingAddress).toEqual(ADDRESS);
  });

  it("keeps the guest's own address when they unticked the box", async () => {
    vi.mocked(db.registryItem.findFirst).mockResolvedValue({ id: "item_1", registry: registry(true), desiredQty: 1 } as never);

    await attributeOrder("shop.myshopify.com", order([{ itemId: "item_1" }]));

    expect(graphql).not.toHaveBeenCalled();
  });

  it("rewrites once per order, not once per registry line", async () => {
    const reg = registry(true);
    vi.mocked(db.registryItem.findFirst)
      .mockResolvedValueOnce({ id: "item_1", registry: reg, desiredQty: 1 } as never)
      .mockResolvedValueOnce({ id: "item_2", registry: reg, desiredQty: 1 } as never);
    vi.mocked(db.registry.findUnique).mockResolvedValue(reg as never);

    await attributeOrder("shop.myshopify.com", order([{ itemId: "item_1", ship: true }, { itemId: "item_2", ship: true }]));

    expect(graphql).toHaveBeenCalledTimes(2); // one status query + one orderUpdate
  });

  it("leaves the order alone when the registrant has since turned it off", async () => {
    vi.mocked(db.registryItem.findFirst).mockResolvedValue({ id: "item_1", registry: registry(false), desiredQty: 1 } as never);

    await attributeOrder("shop.myshopify.com", order([{ itemId: "item_1", ship: true }]));

    expect(graphql).not.toHaveBeenCalled();
  });
});
