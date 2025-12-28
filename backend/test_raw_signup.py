import os
from supabase import create_client, Client
from dotenv import load_dotenv

def test_raw_signup():
    load_dotenv()
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    
    supabase = create_client(url, key)
    
    email = "ayanfeoluwaedun@gmail.com"
    print(f"Testing direct signup for: {email}")
    
    try:
        res = supabase.auth.sign_up({
            "email": email,
            "password": "Password123!",
            "options": {
                "data": {
                    "first_name": "Ayanfe",
                    "last_name": "Test",
                    "role": "restaurant"
                }
            }
        })
        print(f"Signup Success: {res}")
    except Exception as e:
        print(f"Signup Error: {e}")

if __name__ == "__main__":
    test_raw_signup()
