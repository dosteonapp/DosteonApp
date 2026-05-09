import httpx
import json
import uuid
import time
import os
import pytest

BASE_URL = "http://localhost:8000/api/v1"

pytestmark = pytest.mark.skip(
    reason="Manual onboarding flow; sends real email and requires live backend at http://localhost:8000"
)

def test_onboarding_flow():
    print("--- TESTING ONBOARDING FLOW (REAL EMAIL) ---")
    
    # We will use the requested email to test the confirmation flow
    admin_email = "gatetejules1@gmail.com"
    password = "Password123!"
    suffix = str(uuid.uuid4())[:4]
    
    # 1. Signup as Admin (Creates Organization)
    print(f"\n1. Signing up Admin: {admin_email}")
    signup_data = {
        "email": admin_email,
        "password": password,
        "first_name": "Jules",
        "last_name": "Gatete",
        "role": "admin",
        "organization_name": f"Gatete Restaurant {suffix}"
    }
    
    try:
        response = httpx.post(f"{BASE_URL}/auth/signup", json=signup_data, timeout=10.0)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            res_json = response.json()
            org_id = res_json.get("organization_id")
            print(f"[\u2705] Signup successful.")
            print(f"Organization ID: {org_id}")
            
            # Save credentials for next test
            with open("test_creds.json", "w") as f:
                json.dump({
                    "email": admin_email,
                    "password": password,
                    "organization_id": org_id
                }, f)
            
            print("\nCREDENTIALS SAVED to 'test_creds.json'")
            print("\nACTION NEEDED:")
            print(f"1. Check the email inbox of '{admin_email}'.")
            print("2. Click the confirmation link.")
            print("3. Then run 'test_restaurant_ops.py' to verify the sign-in and dashboard data.")
        else:
            print("[\u274c] Signup failed.")
            print(f"Error detail: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_onboarding_flow()
