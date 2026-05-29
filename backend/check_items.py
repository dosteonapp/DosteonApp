import asyncio
from app.db.prisma import db

async def check_items():
    await db.connect()
    
    # The two item IDs from your console logs
    item_ids = [
        "1bafd1cd-d661-4d1d-b076-5f439f42d7c0",
        "f1c62c33-26ce-4813-b375-4ce177a1f52c"
    ]
    
    print("=" * 80)
    print("CHECKING MENU ITEMS IN DATABASE")
    print("=" * 80)
    
    for item_id in item_ids:
        print(f"\nLooking for item: {item_id}")
        item = await db.menuitem.find_unique(where={"id": item_id})
        
        if item:
            print(f"FOUND!")
            print(f"  Name: {item.name}")
            print(f"  ID: {item.id}")
            print(f"  Status: {item.status}")
            print(f"  Organization: {item.organization_id}")
            print(f"  Brand: {item.brand_id}")
            print(f"  Price: {item.price}")
            print(f"  Cost: {item.cost}")
        else:
            print(f"NOT FOUND in database!")
    
    # Also check ALL menu items for the organization
    print("\n" + "=" * 80)
    print("ALL MENU ITEMS IN YOUR ORGANIZATION")
    print("=" * 80)
    
    org_id = "5f597070-4f78-450f-a8a7-ae5ed4bf5a02"
    all_items = await db.menuitem.find_many(
        where={"organization_id": org_id}
    )
    
    print(f"\nTotal items in org: {len(all_items)}\n")
    for item in all_items:
        print(f"  Name: {item.name}")
        print(f"    ID: {item.id}")
        print(f"    Status: {item.status}")
        print(f"    Brand: {item.brand_id}")
        print()
    
    await db.disconnect()

asyncio.run(check_items())
