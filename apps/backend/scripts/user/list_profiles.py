import asyncio
from prisma import Prisma

async def list_profiles():
    db = Prisma()
    await db.connect()
    
    profiles = await db.profile.find_many()
    print("User Profiles in DB:")
    for p in profiles:
        print(f" - {p.email} (ID: {p.id}, Role: {p.role})")
    
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(list_profiles())
