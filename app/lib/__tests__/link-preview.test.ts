import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The paste box's look-up step (25 Sep 2026). Ben pasted williams-sonoma.ca
 * and sportchek.ca links; the first answers a server read with 403 and the
 * second with an app shell titled "General PDP Template". Both used to land
 * on the list as junk. Neither may throw here — the registrant gets the form
 * to fill in instead.
 */

const findUnique = vi.fn();
const fetchProductPage = vi.fn();

vi.mock("../../db.server", () => ({ default: { externalSource: { findUnique } } }));
vi.mock("../queue.server", () => ({ registerHandler: vi.fn(), enqueue: vi.fn() }));
vi.mock("../resolver/fetcher.server", () => {
  class FetchRefused extends Error {
    constructor(message: string, readonly reason: string) {
      super(message);
    }
  }
  return { fetchProductPage, FetchRefused };
});

const { previewUrl } = await import("../resolver/index.server");
const { FetchRefused } = await import("../resolver/fetcher.server");
const { looksLikePlaceholderTitle } = await import("../resolver/metadata");

const productPage = (title: string, extra = "") => ({
  finalUrl: "https://boutique.example/p/vase",
  contentType: "text/html",
  html: `<html><head><title>${title}</title>
    <meta property="og:title" content="${title}">
    <meta property="og:image" content="https://boutique.example/vase.jpg">
    <meta property="product:price:amount" content="89.00">
    <meta property="product:price:currency" content="CAD">${extra}</head><body></body></html>`,
});

beforeEach(() => {
  vi.clearAllMocks();
  findUnique.mockResolvedValue(null);
});

describe("previewUrl", () => {
  it("returns the title, photo and price read from the page", async () => {
    fetchProductPage.mockResolvedValue(productPage("Speckled Ceramic Vase"));
    const p = await previewUrl("https://boutique.example/p/vase?utm_source=x");
    expect(p).toMatchObject({
      url: "https://boutique.example/p/vase",
      title: "Speckled Ceramic Vase",
      imageUrl: "https://boutique.example/vase.jpg",
      price: "89.00",
      currency: "CAD",
    });
  });

  it("returns empty details, not an error, when the store refuses the read (403)", async () => {
    fetchProductPage.mockRejectedValue(new FetchRefused("Responded 403", "bad_status"));
    const p = await previewUrl("https://williams-sonoma.ca/products/le-creuset-signature-fry-pan");
    expect(p.title).toBeNull();
    expect(p.url).toBe("https://williams-sonoma.ca/products/le-creuset-signature-fry-pan");
    expect(p.domain).toBe("williams-sonoma.ca");
  });

  it("treats an app-shell title as nothing found", async () => {
    fetchProductPage.mockResolvedValue(productPage("General PDP Template"));
    const p = await previewUrl("https://sportchek.ca/en/pdp/ripzone-shreddy-snowboard-kit.html");
    expect(p.title).toBeNull();
  });

  it("uses a fresh cached read instead of fetching again", async () => {
    findUnique.mockResolvedValue({
      fetchStatus: "ok", lastFetchedAt: new Date(), ttlSeconds: 3600,
      title: "Cached Vase", imageUrl: "https://boutique.example/v.jpg", price: "12.50", currency: "USD",
    });
    const p = await previewUrl("https://boutique.example/p/vase");
    expect(p.title).toBe("Cached Vase");
    expect(fetchProductPage).not.toHaveBeenCalled();
  });

  it("never hands the browser a non-https photo", async () => {
    findUnique.mockResolvedValue({
      fetchStatus: "ok", lastFetchedAt: new Date(), ttlSeconds: 3600,
      title: "Vase", imageUrl: "http://boutique.example/v.jpg", price: null, currency: null,
    });
    expect((await previewUrl("https://boutique.example/p/vase")).imageUrl).toBeNull();
  });

  it("still rejects something that isn't a link", async () => {
    await expect(previewUrl("not a url")).rejects.toThrow();
  });
});

describe("looksLikePlaceholderTitle", () => {
  it("flags app shells, bot checks and error pages", () => {
    for (const t of ["General PDP Template", "Just a moment...", "Access Denied", "Robot Check", "Robot or human?", "Page Not Found", "", null]) {
      expect(looksLikePlaceholderTitle(t), String(t)).toBe(true);
    }
  });

  it("leaves real product names alone", () => {
    for (const t of ["Le Creuset Signature Fry Pan", "Ripzone Shreddy Snowboard Kit", "Home Sweet Home Doormat"]) {
      expect(looksLikePlaceholderTitle(t), t).toBe(false);
    }
  });
});
