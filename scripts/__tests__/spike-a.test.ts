import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { verifyAttribution } from "../../app/lib/attribution";

/**
 * scripts/spike-a.mjs re-implements the HMAC from app/lib/attribution.ts so it
 * can run with no build step and no database. That duplication is deliberate,
 * but it must never drift — a spike run against a token the app would reject
 * would send you chasing a platform bug that isn't there.
 *
 * So: run the script, pull the token out of its output, and assert the real
 * app function accepts it.
 */

const SCRIPT = path.join(process.cwd(), "scripts", "spike-a.mjs");

function runScript(args: string[]): string {
  return execFileSync("node", [SCRIPT, ...args], {
    encoding: "utf8",
    env: {
      ...process.env,
      // Same key vitest.config.ts gives the app, so both sides sign alike.
      SIGNING_KEY: Buffer.alloc(32, 9).toString("base64"),
    },
  });
}

describe("scripts/spike-a.mjs", () => {
  it("mints a token the app's own verifier accepts", () => {
    const output = runScript(["40000001"]);
    const match = output.match(/'_rg':\s*'([^']+)'/);

    expect(match, "no _rg token found in script output").not.toBeNull();

    const payload = verifyAttribution(match![1]);
    expect(payload).toEqual({ r: "reg_SPIKE_A", i: "ri_SPIKE_A" });
  });

  it("emits a snippet that records the cart token on every run", () => {
    // Fallback (b) in the spike doc reconciles server-side on cart_token. If
    // rows 1-7 fail, the cart tokens from these runs are the only evidence
    // available without re-running the whole matrix.
    const output = runScript(["40000001"]);
    expect(output).toContain("/cart.js");
    expect(output).toContain("CART TOKEN");
  });

  it("rejects a tampered token via --verify", () => {
    expect(() => runScript(["--verify", "bogus.token"])).toThrow();
  });

  it("refuses a non-numeric variant id rather than producing a broken snippet", () => {
    expect(() => runScript(["gid://shopify/ProductVariant/40000001"])).toThrow();
  });
});
