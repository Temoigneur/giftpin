-- Gift cards sold through Giftpin's gift card listing. Additive and idempotent.
CREATE TABLE IF NOT EXISTS "GiftCardSale" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "lineItemId" TEXT NOT NULL,
    "orderName" TEXT,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'store',
    "voidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftCardSale_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "GiftCardSale_orderId_lineItemId_key" ON "GiftCardSale"("orderId", "lineItemId");
CREATE INDEX IF NOT EXISTS "GiftCardSale_shopId_createdAt_idx" ON "GiftCardSale"("shopId", "createdAt");

DO $$ BEGIN
    ALTER TABLE "GiftCardSale" ADD CONSTRAINT "GiftCardSale_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
