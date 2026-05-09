import asyncio
from prisma import Json
from app.db.prisma import db, connect_db

async def test():
    await connect_db()
    try:
        # Check if we can create a minimalist DayStatus
        # Just to see if it accepts {} or None or wants Json({})
        # Note: I'll use a dummy UUID
        import uuid
        dummy_id = str(uuid.uuid4())
        print(f"Testing with dummy ID: {dummy_id}")
        
        print("Test 1: Create with None metadata")
        ds1 = await db.daystatus.create(
            data={
                "organization_id": dummy_id,
                "state": "CLOSED",
                "metadata": None
            }
        )
        print("Test 1 Success!")
        
        dummy_id2 = str(uuid.uuid4())
        print("Test 2: Create with {} metadata")
        ds2 = await db.daystatus.create(
            data={
                "organization_id": dummy_id2,
                "state": "CLOSED",
                "metadata": {}
            }
        )
        print("Test 2 Success!")
        
        dummy_id3 = str(uuid.uuid4())
        print("Test 3: Create with Json({}) metadata")
        ds3 = await db.daystatus.create(
            data={
                "organization_id": dummy_id3,
                "state": "CLOSED",
                "metadata": Json({})
            }
        )
        print("Test 3 Success!")
        
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(test())
