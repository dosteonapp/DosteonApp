import requests

def trigger_forgot_password():
    url = "http://127.0.0.1:8000/api/v1/auth/forgot-password"
    payload = {"email": "gatetejules1@gmail.com"}
    
    print(f"Triggering forgot password for: {payload['email']}")
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    trigger_forgot_password()
