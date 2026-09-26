-- Additive only: a new table for guests who opt in to a pre-event reminder.

-- CreateTable
CREATE TABLE "GuestReminder" (
    "id" TEXT NOT NULL,
    "registryId" TEXT NOT NULL,
    "emailEnc" TEXT NOT NULL,
    "emailHash" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuestReminder_emailHash_idx" ON "GuestReminder"("emailHash");

-- CreateIndex
CREATE UNIQUE INDEX "GuestReminder_registryId_emailHash_key" ON "GuestReminder"("registryId", "emailHash");

-- AddForeignKey
ALTER TABLE "GuestReminder" ADD CONSTRAINT "GuestReminder_registryId_fkey" FOREIGN KEY ("registryId") REFERENCES "Registry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
