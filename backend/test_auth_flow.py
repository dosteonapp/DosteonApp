import requests

def test_restaurant_flow():
    base_url = "http://127.0.0.1:8000/api/v1"
    email = "ayanfeoluwaedun@gmail.com"
    password = "Password123!"
    
    # Step 3: Login
    print(f"--- Step 3: Logging in as {email} ---")
    login_url = f"{base_url}/auth/login"
    login_payload = {"email": email, "password": password}
    
    try:
        login_response = requests.post(login_url, json=login_payload)
        print(f"Login Status: {login_response.status_code}")
        if login_response.status_code != 200:
            print(f"Login Failed: {login_response.json()}")
            return
        
        login_data = login_response.json()
        token = login_data["access_token"]
        role = login_data["user"]["role"]
        print(f"Login Successful! Role: {role}")
        
        # Step 4: Role-Based Access Check
        print("\n--- Step 4: Role-Based Access Check ---")
        headers = {"Authorization": f"Bearer {token}"}
        
        # 4a: Check /me
        print("Checking /test/me...")
        me_res = requests.get(f"{base_url}/test/me", headers=headers)
        print(f"/test/me Status: {me_res.status_code}")
        print(f"/test/me Response: {me_res.json()}")
        
        # 4b: Check /restaurant-only
        print("\nChecking /test/restaurant-only...")
        rest_res = requests.get(f"{base_url}/test/restaurant-only", headers=headers)
        print(f"/test/restaurant-only Status: {rest_res.status_code}")
        print(f"/test/restaurant-only Response: {rest_res.json()}")
        
        # 4c: Check /supplier-only
        print("\nChecking /test/supplier-only (Expected to fail with 403)...")
        supp_res = requests.get(f"{base_url}/test/supplier-only", headers=headers)
        print(f"/test/supplier-only Status: {supp_res.status_code}")
        print(f"/test/supplier-only Response: {supp_res.json()}")
        
    except Exception as e:
        print(f"Error during testing: {e}")

if __name__ == "__main__":
    test_restaurant_flow()
