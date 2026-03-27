"""One-time migration script to mark legacy bootstrapped contextual products.

This script is intended to be run once against an existing production
database where organizations were previously initialized via the
`bootstrap_organization` helper (full catalog) before the new
onboarding-driven inventory model was introduced.

It marks all existing contextual products with a metadata flag so that
future migrations or analytics can distinguish legacy-bootstrapped
items from those created via onboarding selection.

Usage (from backend/ directory, with venv activated and DATABASE_URL set):

    python -m scripts.mark_legacy_bootstrap

The script is idempotent and safe to rerun.
"""

import asyncio

from app.db.prisma import db


LEGACY_FLAG_KEY = "legacy_bootstrapped"


async def mark_legacy_bootstrap() -> None:
    await db.connect()

    # Add the legacy flag to all contextual_products that do not yet
    # have it in their metadata. We use JSONB concatenation so we don't
    # overwrite any existing keys.
    query = f"""
UPDATE contextual_products
SET metadata = COALESCE(metadata, '{{}}'::jsonb) || '{{"{LEGACY_FLAG_KEY}": true}}'::jsonb
WHERE metadata IS NULL
   OR metadata ->> '{LEGACY_FLAG_KEY}' IS NULL;
"""

    try:
        await db.execute_raw(query)
        print("✅ Marked legacy-bootstrapped contextual products with metadata flag.")
    finally:
        await db.disconnect()


if __name__ == "__main__":  # pragma: no cover - operational script
    asyncio.run(mark_legacy_bootstrap())
