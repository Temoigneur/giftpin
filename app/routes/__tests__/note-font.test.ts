import { describe, it, expect } from "vitest";
import { loader } from "../fonts.note-italic[.]woff2";

describe("guest page note font", () => {
  it("serves the woff2 with CORS, since the guest page is on the store's domain", async () => {
    const res = await loader();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("font/woff2");
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect((await res.arrayBuffer()).byteLength).toBeGreaterThan(10_000);
  });
});
