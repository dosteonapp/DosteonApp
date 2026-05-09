-- ============================================================
-- Bridge migration: fills all schema gaps that were applied
-- directly in Supabase without Prisma migration files.
-- Every statement uses IF NOT EXISTS so it is safe to re-run
-- on production where these objects already exist.
-- ============================================================

-- ── New enums ─────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE "ConsumptionReason" AS ENUM (
        'CUSTOMER_SERVICE', 'STAFF_MEAL', 'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "WasteReason" AS ENUM (
        'SPOILED_EXPIRED', 'DAMAGED_PACKAGING', 'SPILLED_DROPPED',
        'OVERCOOKED_BURNED', 'QUALITY_ISSUE', 'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SaleChannel" AS ENUM ('DINE_IN', 'TAKEAWAY', 'DELIVERY');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SaleStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'VOIDED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ── Missing columns on organizations ─────────────────────

ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "city"               TEXT;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "phone"              TEXT;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "daily_stock_count"  BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "logo_url"           TEXT;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "address"            TEXT;

-- ── Missing columns on profiles ──────────────────────────

ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "avatar_url"           TEXT;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "onboarding_completed"  BOOLEAN NOT NULL DEFAULT false;

-- ── brands table ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "brands" (
    "id"              UUID        NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID        NOT NULL,
    "name"            TEXT        NOT NULL,
    "logo_url"        TEXT,
    "is_active"       BOOLEAN     NOT NULL DEFAULT true,
    "created_at"      TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at"      TIMESTAMPTZ(6),
    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "brands_organization_id_name_key"
    ON "brands"("organization_id", "name");

CREATE INDEX IF NOT EXISTS "brands_organization_id_idx"
    ON "brands"("organization_id");

-- ── Add brand_id to locations and contextual_products ────

ALTER TABLE "locations" ADD COLUMN IF NOT EXISTS "name"     TEXT;
ALTER TABLE "locations" ADD COLUMN IF NOT EXISTS "brand_id" UUID;
CREATE INDEX IF NOT EXISTS "locations_brand_id_idx" ON "locations"("brand_id");

ALTER TABLE "contextual_products" ADD COLUMN IF NOT EXISTS "brand_id" UUID;
ALTER TABLE "contextual_products" ADD COLUMN IF NOT EXISTS "pending_canonical_review" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS "contextual_products_brand_id_idx" ON "contextual_products"("brand_id");

-- ── New columns on inventory_events ──────────────────────

ALTER TABLE "inventory_events" ADD COLUMN IF NOT EXISTS "consumption_reason" "ConsumptionReason";
ALTER TABLE "inventory_events" ADD COLUMN IF NOT EXISTS "waste_reason"        "WasteReason";

-- ── menu_items table ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS "menu_items" (
    "id"              UUID        NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID        NOT NULL,
    "brand_id"        UUID,
    "name"            TEXT        NOT NULL,
    "price"           DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cost"            DOUBLE PRECISION DEFAULT 0,
    "category"        TEXT        NOT NULL DEFAULT 'Signature',
    "status"          TEXT        NOT NULL DEFAULT 'active',
    "source"          TEXT        NOT NULL DEFAULT 'onboarding',
    "created_at"      TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "menu_items_organization_id_idx" ON "menu_items"("organization_id");
CREATE INDEX IF NOT EXISTS "menu_items_brand_id_idx"        ON "menu_items"("brand_id");

-- ── sale_orders table ────────────────────────────────────

CREATE TABLE IF NOT EXISTS "sale_orders" (
    "id"              UUID        NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID        NOT NULL,
    "brand_id"        UUID,
    "channel"         "SaleChannel"  NOT NULL DEFAULT 'DINE_IN',
    "status"          "SaleStatus"   NOT NULL DEFAULT 'COMPLETED',
    "total_revenue"   DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_cogs"      DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gross_profit"    DOUBLE PRECISION NOT NULL DEFAULT 0,
    "logged_by"       UUID,
    "business_date"   DATE        NOT NULL,
    "occurred_at"     TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at"      TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sale_orders_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "sale_orders_organization_id_idx"
    ON "sale_orders"("organization_id");
CREATE INDEX IF NOT EXISTS "sale_orders_brand_id_idx"
    ON "sale_orders"("brand_id");
CREATE INDEX IF NOT EXISTS "sale_orders_organization_id_business_date_idx"
    ON "sale_orders"("organization_id", "business_date");

-- ── sale_order_items table ───────────────────────────────

CREATE TABLE IF NOT EXISTS "sale_order_items" (
    "id"            UUID    NOT NULL DEFAULT gen_random_uuid(),
    "sale_order_id" UUID    NOT NULL,
    "menu_item_id"  UUID    NOT NULL,
    "quantity"      INTEGER NOT NULL DEFAULT 1,
    "unit_price"    DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit_cogs"     DOUBLE PRECISION NOT NULL DEFAULT 0,
    "line_total"    DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT "sale_order_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "sale_order_items_sale_order_id_idx" ON "sale_order_items"("sale_order_id");
CREATE INDEX IF NOT EXISTS "sale_order_items_menu_item_id_idx"  ON "sale_order_items"("menu_item_id");
