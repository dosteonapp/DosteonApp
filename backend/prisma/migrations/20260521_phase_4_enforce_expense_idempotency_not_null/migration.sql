-- PHASE B1: Enforce NOT NULL on Expense.idempotency_key
-- SAFETY: Only run after PHASE A backfill is confirmed complete
-- Rollback: ALTER TABLE "Expense" ALTER COLUMN idempotency_key DROP NOT NULL;

ALTER TABLE "Expense"
ALTER COLUMN idempotency_key SET NOT NULL;
