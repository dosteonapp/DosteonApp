import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")

print(f"Connecting to {url}")
supabase = create_client(url, key)

try:
    # Try a simple select first
    res = supabase.table("organizations").select("*").limit(1).execute()
    print("Select Organizations Success:", res.data)
    
    # Try upserting to day_status
    # Get an org id first
    org_id = res.data[0]["id"] if res.data else None
    if org_id:
        print(f"Testing upsert for org: {org_id}")
        upsert_res = supabase.table("day_status").upsert({
            "organization_id": org_id,
            "state": "OPEN",
            "is_opening_completed": True
        }, on_conflict="organization_id").execute()
        print("Upsert Day Status Success:", upsert_res.data)
except Exception as e:
    print("Error during setup test:")
    print(e)
