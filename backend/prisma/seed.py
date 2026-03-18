import asyncio
import os
from prisma import Prisma
from datetime import datetime
from decimal import Decimal

async def seed():
    db = Prisma()
    await db.connect()

    print("--- SEEDING MASTER DATA ---")

    # 1. Get or Create Organization
    org_name = "Dosteon Demo Restaurant"
    org = await db.organization.find_first(where={"name": org_name})
    if not org:
        org = await db.organization.create(
            data={
                "name": org_name,
                "type": "restaurant",
                "settings": {"opening_time": "08:00", "closing_time": "22:00"}
            }
        )
        print(f"Created Organization: {org.name}")
    else:
        print(f"Using existing Organization: {org.name}")

    # 2. Update Profile (Link to Org if email matches)
    user_email = "gatetejules1@gmail.com" # As per seed_data.py
    profile = await db.profile.find_first(where={"email": user_email})
    if profile:
        await db.profile.update(
            where={"id": profile.id},
            data={"organization_id": org.id}
        )
        print(f"Linked profile {user_email} to organization.")

    # 3. Seed Inventory Items
    inventory_data = [
        {"name": "Whole Milk", "category": "Dairy", "unit": "liters", "current_stock": 45.0, "min_level": 10.0, "cost_per_unit": 1.2},
        {"name": "Arabica Coffee Beans", "category": "Dry Goods", "unit": "kg", "current_stock": 5.0, "min_level": 8.0, "cost_per_unit": 18.5},
        {"name": "White Sugar", "category": "Dry Goods", "unit": "kg", "current_stock": 25.0, "min_level": 5.0, "cost_per_unit": 0.9},
        {"name": "Oat Milk", "category": "Dairy", "unit": "liters", "current_stock": 10.0, "min_level": 5.0, "cost_per_unit": 2.1},
        {"name": "Eggs", "category": "Proteins", "unit": "tray (30)", "current_stock": 15.0, "min_level": 5.0, "cost_per_unit": 5.5},
        {"name": "Chicken Breast", "category": "Proteins", "unit": "kg", "current_stock": 20.0, "min_level": 5.0, "cost_per_unit": 6.0}
    ]

    for item in inventory_data:
        existing = await db.inventoryitem.find_first(
            where={"organization_id": org.id, "name": item["name"]}
        )
        if not existing:
            await db.inventoryitem.create(
                data={
                    "organization_id": org.id,
                    "name": item["name"],
                    "category": item["category"],
                    "unit": item["unit"],
                    "current_stock": item["current_stock"],
                    "min_level": item["min_level"],
                    "cost_per_unit": item["cost_per_unit"]
                }
            )
            print(f"Created Inventory Item: {item['name']}")

    # 4. Seed Menu Items & Recipes
    # Re-fetch inventory to get IDs
    inv_items = await db.inventoryitem.find_many(where={"organization_id": org.id})
    inv_map = {i.name: i.id for i in inv_items}

    menu_data = [
        {
            "name": "Cafe Latte",
            "price": 3500,
            "category": "Coffee",
            "ingredients": [
                {"name": "Whole Milk", "qty": 0.25},
                {"name": "Arabica Coffee Beans", "qty": 0.018}
            ]
        },
        {
            "name": "Oat Latte",
            "price": 4000,
            "category": "Coffee",
            "ingredients": [
                {"name": "Oat Milk", "qty": 0.3},
                {"name": "Arabica Coffee Beans", "qty": 0.018}
            ]
        },
        {
            "name": "Black Coffee",
            "price": 2500,
            "category": "Coffee",
            "ingredients": [
                {"name": "Arabica Coffee Beans", "qty": 0.018}
            ]
        }
    ]

    for m in menu_data:
        menu_item = await db.menuitem.find_first(
            where={"organization_id": org.id, "name": m["name"]}
        )
        if not menu_item:
            menu_item = await db.menuitem.create(
                data={
                    "organization_id": org.id,
                    "name": m["name"],
                    "price": m["price"],
                    "category": m["category"]
                }
            )
            print(f"Created Menu Item: {m['name']}")
        
        # Link Recipes
        for ing in m["ingredients"]:
            if ing["name"] in inv_map:
                await db.recipe.upsert(
                    where={
                        "menu_item_id_inventory_item_id": {
                            "menu_item_id": menu_item.id,
                            "inventory_item_id": inv_map[ing["name"]]
                        }
                    },
                    data={
                        "create": {
                            "menu_item_id": menu_item.id,
                            "inventory_item_id": inv_map[ing["name"]],
                            "quantity_required": ing["qty"]
                        },
                        "update": {
                            "quantity_required": ing["qty"]
                        }
                    }
                )
                print(f"  - Linked {ing['name']} to {m['name']}")

    # 5. Initialize Day Status
    existing_status = await db.daystatus.find_unique(where={"organization_id": org.id})
    if not existing_status:
        await db.daystatus.create(
            data={
                "organization_id": org.id,
                "state": "CLOSED"
            }
        )
        print("Initialized Day Status to CLOSED.")

    await db.disconnect()
    print("--- SEEDING COMPLETE ---")

if __name__ == "__main__":
    asyncio.run(seed())
