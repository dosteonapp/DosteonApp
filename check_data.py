import asyncio, sys, os
sys.path.append(os.getcwd())
from app.db.prisma import db

async def main():
    await db.connect()
    org_id = "cc5e8d58-f217-40c3-b2a9-6a5366f24c5f"
    count = await db.contextualproduct.count(where={"organization_id": org_id})
    profile = await db.profile.find_unique(where={"id": "477047a0-9dbd-4f1f-ad57-337029eb298f"})
    print(f"Contextual products: {count}")
    print(f"Profile org_id: {profile.organization_id if profile else 'NOT FOUND'}")
    await db.disconnect()

asyncio.run(main())
