-- Daily counters for registry analytics. Additive and idempotent.
CREATE TABLE IF NOT EXISTS "DailyStat" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "metric" TEXT NOT NULL,
    "registryId" TEXT NOT NULL DEFAULT '',
    "count" INTEGER NOT NULL DEFAULT 0,
    "value" DECIMAL(14,2) NOT NULL DEFAULT 0,

    CONSTRAINT "DailyStat_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DailyStat_shopId_day_metric_registryId_key" ON "DailyStat"("shopId", "day", "metric", "registryId");
CREATE INDEX IF NOT EXISTS "DailyStat_day_metric_idx" ON "DailyStat"("day", "metric");

DO $$ BEGIN
  ALTER TABLE "DailyStat" ADD CONSTRAINT "DailyStat_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
