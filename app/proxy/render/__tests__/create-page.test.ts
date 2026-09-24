import { describe, it, expect } from "vitest";
import { renderCreatePage } from "../create-page";
import { EVENT_TYPES } from "../../../shared/settings";

/** Each occasion is its own template on the create form (24 Sep 2026). */
describe("create page occasion templates", () => {
  const base = { shopName: "S", accentColor: "#000", actionUrl: "/apps/registry" };

  it("offers every enabled occasion, each with its own example name and note", () => {
    const html = renderCreatePage({ ...base, enabledEventTypes: EVENT_TYPES.map((t) => t.value) });
    for (const t of EVENT_TYPES) expect(html).toContain(`value="${t.value}" data-title=`);
    expect(html).toContain('data-title="Maya turns 5!"');
  });

  it("uses the selected occasion's example name as the placeholder", () => {
    const html = renderCreatePage({ ...base, enabledEventTypes: ["wedding", "birthday"], values: { eventType: "birthday" } });
    expect(html).toContain('placeholder="Maya turns 5!"');
  });

  it("defaults to the first enabled occasion's template", () => {
    const html = renderCreatePage({ ...base, enabledEventTypes: ["baby"] });
    expect(html).toContain('placeholder="Baby Rivera is on the way"');
    expect(html).not.toContain('value="wedding"');
  });
});
