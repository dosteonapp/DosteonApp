import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv('DATABASE_URL').replace('?pgbouncer=true', '')
print(f"Connecting to {db_url.split('@')[-1]}")

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    roles = ['postgres', 'anon', 'authenticated', 'service_role', 'authenticator']
    
    for role in roles:
        print(f"Granting permissions to {role}...")
        try:
            cur.execute(f"GRANT USAGE ON SCHEMA public TO {role};")
            cur.execute(f"GRANT ALL ON ALL TABLES IN SCHEMA public TO {role};")
            cur.execute(f"GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO {role};")
            cur.execute(f"GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO {role};")
            
            cur.execute(f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO {role};")
            cur.execute(f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO {role};")
            cur.execute(f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO {role};")
        except Exception as e:
            print(f"  Warning: Could not grant to {role}: {e}")
            conn.rollback()
            continue
        conn.commit()
    
    print("Flushing PostgREST schema cache...")
    try:
        cur.execute("SELECT pg_notify('pgrst', 'reload schema');")
        conn.commit()
    except Exception as e:
        print(f"  Warning: Could not notify pgrst: {e}")
        conn.rollback()

    cur.close()
    conn.close()
    print("Done.")
except Exception as e:
    print(f"Error: {e}")
