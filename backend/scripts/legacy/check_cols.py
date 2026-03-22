import asyncio
from prisma import Prisma

async def check():
    db = Prisma()
    await db.connect()
    
    res = await db.query_raw("SELECT column_name FROM information_schema.columns WHERE table_name='contextual_products' AND table_schema='public';")
    print("Columns in 'contextual_products':")
    for row in res:
        print(f" - {row['column_name']}")
    
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(check())
