import dns from "node:dns/promises";
import net from "node:net";
import { cache } from "../cache.server";

/**
 * Outbound fetching for registrant-pasted URLs.
 *
 * The rules this enforces are what keep the feature on the right side of both
 * the law and App Store requirement 1.1.13:
 *
 *  - We fetch ONLY a URL a registrant explicitly pasted. There is no crawler
 *    here, no catalog enumeration, no bulk import. One URL, one fetch.
 *  - We identify ourselves honestly and carry a contact URL, so a retailer who
 *    wants us to stop has an obvious way to say so.
 *  - We respect robots.txt and a configurable denylist.
 *  - We rate-limit per destination domain and cache hard.
 *  - We refuse to fetch anything that resolves to a private address, because
 *    this endpoint takes a user-supplied URL and would otherwise be a
 *    server-side request forgery hole straight into the cluster.
 */

const TIMEOUT_MS = 8_000;
const MAX_BYTES = 2 * 1024 * 1024; // product pages are big; 2MB is generous
const MAX_REDIRECTS = 3;
const PER_DOMAIN_PER_MINUTE = 10;

function userAgent(): string {
  return (
    process.env.RESOLVER_USER_AGENT ||
    "GiftpinBot/1.0 (+https://giftpin.app/; gift registry link preview)"
  );
}

function denylist(): Set<string> {
  return new Set(
    (process.env.RESOLVER_DENYLIST || "")
      .split(",")
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean),
  );
}

export class FetchRefused extends Error {
  constructor(
    message: string,
    readonly reason: "denylisted" | "robots" | "private_address" | "rate_limited" | "too_large" | "bad_status" | "timeout" | "network",
  ) {
    super(message);
  }
}

// ---------------------------------------------------------------------------
// SSRF guard
// ---------------------------------------------------------------------------

function isPrivateAddress(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true; // link-local / cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a >= 224) return true; // multicast + reserved
    return false;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::") return true;
    if (lower.startsWith("fe80")) return true; // link-local
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique-local
    // IPv4-mapped — re-check the embedded address
    const mapped = lower.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateAddress(mapped[1]);
    return false;
  }
  return true; // unparseable: refuse
}

async function assertPublicHost(hostname: string): Promise<void> {
  // A literal IP in the URL skips DNS entirely.
  if (net.isIP(hostname)) {
    if (isPrivateAddress(hostname)) {
      throw new FetchRefused(`Refusing to fetch private address ${hostname}`, "private_address");
    }
    return;
  }

  let records: { address: string }[];
  try {
    records = await dns.lookup(hostname, { all: true });
  } catch {
    throw new FetchRefused(`Could not resolve ${hostname}`, "network");
  }

  if (records.length === 0) {
    throw new FetchRefused(`Could not resolve ${hostname}`, "network");
  }
  for (const record of records) {
    if (isPrivateAddress(record.address)) {
      throw new FetchRefused(`${hostname} resolves to a private address`, "private_address");
    }
  }
}

// ---------------------------------------------------------------------------
// robots.txt
// ---------------------------------------------------------------------------

/**
 * Deliberately small. We only ever request one page that a human pasted, so
 * the question is just "is this path disallowed for us" — no crawl-delay
 * scheduling, no sitemap discovery.
 */
export function robotsAllows(robotsTxt: string, path: string, agent: string): boolean {
  const lines = robotsTxt.split("\n").map((l) => l.replace(/#.*$/, "").trim());

  const groups: { agents: string[]; rules: { allow: boolean; path: string }[] }[] = [];
  let current: (typeof groups)[number] | null = null;
  let lastWasAgent = false;

  for (const line of lines) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const field = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (field === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else if (field === "allow" || field === "disallow") {
      if (!current) continue;
      lastWasAgent = false;
      if (value !== "" || field === "disallow") {
        current.rules.push({ allow: field === "allow", path: value });
      }
    }
  }

  const name = agent.toLowerCase();
  const specific = groups.find((g) => g.agents.some((a) => a !== "*" && name.includes(a)));
  const wildcard = groups.find((g) => g.agents.includes("*"));
  const group = specific ?? wildcard;
  if (!group) return true;

  // Longest matching rule wins; Allow wins ties. (Google's precedence rule.)
  let best: { allow: boolean; length: number } | null = null;
  for (const rule of group.rules) {
    if (rule.path === "") continue;
    const pattern = rule.path.replace(/\*/g, "");
    const matches = rule.path.includes("*")
      ? new RegExp("^" + rule.path.split("*").map(escapeRegex).join(".*")).test(path)
      : path.startsWith(rule.path);
    if (!matches) continue;
    const length = pattern.length;
    if (!best || length > best.length || (length === best.length && rule.allow)) {
      best = { allow: rule.allow, length };
    }
  }

  return best ? best.allow : true;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function checkRobots(url: URL): Promise<boolean> {
  const key = `robots:${url.hostname}`;
  const driver = cache();

  let body = await driver.get(key).catch(() => null);

  if (body === null) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const response = await fetch(`https://${url.hostname}/robots.txt`, {
        headers: { "User-Agent": userAgent() },
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timer);
      // A missing or erroring robots.txt means "no restrictions".
      body = response.ok ? (await response.text()).slice(0, 100_000) : "";
    } catch {
      body = "";
    }
    await driver.set(key, body, 24 * 3600).catch(() => {});
  }

  if (body === "") return true;
  return robotsAllows(body, url.pathname, userAgent());
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

export interface FetchedPage {
  finalUrl: string;
  html: string;
  contentType: string;
}

/** Fetch a product page for metadata extraction, with every guard applied. */
export async function fetchProductPage(rawUrl: string): Promise<FetchedPage> {
  const url = new URL(rawUrl);

  if (denylist().has(url.hostname)) {
    throw new FetchRefused(`${url.hostname} is on the denylist`, "denylisted");
  }

  const rate = await cache()
    .incrWithTtl(`fetchrate:${url.hostname}`, 60)
    .catch(() => 0);
  if (rate > PER_DOMAIN_PER_MINUTE) {
    throw new FetchRefused(`Rate limit reached for ${url.hostname}`, "rate_limited");
  }

  if (!(await checkRobots(url))) {
    throw new FetchRefused(`robots.txt disallows ${url.pathname}`, "robots");
  }

  return fetchWithGuards(url, 0);
}

async function fetchWithGuards(url: URL, redirectCount: number): Promise<FetchedPage> {
  if (redirectCount > MAX_REDIRECTS) {
    throw new FetchRefused("Too many redirects", "network");
  }

  await assertPublicHost(url.hostname);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      headers: {
        "User-Agent": userAgent(),
        Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-CA,en-US;q=0.9,en;q=0.8,fr-CA;q=0.7",
      },
      signal: controller.signal,
      // Manual, so each hop gets the SSRF check — otherwise a public host can
      // redirect us straight at 169.254.169.254.
      redirect: "manual",
    });
  } catch (err) {
    clearTimeout(timer);
    const isAbort = (err as Error).name === "AbortError";
    throw new FetchRefused(
      isAbort ? "Timed out" : `Network error: ${(err as Error).message}`,
      isAbort ? "timeout" : "network",
    );
  }
  clearTimeout(timer);

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    if (!location) throw new FetchRefused("Redirect without a location", "network");
    return fetchWithGuards(new URL(location, url), redirectCount + 1);
  }

  if (!response.ok) {
    throw new FetchRefused(`Responded ${response.status}`, "bad_status");
  }

  const contentType = response.headers.get("content-type") ?? "";
  const declaredLength = Number(response.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BYTES) {
    throw new FetchRefused("Page too large", "too_large");
  }

  const html = await readCapped(response, MAX_BYTES);

  return { finalUrl: response.url || url.toString(), html, contentType };
}

/** Reads at most `limit` bytes, then abandons the stream. */
async function readCapped(response: Response, limit: number): Promise<string> {
  if (!response.body) return response.text();

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel().catch(() => {});
      throw new FetchRefused("Page too large", "too_large");
    }
    chunks.push(value);
  }

  return Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf8");
}

export const __testables = { isPrivateAddress, robotsAllows };
