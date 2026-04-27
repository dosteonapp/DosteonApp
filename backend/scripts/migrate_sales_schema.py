"""
Idempotent migration: add Sales layer tables and columns.
Run once after deploying the schema change:
    cd backend
    python scripts/migrate_sales_schema.py
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.db.prisma import db

# Each entry is executed as a single statement.
STATEMENTS = [
    # MenuItem additions
    "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS cost FLOAT DEFAULT 0",
    "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'active'",
    "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS source VARCHAR DEFAULT 'manual'",

    # SaleChannel enum
    """DO $$ BEGIN
  CREATE TYPE "SaleChannel" AS ENUM ('DINE_IN', 'TAKEAWAY', 'DELIVERY');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$""",

    # SaleStatus enum
    """DO $$ BEGIN
  CREATE TYPE "SaleStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'VOIDED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$""",

    # SaleOrder table
    """CREATE TABLE IF NOT EXISTS sale_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  brand_id        UUID,
  channel         "SaleChannel" NOT NULL DEFAULT 'DINE_IN',
  status          "SaleStatus"  NOT NULL DEFAULT 'COMPLETED',
  total_revenue   FLOAT NOT NULL DEFAULT 0,
  total_cogs      FLOAT NOT NULL DEFAULT 0,
  gross_profit    FLOAT NOT NULL DEFAULT 0,
  logged_by       UUID,
  business_date   DATE NOT NULL,
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
)""",

    "CREATE INDEX IF NOT EXISTS sale_orders_org_idx ON sale_orders(organization_id)",
    "CREATE INDEX IF NOT EXISTS sale_orders_brand_idx ON sale_orders(brand_id)",
    "CREATE INDEX IF NOT EXISTS sale_orders_business_date_idx ON sale_orders(organization_id, business_date)",

    # SaleOrderItem table
    """CREATE TABLE IF NOT EXISTS sale_order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_order_id   UUID NOT NULL,
  menu_item_id    UUID NOT NULL,
  quantity        INT   NOT NULL DEFAULT 1,
  unit_price      FLOAT NOT NULL DEFAULT 0,
  unit_cogs       FLOAT NOT NULL DEFAULT 0,
  line_total      FLOAT NOT NULL DEFAULT 0
)""",

    "CREATE INDEX IF NOT EXISTS sale_order_items_order_idx ON sale_order_items(sale_order_id)",
    "CREATE INDEX IF NOT EXISTS sale_order_items_menu_item_idx ON sale_order_items(menu_item_id)",
]


async def main() -> None:
    await db.connect()
    try:
        for stmt in STATEMENTS:
            label = stmt.strip().splitlines()[0][:80]
            try:
                await db.execute_raw(stmt)
                print(f"  OK: {label}")
            except Exception as e:
                print(f"  WARN ({label}): {e}")
        print("Sales schema migration complete.")
    finally:
        await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
