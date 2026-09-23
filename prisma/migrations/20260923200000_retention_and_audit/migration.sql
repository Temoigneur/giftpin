-- Retention + audit trail (23 Sep 2026).
--
-- Written to be idempotent (IF NOT EXISTS) so it is safe whether it is applied
-- by `prisma migrate deploy` or was already applied by hand to the live Neon
-- database first. Purely additive: one nullable column, one index, one table.

ALTER TABLE "Purchase" ADD COLUMN IF NOT EXISTS "buyerCustomerId" TEXT;

CREATE INDEX IF NOT EXISTS "Purchase_buyerCustomerId_idx" ON "Purchase"("buyerCustomerId");

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL,
  "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "shop" TEXT,
  "actor" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "subject" TEXT,
  "detail" JSONB NOT NULL DEFAULT '{}',
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AuditLog_at_idx" ON "AuditLog"("at");
CREATE INDEX IF NOT EXISTS "AuditLog_shop_at_idx" ON "AuditLog"("shop", "at");
