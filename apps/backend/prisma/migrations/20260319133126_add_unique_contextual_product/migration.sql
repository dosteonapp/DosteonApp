-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'MANAGER', 'CHEF', 'STAFF');

-- CreateEnum
CREATE TYPE "InventoryEventType" AS ENUM ('OPENING', 'RECEIVED', 'USED', 'WASTED', 'ADJUSTMENT', 'TRANSFER', 'CLOSING_CORRECTION');

-- CreateEnum
CREATE TYPE "DayState" AS ENUM ('CLOSED', 'OPEN', 'CLOSING');

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'restaurant',
    "settings" JSONB DEFAULT '{"opening_time": "08:00", "closing_time": "22:00"}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "first_name" TEXT,
    "last_name" TEXT,
    "organization_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canonical_products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "product_type" TEXT NOT NULL DEFAULT 'inventory_item',
    "base_unit" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_critical_item" BOOLEAN NOT NULL DEFAULT false,
    "synonyms" TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canonical_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT,
    "city" TEXT,
    "location_type" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contextual_products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "canonical_product_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "owner_type" TEXT NOT NULL DEFAULT 'restaurant',
    "name" TEXT,
    "sku" TEXT,
    "brand_name" TEXT,
    "pack_size" DOUBLE PRECISION,
    "pack_unit" TEXT,
    "preferred_unit" TEXT,
    "current_stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reorder_threshold" DOUBLE PRECISION DEFAULT 0,
    "critical_threshold" DOUBLE PRECISION DEFAULT 0,
    "location_id" UUID,
    "storage_type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contextual_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contextual_product_id" UUID NOT NULL,
    "organization_id" UUID,
    "event_type" "InventoryEventType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "source_location_id" UUID,
    "destination_location_id" UUID,
    "actor_type" TEXT,
    "actor_id" UUID,
    "reference_id" TEXT,
    "metadata" JSONB,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "day_status" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "state" "DayState" NOT NULL DEFAULT 'CLOSED',
    "business_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opened_by" UUID,
    "closed_by" UUID,
    "opened_at" TIMESTAMPTZ(6),
    "closed_at" TIMESTAMPTZ(6),
    "is_opening_completed" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "day_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_conversions" (
    "from_unit" TEXT NOT NULL,
    "to_unit" TEXT NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "unit_conversions_pkey" PRIMARY KEY ("from_unit","to_unit")
);

-- CreateIndex
CREATE INDEX "profiles_organization_id_idx" ON "profiles"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "canonical_products_sku_key" ON "canonical_products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "canonical_products_name_key" ON "canonical_products"("name");

-- CreateIndex
CREATE INDEX "canonical_products_sku_idx" ON "canonical_products"("sku");

-- CreateIndex
CREATE INDEX "contextual_products_organization_id_idx" ON "contextual_products"("organization_id");

-- CreateIndex
CREATE INDEX "contextual_products_sku_idx" ON "contextual_products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "contextual_products_organization_id_canonical_product_id_key" ON "contextual_products"("organization_id", "canonical_product_id");

-- CreateIndex
CREATE INDEX "inventory_events_contextual_product_id_idx" ON "inventory_events"("contextual_product_id");

-- CreateIndex
CREATE INDEX "inventory_events_organization_id_idx" ON "inventory_events"("organization_id");

-- CreateIndex
CREATE INDEX "inventory_events_created_at_idx" ON "inventory_events"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "day_status_organization_id_key" ON "day_status"("organization_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contextual_products" ADD CONSTRAINT "contextual_products_canonical_product_id_fkey" FOREIGN KEY ("canonical_product_id") REFERENCES "canonical_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contextual_products" ADD CONSTRAINT "contextual_products_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contextual_products" ADD CONSTRAINT "contextual_products_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_events" ADD CONSTRAINT "inventory_events_contextual_product_id_fkey" FOREIGN KEY ("contextual_product_id") REFERENCES "contextual_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_events" ADD CONSTRAINT "inventory_events_source_location_id_fkey" FOREIGN KEY ("source_location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_events" ADD CONSTRAINT "inventory_events_destination_location_id_fkey" FOREIGN KEY ("destination_location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "day_status" ADD CONSTRAINT "day_status_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
