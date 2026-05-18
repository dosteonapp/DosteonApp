CREATE TABLE "menu_categories" (
  "id"              UUID NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" UUID NOT NULL,
  "name"            TEXT NOT NULL,
  "created_at"      TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "menu_categories_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "menu_categories_organization_id_name_key" UNIQUE ("organization_id", "name"),
  CONSTRAINT "menu_categories_organization_id_fkey"
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
