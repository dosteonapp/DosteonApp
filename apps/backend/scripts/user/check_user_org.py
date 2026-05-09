import asyncio
from prisma import Prisma

async def check_user_org():
    db = Prisma()
    await db.connect()
    profile = await db.profile.find_first(where={"email": "gatetejules1@gmail.com"})
    print(f"User: {profile.email}, Organization: {profile.organization_id}")
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(check_user_org())
