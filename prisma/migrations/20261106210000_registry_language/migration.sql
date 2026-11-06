-- Optional per-registry language. Null = follow the store's language setting.
-- Additive and idempotent; no existing row changes.
ALTER TABLE "Registry" ADD COLUMN IF NOT EXISTS "language" TEXT;
