import asyncio
from prisma import Prisma

async def check():
    db = Prisma()
    await db.connect()
    
    # Check tables
    res = await db.query_raw("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
    print("Tables in public schema:")
    for row in res:
        print(f" - {row['table_name']}")
    
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(check())
