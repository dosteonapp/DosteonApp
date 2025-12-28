import requests

def diagnostic_signup():
    url = "http://127.0.0.1:8000/api/v1/auth/signup"
    payload = {
        "email": "ayanfeoluwaedun@gmail.com",
        "password": "Password123!",
        "first_name": "Ayanfe",
        "last_name": "Test",
        "role": "restaurant"
    }
    
    print(f"Triggering signup for: {payload['email']}")
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response JSON: {response.json()}")

if __name__ == "__main__":
    diagnostic_signup()
