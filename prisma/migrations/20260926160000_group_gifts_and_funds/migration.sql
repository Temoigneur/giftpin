-- Group gifting and cash funds (Pro). Additive and idempotent. See SPIKE-C.md.
ALTER TYPE "ItemSourceType" ADD VALUE IF NOT EXISTS 'fund';

ALTER TABLE "RegistryItem" ADD COLUMN IF NOT EXISTS "fundGoal" DECIMAL(12,2);
ALTER TABLE "RegistryItem" ADD COLUMN IF NOT EXISTS "fundedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0;

ALTER TABLE "Registry" ADD COLUMN IF NOT EXISTS "contributionsToRegistrant" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Purchase" ADD COLUMN IF NOT EXISTS "isContribution" BOOLEAN NOT NULL DEFAULT false;
