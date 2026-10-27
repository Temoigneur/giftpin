-- Gift card usage fee and directory country. Additive and idempotent.
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "devStore" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "GiftCardSale" ADD COLUMN IF NOT EXISTS "feeStatus" TEXT;
ALTER TABLE "GiftCardSale" ADD COLUMN IF NOT EXISTS "feeAmount" DECIMAL(12,2);
ALTER TABLE "GiftCardSale" ADD COLUMN IF NOT EXISTS "feeCurrency" TEXT;
ALTER TABLE "GiftCardSale" ADD COLUMN IF NOT EXISTS "feeRate" DECIMAL(14,6);
ALTER TABLE "GiftCardSale" ADD COLUMN IF NOT EXISTS "usageRecordId" TEXT;
ALTER TABLE "GiftCardSale" ADD COLUMN IF NOT EXISTS "feeCheckedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "GiftCardSale_feeStatus_createdAt_idx" ON "GiftCardSale"("feeStatus", "createdAt");
