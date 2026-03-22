-- Add composite index to speed up queries that filter by organization_id
-- and order by created_at (e.g., recent activities and closing indicators).

CREATE INDEX IF NOT EXISTS "inventory_events_org_created_idx"
ON "inventory_events" ("organization_id", "created_at");
