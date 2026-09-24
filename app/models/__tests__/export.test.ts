import { describe, it, expect, vi } from "vitest";

vi.mock("../../db.server", () => ({ default: {} }));

import {
  mintExportToken,
  readExportToken,
  registriesCsv,
  purchasesCsv,
  salesCsv,
  type PurchaseExportRow,
} from "../export.server";
import { signToken } from "../../lib/crypto.server";

const lines = (csv: string) => csv.replace(/^\uFEFF/, "").split("\r\n");

describe("export links", () => {
  it("round-trips shop and kind", () => {
    expect(readExportToken(mintExportToken("shop_1", "purchases"))).toEqual({ shopId: "shop_1", kind: "purchases" });
  });

  it("rejects tampered, foreign-purpose, unknown-kind and expired tokens", () => {
    const token = mintExportToken("shop_1", "registries");
    expect(readExportToken(token.slice(0, -2) + "xx")).toBeNull();
    expect(readExportToken(signToken({ p: "manage", s: "shop_1", k: "registries" }, 60))).toBeNull();
    expect(readExportToken(signToken({ p: "admin-export", s: "shop_1", k: "everything" }, 60))).toBeNull();
    expect(readExportToken(signToken({ p: "admin-export", s: "shop_1", k: "sales" }, -1))).toBeNull();
    expect(readExportToken(null)).toBeNull();
  });
});

describe("registriesCsv", () => {
  it("one row per registry with contacts joined and completed items counted", () => {
    const csv = registriesCsv([
      {
        id: "r1",
        slug: "abc123",
        title: "=Sam & Alex",
        eventType: "wedding",
        eventDate: new Date("2027-06-12T00:00:00Z"),
        status: "active",
        privacy: "public_",
        createdAt: new Date("2026-09-01T12:00:00Z"),
        registrants: [
          { name: "Sam Lee", email: "sam@example.com", role: "owner" },
          { name: "Alex Kim", email: null, role: "co" },
        ],
        items: [
          { desiredQty: 1, purchasedQty: 1 },
          { desiredQty: 2, purchasedQty: 1 },
        ],
      },
    ]);
    const [header, row] = lines(csv);
    expect(header).toContain('"Registrant emails"');
    expect(row).toBe(
      `"r1","'=Sam & Alex","Wedding","2027-06-12","active","public","2026-09-01","Sam Lee; Alex Kim","sam@example.com","2","1","/r/abc123"`,
    );
  });
});

describe("purchasesCsv", () => {
  const purchase = (overrides: Partial<PurchaseExportRow> = {}): PurchaseExportRow => ({
    createdAt: new Date("2026-09-02T10:00:00Z"),
    source: "online",
    orderName: "#1021",
    orderId: "gid://shopify/Order/1",
    qty: 2,
    amount: "59.90",
    currency: null,
    buyerName: "Jo",
    isNewCustomer: true,
    shippedToRegistrant: false,
    voidedAt: null,
    item: { snapshotTitle: "Dinner set", registry: { id: "r1", title: "Wedding" } },
    ...overrides,
  });

  it("formats money in shop currency and flags refunds", () => {
    const [, a, b] = lines(
      purchasesCsv([purchase(), purchase({ source: "external", amount: null, orderName: null, orderId: null, voidedAt: new Date("2026-09-05T00:00:00Z") })], "USD"),
    );
    expect(a).toBe(`"2026-09-02","r1","Wedding","Dinner set","Your store (online)","#1021","gid://shopify/Order/1","2","59.90","USD","Jo","yes","no",""`);
    expect(b).toContain(`"Another store (guest confirmed)"`);
    expect(b.endsWith(`"","","Jo","yes","no","2026-09-05"`)).toBe(true);
  });
});

describe("salesCsv", () => {
  it("labels currency in the header and writes one row per month", () => {
    const [header, row] = lines(
      salesCsv([{ month: "2026-09-01T00:00:00.000Z", revenue: 90, orders: 2, newCustomers: 1, averageOrder: 45 }], "CAD"),
    );
    expect(header).toBe(`"Month","Registry revenue (CAD)","Orders","New customers","Average registry order (CAD)"`);
    expect(row).toBe(`"2026-09","90.00","2","1","45.00"`);
  });
});
