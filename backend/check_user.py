from app.core.supabase import supabase

def check_user_profile(email: str):
    print(f"Checking if profile exists for: {email}")
    try:
        response = supabase.table("profiles").select("*").eq("email", email).execute()
        if response.data:
            print(f"SUCCESS: Profile found: {response.data}")
        else:
            print(f"NOT FOUND: No profile with email {email}")
            # Try to list all profiles to see what's there
            all_profiles = supabase.table("profiles").select("email").execute()
            print(f"Existing profiles in DB: {[p['email'] for p in all_profiles.data]}")
    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")

if __name__ == "__main__":
    check_user_profile("gatetejules1@gmail.com")
