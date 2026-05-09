import httpx
import asyncio
import sys
import os
import pytest

# Add parent directory to path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

BASE_URL = "http://localhost:8000/api/v1"

pytestmark = pytest.mark.skip(
    reason="Manual integration script; requires live backend at http://localhost:8000"
)

async def test_auth_flow():
    email = "gatetejules1@gmail.com"
    password = "SafePassword123!" # This must meet complexity requirements
    
    print(f"--- Testing Auth Flow for {email} ---")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # 1. Signup
        print("\n1. Testing Signup...")
        signup_data = {
            "email": email,
            "password": password,
            "first_name": "Jules",
            "last_name": "Gatete",
            "role": "restaurant"
        }
        try:
            res = await client.post(f"{BASE_URL}/auth/signup", json=signup_data)
            print(f"Signup Status: {res.status_code}")
            if res.status_code < 400:
                print(f"Signup Response: {res.json()}")
            else:
                print(f"Signup Failed: {res.text}")
        except Exception as e:
            print(f"Signup Error: {e}")

        # 2. Login
        print("\n2. Testing Login...")
        login_data = {
            "email": email,
            "password": password
        }
        try:
            res = await client.post(f"{BASE_URL}/auth/login", json=login_data)
            print(f"Login Status: {res.status_code}")
            if res.status_code == 200:
                token_data = res.json()
                access_token = token_data["access_token"]
                refresh_token = token_data["refresh_token"]
                print("Login Successful!")
                
                # 3. Get Me
                print("\n3. Testing /me endpoint...")
                headers = {"Authorization": f"Bearer {access_token}"}
                res = await client.get(f"{BASE_URL}/auth/me", headers=headers)
                print(f"Me Status: {res.status_code}")
                print(f"Me Response: {res.json()}")
                
                # 4. Refresh Token
                print("\n4. Testing /refresh endpoint...")
                refresh_data = {"refresh_token": refresh_token}
                res = await client.post(f"{BASE_URL}/auth/refresh", json=refresh_data)
                print(f"Refresh Status: {res.status_code}")
                if res.status_code == 200:
                    print("Token Refresh Successful!")
                else:
                    print(f"Refresh Failed: {res.text}")
            else:
                print(f"Login Failed: {res.json().get('detail', 'Unknown error')}")
                if res.status_code == 403:
                    print("NOTE: 403 Forbidden usually means email is not confirmed.")
        except Exception as e:
            print(f"Login Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_auth_flow())
