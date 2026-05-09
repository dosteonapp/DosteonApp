"""Seed staging database with a test organization and brand.

Run ONLY against staging. Never against production.

Usage:
    APP_ENV=staging DATABASE_URL="$STAGING_DATABASE_URL" DIRECT_URL="$STAGING_DIRECT_URL" \\
      python backend/scripts/seed_staging.py
"""

import asyncio
import os
import sys


async def main():
    app_env = os.environ.get("APP_ENV", "")
    if app_env == "production":
        print("REFUSED: seed_staging.py cannot run in production.", file=sys.stderr)
        sys.exit(1)

    if app_env not in ("staging", "development"):
        print(
            f"WARNING: APP_ENV='{app_env}' is not 'staging' or 'development'. "
            "Set APP_ENV=staging to confirm you are targeting the staging database.",
            file=sys.stderr,
        )
        sys.exit(1)

    from prisma import Prisma

    db = Prisma()
    await db.connect()

    try:
        # Create a test organization
        org = await db.organization.create(
            data={
                "name": "Staging Test Restaurant",
                "type": "restaurant",
                "city": "Nairobi",
            }
        )

        # Create a test brand under the org
        brand = await db.brand.create(
            data={
                "organization_id": org.id,
                "name": "Test Brand",
                "is_active": True,
            }
        )

        print(f"Seeded org:   {org.id}  ({org.name})")
        print(f"Seeded brand: {brand.id} ({brand.name})")
        print()
        print("Next step: create a test user in the Supabase Auth dashboard")
        print("and link it to this org_id via the profiles table.")

    finally:
        await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
