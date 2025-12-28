import requests

def trigger_magic_link():
    email = "gatetejules1@gmail.com"
    url = "http://127.0.0.1:8000/api/v1/auth/magic-link"
    payload = {"email": email}
    
    print(f"Triggering magic link for: {email}")
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    trigger_magic_link()
