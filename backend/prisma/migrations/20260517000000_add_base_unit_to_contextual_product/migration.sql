-- Add base_unit column to contextual_products
ALTER TABLE "contextual_products" ADD COLUMN IF NOT EXISTS "base_unit" TEXT;

-- Backfill from pack_unit where available
UPDATE "contextual_products" SET base_unit = pack_unit WHERE pack_unit IS NOT NULL AND base_unit IS NULL;
