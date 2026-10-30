import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

vi.mock("../../db.server", () => ({
  default: {
    registry: { findUnique: vi.fn(), findMany: vi.fn() },
    registryEvent: { create: vi.fn() },
    auditLog: { create: vi.fn() },
  },
}));
vi.mock("../../shopify.server", () => ({ unauthenticated: { admin: vi.fn() } }));
vi.mock("../../lib/queue.server", () => ({ registerHandler: vi.fn(), enqueue: vi.fn() }));

import db from "../../db.server";
import { enqueue } from "../../lib/queue.server";
import { unauthenticated } from "../../shopify.server";
import { encrypt } from "../../lib/crypto.server";
import {
  FLOW_TRIGGERS,
  itemsRemaining,
  legacyOrderId,
  queueFlowTrigger,
  runFlowEventReminders,
  sendFlowTrigger,
  type FlowTrigger,
} from "../flow.server";

const NOW = new Date("2026-10-30T15:10:00Z");
const DAY = 86_400_000;

const EXTENSION_DIRS: Record<FlowTrigger, string> = {
  registryCreated: "flow-registry-created",
  eventApproaching: "flow-event-approaching",
  giftPurchased: "flow-gift-purchased",
};

/** The payload keys a trigger's TOML declares, in Flow's terms. */
function tomlKeys(dir: string): { handle: string; keys: string[] } {
  const toml = readFileSync(join(__dirname, "../../../extensions", dir, "shopify.extension.toml"), "utf8");
  const handle = /^handle = "([^"]+)"/m.exec(toml)?.[1] ?? "";
  const keys: string[] = [];
  for (const block of toml.split("[[settings.fields]]").slice(1)) {
    const type = /type = "([^"]+)"/.exec(block)?.[1];
    const key = /key = "([^"]+)"/.exec(block)?.[1];
    if (type?.endsWith("_reference")) keys.push(`${type.replace(/_reference$/, "")}_id`);
    else if (key) keys.push(key);
  }
  return { handle, keys };
}

function registryRow(over: Record<string, unknown> = {}) {
  return {
    id: "reg_1",
    slug: "abc123",
    title: "Sam & Alex",
    eventType: "wedding",
    eventDate: new Date("2026-11-20T00:00:00Z"),
    shop: { domain: "demo.myshopify.com", plan: "pro", uninstalledAt: null },
    registrants: [{ name: "Sam", emailEnc: encrypt("sam@example.com"), role: "owner" }],
    items: [
      { desiredQty: 1, purchasedQty: 1, fundGoal: null, fundedAmount: null },
      { desiredQty: 2, purchasedQty: 1, fundGoal: null, fundedAmount: null },
    ],
    ...over,
  };
}

const purchase = { orderId: "gid://shopify/Order/5551234", itemTitle: "Kettle", quantity: 1, isContribution: false };

beforeEach(() => {
  vi.mocked(enqueue).mockReset();
  vi.mocked(db.registry.findUnique).mockReset();
  vi.mocked(db.registry.findMany).mockReset();
  vi.mocked(db.registryEvent.create).mockReset();
});

describe("trigger payloads match the extension TOMLs", () => {
  // Flow rejects a payload missing any declared field, and a key the TOML
  // doesn't declare never reaches the merchant's workflow. Either drift is
  // silent in production, so pin them together here.
  for (const trigger of Object.keys(FLOW_TRIGGERS) as FlowTrigger[]) {
    it(trigger, async () => {
      vi.mocked(db.registry.findUnique).mockResolvedValue(registryRow() as never);
      expect(await queueFlowTrigger("reg_1", trigger, { days: 21, purchase })).toBe(true);

      const [name, job] = vi.mocked(enqueue).mock.calls[0] as [string, { handle: string; payload: object }];
      const { handle, keys } = tomlKeys(EXTENSION_DIRS[trigger]);
      expect(name).toBe("flow-trigger");
      expect(job.handle).toBe(handle);
      expect(Object.keys(job.payload).sort()).toEqual([...keys].sort());
      for (const key of keys) {
        if (key.endsWith("_id")) continue;
        expect(key).toMatch(/^[A-Za-z ]+$/); // Flow's rule for custom keys
      }
    });
  }
});

describe("queueFlowTrigger", () => {
  it("sends registry details and the registrant, never the manage link", async () => {
    vi.mocked(db.registry.findUnique).mockResolvedValue(registryRow() as never);
    await queueFlowTrigger("reg_1", "giftPurchased", { purchase });
    const job = vi.mocked(enqueue).mock.calls[0][1] as { shop: string; payload: Record<string, unknown> };
    expect(job.shop).toBe("demo.myshopify.com");
    expect(job.payload).toMatchObject({
      "Registry title": "Sam & Alex",
      Occasion: "Wedding",
      "Event date": "2026-11-20",
      "Registry URL": "https://demo.myshopify.com/apps/registry/r/abc123",
      "Registrant email": "sam@example.com",
      "Items remaining": 1,
      order_id: 5551234,
      "Item title": "Kettle",
    });
    expect(JSON.stringify(job.payload)).not.toContain("manage");
  });

  it("sends an empty event date for an undated registry", async () => {
    vi.mocked(db.registry.findUnique).mockResolvedValue(registryRow({ eventDate: null }) as never);
    await queueFlowTrigger("reg_1", "registryCreated");
    expect((vi.mocked(enqueue).mock.calls[0][1] as { payload: object }).payload).toMatchObject({ "Event date": "" });
  });

  it("does nothing for a Free shop or an uninstalled one", async () => {
    vi.mocked(db.registry.findUnique).mockResolvedValue(
      registryRow({ shop: { domain: "d.myshopify.com", plan: "free", uninstalledAt: null } }) as never,
    );
    expect(await queueFlowTrigger("reg_1", "registryCreated")).toBe(false);
    vi.mocked(db.registry.findUnique).mockResolvedValue(
      registryRow({ shop: { domain: "d.myshopify.com", plan: "pro", uninstalledAt: new Date() } }) as never,
    );
    expect(await queueFlowTrigger("reg_1", "registryCreated")).toBe(false);
    expect(enqueue).not.toHaveBeenCalled();
  });

  it("never throws into the caller", async () => {
    vi.mocked(db.registry.findUnique).mockRejectedValue(new Error("db down"));
    await expect(queueFlowTrigger("reg_1", "registryCreated")).resolves.toBe(false);
  });
});

describe("helpers", () => {
  it("legacyOrderId takes the number off a GID or a bare id", () => {
    expect(legacyOrderId("gid://shopify/Order/123")).toBe(123);
    expect(legacyOrderId("456")).toBe(456);
    expect(legacyOrderId("nope")).toBeNull();
  });

  it("itemsRemaining counts a fully funded fund as taken", () => {
    expect(
      itemsRemaining([
        { desiredQty: 1, purchasedQty: 0, fundGoal: "100.00", fundedAmount: "100.00" },
        { desiredQty: 1, purchasedQty: 0, fundGoal: "100.00", fundedAmount: "40.00" },
      ]),
    ).toBe(1);
  });
});

describe("sendFlowTrigger", () => {
  function mockGraphql(body: object) {
    const graphql = vi.fn().mockResolvedValue({ json: async () => body });
    vi.mocked(unauthenticated.admin).mockResolvedValue({ admin: { graphql } } as never);
    return graphql;
  }

  it("calls flowTriggerReceive with the handle and payload", async () => {
    const graphql = mockGraphql({ data: { flowTriggerReceive: { userErrors: [] } } });
    await sendFlowTrigger("demo.myshopify.com", "giftpin-registry-created", { "Registry ID": "r" });
    expect(graphql.mock.calls[0][0]).toContain("flowTriggerReceive");
    expect(graphql.mock.calls[0][1]).toEqual({
      variables: { handle: "giftpin-registry-created", payload: { "Registry ID": "r" } },
    });
  });

  it("logs a userError rather than retrying it", async () => {
    mockGraphql({ data: { flowTriggerReceive: { userErrors: [{ message: "Invalid handle" }] } } });
    await expect(sendFlowTrigger("demo.myshopify.com", "x", {})).resolves.toBeUndefined();
  });

  it("throws on a top-level error so the job retries", async () => {
    mockGraphql({ errors: [{ message: "Throttled" }] });
    await expect(sendFlowTrigger("demo.myshopify.com", "x", {})).rejects.toThrow("Throttled");
  });
});

describe("runFlowEventReminders", () => {
  it("marks and queues registries 1 to 30 days out, skipping the rest", async () => {
    vi.mocked(db.registry.findMany).mockResolvedValue([
      { id: "in", eventDate: new Date(NOW.getTime() + 21 * DAY) },
      { id: "today", eventDate: new Date("2026-10-30T00:00:00Z") },
    ] as never);
    vi.mocked(db.registry.findUnique).mockResolvedValue(registryRow({ id: "in" }) as never);

    expect(await runFlowEventReminders(NOW)).toBe(1);
    expect(db.registryEvent.create).toHaveBeenCalledTimes(1);
    expect(db.registryEvent.create).toHaveBeenCalledWith({
      data: { registryId: "in", type: "flow_event_approaching_sent", payload: { days: 21 } },
    });
    const job = vi.mocked(enqueue).mock.calls[0][1] as { payload: Record<string, unknown> };
    expect(job.payload["Days until event"]).toBe(21);
  });
});
