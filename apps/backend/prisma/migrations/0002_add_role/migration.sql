-- 0002_add_role — roles-profile UoW
-- Drives: BR-A13 (role at signup), BR-A14 (role data model + backwards-compat default).
-- Backwards-compatible: existing rows backfill to 'SELLER' via DEFAULT (US-009 AC6).
-- Rollback: see migration-rollback.sql.

CREATE TYPE "Role" AS ENUM ('MERCHANT', 'SELLER');

ALTER TABLE "users"
  ADD COLUMN "role" "Role" NOT NULL DEFAULT 'SELLER';
