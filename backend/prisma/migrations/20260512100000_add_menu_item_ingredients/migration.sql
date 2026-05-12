CREATE TABLE "menu_item_ingredients" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "menu_item_id" UUID NOT NULL,
  "contextual_product_id" UUID NOT NULL,
  "quantity_per_unit" DOUBLE PRECISION NOT NULL,
  "unit" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "menu_item_ingredients_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "menu_item_ingredients"
  ADD CONSTRAINT "menu_item_ingredients_menu_item_id_fkey"
  FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "menu_item_ingredients"
  ADD CONSTRAINT "menu_item_ingredients_contextual_product_id_fkey"
  FOREIGN KEY ("contextual_product_id") REFERENCES "contextual_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "menu_item_ingredients_menu_item_id_contextual_product_id_key"
  ON "menu_item_ingredients"("menu_item_id", "contextual_product_id");

CREATE INDEX "menu_item_ingredients_menu_item_id_idx" ON "menu_item_ingredients"("menu_item_id");
CREATE INDEX "menu_item_ingredients_contextual_product_id_idx" ON "menu_item_ingredients"("contextual_product_id");
