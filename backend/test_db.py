from app.core.supabase import supabase

def list_tables():
    print("Attempting to check for 'profiles' table existence...")
    try:
        # A simple query to a non-existent table would give 404.
        # Let's try to select from a table we expect to exist.
        response = supabase.table("profiles").select("id").limit(1).execute()
        print(f"Profiles table exists. Data: {response.data}")
    except Exception as e:
        print(f"Error accessing 'profiles' table: {e}")
        
    try:
        # Try another common table like 'inventory' if it exists in their schema
        response = supabase.table("inventory").select("id").limit(1).execute()
        print(f"Inventory table exists. Data: {response.data}")
    except Exception as e:
        print(f"Error accessing 'inventory' table: {e}")

if __name__ == "__main__":
    list_tables()
