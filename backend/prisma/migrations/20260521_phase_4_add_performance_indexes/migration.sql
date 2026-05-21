-- PHASE B3: Add performance indexes (non-blocking, CONCURRENT)
-- These improve query performance for common access patterns
-- Safe to add: no data modification, readers continue unblocked

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expense_org_date
ON "Expense" (organization_id, business_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saleorder_org_created
ON "SaleOrder" (organization_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_event_org_date
ON "InventoryEvent" (organization_id, created_at DESC);
