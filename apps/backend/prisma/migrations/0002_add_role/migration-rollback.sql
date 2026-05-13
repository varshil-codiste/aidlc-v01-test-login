-- Rollback for 0002_add_role.
-- Run manually if `0002_add_role/migration.sql` must be reverted.

ALTER TABLE "users" DROP COLUMN "role";
DROP TYPE "Role";
