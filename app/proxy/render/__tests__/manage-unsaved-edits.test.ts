import { describe, it, expect } from "vitest";
import { JSDOM, VirtualConsole } from "jsdom";
import { renderManagePage, type ManagePageData } from "../manage-page";
import type { DisplayItem } from "../../../models/item.server";

/**
 * Ben, 9 Nov 2026: type a note for guests, then click "Let guests chip in",
 * and the note was gone. The chip-in button is its own little form that
 * reloads the page, so the item's unsaved note/qty/category went with it.
 * These run the real page script in a DOM and check that a reload now saves
 * the typed edits first.
 */

const item = (o: Partial<DisplayItem>): DisplayItem =>
  ({
    id: "i1", sourceType: "shopify_internal", title: "Linen Pillowcase Pair", imageUrl: null, price: 71.25, currency: "CAD",
    desiredQty: 2, purchasedQty: 0, claimedQty: 0, remainingQty: 2, note: null, category: null, storeMatch: null,
    variantGid: "gid://shopify/ProductVariant/1", externalUrl: null, externalDomain: null, isExternal: false, isStale: false,
    availability: "in_stock", fulfilled: false, fund: null, ...o,
  }) as DisplayItem;

function html(items: DisplayItem[]): string {
  return renderManagePage({
    chromeExtensionUrl: "https://chromewebstore.google.com/detail/giftpin/abc",
    registryId: "registry_1",
    title: "Sam & Alex's Wedding",
    message: null,
    eventType: "wedding",
    eventDate: null,
    privacy: "unlisted",
    items,
    shopName: "Maple & Clay",
    accentColor: "#2f5d50",
    currency: "CAD",
    shareUrl: "https://maple-clay.com/apps/registry/r/abc123",
    actionUrl: "/apps/registry",
    token: "tok_abc",
    manageUrl: "https://maple-clay.com/apps/registry/manage?t=tok_abc",
    externalItemsAllowed: true,
    storeSearchUrl: "/collections/all",
    gifts: [],
    contributions: { toRegistrant: false },
  } as ManagePageData);
}

type Call = { path: string; body: Record<string, unknown> };

function load(items: DisplayItem[], fail: string[] = []) {
  const calls: Call[] = [];
  let reloads = 0;
  // jsdom can't navigate, so location.reload() reports "not implemented":
  // count those reports as reloads (and keep them out of the test output).
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (e) => {
    if (/navigation/i.test(String(e.message))) reloads++;
  });
  const dom = new JSDOM(html(items), {
    virtualConsole,
    url: "https://maple-clay.com/apps/registry/manage?t=tok_abc",
    runScripts: "dangerously",
    beforeParse(win) {
      (win as unknown as { fetch: unknown }).fetch = (url: string, init?: { body?: string }) => {
        const path = new URL(url, "https://maple-clay.com").pathname.replace("/apps/registry", "");
        if (init?.body) calls.push({ path, body: JSON.parse(init.body) });
        const ok = !fail.includes(path);
        return Promise.resolve({
          json: () => Promise.resolve(ok ? { ok: true, version: 0 } : { ok: false, error: "Nope" }),
          text: () => Promise.resolve(""),
        });
      };
    },
  });
  const win = dom.window;
  const doc = win.document;
  const settle = () => new Promise((r) => setTimeout(r, 20));
  return { win, doc, calls, settle, reloads: () => reloads };
}

function submit(doc: Document, form: Element) {
  form.dispatchEvent(new doc.defaultView!.Event("submit", { bubbles: true, cancelable: true }));
}

describe("manage page keeps typed edits when another button reloads it", () => {
  it("saves a just-typed note before turning on chip-in", async () => {
    const { doc, calls, settle } = load([item({})]);
    const note = doc.querySelector<HTMLInputElement>('.js-item [name=note]')!;
    note.value = "The blue ones, please";
    submit(doc, doc.querySelector(".js-group")!);
    await settle();
    expect(calls.map((c) => c.path)).toEqual(["/item-fund", "/update-item"]);
    expect(calls[1].body).toMatchObject({ itemId: "i1", note: "The blue ones, please", desiredQty: 2 });
  });

  it("saves a changed quantity and category too", async () => {
    const { doc, calls, settle } = load([item({})]);
    doc.querySelector<HTMLInputElement>('.js-item [name=desiredQty]')!.value = "3";
    const cat = doc.querySelector<HTMLSelectElement>('.js-item [name=category]')!;
    cat.selectedIndex = 1;
    submit(doc, doc.querySelector(".js-group")!);
    await settle();
    const save = calls.find((c) => c.path === "/update-item");
    expect(save?.body).toMatchObject({ desiredQty: 3, category: cat.value });
  });

  it("does not send an item save when nothing was typed", async () => {
    const { doc, calls, settle } = load([item({ note: "Already saved" })]);
    submit(doc, doc.querySelector(".js-group")!);
    await settle();
    expect(calls.map((c) => c.path)).toEqual(["/item-fund"]);
  });

  it("saves the note when stopping chip-ins as well", async () => {
    const { doc, calls, settle } = load([item({ fund: { goal: 143, funded: 0 } as DisplayItem["fund"] })]);
    doc.querySelector<HTMLInputElement>('.js-item [name=note]')!.value = "Any colour";
    doc.querySelector<HTMLElement>(".js-group-off")!.click();
    await settle();
    expect(calls.map((c) => c.path)).toEqual(["/item-fund", "/update-item"]);
    expect(calls[1].body).toMatchObject({ note: "Any colour" });
  });

  it("stays on the page, with the note still typed in, when saving it fails", async () => {
    const { doc, settle, reloads } = load([item({})], ["/update-item"]);
    const note = doc.querySelector<HTMLInputElement>('.js-item [name=note]')!;
    note.value = "Keep me";
    submit(doc, doc.querySelector(".js-group")!);
    await settle();
    expect(reloads()).toBe(0);
    expect(note.value).toBe("Keep me");
    expect(doc.querySelector(".js-item .js-status")!.textContent).toBe("Nope");
  });

  it("reloads after saving when everything worked", async () => {
    const { doc, settle, reloads } = load([item({})]);
    doc.querySelector<HTMLInputElement>('.js-item [name=note]')!.value = "Hi";
    submit(doc, doc.querySelector(".js-group")!);
    await settle();
    expect(reloads()).toBe(1);
  });

  it("doesn't try to save the note of an item being removed", async () => {
    const { doc, calls, settle, win } = load([item({})]);
    win.confirm = () => true;
    doc.querySelector<HTMLInputElement>('.js-item [name=note]')!.value = "Bye";
    doc.querySelector<HTMLElement>(".js-remove")!.click();
    await settle();
    expect(calls.map((c) => c.path)).toEqual(["/remove-item"]);
  });
});
