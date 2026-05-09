import asyncio, sys, os
sys.path.append(os.getcwd())
from app.db.prisma import db

async def main():
    await db.connect()
    orgs = await db.organization.find_many()
    print(f"Organizations found: {len(orgs)}")
    for o in orgs:
        print(f"  ID: {o.id} | Name: {o.name}")
    await db.disconnect()

asyncio.run(main())
