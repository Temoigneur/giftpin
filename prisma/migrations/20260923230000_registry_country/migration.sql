-- Which country's stores to link to when the hosting store doesn't carry an item.
-- NULL means the default (United States). Additive and idempotent.
ALTER TABLE "Registry" ADD COLUMN IF NOT EXISTS "country" TEXT;
