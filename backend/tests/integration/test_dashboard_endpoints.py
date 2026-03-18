import httpx
import json
import asyncio

async def test_dashboard_endpoints():
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        # 1. Login to get token
        email = "test_sync_4@example.com"
        password = "Password123!"
        print(f"Logging in {email}...")
        res = await client.post("/api/v1/auth/login", json={"email": email, "password": password})
        if res.status_code != 200:
            print(f"Login failed: {res.status_code}")
            print(res.json())
            return
        
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Login successful.")

        # 2. Test Restaurant Endpoints
        print("\nTesting Restaurant Endpoints:")
        for path in ["/api/v1/restaurant/stats", "/api/v1/restaurant/inventory/low-stock", "/api/v1/restaurant/orders/recent"]:
            print(f"GET {path}")
            res = await client.get(path, headers=headers)
            print(f"Status: {res.status_code}")
            if res.status_code == 200:
                print(f"Response: {json.dumps(res.json(), indent=2)[:200]}...")
            else:
                print(f"Error: {res.text}")

        # 3. Test Supplier Endpoints
        print("\nTesting Supplier Endpoints:")
        for path in ["/api/v1/supplier/stats", "/api/v1/supplier/orders", "/api/v1/supplier/products"]:
            print(f"GET {path}")
            res = await client.get(path, headers=headers)
            print(f"Status: {res.status_code}")
            if res.status_code == 200:
                print(f"Response: {json.dumps(res.json(), indent=2)[:200]}...")
            else:
                print(f"Error: {res.text}")

if __name__ == "__main__":
    asyncio.run(test_dashboard_endpoints())
