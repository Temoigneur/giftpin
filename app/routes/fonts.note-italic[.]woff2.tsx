import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * The guest page's registry-note font (Cormorant Garamond Italic 500, SIL OFL,
 * licence beside the file in app/assets/fonts).
 *
 * Served from a route rather than public/ because the guest page lives on the
 * store's domain (app proxy) and fonts are a CORS-checked fetch: the static
 * file server sends no Access-Control-Allow-Origin, so the browser would
 * silently drop the font. The file is read from the working directory, which
 * is the repo root both in `shopify app dev` and in the Docker image (/app).
 */
let cached: Buffer | null = null;

export const loader = async () => {
  try {
    cached ??= await readFile(join(process.cwd(), "app/assets/fonts/cormorant-garamond-latin-500-italic.woff2"));
  } catch {
    return new Response("Not found", { status: 404 });
  }
  return new Response(new Uint8Array(cached), {
    headers: {
      "Content-Type": "font/woff2",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
