import type { LoaderFunctionArgs } from "react-router";
import { checkOpsAuth } from "../lib/ops-auth.server";
import { opsOverview, type OpsShopRow } from "../models/stats.server";

/**
 * GET /ops — Giftpin's own view of every store, Free and Pro: registry
 * traffic, clicks, registry sales and what share of the store's sales that
 * is. For Ben, never for merchants. Password from OPS_PASSWORD (see
 * app/lib/ops-auth.server.ts); 404 while that's unset.
 *
 * Plain server-rendered HTML like the marketing pages: no admin session, no
 * client bundle, nothing cached anywhere.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const auth = checkOpsAuth(request.headers.get("authorization"), process.env.OPS_PASSWORD);
  if (auth === "disabled") return new Response("Not found", { status: 404 });
  if (auth === "denied") {
    return new Response("Password required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Giftpin ops", charset="UTF-8"', "Cache-Control": "no-store" },
    });
  }

  const daysParam = Number(new URL(request.url).searchParams.get("days"));
  const days = [7, 30, 90, 365].includes(daysParam) ? daysParam : 30;
  const { shops } = await opsOverview(days);

  return new Response(renderOps(shops, days), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer",
    },
  });
};

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function money(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-CA", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${Math.round(amount)} ${currency}`;
  }
}

function date(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "–";
}

/** "registries 12 · settings 3", busiest first. */
export function adminViewsCell(views: OpsShopRow["adminViews"]): string {
  const parts = Object.entries(views)
    .filter(([, n]) => (n ?? 0) > 0)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .map(([sec, n]) => `${esc(sec)} ${n}`);
  return parts.length ? `<small>${parts.join(" · ")}</small>` : "–";
}

export function renderOps(shops: OpsShopRow[], days: number): string {
  const live = shops.filter((s) => !s.uninstalledAt && !s.devStore);
  const sum = (key: "registryViews" | "registriesCreated" | "giftsFromStore") => live.reduce((n, s) => n + s[key], 0);
  const candidates = live.filter((s) => s.upgradeCandidate).length;

  const rows = shops
    .map((s) => {
      const status = s.uninstalledAt ? `Uninstalled ${date(s.uninstalledAt)}` : s.devStore ? "Dev store" : "";
      return `<tr class="${s.uninstalledAt ? "gone" : ""}${s.upgradeCandidate ? " hot" : ""}">
<td><strong>${esc(s.name ?? s.domain)}</strong><br><small>${esc(s.domain)}${status ? ` · ${esc(status)}` : ""}</small></td>
<td>${s.plan === "pro" ? "Pro" : "Free"}${s.upgradeCandidate ? '<br><small class="tag">Nudge to Pro</small>' : ""}</td>
<td>${date(s.installedAt)}</td>
<td class="n">${s.activeRegistries}</td>
<td class="n">${s.registriesCreated}</td>
<td class="n">${s.registryViews}</td>
<td class="n">${s.createPageViews}</td>
<td class="n">${s.cartAdds}</td>
<td class="n">${s.externalClicks}</td>
<td class="n">${s.shares.share + s.shares.copy + s.shares.qr}<br><small>${s.shares.share} · ${s.shares.copy} · ${s.shares.qr}</small></td>
<td>${adminViewsCell(s.adminViews)}</td>
<td class="n">${s.giftsFromStore}</td>
<td class="n">${money(s.registrySales, s.currency)}</td>
<td class="n">${s.newCustomers}</td>
<td class="n">${s.storeOrders ? `${s.storeOrders} · ${money(s.storeSales, s.currency)}` : "–"}</td>
<td class="n">${s.registrySharePercent === null ? "–" : `${s.registrySharePercent}%`}</td>
<td>${date(s.lastRegistryAt)}</td>
</tr>`;
    })
    .join("\n");

  const rangeLinks = [7, 30, 90, 365]
    .map((d) => (d === days ? `<strong>${d} days</strong>` : `<a href="?days=${d}">${d} days</a>`))
    .join(" · ");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Giftpin ops</title>
<style>
body{font:14px/1.45 system-ui,-apple-system,Segoe UI,sans-serif;margin:0;padding:16px;background:#f6f7fb;color:#181638}
h1{font-size:20px;margin:0 0 4px}
.cards{display:flex;flex-wrap:wrap;gap:12px;margin:16px 0}
.card{background:#fff;border:1px solid #e3e5ef;border-radius:10px;padding:10px 14px;min-width:130px}
.card b{display:block;font-size:22px}
.wrap{overflow-x:auto;background:#fff;border:1px solid #e3e5ef;border-radius:10px}
table{border-collapse:collapse;width:100%;min-width:1300px}
th,td{padding:8px 10px;border-bottom:1px solid #eef0f6;text-align:left;vertical-align:top}
th{font-size:12px;color:#555;background:#fafbfe;position:sticky;top:0}
td.n,th.n{text-align:right;white-space:nowrap}
tr.gone{opacity:.5}
tr.hot{background:#f3efff}
.tag{color:#6D3AE8;font-weight:600}
small{color:#666}
p.note{color:#555;max-width:900px}
</style>
</head>
<body>
<h1>Giftpin ops</h1>
<div>${rangeLinks}</div>
<div class="cards">
<div class="card">Live stores<b>${live.length}</b></div>
<div class="card">Pro<b>${live.filter((s) => s.plan === "pro").length}</b></div>
<div class="card">Free to nudge<b>${candidates}</b></div>
<div class="card">Registry views<b>${sum("registryViews")}</b></div>
<div class="card">Registries created<b>${sum("registriesCreated")}</b></div>
<div class="card">Gifts bought in store<b>${sum("giftsFromStore")}</b></div>
</div>
<div class="wrap"><table>
<thead><tr>
<th>Store</th><th>Plan</th><th>Installed</th>
<th class="n">Active registries</th><th class="n">Registries created</th>
<th class="n">Registry views</th><th class="n">Create-page views</th>
<th class="n">Add to cart</th><th class="n">Clicks to other stores</th>
<th class="n">Link shares<br><small>share · copy · QR</small></th><th>Admin opens</th>
<th class="n">Gifts bought in store</th><th class="n">Registry sales</th><th class="n">New customers</th>
<th class="n">All store orders</th><th class="n">Registry share</th><th>Last registry</th>
</tr></thead>
<tbody>
${rows || '<tr><td colspan="17">No stores yet.</td></tr>'}
</tbody>
</table></div>
<p class="note">Last ${days} days, UTC. Views and clicks skip bots and link previews. "All store orders" is every order
the store took (gross, before refunds), counted from the day this page shipped, so "Registry share" is only
meaningful for periods after that. "Link shares" and "Admin opens" count from the day they shipped (Nov 2026):
presses of Share, Copy link and QR code on registrants' manage pages, and how often the store's staff opened each
section of Giftpin in Shopify admin. Highlighted rows are Free stores with a registry sale, 50+ registry views or 3+ active
registries. Totals in the cards leave out dev stores and uninstalled stores.</p>
</body>
</html>`;
}
