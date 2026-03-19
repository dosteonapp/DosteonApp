import asyncio, sys, os
sys.path.append(os.getcwd())
from app.db.prisma import db

async def main():
    await db.connect()
    profiles = await db.profile.find_many()
    print(f"Profiles found: {len(profiles)}")
    for p in profiles:
        print(f"  ID: {p.id} | Email: {p.email} | Org: {p.organization_id}")
    await db.disconnect()

asyncio.run(main())
