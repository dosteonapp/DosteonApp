import asyncio
from app.db.prisma import db, connect_db

YOUR_PROFILE_ID = "477047a0-9dbd-4f1f-ad57-337029eb298f"  # your real Supabase user ID
YOUR_ORG_ID     = "cc5e8d58-f217-40c3-b2a9-6a5366f24c5f"  # your real org ID from auth/me

async def seed():
    await connect_db()

    # 1. Upsert Organization
    org = await db.organization.upsert(
        where={"id": YOUR_ORG_ID},
        data={
            "create": {
                "id": YOUR_ORG_ID,
                "name": "Dosteon Test Restaurant",
                "type": "restaurant",
                "settings": "{\"opening_time\": \"08:00\", \"closing_time\": \"22:00\"}"
            },
            "update": {
                "name": "Dosteon Test Restaurant",
            }
        }
    )
    print(f"? Organization: {org.name}")

    # 2. Link your profile to the org
    profile = await db.profile.update(
        where={"id": YOUR_PROFILE_ID},
        data={"organization_id": YOUR_ORG_ID}
    )
    print(f"? Profile linked: {profile.email}")

    # 3. Create a Location
    location = await db.location.create(
        data={
            "organization_id": YOUR_ORG_ID,
            "country": "Rwanda",
            "city": "Kigali",
            "region": "Kigali City",
            "location_type": "main"
        }
    )
    print(f"? Location created: {location.id}")

    # 4. Create DayStatus (CLOSED by default)
    day_status = await db.daystatus.upsert(
        where={"organization_id": YOUR_ORG_ID},
        data={
            "create": {
                "organization_id": YOUR_ORG_ID,
                "state": "CLOSED",
            },
            "update": {}
        }
    )
    print(f"? DayStatus: {day_status.state}")

    await db.disconnect()
    print("\n?? Seed complete!")

asyncio.run(seed())
