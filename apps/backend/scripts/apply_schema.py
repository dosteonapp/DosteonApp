import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def apply_sql():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL not found in .env")
        return
    
    # Strip pgbouncer parameter for psycopg2
    if "?pgbouncer=true" in db_url:
        db_url = db_url.replace("?pgbouncer=true", "")
    elif "&pgbouncer=true" in db_url:
        db_url = db_url.replace("&pgbouncer=true", "")

    print(f"Connecting to database to apply schema...")
    try:
        # Connect to Postgres
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()

        # Read SQL file
        sql_path = "layered_inventory.sql"
        with open(sql_path, "r") as f:
            sql = f.read()

        # Execute SQL script
        print("Executing SQL script...")
        cur.execute(sql)
        
        # Notify PostgREST to reload schema
        try:
            print("Notifying PostgREST to reload schema cache...")
            cur.execute("NOTIFY pgrst, 'reload schema';")
        except:
            print("Notice: Could not notify pgrst (might not have permissions), but schema was applied.")
        
        print("Schema applied successfully!")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error applying SQL: {e}")

if __name__ == "__main__":
    apply_sql()
