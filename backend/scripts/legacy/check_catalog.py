import asyncio, sys, os
sys.path.append(os.getcwd())
from app.db.prisma import db

async def main():
    await db.connect()
    count = await db.canonicalproduct.count()
    public_count = await db.canonicalproduct.count(where={"is_public": True})
    print(f"Total canonical products: {count}")
    print(f"Public canonical products: {public_count}")
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
