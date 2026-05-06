-- Drop the global unique constraint on idempotency_key
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_idempotency_key_key;

-- Add a scoped unique constraint: same key is allowed across orgs, but not within one org
ALTER TABLE expenses ADD CONSTRAINT expenses_organization_id_idempotency_key_key
  UNIQUE (organization_id, idempotency_key);
