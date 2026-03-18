from app.core.supabase import supabase

def verify_records():
    print("Verifying Database Records...")
    
    # Check latest organization
    orgs = supabase.table("organizations").select("*").order("created_at", desc=True).limit(1).execute()
    if orgs.data:
        print(f"[\u2705] Latest Organization: {orgs.data[0]['name']} (ID: {orgs.data[0]['id']})")
    else:
        print("[\u274c] No organizations found.")

    # Check latest profile
    profiles = supabase.table("profiles").select("*").order("created_at", desc=True).limit(1).execute()
    if profiles.data:
        profile = profiles.data[0]
        print(f"[\u2705] Latest Profile: {profile['email']} (Role: {profile['role']})")
        print(f"    Linked Org ID: {profile['organization_id']}")
    else:
        print("[\u274c] No profiles found.")

if __name__ == "__main__":
    verify_records()
