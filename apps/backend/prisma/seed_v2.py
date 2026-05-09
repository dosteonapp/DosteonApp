import asyncio
import os
from prisma import Prisma
from datetime import datetime

async def seed():
    db = Prisma()
    await db.connect()

    print("--- SEEDING MASTER DATA (V2.1) ---")

    # 1. Get or Create Organization
    org_name = "Dosteon Demo Restaurant"
    org = await db.organization.find_first(where={"name": org_name})
    if not org:
        org = await db.organization.create(
            data={
                "name": org_name,
                "type": "restaurant",
                "settings": {"opening_time": "08:00 AM", "closing_time": "10:00 PM"}
            }
        )
        print(f"Created Organization: {org.name}")
    else:
        print(f"Using existing Organization: {org.id} - {org.name}")

    # 2. Update Profile (Link to Org if email matches)
    user_email = "gatetejules1@gmail.com"
    profile = await db.profile.find_first(where={"email": user_email})
    if profile:
        try:
            await db.profile.update(
                where={"id": profile.id},
                data={
                    "organization_id": org.id,
                    "first_name": "Jules",
                    "last_name": "Gatete",
                    # "role": "MANAGER" # Temporarily commented to avoid enum error
                }
            )
            print(f"Linked profile {user_email} to organization and set name.")
        except Exception as e:
            print(f"Error updating profile: {e}")

    # 3. Canonical Products List (~30 items)
    canonical_items = [
        {"name": "Tomatoes", "category": "Fresh Produce", "type": "Vegetables", "unit": "kg", "prefix": "FPD"},
        {"name": "Onions", "category": "Fresh Produce", "type": "Vegetables", "unit": "kg", "prefix": "FPD"},
        {"name": "Garlic", "category": "Fresh Produce", "type": "Vegetables", "unit": "kg", "prefix": "FPD"},
        {"name": "Olive Oil", "category": "Oils & Fats", "type": "Cooking Oil", "unit": "liters", "prefix": "OIL"},
        {"name": "Mozzarella", "category": "Dairy", "type": "Cheese", "unit": "kg", "prefix": "DAI"},
        {"name": "Chicken Breast", "category": "Proteins", "type": "Meat", "unit": "kg", "prefix": "PRO"},
        {"name": "Flour", "category": "Grains & Staples", "type": "Dry Goods", "unit": "kg", "prefix": "GRN"},
        {"name": "Rice", "category": "Grains & Staples", "type": "Dry Goods", "unit": "kg", "prefix": "GRN"},
        {"name": "Sugar", "category": "Grains & Staples", "type": "Dry Goods", "unit": "kg", "prefix": "GRN"},
        {"name": "Butter", "category": "Oils & Fats", "type": "Dairy", "unit": "kg", "prefix": "OIL"},
        {"name": "Milk", "category": "Dairy", "type": "Liquid", "unit": "liters", "prefix": "DAI"},
        {"name": "Salt", "category": "Spices & Seasonings", "type": "Seasoning", "unit": "kg", "prefix": "SPC"},
        {"name": "Black Pepper", "category": "Spices & Seasonings", "type": "Seasoning", "unit": "kg", "prefix": "SPC"},
        {"name": "Basil", "category": "Fresh Produce", "type": "Herbs", "unit": "bunches", "prefix": "FPD"},
        {"name": "Parsley", "category": "Fresh Produce", "type": "Herbs", "unit": "bunches", "prefix": "FPD"},
        {"name": "Beef", "category": "Proteins", "type": "Meat", "unit": "kg", "prefix": "PRO"},
        {"name": "Eggs", "category": "Proteins", "type": "Poultry", "unit": "tray (30)", "prefix": "PRO"},
        {"name": "Potatoes", "category": "Fresh Produce", "type": "Vegetables", "unit": "kg", "prefix": "FPD"},
        {"name": "Carrots", "category": "Fresh Produce", "type": "Vegetables", "unit": "kg", "prefix": "FPD"},
        {"name": "Lettuce", "category": "Fresh Produce", "type": "Vegetables", "unit": "heads", "prefix": "FPD"},
        {"name": "Cabbage", "category": "Fresh Produce", "type": "Vegetables", "unit": "kg", "prefix": "FPD"},
        {"name": "Cheddar", "category": "Dairy", "type": "Cheese", "unit": "kg", "prefix": "DAI"},
        {"name": "Yogurt", "category": "Dairy", "type": "Dairy", "unit": "kg", "prefix": "DAI"},
        {"name": "Mayonnaise", "category": "Condiments & Sauces", "type": "Sauce", "unit": "kg", "prefix": "CND"},
        {"name": "Ketchup", "category": "Condiments & Sauces", "type": "Sauce", "unit": "kg", "prefix": "CND"},
        {"name": "Pasta", "category": "Grains & Staples", "type": "Dry Goods", "unit": "kg", "prefix": "GRN"},
        {"name": "Beans", "category": "Grains & Staples", "type": "Dry Goods", "unit": "kg", "prefix": "GRN"},
        {"name": "Corn", "category": "Fresh Produce", "type": "Vegetables", "unit": "kg", "prefix": "FPD"},
        {"name": "Cooking Oil", "category": "Oils & Fats", "type": "Cooking Oil", "unit": "liters", "prefix": "OIL"},
        {"name": "Soy Sauce", "category": "Condiments & Sauces", "type": "Sauce", "unit": "liters", "prefix": "CND"},
    ]

    prefix_counts = {}

    for item in canonical_items:
        # Create Canonical Product
        cp = await db.canonicalproduct.find_first(where={"name": item["name"]})
        if not cp:
            cp = await db.canonicalproduct.create(
                data={
                    "name": item["name"],
                    "category": item["category"],
                    "product_type": item["type"],
                    "base_unit": item["unit"],
                    "is_critical_item": True if item["prefix"] == "PRO" else False
                }
            )
            print(f"Created Canonical Product: {item['name']}")
        
        # Create Contextual Product for Organization
        existing_ctx = await db.contextualproduct.find_first(
            where={
                "organization_id": org.id,
                "canonical_product_id": cp.id
            }
        )
        
        if not existing_ctx:
            # Generate SKU
            prefix = item["prefix"]
            count = prefix_counts.get(prefix, 1)
            sku = f"{prefix}-{str(count).zfill(3)}"
            prefix_counts[prefix] = count + 1
            
            await db.contextualproduct.create(
                data={
                    "organization_id": org.id,
                    "canonical_product_id": cp.id,
                    "name": cp.name,
                    "sku": sku,
                    "pack_unit": cp.base_unit,
                    "preferred_unit": cp.base_unit,
                    "current_stock": 20.0,
                    "reorder_threshold": 5.0,
                    "critical_threshold": 2.0
                }
            )
            print(f"  - Setup Contextual Product: {cp.name} (SKU: {sku})")

    # 4. Initialize Day Status
    existing_status = await db.daystatus.find_unique(where={"organization_id": org.id})
    if not existing_status:
        await db.daystatus.create(
            data={
                "organization_id": org.id,
                "state": "CLOSED",
                "is_opening_completed": False
            }
        )
        print("Initialized Day Status to CLOSED.")

    await db.disconnect()
    print("--- SEEDING COMPLETE ---")

if __name__ == "__main__":
    asyncio.run(seed())
