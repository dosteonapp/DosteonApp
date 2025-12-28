import os
from supabase import create_client, Client
from dotenv import load_dotenv

def create_blessing_user():
    load_dotenv()
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    supabase: Client = create_client(url, key)
    
    email = "patrickblessing0610@gmail.com"
    print(f"Manually creating confirmed user: {email}")
    
    try:
        res = supabase.auth.admin.create_user({
            "email": email,
            "password": "Test@1234",
            "email_confirm": True,
            "user_metadata": {
                "first_name": "Blessing",
                "last_name": "User",
                "role": "restaurant"
            }
        })
        print(f"Admin Create Success!")
        print(f"Email: {email}")
        print(f"Password: Test@1234")
        return res
    except Exception as e:
        print(f"Admin Create Error: {e}")
        return None

if __name__ == "__main__":
    create_blessing_user()
