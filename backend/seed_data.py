from app.core.supabase import supabase
import json
import os
from uuid import UUID

def seed_inventory():
    print("--- SEEDING INITIAL INVENTORY DATA ---")
    
    # 1. Get the organization_id from the confirmed user
    email = "gatetejules1@gmail.com"
    try:
        profile_res = supabase.table("profiles").select("organization_id").eq("email", email).single().execute()
        if not profile_res.data or not profile_res.data.get("organization_id"):
            print(f"[\u274c] Error: No organization found for {email}. Did you run the onboarding and confirm the user?")
            return
        
        org_id = profile_res.data["organization_id"]
        print(f"[\u2705] Found Organization ID: {org_id}")
    except Exception as e:
        print(f"[\u274c] Database Error: {e}")
        return

    # 2. Sample Data
    items = [
        {
            "organization_id": org_id,
            "name": "Whole Milk",
            "category": "Dairy",
            "brand": "Farm Fresh",
            "unit": "Liters",
            "current_stock": 45.0,
            "min_level": 10.0,
            "restock_point": 15.0,
            "cost_per_unit": 1.2,
            "location": "Fridge A"
        },
        {
            "organization_id": org_id,
            "name": "Arabica Coffee Beans",
            "category": "Dry Goods",
            "brand": "Ethiopia Gold",
            "unit": "kg",
            "current_stock": 5.0,
            "min_level": 8.0, # This should trigger a "Low Stock" alert
            "restock_point": 10.0,
            "cost_per_unit": 18.5,
            "location": "Dry Pantry"
        },
        {
            "organization_id": org_id,
            "name": "White Sugar",
            "category": "Dry Goods",
            "brand": "SweetLife",
            "unit": "kg",
            "current_stock": 25.0,
            "min_level": 5.0,
            "restock_point": 8.0,
            "cost_per_unit": 0.9,
            "location": "Dry Pantry"
        },
        {
            "organization_id": org_id,
            "name": "Oat Milk",
            "category": "Dairy",
            "brand": "Oatly",
            "unit": "Liters",
            "current_stock": 2.0,
            "min_level": 5.0, # Low Stock
            "restock_point": 8.0,
            "cost_per_unit": 2.1,
            "location": "Fridge B"
        },
        {
            "organization_id": org_id,
            "name": "Unsalted Butter",
            "category": "Dairy",
            "brand": "Kerrygold",
            "unit": "kg",
            "current_stock": 12.0,
            "min_level": 2.0,
            "restock_point": 4.0,
            "cost_per_unit": 7.5,
            "location": "Fridge A"
        }
    ]

    # 3. Insert and Verify
    print("\n3. Inserting items...")
    try:
        # Clear existing to avoid duplicates if re-running
        supabase.table("inventory_items").delete().eq("organization_id", org_id).execute()
        
        insert_res = supabase.table("inventory_items").insert(items).execute()
        if insert_res.data:
            print(f"[\u2705] Successfully seeded {len(insert_res.data)} items.")
            for item in insert_res.data:
                status = "LOW" if item["current_stock"] <= item["min_level"] else "OK"
                print(f"    - {item['name']}: {item['current_stock']} {item['unit']} [{status}]")
    except Exception as e:
        print(f"[\u274c] Insert Error: {e}")

if __name__ == "__main__":
    seed_inventory()
