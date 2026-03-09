from app.core.supabase import supabase
import uuid

def smart_repair():
    print("--- SMART REPAIR & SEED ---")
    email = "gatetejules1@gmail.com"
    password = "Password123!"
    
    # 1. Create Organization
    print("1. Ensuring Organization exists...")
    org_name = "Gatete Restaurant"
    # Try to find existing
    org_res = supabase.table("organizations").select("*").eq("name", org_name).execute()
    if org_res.data:
        org_id = org_res.data[0]["id"]
        print(f"   Using existing Org: {org_id}")
    else:
        new_org = supabase.table("organizations").insert({"name": org_name}).execute()
        org_id = new_org.data[0]["id"]
        print(f"   Created new Org: {org_id}")

    # 2. Create Auth User (Admin bypass)
    print(f"2. Creating/Verifying Auth User: {email}")
    # Using service role allows us to create users with confirmed email directly
    try:
        # We use the admin console (available via service_role)
        # However, the python client 'supabase.auth.admin' might vary. 
        # Let's try to signup normally first, but if rate limited, we can't bypass via signup.
        # Bypass: Create user via supabase.auth.admin.create_user if available
        user_res = supabase.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {
                "first_name": "Jules",
                "last_name": "Gatete",
                "role": "admin",
                "organization_id": org_id
            }
        })
        user_id = user_res.user.id
        print(f"   [\u2705] User created and confirmed: {user_id}")
    except Exception as e:
        print(f"   User already exists or error: {e}")
        # Try to fetch existing user ID from profiles if they exist
        prof = supabase.table("profiles").select("id").eq("email", email).execute()
        if prof.data:
            user_id = prof.data[0]["id"]
            print(f"   Using existing Profile ID: {user_id}")
        else:
            print("   [\u274c] Cannot find user. Please manually confirm user in Supabase Dashboard first.")
            return

    # 3. Seed Inventory
    print("3. Seeding Inventory...")
    items = [
        {"organization_id": org_id, "name": "Whole Milk", "category": "Dairy", "unit": "Liters", "current_stock": 45.0, "min_level": 10.0, "cost_per_unit": 1.2},
        {"organization_id": org_id, "name": "Arabica Coffee Beans", "category": "Dry Goods", "unit": "kg", "current_stock": 5.0, "min_level": 8.0, "cost_per_unit": 18.5},
        {"organization_id": org_id, "name": "White Sugar", "category": "Dry Goods", "unit": "kg", "current_stock": 25.0, "min_level": 5.0, "cost_per_unit": 0.9},
        {"organization_id": org_id, "name": "Oat Milk", "category": "Dairy", "unit": "Liters", "current_stock": 0.0, "min_level": 5.0, "cost_per_unit": 2.1},
    ]
    
    # Delete old items for this org to clean up
    supabase.table("inventory_items").delete().eq("organization_id", org_id).execute()
    supabase.table("inventory_items").insert(items).execute()
    print(f"   [\u2705] Seeded {len(items)} items.")

    print("\nREPAIR COMPLETE!")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print("\nYou can now login directly on the frontend dashboard.")

if __name__ == "__main__":
    smart_repair()
