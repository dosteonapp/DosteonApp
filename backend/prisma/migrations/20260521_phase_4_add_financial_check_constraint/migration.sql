-- PHASE B2: Add SaleOrder financial consistency CHECK constraint
-- Safety: Only applied after Phase A audit confirms no inconsistencies
-- Rollback: ALTER TABLE "SaleOrder" DROP CONSTRAINT saleorder_financial_consistency;

ALTER TABLE "SaleOrder"
ADD CONSTRAINT saleorder_financial_consistency
CHECK (gross_profit = (total_revenue - total_cogs));
