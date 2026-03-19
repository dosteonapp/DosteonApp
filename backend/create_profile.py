import asyncio, sys, os
sys.path.append(os.getcwd())
from app.db.prisma import db

PROFILE_ID = "477047a0-9dbd-4f1f-ad57-337029eb298f"
ORG_ID     = "cc5e8d58-f217-40c3-b2a9-6a5366f24c5f"

async def main():
    await db.connect()

    # Create profile
    profile = await db.profile.create(data={
        "id": PROFILE_ID,
        "email": "gatetejules1@gmail.com",
        "first_name": "Jules",
        "last_name": "Gatete",
        "role": "OWNER",
        "organization_id": ORG_ID,
    })
    print(f"✅ Profile created: {profile.email}")

    await db.disconnect()

asyncio.run(main())
