-- CreateEnum
CREATE TYPE "RegistryPrivacy" AS ENUM ('unlisted', 'public_', 'password');

-- CreateEnum
CREATE TYPE "RegistryStatus" AS ENUM ('active', 'archived', 'deleted');

-- CreateEnum
CREATE TYPE "RegistrantRole" AS ENUM ('owner', 'co');

-- CreateEnum
CREATE TYPE "ItemSourceType" AS ENUM ('internal', 'shopify_ext', 'web', 'manual');

-- CreateEnum
CREATE TYPE "PurchaseSource" AS ENUM ('online', 'pos', 'manual', 'external');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "name" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "moneyFormat" TEXT,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uninstalledAt" TIMESTAMP(3),
    "settings" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registry" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "customerId" TEXT,
    "slug" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "message" TEXT,
    "coverImageUrl" TEXT,
    "privacy" "RegistryPrivacy" NOT NULL DEFAULT 'unlisted',
    "indexable" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT,
    "shipToRegistrant" BOOLEAN NOT NULL DEFAULT false,
    "shippingAddressEnc" TEXT,
    "status" "RegistryStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registrant" (
    "id" TEXT NOT NULL,
    "registryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emailEnc" TEXT NOT NULL,
    "emailHash" TEXT NOT NULL,
    "role" "RegistrantRole" NOT NULL DEFAULT 'owner',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Registrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistryItem" (
    "id" TEXT NOT NULL,
    "registryId" TEXT NOT NULL,
    "sourceType" "ItemSourceType" NOT NULL,
    "productGid" TEXT,
    "variantGid" TEXT,
    "externalSourceId" TEXT,
    "snapshotTitle" TEXT,
    "snapshotImageUrl" TEXT,
    "snapshotPrice" DECIMAL(12,2),
    "snapshotCurrency" TEXT,
    "externalUrl" TEXT,
    "desiredQty" INTEGER NOT NULL DEFAULT 1,
    "purchasedQty" INTEGER NOT NULL DEFAULT 0,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalSource" (
    "id" TEXT NOT NULL,
    "canonicalUrlHash" TEXT NOT NULL,
    "canonicalUrl" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "resolver" TEXT NOT NULL,
    "title" TEXT,
    "imageUrl" TEXT,
    "price" DECIMAL(12,2),
    "currency" TEXT,
    "availability" TEXT,
    "lastFetchedAt" TIMESTAMP(3),
    "fetchStatus" TEXT NOT NULL DEFAULT 'pending',
    "fetchError" TEXT,
    "ttlSeconds" INTEGER NOT NULL DEFAULT 604800,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "guestFingerprint" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "source" "PurchaseSource" NOT NULL,
    "orderId" TEXT,
    "lineItemId" TEXT,
    "orderName" TEXT,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "amount" DECIMAL(12,2),
    "currency" TEXT,
    "buyerName" TEXT,
    "buyerEmailEnc" TEXT,
    "buyerMessage" TEXT,
    "hiddenUntil" TIMESTAMP(3),
    "shippedToRegistrant" BOOLEAN NOT NULL DEFAULT false,
    "isNewCustomer" BOOLEAN NOT NULL DEFAULT false,
    "voidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistryEvent" (
    "id" TEXT NOT NULL,
    "registryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessedWebhook" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_shop_idx" ON "Session"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_domain_key" ON "Shop"("domain");

-- CreateIndex
CREATE INDEX "Shop_uninstalledAt_idx" ON "Shop"("uninstalledAt");

-- CreateIndex
CREATE INDEX "Registry_shopId_status_idx" ON "Registry"("shopId", "status");

-- CreateIndex
CREATE INDEX "Registry_shopId_eventDate_idx" ON "Registry"("shopId", "eventDate");

-- CreateIndex
CREATE UNIQUE INDEX "Registry_shopId_slug_key" ON "Registry"("shopId", "slug");

-- CreateIndex
CREATE INDEX "Registrant_registryId_idx" ON "Registrant"("registryId");

-- CreateIndex
CREATE INDEX "Registrant_emailHash_idx" ON "Registrant"("emailHash");

-- CreateIndex
CREATE INDEX "RegistryItem_registryId_priority_idx" ON "RegistryItem"("registryId", "priority");

-- CreateIndex
CREATE INDEX "RegistryItem_externalSourceId_idx" ON "RegistryItem"("externalSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalSource_canonicalUrlHash_key" ON "ExternalSource"("canonicalUrlHash");

-- CreateIndex
CREATE INDEX "ExternalSource_domain_idx" ON "ExternalSource"("domain");

-- CreateIndex
CREATE INDEX "ExternalSource_fetchStatus_lastFetchedAt_idx" ON "ExternalSource"("fetchStatus", "lastFetchedAt");

-- CreateIndex
CREATE INDEX "Claim_itemId_releasedAt_idx" ON "Claim"("itemId", "releasedAt");

-- CreateIndex
CREATE INDEX "Claim_expiresAt_releasedAt_idx" ON "Claim"("expiresAt", "releasedAt");

-- CreateIndex
CREATE INDEX "Purchase_itemId_voidedAt_idx" ON "Purchase"("itemId", "voidedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_orderId_lineItemId_key" ON "Purchase"("orderId", "lineItemId");

-- CreateIndex
CREATE INDEX "RegistryEvent_registryId_createdAt_idx" ON "RegistryEvent"("registryId", "createdAt");

-- CreateIndex
CREATE INDEX "RegistryEvent_type_createdAt_idx" ON "RegistryEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "ProcessedWebhook_createdAt_idx" ON "ProcessedWebhook"("createdAt");

-- AddForeignKey
ALTER TABLE "Registry" ADD CONSTRAINT "Registry_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registrant" ADD CONSTRAINT "Registrant_registryId_fkey" FOREIGN KEY ("registryId") REFERENCES "Registry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistryItem" ADD CONSTRAINT "RegistryItem_registryId_fkey" FOREIGN KEY ("registryId") REFERENCES "Registry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistryItem" ADD CONSTRAINT "RegistryItem_externalSourceId_fkey" FOREIGN KEY ("externalSourceId") REFERENCES "ExternalSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "RegistryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "RegistryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistryEvent" ADD CONSTRAINT "RegistryEvent_registryId_fkey" FOREIGN KEY ("registryId") REFERENCES "Registry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
