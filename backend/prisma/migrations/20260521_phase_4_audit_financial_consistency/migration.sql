-- PHASE A2: Audit SaleOrder financial consistency (READ ONLY - NO WRITES)
-- Objective: Identify any rows where gross_profit != (total_revenue - total_cogs)

-- IMPORTANT: This is read-only for diagnostic purposes
-- Do NOT run UPDATE yet - this is just to identify problem rows

-- Find rows with financial inconsistencies:
SELECT
  id,
  organization_id,
  total_revenue,
  total_cogs,
  gross_profit,
  (total_revenue - total_cogs) as expected_profit,
  (gross_profit - (total_revenue - total_cogs)) as drift
FROM "SaleOrder"
WHERE gross_profit != (total_revenue - total_cogs)
  AND total_revenue IS NOT NULL
  AND total_cogs IS NOT NULL
ORDER BY organization_id, drift DESC;

-- Summary: count inconsistencies by organization
SELECT
  organization_id,
  COUNT(*) as inconsistency_count,
  SUM(ABS(gross_profit - (total_revenue - total_cogs))) as total_drift
FROM "SaleOrder"
WHERE gross_profit != (total_revenue - total_cogs)
  AND total_revenue IS NOT NULL
  AND total_cogs IS NOT NULL
GROUP BY organization_id
ORDER BY total_drift DESC;
