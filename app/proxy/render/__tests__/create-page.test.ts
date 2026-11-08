import { describe, it, expect } from "vitest";
import { renderCreatePage, renderFindPage, hasLookalikes } from "../create-page";
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

describe("find a registry", () => {
  const base = { shopName: "Shop", accentColor: "#000", actionUrl: "/apps/registry", query: "sam", searched: true };
  const sam = (date: string, url: string) => ({
    title: "Sam & Alex's Wedding",
    eventLabel: "Wedding",
    eventDate: new Date(date),
    url,
    names: "Sam & Alex",
  });

  it("warns when two registries look alike and puts each date in bold", () => {
    const html = renderFindPage({ ...base, results: [sam("2027-06-12T00:00:00Z", "/a"), sam("2027-09-04T00:00:00Z", "/b")] });
    expect(html).toContain("More than one registry matches");
    expect(html).toContain("<strong>June 12, 2027</strong>");
    expect(html).toContain("<strong>September 4, 2027</strong>");
    expect(html).toContain("Sam &amp; Alex");
  });

  it("doesn't warn for a single match", () => {
    expect(renderFindPage({ ...base, results: [sam("2027-06-12T00:00:00Z", "/a")] })).not.toContain("More than one registry matches");
  });

  it("treats the same names in either order as a lookalike", () => {
    expect(hasLookalikes([{ title: "One", names: "Sam & Alex" }, { title: "Two", names: "Alex and Sam" }])).toBe(true);
    expect(hasLookalikes([{ title: "One", names: "Sam & Alex" }, { title: "Two", names: "Sam & Jo" }])).toBe(false);
  });
});

describe("wish list occasion", () => {
  const base = { shopName: "S", accentColor: "#000", actionUrl: "/apps/registry" };

  it("is left out unless the shop switched it on, and hides the date field when picked", () => {
    expect(renderCreatePage({ ...base, enabledEventTypes: [] })).not.toContain('value="wishlist"');
    const html = renderCreatePage({ ...base, enabledEventTypes: ["wishlist", "birthday"] });
    expect(html).toContain('value="wishlist"');
    expect(html).toMatch(/value="wishlist"[^>]*data-nodate/);
    expect(html).toContain('<div id="c-date-field">');
    expect(renderCreatePage({ ...base, enabledEventTypes: ["wishlist"] })).toContain('<div id="c-date-field" hidden>');
  });
});

/** Ben, 8 Nov 2026: emailing your registries must not leave the filled-in create form. */
describe("create page: Email me my registries", () => {
  const base = { shopName: "S", accentColor: "#000", actionUrl: "/apps/registry", enabledEventTypes: ["wedding"] };

  it("keeps the plain form post as a no-JS fallback", () => {
    const html = renderCreatePage(base);
    expect(html).toContain('id="c-resend-form" method="post" action="/apps/registry/resend"');
  });

  it("sends in the background and shows Email sent, then Send again", () => {
    const html = renderCreatePage(base);
    expect(html).toContain("e.preventDefault()");
    expect(html).toContain('"Email sent"');
    expect(html).toContain('"Send again"');
    expect(html).toContain('id="c-resend-status"');
    // falls back to a real post if the background send fails
    expect(html).toContain("f.submit()");
  });
});
