import { describe, it, expect, vi } from "vitest";

vi.mock("../queue.server", () => ({ registerHandler: vi.fn(), enqueue: vi.fn() }));

import { __testables } from "../email.server";

const { templates } = __testables;

describe("Pro automation emails", () => {
  it("always gives guests a way to unsubscribe", () => {
    const mail = templates["guest-event-reminder"]({
      to: "guest@example.com",
      registryTitle: "Sam & Alex",
      shopName: "Demo",
      days: 14,
      remaining: 3,
      url: "https://demo.myshopify.com/apps/registry/r/abc",
      unsubscribeUrl: "https://demo.myshopify.com/apps/registry/unsubscribe?u=tok",
    });
    expect(mail.subject).toBe("Sam & Alex is in two weeks");
    expect(mail.html).toContain("unsubscribe?u=tok");
    expect(mail.text).toContain("unsubscribe?u=tok");
    expect(mail.html).toContain("Sam &amp; Alex");
  });

  it("escapes registrant and buyer text in the thank-you list", () => {
    const mail = templates["thank-you-reminder"]({
      to: "sam@example.com",
      registryTitle: "Ours",
      gifts: [{ item: "<b>Toaster</b>", from: "Taylor" }],
      moreCount: 0,
      csvUrl: "https://x/thank-you.csv",
      url: "https://x/manage",
    });
    expect(mail.html).not.toContain("<b>Toaster</b>");
    expect(mail.html).toContain("&lt;b&gt;Toaster");
    expect(mail.text).toContain("- <b>Toaster</b>: Taylor");
  });

  it("puts the discount code, percentage and expiry in the completion email", () => {
    const mail = templates["completion-discount"]({
      to: "sam@example.com",
      registryTitle: "Ours",
      shopName: "Demo",
      code: "THANKS-ABCD2345",
      percent: 15,
      remaining: 2,
      endsOn: "2026-11-23",
      url: "https://x/manage",
    });
    // Names the registry: a registrant with several can tell which one it's for.
    expect(mail.subject).toBe("15% off what's left on Ours");
    expect(mail.html).toContain("<strong>Ours</strong>");
    expect(mail.html).toContain("THANKS-ABCD2345");
    expect(mail.text).toContain("until 2026-11-23");
  });
});
