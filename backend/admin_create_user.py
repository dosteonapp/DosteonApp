import os
from supabase import create_client, Client
from dotenv import load_dotenv

def create_confirmed_user():
    load_dotenv()
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    supabase: Client = create_client(url, key)
    
    email = "ayanfeoluwaedun@gmail.com"
    print(f"Manually creating confirmed user: {email}")
    
    try:
        res = supabase.auth.admin.create_user({
            "email": email,
            "password": "Password123!",
            "email_confirm": True, # This confirms the email immediately!
            "user_metadata": {
                "first_name": "Ayanfe",
                "last_name": "Test",
                "role": "restaurant"
            }
        })
        print(f"Admin Create Success: {res}")
        return res
    except Exception as e:
        print(f"Admin Create Error: {e}")
        return None

if __name__ == "__main__":
    create_confirmed_user()
