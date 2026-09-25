import { describe, it, expect, vi, beforeEach } from "vitest";
import { encrypt } from "../../lib/crypto.server";

/**
 * applyShipToRegistrant() rewrites a real order's shipping address, so a bug
 * here either mails a gift to the buyer instead of the registrant, or (worse)
 * silently skips the recalculation of tax. Both are money bugs, not cosmetic
 * ones — see the guardrail comments in purchase.server.ts.
 *
 * db.server and shopify.server are mocked so this stays a fast unit test:
 * shopify.server.ts constructs a real shopifyApp() at import time, which
 * needs real API credentials outside this test run.
 */

vi.mock("../../db.server", () => ({
  default: {
    registry: { findUnique: vi.fn() },
  },
}));

vi.mock("../../shopify.server", () => ({
  unauthenticated: { admin: vi.fn() },
}));

import db from "../../db.server";
import { applyShipToRegistrant } from "../purchase.server";

const mockedFindUnique = vi.mocked(db.registry.findUnique);

// The shape the manage page's form saves (app/shared/shipping-address.ts).
const ADDRESS = {
  firstName: "Maya",
  lastName: "Chen",
  address1: "1 Main St",
  city: "Toronto",
  provinceCode: "ON",
  countryCode: "CA",
  zip: "M5V 1A1",
};

function registryRow(overrides: Partial<{ shipToRegistrant: boolean; shippingAddressEnc: string | null }> = {}) {
  return {
    id: "reg_1",
    shipToRegistrant: true,
    shippingAddressEnc: encrypt(JSON.stringify(ADDRESS)),
    ...overrides,
  };
}

function jsonResponse(body: unknown): Response {
  return { json: async () => body } as Response;
}

beforeEach(() => {
  mockedFindUnique.mockReset();
});

describe("applyShipToRegistrant", () => {
  it("rewrites the address on a paid, unfulfilled order in the same province", async () => {
    mockedFindUnique.mockResolvedValue(registryRow() as never);

    const graphql = vi
      .fn()
      // 1: status query
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            order: {
              displayFulfillmentStatus: "UNFULFILLED",
              shippingAddress: { provinceCode: "ON", countryCodeV2: "CA" },
            },
          },
        }),
      )
      // 2: orderUpdate mutation
      .mockResolvedValueOnce(jsonResponse({ data: { orderUpdate: { userErrors: [] } } }));

    const result = await applyShipToRegistrant(graphql, "gid://shopify/Order/1", "reg_1");

    expect(result).toEqual({ applied: true });
    expect(graphql).toHaveBeenCalledTimes(2);

    // The mutation must carry the registrant's address, not touch billing.
    const [mutationQuery, mutationOptions] = graphql.mock.calls[1];
    expect(mutationQuery).toContain("orderUpdate");
    expect(mutationOptions.variables.input).toMatchObject({
      id: "gid://shopify/Order/1",
      shippingAddress: ADDRESS,
    });
  });

  it("does not rewrite when ship-to-registrant was never turned on", async () => {
    mockedFindUnique.mockResolvedValue(registryRow({ shipToRegistrant: false }) as never);
    const graphql = vi.fn();

    const result = await applyShipToRegistrant(graphql, "gid://shopify/Order/1", "reg_1");

    expect(result).toEqual({ applied: false, reason: "not_enabled" });
    expect(graphql).not.toHaveBeenCalled();
  });

  it("does not rewrite when no address was ever saved", async () => {
    mockedFindUnique.mockResolvedValue(registryRow({ shippingAddressEnc: null }) as never);
    const graphql = vi.fn();

    const result = await applyShipToRegistrant(graphql, "gid://shopify/Order/1", "reg_1");

    expect(result).toEqual({ applied: false, reason: "no_address" });
    expect(graphql).not.toHaveBeenCalled();
  });

  it("refuses once anything has shipped — tax would silently not recalculate", async () => {
    mockedFindUnique.mockResolvedValue(registryRow() as never);

    const graphql = vi.fn().mockResolvedValueOnce(
      jsonResponse({
        data: {
          order: {
            displayFulfillmentStatus: "PARTIAL",
            shippingAddress: { provinceCode: "ON" },
          },
        },
      }),
    );

    const result = await applyShipToRegistrant(graphql, "gid://shopify/Order/1", "reg_1");

    // Only the status query should fire — the mutation is never attempted.
    expect(result).toEqual({ applied: false, reason: "already_fulfilled" });
    expect(graphql).toHaveBeenCalledTimes(1);
  });

  it("refuses a cross-jurisdiction move — this is where the money actually changes", async () => {
    mockedFindUnique.mockResolvedValue(registryRow() as never); // registrant is in ON

    const graphql = vi.fn().mockResolvedValueOnce(
      jsonResponse({
        data: {
          order: {
            displayFulfillmentStatus: "UNFULFILLED",
            shippingAddress: { provinceCode: "BC" }, // buyer checked out from BC
          },
        },
      }),
    );

    const result = await applyShipToRegistrant(graphql, "gid://shopify/Order/1", "reg_1");

    expect(result).toEqual({ applied: false, reason: "cross_jurisdiction" });
    expect(graphql).toHaveBeenCalledTimes(1);
  });

  it("refuses a cross-border move even when neither side has a province", async () => {
    mockedFindUnique.mockResolvedValue(
      registryRow({
        shippingAddressEnc: encrypt(JSON.stringify({ ...ADDRESS, provinceCode: undefined, countryCode: "GB" })),
      }) as never,
    );

    const graphql = vi.fn().mockResolvedValueOnce(
      jsonResponse({
        data: {
          order: { displayFulfillmentStatus: "UNFULFILLED", shippingAddress: { countryCodeV2: "IE" } },
        },
      }),
    );

    const result = await applyShipToRegistrant(graphql, "gid://shopify/Order/1", "reg_1");

    expect(result).toEqual({ applied: false, reason: "cross_jurisdiction" });
    expect(graphql).toHaveBeenCalledTimes(1);
  });

  it("sends countryCode (the input field name) for an address saved with the old countryCodeV2 key", async () => {
    const legacy = { address1: "1 Main St", city: "Toronto", provinceCode: "ON", countryCodeV2: "CA" };
    mockedFindUnique.mockResolvedValue(
      registryRow({ shippingAddressEnc: encrypt(JSON.stringify(legacy)) }) as never,
    );

    const graphql = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            order: { displayFulfillmentStatus: "UNFULFILLED", shippingAddress: { provinceCode: "ON", countryCodeV2: "CA" } },
          },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ data: { orderUpdate: { userErrors: [] } } }));

    await applyShipToRegistrant(graphql, "gid://shopify/Order/1", "reg_1");

    expect(graphql.mock.calls[1][1].variables.input.shippingAddress).toEqual({
      address1: "1 Main St",
      city: "Toronto",
      provinceCode: "ON",
      countryCode: "CA",
    });
  });

  it("surfaces userErrors from the mutation instead of reporting false success", async () => {
    mockedFindUnique.mockResolvedValue(registryRow() as never);

    const graphql = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            order: { displayFulfillmentStatus: "UNFULFILLED", shippingAddress: { provinceCode: "ON" } },
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: { orderUpdate: { userErrors: [{ field: ["shippingAddress"], message: "Invalid zip" }] } },
        }),
      );

    const result = await applyShipToRegistrant(graphql, "gid://shopify/Order/1", "reg_1");

    expect(result).toEqual({ applied: false, reason: "Invalid zip" });
  });

  it("does not rewrite when the order can't be found", async () => {
    mockedFindUnique.mockResolvedValue(registryRow() as never);
    const graphql = vi.fn().mockResolvedValueOnce(jsonResponse({ data: {} }));

    const result = await applyShipToRegistrant(graphql, "gid://shopify/Order/1", "reg_1");

    expect(result).toEqual({ applied: false, reason: "order_not_found" });
  });
});
