from app.db.prisma import db
import asyncio

async def f():
    await db.connect()
    print([m for m in dir(db) if not m.startswith('_')])
    await db.disconnect()

asyncio.run(f())
