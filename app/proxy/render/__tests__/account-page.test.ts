import { describe, it, expect } from "vitest";
import { renderAccountPage, renderAccountSignInPage, renderCreatePage } from "../create-page";
import { renderManagePage } from "../manage-page";
import { ACCOUNT_STORAGE_KEY } from "../../../shared/storage-keys";

const brand = { shopName: "Maple & Co", accentColor: "#6D3AE8" };

describe("My registries page", () => {
  const html = renderAccountPage({
    ...brand,
    actionUrl: "/apps/registry",
    registries: [
      { id: "r1", title: "Sam & Alex <wedding>", eventType: "wedding", eventDate: new Date("2027-06-12T00:00:00Z"), partner: false, href: "/apps/registry/manage?t=T1", token: "T1" },
      { id: "r2", title: "Baby Lee", eventType: "baby", eventDate: null, partner: true, href: "/apps/registry/manage?t=T2", token: "T2" },
    ],
    createHref: "/apps/registry?a=ACC",
    accountToken: "ACC",
  });

  it("lists every registry with its own manage link, escaped", () => {
    expect(html).toContain("/apps/registry/manage?t=T1");
    expect(html).toContain("/apps/registry/manage?t=T2");
    expect(html).toContain("Sam &amp; Alex &lt;wedding&gt;");
    expect(html).toContain("June 12, 2027");
    expect(html).toContain("You&#39;re a partner");
  });

  it("offers to start another registry with the same email", () => {
    expect(html).toContain('href="/apps/registry?a=ACC"');
    expect(html).toContain("Start another registry");
  });

  it("remembers the account link on this browser", () => {
    expect(html).toContain(ACCOUNT_STORAGE_KEY);
  });

  it("has an empty state", () => {
    const empty = renderAccountPage({ ...brand, actionUrl: "/a", registries: [], createHref: "/a", accountToken: "ACC" });
    expect(empty).toContain("no registries with this email yet");
    // Never saves a token it wasn't given.
    const none = renderAccountPage({ ...brand, actionUrl: "/a", registries: [], createHref: "/a", accountToken: null });
    expect(none).not.toContain("localStorage.setItem(\"giftpin.account\"");
  });
});

describe("My registries without a link", () => {
  it("from a manage page, emails the link in one click and lists nothing", () => {
    const html = renderAccountSignInPage({ ...brand, actionUrl: "/apps/registry", manageToken: "MT", expired: false });
    expect(html).toContain('action="/apps/registry/account-link?t=MT"');
    expect(html).not.toContain("manage?t=");
  });

  it("otherwise asks for the email", () => {
    const html = renderAccountSignInPage({ ...brand, actionUrl: "/apps/registry", manageToken: null, expired: false });
    expect(html).toContain('action="/apps/registry/resend"');
  });

  it("forgets an expired saved link instead of looping back to it", () => {
    const html = renderAccountSignInPage({ ...brand, actionUrl: "/apps/registry", manageToken: null, expired: true });
    expect(html).toContain("localStorage.removeItem");
    expect(html).not.toContain("location.replace");
  });
});

describe("create page prefill", () => {
  it("fills in name and email for Start another registry", () => {
    const html = renderCreatePage({
      ...brand,
      actionUrl: "/apps/registry",
      enabledEventTypes: ["wedding"],
      values: { registrantName: "Sam", registrantEmail: "sam@example.com" },
    });
    expect(html).toContain('value="sam@example.com"');
    expect(html).toContain('value="Sam"');
  });
});

describe("manage page", () => {
  it("links to My registries only when given a URL", () => {
    const base = {
      ...brand,
      registryId: "r1", title: "T", message: null, eventType: "wedding", eventDate: null, privacy: "unlisted",
      items: [], currency: "CAD", shareUrl: "https://x/r/s", actionUrl: "/apps/registry", token: "T",
      manageUrl: "https://x/manage?t=T", externalItemsAllowed: true, storeSearchUrl: "/collections/all", gifts: [],
    };
    expect(renderManagePage(base)).not.toContain(">My registries<");
    expect(renderManagePage({ ...base, myRegistriesUrl: "/apps/registry/account?t=T" })).toContain('href="/apps/registry/account?t=T">My registries<');
  });
});

describe("signed in to the store account, no emailed link", () => {
  // Ben, 5 Nov 2026: My registries from the manage page showed no
  // "Email me the link" while signed in to the store, so registries started
  // without signing in could never be reached from there.
  const html = renderAccountPage({
    ...brand,
    actionUrl: "/apps/registry",
    registries: [],
    createHref: "/apps/registry",
    accountToken: null,
    manageToken: "MT",
  });

  it("still offers the one-click email link", () => {
    expect(html).toContain('action="/apps/registry/account-link?t=MT"');
    expect(html).toContain("Email me the link");
    expect(html).toContain("No registries are linked to your store account yet");
  });

  it("goes to a saved emailed link if this browser has one", () => {
    expect(html).toContain("location.replace");
  });

  it("isn't offered once the emailed link is in use", () => {
    const withLink = renderAccountPage({ ...brand, actionUrl: "/apps/registry", registries: [], createHref: "/a", accountToken: "ACC", manageToken: "MT" });
    expect(withLink).not.toContain("account-link?t=");
    expect(withLink).not.toContain("location.replace");
  });
});

describe("emailed-link view", () => {
  it("offers to email the link again", () => {
    const html = renderAccountPage({ ...brand, actionUrl: "/apps/registry", registries: [], createHref: "/a", accountToken: "ACC" });
    expect(html).toContain('action="/apps/registry/account-link?a=ACC"');
    expect(html).toContain("Email me this link");
  });
});
