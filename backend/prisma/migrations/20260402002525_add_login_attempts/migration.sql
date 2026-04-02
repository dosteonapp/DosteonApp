-- DropForeignKey
ALTER TABLE "contextual_products" DROP CONSTRAINT "contextual_products_canonical_product_id_fkey";

-- DropForeignKey
ALTER TABLE "contextual_products" DROP CONSTRAINT "contextual_products_location_id_fkey";

-- DropForeignKey
ALTER TABLE "contextual_products" DROP CONSTRAINT "contextual_products_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "day_status" DROP CONSTRAINT "day_status_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "inventory_events" DROP CONSTRAINT "inventory_events_contextual_product_id_fkey";

-- DropForeignKey
ALTER TABLE "inventory_events" DROP CONSTRAINT "inventory_events_destination_location_id_fkey";

-- DropForeignKey
ALTER TABLE "inventory_events" DROP CONSTRAINT "inventory_events_source_location_id_fkey";

-- DropForeignKey
ALTER TABLE "locations" DROP CONSTRAINT "locations_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_organization_id_fkey";

-- CreateTable
CREATE TABLE "login_attempts" (
    "email_hash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_failed_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("email_hash")
);

-- CreateIndex
CREATE INDEX "profiles_email_idx" ON "profiles"("email");

-- RenameIndex
ALTER INDEX "inventory_events_org_created_idx" RENAME TO "inventory_events_organization_id_created_at_idx";
