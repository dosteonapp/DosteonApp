import asyncio
from prisma import Prisma

async def main():
    # Try with postgres:// format
    db_url = "postgres://postgres:Dosteon%402026@db.vtgdoxvvxosrcyhbfiii.supabase.co:6543/postgres?pgbouncer=true&sslmode=require&connection_limit=1"
    print(f"Testing connectivity with optimized pooler URL: {db_url}")
    db = Prisma(datasource={"url": db_url})
    try:
        await asyncio.wait_for(db.connect(), timeout=10)
        print(f"Connected successfully!")
        await db.disconnect()
        return
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
