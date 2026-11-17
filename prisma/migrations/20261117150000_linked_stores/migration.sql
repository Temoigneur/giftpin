-- Linked stores (multi-store registries). Additive only: two nullable columns
-- and three new tables. No existing row changes meaning (a null sourceShopId
-- or Purchase.shopId means "the registry's own store", as before).

ALTER TABLE "RegistryItem" ADD COLUMN IF NOT EXISTS "sourceShopId" TEXT;
CREATE INDEX IF NOT EXISTS "RegistryItem_sourceShopId_idx" ON "RegistryItem"("sourceShopId");
ALTER TABLE "RegistryItem" ADD CONSTRAINT "RegistryItem_sourceShopId_fkey"
  FOREIGN KEY ("sourceShopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Purchase" ADD COLUMN IF NOT EXISTS "shopId" TEXT;
CREATE INDEX IF NOT EXISTS "Purchase_shopId_idx" ON "Purchase"("shopId");

CREATE TABLE "StoreGroup" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoreGroup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StoreGroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoreGroupMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StoreGroupMember_shopId_key" ON "StoreGroupMember"("shopId");
CREATE INDEX "StoreGroupMember_groupId_idx" ON "StoreGroupMember"("groupId");
ALTER TABLE "StoreGroupMember" ADD CONSTRAINT "StoreGroupMember_groupId_fkey"
  FOREIGN KEY ("groupId") REFERENCES "StoreGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoreGroupMember" ADD CONSTRAINT "StoreGroupMember_shopId_fkey"
  FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "StoreLinkCode" (
    "id" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "usedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoreLinkCode_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StoreLinkCode_codeHash_key" ON "StoreLinkCode"("codeHash");
CREATE INDEX "StoreLinkCode_shopId_createdAt_idx" ON "StoreLinkCode"("shopId", "createdAt");
