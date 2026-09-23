-- Applied directly to the live Neon DB via a tested branch migration on
-- 23 Sep 2026 (device shell down this session — see STATUS.md's "Known
-- ongoing constraint"). This file exists only so Prisma's own migration
-- history matches what's actually live; same pattern as
-- 20260919181534_registry_item_dedup_constraints.

CREATE TYPE "ShopPlan" AS ENUM ('free', 'pro');

ALTER TABLE "Shop"
  ADD COLUMN "plan" "ShopPlan" NOT NULL DEFAULT 'free',
  ADD COLUMN "shopifyChargeId" TEXT,
  ADD COLUMN "planUpdatedAt" TIMESTAMP(3);
