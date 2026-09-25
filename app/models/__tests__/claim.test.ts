import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * confirmBoughtElsewhere() is the guest's "Already bought it?" on a store
 * item. It must never count past what the registrant asked for, and must never
 * touch external items (those go through a hold).
 */

const tx = {
  registryItem: { findUnique: vi.fn(), update: vi.fn() },
  purchase: { create: vi.fn() },
};

vi.mock("../../db.server", () => ({
  default: { $transaction: vi.fn((fn: (t: typeof tx) => unknown) => fn(tx)) },
}));

vi.mock("../registry.server", () => ({ touchRegistry: vi.fn(), logEvent: vi.fn() }));

import { confirmBoughtElsewhere } from "../claim.server";
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
