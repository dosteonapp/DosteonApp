import requests

def reset_password():
    # Exactly as provided by the user
    token = "eyJhbGciOiJIUzI1NiIsImtpZCI6Ilh1TkRFRGlCajJ2SVNtN0kiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3FmYmtncHVleWRwc2JtcnhudndkLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJjYmVhNDhmOC0xNDI5LTQ2YWItYmQ1MC0zMDA4YWY1N2EzNWUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzY2NDg5Mzk4LCJpYXQiOjE3NjY0ODU3OTgsImVtYWlsIjoiZ2F0ZXRlanVsZXMxQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJnYXRldGVqdWxlczFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcnN0X25hbWUiOiJKdWxlcyIsImxhc3RfbmFtZSI6IlRlc3QiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInJvbGUiOiJyZXN0YXVyYW50Iiwic3ViIjoiY2JlYTQ4ZjgtMTQyOS00NmFiLWJkNTAtMzAwOGFmNTdhMzVlIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoib3RwIiwidGltZXN0YW1wIjoxNzY2NDg1Nzk4fV0sInNlc3Npb25faWQiOiJjM2I2MDhkOC1lYzAxLTRmNjYtYjY2Ny1kMWYzZDYzODM3NTMiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.PDKIFrMwQfFKXyrQTqCGF5Chf8N-eI_YDNK3i1ZLMNA"
    url = f"http://127.0.0.1:8000/api/v1/auth/reset-password?token={token}"
    payload = {"new_password": "Password123!"}
    
    print(f"Attempting password reset with token length: {len(token)}")
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    reset_password()
