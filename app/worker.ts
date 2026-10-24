/**
 * Background worker entry point (`npm run worker`).
 *
 * Runs as a second Railway service against the same Redis and Postgres. The web
 * process enqueues and returns; this process does the slow work — fetching
 * product pages from other people's servers, sending mail, reaping claims.
 *
 * Importing the modules is what registers their handlers, so the imports below
 * are load-bearing even though nothing here calls into them directly.
 */

import { startWorker, scheduleRecurring } from "./lib/queue.server";

import "./models/purchase.server";
import "./models/claim.server";
import "./lib/resolver/index.server";
import "./lib/store-match.server";
import "./lib/email.server";
import "./models/retention.server";
import "./models/automations.server";
import "./models/gift-card-fee.server";

async function main() {
  const worker = startWorker();
  if (!worker) {
    console.error(
      "[worker] REDIS_URL is not set. Without it, jobs run inline in the web process and this worker has nothing to do.",
    );
    process.exit(1);
  }

  await scheduleRecurring();
  console.log("[worker] ready");

  const shutdown = async (signal: string) => {
    console.log(`[worker] ${signal} — draining`);
    // Let in-flight jobs finish rather than dropping a half-written purchase.
    await worker.close();
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("[worker] failed to start:", err);
  process.exit(1);
});
