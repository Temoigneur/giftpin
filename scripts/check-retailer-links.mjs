#!/usr/bin/env node
/**
 * Checks the retailer search links in app/shared/retailers.ts against the live
 * sites. Run it from a normal machine (cloud sessions can't reach most of these
 * sites, so the links for the countries added on 7 Nov 2026 were written from
 * how each site's search is known to work and never tested).
 *
 *   node scripts/check-retailer-links.mjs            all countries
 *   node scripts/check-retailer-links.mjs DE FR      only these
 *   node scripts/check-retailer-links.mjs --list     print the links, no requests
 *
 * "OK" = the page loaded. "BLOCKED" = the site refused a script (403/429/999):
 * open that link in a browser to check it by hand. "BROKEN" = 404/410/5xx or
 * no connection: fix or drop that link.
 */
import { build } from "esbuild";

const args = process.argv.slice(2);
const list = args.includes("--list");
const only = args.filter((a) => /^[A-Za-z]{2}$/.test(a)).map((a) => a.toUpperCase());

const out = await build({
  entryPoints: ["app/shared/retailers.ts"],
  bundle: true,
  write: false,
  format: "esm",
  platform: "node",
});
const mod = await import(`data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString("base64")}`);

const rows = new Map(); // url -> [labels]
for (const c of mod.COUNTRIES) {
  if (only.length && !only.includes(c.code)) continue;
  for (const shelf of mod.SHELVES) {
    for (const r of mod.retailerSearchLinks(c.code, shelf)) {
      const url = r.url.replace("{q}", encodeURIComponent("stockpot"));
      rows.set(url, [...(rows.get(url) ?? []), `${c.code}/${shelf}/${r.name}`]);
    }
  }
}

if (list) {
  for (const [url, labels] of rows) console.log(`${url}  (${labels.join(", ")})`);
  console.log(`\n${rows.size} links`);
  process.exit(0);
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
let broken = 0;
let blocked = 0;
for (const [url, labels] of rows) {
  let verdict;
  try {
    const res = await fetch(url, { headers: { "user-agent": UA, "accept-language": "en" }, redirect: "follow", signal: AbortSignal.timeout(20000) });
    verdict = res.ok ? "OK" : [403, 429, 999].includes(res.status) ? `BLOCKED ${res.status}` : `BROKEN ${res.status}`;
  } catch (err) {
    verdict = `BROKEN ${err.cause?.code ?? err.message}`;
  }
  if (verdict.startsWith("BROKEN")) broken++;
  if (verdict.startsWith("BLOCKED")) blocked++;
  if (verdict !== "OK") console.log(`${verdict.padEnd(14)} ${url}\n               ${labels.join(", ")}`);
  await new Promise((r) => setTimeout(r, 400));
}
console.log(`\n${rows.size} links: ${rows.size - broken - blocked} OK, ${blocked} blocked (check by hand), ${broken} broken`);
process.exit(broken ? 1 : 0);
