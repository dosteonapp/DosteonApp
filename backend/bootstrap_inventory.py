import asyncio, sys, os
sys.path.append(os.getcwd())
from app.db.prisma import db
from app.db.repositories.inventory_repository import inventory_repo

ORG_ID = "cc5e8d58-f217-40c3-b2a9-6a5366f24c5f"

async def main():
    await db.connect()
    await inventory_repo.bootstrap_organization(ORG_ID)
    print("✅ Inventory bootstrapped!")
    await db.disconnect()

asyncio.run(main())
