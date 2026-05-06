-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('INGREDIENT', 'OVERHEAD');

-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "brand_id" UUID,
    "item_name" TEXT NOT NULL,
    "expense_type" "ExpenseType" NOT NULL,
    "source" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "contextual_product_id" UUID,
    "business_date" DATE NOT NULL,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logged_by" UUID,
    "idempotency_key" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "expenses_idempotency_key_key" ON "expenses"("idempotency_key");

-- CreateIndex
CREATE INDEX "expenses_organization_id_business_date_idx" ON "expenses"("organization_id", "business_date");

-- CreateIndex
CREATE INDEX "expenses_brand_id_business_date_idx" ON "expenses"("brand_id", "business_date");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_contextual_product_id_fkey" FOREIGN KEY ("contextual_product_id") REFERENCES "contextual_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
