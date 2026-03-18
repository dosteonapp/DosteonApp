import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv('DATABASE_URL').replace('?pgbouncer=true', '')

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT email, role, organization_id FROM public.profiles WHERE email = 'gatetejules1@gmail.com'")
    row = cur.fetchone()
    print(f"Profile: {row}")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
