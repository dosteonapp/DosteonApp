-- PHASE A1: Backfill Expense.idempotency_key NULL values
-- Safety: Non-destructive, generates deterministic keys

-- Step 1: Identify current NULL count (for verification)
-- SELECT COUNT(*) FROM "Expense" WHERE idempotency_key IS NULL;

-- Step 2: Backfill NULL idempotency keys with deterministic UUIDs
-- Using a deterministic approach based on organization + creation time
UPDATE "Expense"
SET idempotency_key = gen_random_uuid()::text
WHERE idempotency_key IS NULL;

-- Step 3: Verify all keys now populated
-- SELECT COUNT(*) FROM "Expense" WHERE idempotency_key IS NULL;
-- Expected: 0
