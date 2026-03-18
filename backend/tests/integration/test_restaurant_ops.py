import httpx
import json
import os
import sys

BASE_URL = "http://localhost:8000/api/v1"

def run_ops_test():
    if not os.path.exists("test_creds.json"):
        print("[\u274c] Error: 'test_creds.json' not found. Run 'test_onboarding.py' first.")
        return

    with open("test_creds.json", "r") as f:
        creds = json.load(f)

    print(f"--- TESTING RESTAURANT OPERATIONS for {creds['email']} ---")

    # 1. Login
    print("\n1. Logging in...")
    try:
        login_res = httpx.post(f"{BASE_URL}/auth/login", json={
            "email": creds["email"],
            "password": creds["password"]
        })
        
        if login_res.status_code != 200:
            print(f"[\u274c] Login failed: {login_res.text}")
            print("\nREMINDER: Did you confirm the email in Supabase Dashboard?")
            return

        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("[\u2705] Login successful.")

        # 2. Check Settings
        print("\n2. Checking Organization Settings...")
        settings_res = httpx.get(f"{BASE_URL}/restaurant/settings", headers=headers)
        print(f"Current Settings: {settings_res.json()}")

        # 3. Update Settings (Admin Only)
        print("\n3. Updating Operational Hours...")
        new_settings = {"opening_time": "07:00", "closing_time": "23:00"}
        update_res = httpx.patch(f"{BASE_URL}/restaurant/settings", json=new_settings, headers=headers)
        if update_res.status_code == 200:
            print("[\u2705] Settings updated successfully.")
        else:
            print(f"[\u274c] Settings update failed: {update_res.text}")

        # 4. Check Stats (Empty Inventory)
        print("\n4. Checking Stats (Empty)...")
        stats_res = httpx.get(f"{BASE_URL}/restaurant/stats", headers=headers)
        print(f"Stats: {stats_res.json()}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_ops_test()
