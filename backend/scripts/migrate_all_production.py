"""
Comprehensive idempotent migration — runs every outstanding schema change
against the production database in the correct order.

Run from the backend/ directory:
    DIRECT_URL="<prod-direct-url>" python scripts/migrate_all_production.py

All statements use IF NOT EXISTS / DO-EXCEPTION guards — safe to re-run.
"""
import asyncio
import os
import sys

import asyncpg

STEPS = [
    # ── 0. profiles / organizations: deleted_at (soft-delete column) ─────────
    ('profiles.deleted_at column',
     'ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ'),
    ('organizations.deleted_at column',
     'ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ'),

    # ── 1. profiles: onboarding_completed column ────────────────────────────
    ('profiles.onboarding_completed column',
     'ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "onboarding_completed" BOOLEAN NOT NULL DEFAULT false'),

    # ── 2. profiles: backfill existing users (already have an org = done) ───
    ('profiles.onboarding_completed backfill',
     '''UPDATE "profiles" SET "onboarding_completed" = true
        WHERE "organization_id" IS NOT NULL
          AND "onboarding_completed" = false
          AND "deleted_at" IS NULL'''),

    # ── 3. brands: logo_url, is_active, deleted_at ──────────────────────────
    ('brands.logo_url column',
     'ALTER TABLE brands ADD COLUMN IF NOT EXISTS logo_url TEXT'),
    ('brands.is_active column',
     'ALTER TABLE brands ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE'),
    ('brands.deleted_at column',
     'ALTER TABLE brands ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ'),

    # ── 4. locations: brand_id, name ────────────────────────────────────────
    ('locations.brand_id column',
     'ALTER TABLE locations ADD COLUMN IF NOT EXISTS brand_id UUID'),
    ('locations.name column',
     'ALTER TABLE locations ADD COLUMN IF NOT EXISTS name TEXT'),
    ('locations.brand_id index',
     'CREATE INDEX IF NOT EXISTS locations_brand_id_idx ON locations(brand_id)'),

    # ── 5. contextual_products: brand_id ────────────────────────────────────
    ('contextual_products.brand_id column',
     'ALTER TABLE contextual_products ADD COLUMN IF NOT EXISTS brand_id UUID'),
    ('contextual_products.brand_id index',
     'CREATE INDEX IF NOT EXISTS contextual_products_brand_id_idx ON contextual_products(brand_id)'),

    # ── 6. menu_items: brand_id, cost, status, source ───────────────────────
    ('menu_items.brand_id column',
     'ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS brand_id UUID'),
    ('menu_items.brand_id index',
     'CREATE INDEX IF NOT EXISTS menu_items_brand_id_idx ON menu_items(brand_id)'),
    ('menu_items.cost column',
     "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS cost FLOAT DEFAULT 0"),
    ('menu_items.status column',
     "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'active'"),
    ('menu_items.source column',
     "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS source VARCHAR DEFAULT 'manual'"),

    # ── 7. ConsumptionReason / WasteReason enums ────────────────────────────
    ('ConsumptionReason enum',
     """DO $$ BEGIN
  CREATE TYPE "ConsumptionReason" AS ENUM ('CUSTOMER_SERVICE','STAFF_MEAL','OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$"""),
    ('WasteReason enum',
     """DO $$ BEGIN
  CREATE TYPE "WasteReason" AS ENUM (
    'SPOILED_EXPIRED','DAMAGED_PACKAGING','SPILLED_DROPPED',
    'OVERCOOKED_BURNED','QUALITY_ISSUE','OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$"""),

    # ── 8. inventory_events: reason columns ─────────────────────────────────
    ('inventory_events.consumption_reason column',
     'ALTER TABLE inventory_events ADD COLUMN IF NOT EXISTS consumption_reason "ConsumptionReason"'),
    ('inventory_events.waste_reason column',
     'ALTER TABLE inventory_events ADD COLUMN IF NOT EXISTS waste_reason "WasteReason"'),

    # ── 9. SaleChannel / SaleStatus enums ───────────────────────────────────
    ('SaleChannel enum',
     """DO $$ BEGIN
  CREATE TYPE "SaleChannel" AS ENUM ('DINE_IN','TAKEAWAY','DELIVERY');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$"""),
    ('SaleStatus enum',
     """DO $$ BEGIN
  CREATE TYPE "SaleStatus" AS ENUM ('IN_PROGRESS','COMPLETED','VOIDED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$"""),

    # ── 10. sale_orders table ────────────────────────────────────────────────
    ('sale_orders table',
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
)"""),
    ('sale_orders org index',
     'CREATE INDEX IF NOT EXISTS sale_orders_org_idx ON sale_orders(organization_id)'),
    ('sale_orders brand index',
     'CREATE INDEX IF NOT EXISTS sale_orders_brand_idx ON sale_orders(brand_id)'),
    ('sale_orders date index',
     'CREATE INDEX IF NOT EXISTS sale_orders_business_date_idx ON sale_orders(organization_id, business_date)'),

    # ── 11. sale_order_items table ───────────────────────────────────────────
    ('sale_order_items table',
     """CREATE TABLE IF NOT EXISTS sale_order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_order_id UUID NOT NULL,
  menu_item_id  UUID NOT NULL,
  quantity      INT   NOT NULL DEFAULT 1,
  unit_price    FLOAT NOT NULL DEFAULT 0,
  unit_cogs     FLOAT NOT NULL DEFAULT 0,
  line_total    FLOAT NOT NULL DEFAULT 0
)"""),
    ('sale_order_items order index',
     'CREATE INDEX IF NOT EXISTS sale_order_items_order_idx ON sale_order_items(sale_order_id)'),
    ('sale_order_items menu_item index',
     'CREATE INDEX IF NOT EXISTS sale_order_items_menu_item_idx ON sale_order_items(menu_item_id)'),
]


async def main() -> None:
    url = os.environ.get("DIRECT_URL") or os.environ.get("DATABASE_URL")
    if not url:
        print("ERROR: set DIRECT_URL (or DATABASE_URL) env var before running.", file=sys.stderr)
        sys.exit(1)

    conn = await asyncpg.connect(url)
    ok = 0
    failed = 0
    try:
        for label, sql in STEPS:
            try:
                await conn.execute(sql)
                print(f"  ✓ {label}")
                ok += 1
            except Exception as e:
                print(f"  ✗ {label}: {e}")
                failed += 1
    finally:
        await conn.close()

    print(f"\nDone: {ok} OK, {failed} failed.")
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
