"""
Idempotent migration: add ConsumptionReason / WasteReason enums and
consumption_reason / waste_reason columns to inventory_events.

Run once against your Supabase / Postgres DB:
    python backend/scripts/migrate_inventory_usage_schema.py
"""

import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

SQL = """
-- ConsumptionReason enum
DO $$ BEGIN
  CREATE TYPE "ConsumptionReason" AS ENUM (
    'CUSTOMER_SERVICE',
    'STAFF_MEAL',
    'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- WasteReason enum
DO $$ BEGIN
  CREATE TYPE "WasteReason" AS ENUM (
    'SPOILED_EXPIRED',
    'DAMAGED_PACKAGING',
    'SPILLED_DROPPED',
    'OVERCOOKED_BURNED',
    'QUALITY_ISSUE',
    'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- consumption_reason column
ALTER TABLE inventory_events
  ADD COLUMN IF NOT EXISTS consumption_reason "ConsumptionReason";

-- waste_reason column
ALTER TABLE inventory_events
  ADD COLUMN IF NOT EXISTS waste_reason "WasteReason";
"""


async def main() -> None:
    url = os.environ["DIRECT_URL"]
    conn = await asyncpg.connect(url)
    try:
        await conn.execute(SQL)
        print("Migration complete: ConsumptionReason / WasteReason added to inventory_events.")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
