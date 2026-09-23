-- Closes the addInternalItem/addExternalItem race condition (see CLAUDE.md,
-- STATUS.md, 19 Sep 2026): two near-simultaneous adds of the same
-- variant/URL could both pass the findFirst dedup check before either write
-- landed, producing duplicate RegistryItem rows.
--
-- Applied directly to the live database on 19 Sep 2026 via a Neon branch
-- migration (tested on a temporary branch first, then merged) rather than
-- through `prisma migrate dev`, because the device shell needed to run that
-- command was unavailable this session. This file makes Prisma's own
-- migration history match what's actually in the database — see the
-- "one-time step" note in STATUS.md for the `prisma migrate resolve`
-- command that reconciles it.
CREATE UNIQUE INDEX "RegistryItem_registryId_variantGid_key" ON "RegistryItem"("registryId", "variantGid");
CREATE UNIQUE INDEX "RegistryItem_registryId_externalUrl_key" ON "RegistryItem"("registryId", "externalUrl");
