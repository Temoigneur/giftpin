import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * confirmBoughtElsewhere() is the guest's "Already bought it?" on a store
 * item. It must never count past what the registrant asked for, and must never
 * touch external items (those go through a hold).
 */

const tx = {
  registryItem: { findUnique: vi.fn(), update: vi.fn() },
  purchase: { create: vi.fn(), updateMany: vi.fn() },
};
const purchaseFindUnique = vi.fn();

vi.mock("../../db.server", () => ({
  default: {
    $transaction: vi.fn((fn: (t: typeof tx) => unknown) => fn(tx)),
    purchase: { findUnique: (...args: unknown[]) => purchaseFindUnique(...args) },
  },
}));

vi.mock("../registry.server", () => ({ touchRegistry: vi.fn(), logEvent: vi.fn() }));

import { confirmBoughtElsewhere, mintUndoToken, readUndoToken, undoGuestPurchase } from "../claim.server";
import { signToken } from "../../lib/crypto.server";
import { touchRegistry } from "../registry.server";

function itemRow(overrides: Record<string, unknown> = {}) {
  return { id: "item_1", registryId: "reg_1", sourceType: "internal", desiredQty: 2, purchasedQty: 0, ...overrides };
}

beforeEach(() => {
  vi.clearAllMocks();
  tx.purchase.create.mockResolvedValue({ id: "p_1" });
});

describe("confirmBoughtElsewhere", () => {
  it("records one unit and refreshes the registry page", async () => {
    tx.registryItem.findUnique.mockResolvedValue(itemRow());

    expect(await confirmBoughtElsewhere("item_1")).toEqual({ id: "p_1" });
    expect(tx.purchase.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ itemId: "item_1", source: "external", qty: 1 }),
    });
    expect(tx.registryItem.update).toHaveBeenCalledWith({
      where: { id: "item_1" },
      data: { purchasedQty: { increment: 1 } },
    });
    expect(touchRegistry).toHaveBeenCalledWith("reg_1");
  });

  it("refuses once the item is fully bought", async () => {
    tx.registryItem.findUnique.mockResolvedValue(itemRow({ purchasedQty: 2 }));
    expect(await confirmBoughtElsewhere("item_1")).toBeNull();
    expect(tx.purchase.create).not.toHaveBeenCalled();
  });

  it("refuses external items, which go through a hold instead", async () => {
    tx.registryItem.findUnique.mockResolvedValue(itemRow({ sourceType: "web" }));
    expect(await confirmBoughtElsewhere("item_1")).toBeNull();
    expect(tx.purchase.create).not.toHaveBeenCalled();
  });
});

describe("undo of I bought this", () => {
  const guestPurchase = { id: "p_1", itemId: "item_1", qty: 1, source: "external", voidedAt: null, item: { registryId: "reg_1" } };

  it("round-trips its token and rejects tokens minted for anything else", () => {
    expect(readUndoToken(mintUndoToken("p_1"))).toBe("p_1");
    expect(readUndoToken(signToken({ p: "claim", u: "p_1" }))).toBeNull();
    expect(readUndoToken("garbage")).toBeNull();
  });

  it("voids the purchase and puts the unit back", async () => {
    purchaseFindUnique.mockResolvedValue(guestPurchase);
    tx.purchase.updateMany.mockResolvedValue({ count: 1 });
    tx.registryItem.findUnique.mockResolvedValue({ purchasedQty: 1 });

    expect(await undoGuestPurchase("p_1")).toBe(true);
    expect(tx.purchase.updateMany).toHaveBeenCalledWith({
      where: { id: "p_1", voidedAt: null },
      data: { voidedAt: expect.any(Date) },
    });
    expect(tx.registryItem.update).toHaveBeenCalledWith({ where: { id: "item_1" }, data: { purchasedQty: 0 } });
    expect(touchRegistry).toHaveBeenCalledWith("reg_1");
  });

  it("never undoes an order the webhook recorded", async () => {
    purchaseFindUnique.mockResolvedValue({ ...guestPurchase, source: "online" });
    expect(await undoGuestPurchase("p_1")).toBe(false);
    expect(tx.purchase.updateMany).not.toHaveBeenCalled();
  });

  it("does nothing on a second tap", async () => {
    purchaseFindUnique.mockResolvedValue(guestPurchase);
    tx.purchase.updateMany.mockResolvedValue({ count: 0 });
    expect(await undoGuestPurchase("p_1")).toBe(false);
    expect(tx.registryItem.update).not.toHaveBeenCalled();
  });
});
