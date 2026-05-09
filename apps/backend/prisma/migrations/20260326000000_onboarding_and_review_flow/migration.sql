-- Add address field to organizations (captured during onboarding)
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "address" TEXT;

-- Add pending_canonical_review flag to contextual_products
-- true = user-created product submitted for admin promotion to global catalog
ALTER TABLE "contextual_products" ADD COLUMN IF NOT EXISTS "pending_canonical_review" BOOLEAN NOT NULL DEFAULT FALSE;
