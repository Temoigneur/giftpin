-- Store-match suggestion columns. Tested on a temporary Neon branch on
-- 23 Sep 2026. After it is applied to the live DB, sync Prisma's history:
--   npx prisma migrate resolve --applied 20260923144100_registry_item_store_match

ALTER TABLE "RegistryItem"
  ADD COLUMN "storeMatchStatus" TEXT,
  ADD COLUMN "storeMatchProductGid" TEXT,
  ADD COLUMN "storeMatchVariantGid" TEXT,
  ADD COLUMN "storeMatchTitle" TEXT,
  ADD COLUMN "storeMatchHandle" TEXT;
