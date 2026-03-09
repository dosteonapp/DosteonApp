from app.core.supabase import supabase
import sys

def test_connection():
    print("Testing connection...")
    try:
        # Check profiles (from original schema)
        try:
            res_p = supabase.table("profiles").select("*").limit(1).execute()
            print("[\u2705] 'profiles' table found.")
        except Exception as e:
            print(f"[\u274c] 'profiles' table error: {e}")

        # Check organizations (Phase 1-2 foundation)
        try:
            res_o = supabase.table("organizations").select("*").limit(1).execute()
            print("[\u2705] 'organizations' table found.")
        except Exception as e:
            print(f"[\u274c] 'organizations' table error: {e}")
            print("\nSUGGESTION: Please copy the contents of 'foundation_v1.sql' and run it in your Supabase SQL Editor.")

    except Exception as e:
        print(f"General Connection Error: {e}")

if __name__ == "__main__":
    test_connection()
