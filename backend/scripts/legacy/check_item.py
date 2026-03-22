import asyncio
from prisma import Prisma

async def check_item():
    db = Prisma()
    await db.connect()
    
    id_to_check = "75098cbb-f43b-4b3b-8f65-1eb47338dd83"
    print(f"Checking for item: {id_to_check}")
    
    item = await db.contextualproduct.find_unique(where={"id": id_to_check})
    if item:
        print(f"FOUND! Name: {item.name}, Organization: {item.organization_id}")
    else:
        print("NOT FOUND in ContextualProduct table.")
        
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(check_item())
