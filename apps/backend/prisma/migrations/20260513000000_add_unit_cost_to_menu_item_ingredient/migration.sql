-- AddColumn
ALTER TABLE "menu_item_ingredients" ADD COLUMN IF NOT EXISTS "unit_cost" DOUBLE PRECISION;
