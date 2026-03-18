from app.core.supabase import supabase
import uuid

def seed_pos():
    print("Seeding POS data (Menu & Recipes)...")
    
    # 1. Get the organization (using the one from smart_repair)
    res = supabase.table("organizations").select("id").eq("name", "Gatete Restaurant").execute()
    if not res.data:
        print("Organization not found. Please run smart_repair.py first.")
        return
    
    org_id = res.data[0]["id"]
    
    # 2. Get inventory items to link to recipes
    inv_res = supabase.table("inventory_items").select("id, name").eq("organization_id", org_id).execute()
    inv_map = {item["name"]: item["id"] for item in inv_res.data}
    
    print(f"Found inventory items: {list(inv_map.keys())}")
    
    # 3. Create Menu Items
    menu_items = [
        {
            "organization_id": org_id,
            "name": "Cafe Latte",
            "description": "Rich espresso with steamed milk",
            "price": 3500,
            "category": "Coffee",
            "image_url": "https://images.unsplash.com/photo-1541167760496-162955ed8a9f"
        },
        {
            "organization_id": org_id,
            "name": "Iced Oat Latte",
            "description": "Chilled espresso with creamy oat milk",
            "price": 4000,
            "category": "Coffee",
            "image_url": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735"
        }
    ]
    
    for item in menu_items:
        # Insert if not exists
        check = supabase.table("menu_items").select("id").eq("name", item["name"]).eq("organization_id", org_id).execute()
        if not check.data:
            res_m = supabase.table("menu_items").insert(item).execute()
            menu_id = res_m.data[0]["id"]
            print(f"Created menu item: {item['name']}")
        else:
            menu_id = check.data[0]["id"]
            print(f"Menu item already exists: {item['name']}")
            
        # 4. Link Recipes
        if item["name"] == "Cafe Latte":
            if "Whole Milk" in inv_map and "Arabica Coffee Beans" in inv_map:
                recipe = [
                    {"menu_item_id": menu_id, "inventory_item_id": inv_map["Whole Milk"], "quantity_required": 0.25}, # 250ml
                    {"menu_item_id": menu_id, "inventory_item_id": inv_map["Arabica Coffee Beans"], "quantity_required": 0.018} # 18g
                ]
                for r in recipe:
                    supabase.table("recipes").upsert(r).execute()
                print("Linked recipe for Cafe Latte")
                
        elif item["name"] == "Iced Oat Latte":
            if "Oat Milk" in inv_map and "Arabica Coffee Beans" in inv_map:
                recipe = [
                    {"menu_item_id": menu_id, "inventory_item_id": inv_map["Oat Milk"], "quantity_required": 0.3}, # 300ml
                    {"menu_item_id": menu_id, "inventory_item_id": inv_map["Arabica Coffee Beans"], "quantity_required": 0.018} # 18g
                ]
                for r in recipe:
                    supabase.table("recipes").upsert(r).execute()
                print("Linked recipe for Iced Oat Latte")

if __name__ == "__main__":
    seed_pos()
