import requests

def signup_restaurant():
    url = "http://127.0.0.1:8000/api/v1/auth/signup"
    payload = {
        "email": "ayanfeoluwaedun@gmail.com",
        "password": "Password123!",
        "first_name": "Ayanfe",
        "last_name": "Test",
        "role": "restaurant"
    }
    
    print(f"Triggering signup for: {payload['email']} (Role: {payload['role']})")
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    signup_restaurant()
