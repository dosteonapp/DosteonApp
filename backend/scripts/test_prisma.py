import asyncio
from prisma import Prisma
import os
from dotenv import load_dotenv

load_dotenv()

async def test():
    db = Prisma()
    print(f"Connecting to: {os.getenv('DATABASE_URL')}")
    try:
        await db.connect()
        print("Connected!")
        await db.disconnect()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
