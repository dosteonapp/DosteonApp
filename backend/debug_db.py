from app.core.supabase import supabase
import json

def test_db():
    print("--- Testing DB Connectivity ---")
    try:
        # Try a direct query to check table existence
        res = supabase.table("profiles").select("count", count="exact").execute()
        print(f"Profiles Table: Found. Total records: {res.count}")
    except Exception as e:
        print(f"Profiles Table Error: {e}")
        
    try:
        # Check another table if possible
        res = supabase.table("inventory").select("count", count="exact").execute()
        print(f"Inventory Table: Found. Total records: {res.count}")
    except Exception as e:
        print(f"Inventory Table Error: {e}")

if __name__ == "__main__":
    test_db()
