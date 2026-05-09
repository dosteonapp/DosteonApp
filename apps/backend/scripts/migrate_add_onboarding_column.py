"""
Migration: add onboarding_completed column to profiles table, then backfill.

Adds  profiles.onboarding_completed BOOLEAN NOT NULL DEFAULT false  if it
doesn't already exist, then marks every profile that already has an org as
onboarding_completed = True (these users finished the old onboarding flow).

Run from the backend/ directory against production:
    DATABASE_URL="<prod-url>" python scripts/migrate_add_onboarding_column.py

Idempotent — safe to run multiple times.
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.prisma import db


async def main():
    print("Connecting to database…")
    await db.connect()

    # Step 1: add the column if it doesn't exist
    print("Adding onboarding_completed column (IF NOT EXISTS)…")
    await db.execute_raw(
        'ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "onboarding_completed" BOOLEAN NOT NULL DEFAULT false;'
    )
    print("  Column ready.")

    # Step 2: backfill existing users who already have an org (they completed onboarding)
    result = await db.execute_raw(
        """
        UPDATE "profiles"
        SET    "onboarding_completed" = true
        WHERE  "organization_id" IS NOT NULL
          AND  "onboarding_completed" = false
          AND  "deleted_at" IS NULL;
        """
    )
    print(f"  Backfilled {result} profile row(s).")

    await db.disconnect()
    print("Done.")


if __name__ == "__main__":
    asyncio.run(main())
