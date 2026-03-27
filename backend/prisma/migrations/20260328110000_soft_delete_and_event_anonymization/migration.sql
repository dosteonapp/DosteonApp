-- Add soft-delete fields and allow inventory event anonymization

ALTER TABLE "organizations"
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ;

ALTER TABLE "profiles"
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ;

ALTER TABLE "inventory_events"
  ALTER COLUMN "organization_id" DROP NOT NULL;
