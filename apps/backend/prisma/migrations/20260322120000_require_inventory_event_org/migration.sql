-- Backfill organization_id on existing inventory_events from contextual_products
UPDATE "inventory_events" e
SET "organization_id" = cp."organization_id"
FROM "contextual_products" cp
WHERE e."contextual_product_id" = cp."id"
  AND e."organization_id" IS NULL;

-- Enforce NOT NULL constraint on organization_id
ALTER TABLE "inventory_events"
ALTER COLUMN "organization_id" SET NOT NULL;
