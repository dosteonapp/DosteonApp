-- Add workspace slug to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS slug TEXT;

-- Backfill slugs for existing orgs, handling duplicates via ROW_NUMBER
WITH slug_gen AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^\w\s-]', '', 'g'), '[\s_]+', '-', 'g'))
      ORDER BY created_at
    ) AS rn,
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(LOWER(name), '[^\w\s-]', '', 'g'),
        '[\s_]+', '-', 'g'
      ),
      '^-+|-+$', '', 'g'
    ) AS base_slug
  FROM organizations
  WHERE slug IS NULL
)
UPDATE organizations
SET slug = CASE
  WHEN sg.rn = 1 THEN sg.base_slug
  ELSE sg.base_slug || '-' || sg.rn::text
END
FROM slug_gen sg
WHERE organizations.id = sg.id
  AND (sg.base_slug IS NOT NULL AND sg.base_slug <> '');

-- Set a fallback for any orgs that ended up with an empty base_slug
UPDATE organizations
SET slug = 'workspace-' || SUBSTR(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';

ALTER TABLE organizations ADD CONSTRAINT organizations_slug_unique UNIQUE (slug);
