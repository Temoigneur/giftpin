-- Applied directly to the live Neon DB via a tested branch migration on
-- 23 Sep 2026 (device shell down). This file keeps Prisma's migration history
-- in step with what's live; mark it applied with:
--   npx prisma migrate resolve --applied 20260923141855_registry_item_category

ALTER TABLE "RegistryItem" ADD COLUMN "category" TEXT;
