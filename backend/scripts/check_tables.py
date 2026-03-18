import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def check_tables():
    db_url = os.getenv("DATABASE_URL")
    if "?pgbouncer=true" in db_url:
        db_url = db_url.replace("?pgbouncer=true", "")
    
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
    tables = cur.fetchall()
    print("Tables in public schema:")
    for t in tables:
        print(f"- {t[0]}")
    cur.close()
    conn.close()

if __name__ == "__main__":
    check_tables()
