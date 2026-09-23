import { Queue, Worker, type Job, type JobsOptions } from "bullmq";
import { getRedis } from "./cache.server";

/**
 * Background work.
 *
 * Shopify expects a webhook to be acknowledged in about five seconds, and
 * fetching a registrant-pasted URL from a retailer can take longer than that on
 * its own. So webhooks ack immediately and the real work happens here.
 *
 * With REDIS_URL set this is BullMQ. Without it, jobs run inline on a
 * microtask — which keeps `npm run dev` a single process with no Docker, and is
 * explicitly not how you run this in production.
 */

export type JobName =
  | "attribute-order"
  | "void-purchases"
  | "resolve-url"
  | "refresh-external"
  | "send-email"
  | "reap-claims";

export interface JobPayloads {
  "attribute-order": { shop: string; orderPayload: unknown };
  "void-purchases": { shop: string; orderId: string; lineItemIds?: string[]; reason: string };
  "resolve-url": { externalSourceId: string };
  "refresh-external": { batchSize?: number };
  "send-email": { template: string; to: string; data: Record<string, unknown> };
  "reap-claims": Record<string, never>;
}

type Handler<N extends JobName> = (payload: JobPayloads[N]) => Promise<void>;

const handlers = new Map<JobName, Handler<JobName>>();

export function registerHandler<N extends JobName>(name: N, handler: Handler<N>): void {
  handlers.set(name, handler as Handler<JobName>);
}

declare global {
  // eslint-disable-next-line no-var
  var __registroQueue: Queue | undefined;
  // eslint-disable-next-line no-var
  var __registroWorker: Worker | undefined;
}

const QUEUE_NAME = "registro";

function bullQueue(): Queue | null {
  const connection = getRedis();
  if (!connection) return null;
  if (!global.__registroQueue) {
    global.__registroQueue = new Queue(QUEUE_NAME, { connection });
  }
  return global.__registroQueue;
}

const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 5,
  backoff: { type: "exponential", delay: 2000 },
  removeOnComplete: { age: 3600, count: 1000 },
  removeOnFail: { age: 7 * 24 * 3600 },
};

/**
 * Enqueue work. Never throws — a failed enqueue is logged, because the caller
 * is usually a webhook handler that must still return 200 or Shopify will
 * retry the whole delivery.
 */
export async function enqueue<N extends JobName>(
  name: N,
  payload: JobPayloads[N],
  options?: JobsOptions,
): Promise<void> {
  const queue = bullQueue();

  if (!queue) {
    // Inline driver. Deliberately not awaited by the caller: we want the same
    // "returns immediately" shape as the real queue so behaviour doesn't
    // diverge between dev and production.
    void Promise.resolve().then(async () => {
      try {
        await runJob(name, payload);
      } catch (err) {
        console.error(`[queue:inline] ${name} failed:`, err);
      }
    });
    return;
  }

  try {
    await queue.add(name, payload, { ...DEFAULT_JOB_OPTIONS, ...options });
  } catch (err) {
    console.error(`[queue] failed to enqueue ${name}:`, (err as Error).message);
  }
}

let handlersLoaded: Promise<void> | null = null;

/**
 * `npm run worker` registers every handler by statically importing the model
 * files for their side effects (see worker.ts). The web process never does —
 * no route imports purchase.server.ts, claim.server.ts, resolver/index.server.ts
 * or email.server.ts for their own sake — so with REDIS_URL unset, the inline
 * driver below was calling into a `handlers` map that nothing had populated.
 * Every job silently hit the "no handler registered" branch: webhooks
 * acknowledged, jobs "ran", nothing was ever written. No error, because a
 * missing handler is treated as a legitimate no-op, not a bug.
 *
 * Dynamic import (not a static one at the top of this file) is deliberate:
 * purchase.server.ts imports back from shopify.server.ts, so a static import
 * here would be a real circular dependency. A dynamic import just resolves
 * once the whole module graph is ready, so it never sees that cycle.
 */
function ensureHandlersLoaded(): Promise<void> {
  if (!handlersLoaded) {
    handlersLoaded = Promise.all([
      import("../models/purchase.server"),
      import("../models/claim.server"),
      import("../lib/resolver/index.server"),
      import("../lib/email.server"),
    ]).then(() => undefined);
  }
  return handlersLoaded;
}

export async function runJob<N extends JobName>(name: N, payload: JobPayloads[N]): Promise<void> {
  await ensureHandlersLoaded();
  const handler = handlers.get(name);
  if (!handler) {
    console.warn(`[queue] no handler registered for "${name}"`);
    return;
  }
  await handler(payload as JobPayloads[JobName]);
}

/** Called by the worker process (npm run worker). No-op without Redis. */
export function startWorker(): Worker | null {
  const connection = getRedis();
  if (!connection) {
    console.warn("[worker] REDIS_URL is not set — nothing to consume. Jobs run inline in the web process.");
    return null;
  }
  if (global.__registroWorker) return global.__registroWorker;

  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      await runJob(job.name as JobName, job.data);
    },
    { connection, concurrency: 5 },
  );

  worker.on("failed", (job, err) => {
    console.error(`[worker] ${job?.name} failed (attempt ${job?.attemptsMade}):`, err.message);
  });

  global.__registroWorker = worker;
  return worker;
}

/** Repeatable maintenance jobs. Safe to call more than once. */
export async function scheduleRecurring(): Promise<void> {
  const queue = bullQueue();
  if (!queue) return;

  await queue.add(
    "reap-claims",
    {},
    { repeat: { pattern: "*/15 * * * *" }, jobId: "cron:reap-claims", ...DEFAULT_JOB_OPTIONS },
  );

  await queue.add(
    "refresh-external",
    { batchSize: 200 },
    { repeat: { pattern: "17 3 * * *" }, jobId: "cron:refresh-external", ...DEFAULT_JOB_OPTIONS },
  );
}
