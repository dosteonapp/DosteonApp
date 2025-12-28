import httpx
import json

async def test_auth_loopback():
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        # Signup
        email = "test_loopback_1@example.com"
        password = "Password123!"
        signup_data = {
            "email": email,
            "password": password,
            "first_name": "Test",
            "last_name": "User",
            "role": "restaurant"
        }
        print(f"Signing up {email}...")
        res = await client.post("/api/v1/auth/signup", json=signup_data)
        print(f"Signup Result: {res.status_code}")
        print(res.json())

        # Login
        login_data = {
            "email": email,
            "password": password
        }
        print(f"Logging in {email}...")
        res = await client.post("/api/v1/auth/login", json=login_data)
        print(f"Login Result: {res.status_code}")
        login_res = res.json()
        print(login_res)

        if res.status_code == 200:
            token = login_res["access_token"]
            print(f"Fetching /auth/me with token...")
            res = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
            print(f"Get Me Result: {res.status_code}")
            print(res.json())
        elif res.status_code == 403:
            print("Login failed: Email not verified. This is expected if Supabase is strictly enforcing it.")
        else:
            print("Login failed with other error.")

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_auth_loopback())
