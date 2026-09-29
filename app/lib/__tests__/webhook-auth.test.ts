import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../shopify.server", () => ({
  authenticate: { webhook: vi.fn() },
}));

import { authenticate } from "../../shopify.server";
import { authenticateLifecycleWebhook, isPostValidationRefreshFailure } from "../webhook-auth.server";

const mockedWebhook = vi.mocked(authenticate.webhook);

function webhookRequest() {
  return new Request("https://giftpin.app/webhooks/app/uninstalled", {
    method: "POST",
    headers: { "x-shopify-shop-domain": "gone.myshopify.com", "x-shopify-topic": "app/uninstalled" },
    body: JSON.stringify({ id: 1 }),
  });
}

describe("authenticateLifecycleWebhook", () => {
  beforeEach(() => mockedWebhook.mockReset());

  it("passes a normal webhook straight through", async () => {
    mockedWebhook.mockResolvedValueOnce({ shop: "s.myshopify.com", payload: { a: 1 } } as never);
    await expect(authenticateLifecycleWebhook(webhookRequest())).resolves.toEqual({
      shop: "s.myshopify.com",
      payload: { a: 1 },
    });
  });

  // After uninstall the offline token can't be refreshed; the library throws
  // a 500 after the HMAC has already been checked.
  it("handles the webhook without a session when the token refresh fails", async () => {
    mockedWebhook.mockRejectedValueOnce(new Response(undefined, { status: 500 }));
    await expect(authenticateLifecycleWebhook(webhookRequest())).resolves.toEqual({
      shop: "gone.myshopify.com",
      payload: { id: 1 },
    });
  });

  it("never accepts a webhook that failed HMAC or request validation", async () => {
    for (const status of [400, 401, 405]) {
      mockedWebhook.mockRejectedValueOnce(new Response(undefined, { status }));
      await expect(authenticateLifecycleWebhook(webhookRequest())).rejects.toMatchObject({ status });
    }
  });
});

describe("isPostValidationRefreshFailure", () => {
  it("only matches the refresh-token failure shapes", () => {
    class InvalidJwtError extends Error {}
    class HttpResponseError extends Error {}
    expect(isPostValidationRefreshFailure(new InvalidJwtError())).toBe(true);
    expect(isPostValidationRefreshFailure(new HttpResponseError())).toBe(true);
    expect(isPostValidationRefreshFailure(new Error("other"))).toBe(false);
    expect(isPostValidationRefreshFailure(new TypeError("x"))).toBe(false);
  });
});
