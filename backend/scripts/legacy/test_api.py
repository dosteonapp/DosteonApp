import asyncio
from prisma import Prisma

async def test_endpoint():
    db = Prisma()
    await db.connect()
    profile = await db.profile.find_first(where={"email": "gatetejules1@gmail.com"})
    from app.services.restaurant_service import restaurant_service
    item_id = "75098cbb-f43b-4b3b-8f65-1eb47338dd83"
    print(f"Testing service.get_inventory_item_by_id with {item_id}")
    try:
        res = await restaurant_service.get_inventory_item_by_id(item_id)
        print("SUCCESS! DATA FOUND:")
        print(res)
    except Exception as e:
        print(f"FAILED! Error: {e}")
        
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(test_endpoint())
