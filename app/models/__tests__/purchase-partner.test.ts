import { describe, it, expect, vi } from "vitest";

/**
 * A registry with a partner (co-registrant): both registrants hear about a
 * gift, each with their own kind of manage link, so removing the partner
 * still shuts theirs off.
 */

vi.mock("../../db.server", () => ({ default: {} }));
vi.mock("../../shopify.server", () => ({ unauthenticated: { admin: vi.fn() } }));
vi.mock("../../lib/queue.server", () => ({ registerHandler: vi.fn() }));
vi.mock("../../lib/email.server", () => ({ sendEmail: vi.fn() }));
vi.mock("../../lib/audit.server", () => ({ audit: vi.fn() }));

import { sendEmail } from "../../lib/email.server";
import { encrypt } from "../../lib/crypto.server";
import { readManageGrant } from "../registry.server";
import { __testables } from "../purchase.server";

describe("gift notifications with a partner", () => {
  it("emails the owner and the partner, each with their own link", async () => {
    await __testables.notifyRegistrant(
      {
        id: "reg_1",
        title: "Sam & Alex",
        eventType: "wedding",
        registrants: [
          { id: "rgt_owner", role: "owner", emailEnc: encrypt("sam@example.com") },
          { id: "rgt_partner", role: "co", emailEnc: encrypt("alex@example.com") },
        ],
      },
      "shop.myshopify.com",
      { itemTitle: "Kettle", qty: 1, desiredQty: 1, buyerName: "Jo", hidden: false },
    );

    const calls = vi.mocked(sendEmail).mock.calls;
    expect(calls.map((c) => c[1])).toEqual(["sam@example.com", "alex@example.com"]);
    const tokenOf = (url: string) => new URL(url).searchParams.get("t");
    expect(readManageGrant(tokenOf(calls[0][2].url as string))?.partnerId).toBeNull();
    expect(readManageGrant(tokenOf(calls[1][2].url as string))?.partnerId).toBe("rgt_partner");
  });
});
