import { describe, expect, it } from "vitest";
import { loader, pricingHtml } from "../pricing";
import { PRO_PLAN_DISPLAY_NAME, PRO_PLAN_PRICE, PRO_TRIAL_DAYS } from "../../shared/plans";

describe("public pricing page", () => {
  it("serves HTML without auth", async () => {
    const res = await loader();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/html");
  });

  it("quotes the same price, trial and name the billing code uses", () => {
    const html = pricingHtml();
    expect(html).toContain(`$${PRO_PLAN_PRICE.toFixed(2)}`);
    expect(html).toContain(`${PRO_TRIAL_DAYS}-day free trial`);
    expect(html).toContain(PRO_PLAN_DISPLAY_NAME);
  });

  it("discloses the affiliate commission and that it never touches the merchant's sales", () => {
    const html = pricingHtml();
    expect(html).toContain("affiliate commission");
    expect(html).toContain("never changes the guest's price");
    expect(html).toContain("never applies to purchases from your own store");
  });
});
