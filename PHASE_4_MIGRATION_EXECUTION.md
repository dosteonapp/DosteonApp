# Phase 4 Migration - Manual Execution Guide

The migration files have been created in `backend/prisma/migrations/`:

1. **20260521_phase_4_backfill_expense_idempotency_key** — Backfill NULLs
2. **20260521_phase_4_enforce_expense_idempotency_not_null** — Enforce NOT NULL  
3. **20260521_phase_4_add_financial_check_constraint** — Add CHECK constraint
4. **20260521_phase_4_add_performance_indexes** — Create indexes

## Option A: Use Prisma (Recommended)

```bash
cd backend
export DIRECT_URL="postgresql://postgres.uthliwmewwlfjlbskilw:Dosteon%402026@db.uthliwmewwlfjlbskilw.supabase.co:5432/postgres"
prisma migrate deploy
```

This applies all pending migrations in order.

## Option B: Manual SQL Execution (Advanced)

If Prisma has configuration issues, connect directly to the database and run:

```sql
-- 1. Backfill NULL idempotency_key
UPDATE "Expense"
SET idempotency_key = gen_random_uuid()::text
WHERE idempotency_key IS NULL;

-- 2. Enforce NOT NULL
ALTER TABLE "Expense"
ALTER COLUMN idempotency_key SET NOT NULL;

-- 3. Add financial CHECK constraint
ALTER TABLE "SaleOrder"
ADD CONSTRAINT saleorder_financial_consistency
CHECK (gross_profit = (total_revenue - total_cogs));

-- 4. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_expense_org_date
ON "Expense" (organization_id, business_date DESC);

CREATE INDEX IF NOT EXISTS idx_saleorder_org_created
ON "SaleOrder" (organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inventory_event_org_date
ON "InventoryEvent" (organization_id, created_at DESC);
```

## Option C: Use Python Script (Staging Only)

From your local machine with database access:

```bash
DIRECT_URL="postgresql://postgres.uthliwmewwlfjlbskilw:Dosteon%402026@db.uthliwmewwlfjlbskilw.supabase.co:5432/postgres" \
  python backend/scripts/phase_4_migrate.py
```

## Verification After Migration

Run these queries to confirm success:

```sql
-- Should return 0
SELECT COUNT(*) FROM "Expense" WHERE idempotency_key IS NULL;

-- Should return 0  
SELECT COUNT(*) FROM "SaleOrder" 
WHERE gross_profit != (total_revenue - total_cogs);

-- Should show saleorder_financial_consistency
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name = 'SaleOrder' AND constraint_type = 'CHECK';
```

---

**Status:** Migration files created and ready to apply.  
**Next:** Run migrations from your local machine with database access.
