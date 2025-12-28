import requests
import os
from dotenv import load_dotenv

def check_postgrest():
    load_dotenv()
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    
    if not url or not key:
        print("Missing URL or Key")
        return

    # Postgrest root shows available tables
    api_url = f"{url}/rest/v1/"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}"
    }
    
    print(f"Checking Postgrest at: {api_url}")
    try:
        response = requests.get(api_url, headers=headers)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            try:
                data = response.json()
                tables = data.get("definitions", {}).keys()
                print(f"Visible Tables: {list(tables)}")
            except:
                print("Could not parse JSON response")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_postgrest()
