import os
from dotenv import load_dotenv

def check_env():
    load_dotenv()
    url = os.getenv("SUPABASE_URL")
    anon_key = os.getenv("SUPABASE_ANON_KEY")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    print(f"URL: {url}")
    print(f"ANON_KEY length: {len(anon_key) if anon_key else 'MISSING'}")
    print(f"SERVICE_KEY length: {len(service_key) if service_key else 'MISSING'}")
    
    # Check if URL ends with /
    if url and url.endswith('/'):
        print("WARNING: SUPABASE_URL ends with a slash. This can sometimes cause issues.")

if __name__ == "__main__":
    check_env()
