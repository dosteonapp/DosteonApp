import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db.prisma import connect_db, db

async def check():
    print("Connecting to DB (Direct Port 5432)...")
    try:
        await connect_db()
        orgs = await db.organization.find_many()
        print(f"Found {len(orgs)} organizations:")
        for o in orgs:
            print(f" - {o.id}: {o.name}")
        
    except Exception as e:
        print(f"FAILED: {e}")
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(check())
