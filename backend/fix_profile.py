from app.core.supabase import supabase

def fix_profile():
    user_id = "cbea48f8-1429-46ab-bd50-3008af57a35e"
    email = "gatetejules1@gmail.com"
    
    print(f"--- Fixing Profile for {email} ---")
    profile_data = {
        "id": user_id,
        "email": email,
        "role": "restaurant",
        "first_name": "Jules",
        "last_name": "Test"
    }
    
    try:
        # Check if it exists first
        check = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if check.data:
            print("Profile already exists!")
            return
            
        print("Inserting profile manually...")
        res = supabase.table("profiles").insert(profile_data).execute()
        print(f"Profile Insertion: {res.data}")
    except Exception as e:
        print(f"Error fixing profile: {e}")

if __name__ == "__main__":
    fix_profile()
