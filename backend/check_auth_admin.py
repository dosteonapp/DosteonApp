import os
from supabase import create_client, Client
from dotenv import load_dotenv

def check_auth_user():
    load_dotenv()
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        print("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
        return

    # Using service role key for admin access
    supabase: Client = create_client(url, key)
    
    email = "ayanfeoluwaedun@gmail.com"
    print(f"Checking Auth for: {email}")
    
    try:
        # list_users returns an object with 'users' and 'aud'
        res = supabase.auth.admin.list_users()
        users = res if isinstance(res, list) else getattr(res, 'users', [])
        
        print(f"Total Users in Auth: {len(users)}")
        found = False
        for user in users:
            print(f"- {user.email}")
            if user.email == email:
                print(f"FOUND USER: ID={user.id}, Confirmed={user.email_confirmed_at}")
                found = True
                break
        
        if not found:
            print(f"User {email} NOT found in the list above.")
            
    except Exception as e:
        print(f"Error checking users: {e}")

if __name__ == "__main__":
    check_auth_user()
