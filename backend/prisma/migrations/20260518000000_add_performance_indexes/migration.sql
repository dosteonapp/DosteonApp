-- Performance indexes for common query patterns
-- Note: CONCURRENTLY removed — Prisma wraps migrations in a transaction,
-- and PostgreSQL disallows CONCURRENTLY inside a transaction block.

-- sale_orders: scoped history queries (org + date range + status)
CREATE INDEX IF NOT EXISTS "sale_orders_org_status_date_idx"
    ON "sale_orders" ("organization_id", "status", "business_date");

-- sale_orders: brand-scoped queries
CREATE INDEX IF NOT EXISTS "sale_orders_org_brand_date_idx"
    ON "sale_orders" ("organization_id", "brand_id", "business_date");

-- contextual_products: inventory search by org + name
CREATE INDEX IF NOT EXISTS "contextual_products_org_name_idx"
    ON "contextual_products" ("organization_id", "name");

-- inventory_events: event history queries by org + type + time
CREATE INDEX IF NOT EXISTS "inventory_events_org_type_time_idx"
    ON "inventory_events" ("organization_id", "event_type", "occurred_at");

-- expenses: cost lookups per product (latest unit cost queries)
CREATE INDEX IF NOT EXISTS "expenses_product_time_idx"
    ON "expenses" ("contextual_product_id", "occurred_at")
    WHERE "contextual_product_id" IS NOT NULL;
