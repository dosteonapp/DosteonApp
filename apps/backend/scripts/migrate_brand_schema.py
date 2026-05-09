"""
One-time migration: apply Phase 1 brand architecture columns.

Run AFTER `prisma db push` fails or before it (for existing production DBs
where you want to run raw SQL yourself instead of letting Prisma alter tables).

Usage:
    cd backend
    python scripts/migrate_brand_schema.py

This script is idempotent — safe to run multiple times.
"""
import asyncio
import sys
import os

# Allow running from the project root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.db.prisma import db


MIGRATION_SQL = """
-- Phase 1: Brand architecture — all new columns are nullable,
-- zero existing data breaks. relationMode="prisma" means no DB-level FKs.

-- 1. Extend brands table
ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS logo_url   TEXT,
  ADD COLUMN IF NOT EXISTS is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Add brand_id + name to locations
ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS brand_id UUID,
  ADD COLUMN IF NOT EXISTS name     TEXT;
CREATE INDEX IF NOT EXISTS locations_brand_id_idx ON locations(brand_id);

-- 3. Add brand_id to contextual_products
ALTER TABLE contextual_products
  ADD COLUMN IF NOT EXISTS brand_id UUID;
CREATE INDEX IF NOT EXISTS contextual_products_brand_id_idx ON contextual_products(brand_id);

-- 4. Add brand_id to menu_items
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS brand_id UUID;
CREATE INDEX IF NOT EXISTS menu_items_brand_id_idx ON menu_items(brand_id);
"""


async def run():
    await db.connect()
    try:
        print("Running Phase 1 brand schema migration...")
        # Execute each statement separately (Prisma execute_raw handles one statement at a time)
        statements = [s.strip() for s in MIGRATION_SQL.split(";") if s.strip() and not s.strip().startswith("--")]
        for stmt in statements:
            try:
                await db.execute_raw(stmt)
                print(f"  OK: {stmt[:80].replace(chr(10), ' ')}...")
            except Exception as e:
                # IF NOT EXISTS guards mean duplicate runs are safe; still log
                print(f"  WARN: {e}")
        print("Migration complete.")
    finally:
        await db.disconnect()


if __name__ == "__main__":
    asyncio.run(run())
