import asyncio
from app.db.prisma import db, connect_db

async def test():
    await connect_db()
    try:
        ds = await db.daystatus.find_first()
        if ds:
            print(f"STATE: {ds.state} (Type: {type(ds.state)})")
            print(f"METADATA: {ds.metadata} (Type: {type(ds.metadata)})")
        else:
            print("No DayStatus found.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(test())
