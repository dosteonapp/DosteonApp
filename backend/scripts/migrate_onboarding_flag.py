"""
One-time migration: set onboarding_completed = True on every Profile row
where organization_id IS NOT NULL.

These are existing users who already completed the original onboarding flow
(org was created and linked during signup / old onboard endpoint). Without
this migration they would be incorrectly routed back to /onboarding.

Run from the backend/ directory:
    python scripts/migrate_onboarding_flag.py

This script is idempotent — running it multiple times is safe.
"""
import asyncio
import sys
import os

# Make sure the app package is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.prisma import db


async def main():
    print("Connecting to database…")
    await db.connect()

    # Find all profiles that have an org linked but are not yet flagged
    profiles = await db.profile.find_many(
        where={
            "organization_id": {"not": None},
            "onboarding_completed": False,
            "deleted_at": None,
        }
    )

    if not profiles:
        print("No profiles to migrate — all existing users are already flagged.")
        await db.disconnect()
        return

    print(f"Found {len(profiles)} profile(s) to migrate…")

    updated = 0
    for p in profiles:
        try:
            await db.profile.update(
                where={"id": p.id},
                data={"onboarding_completed": True},
            )
            updated += 1
            print(f"  ✓ {p.email} ({p.id})")
        except Exception as e:
            print(f"  ✗ Failed for {p.id}: {e}")

    print(f"\nDone. {updated}/{len(profiles)} profiles updated.")
    await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
