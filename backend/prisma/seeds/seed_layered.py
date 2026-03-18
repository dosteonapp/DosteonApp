import psycopg2
import os
from dotenv import load_dotenv
import json
import uuid

load_dotenv()

def seed_layered_psycopg2():
    print("--- SEEDING LAYERED INVENTORY DATA (via Psycopg2) ---")
    db_url = os.getenv("DATABASE_URL")
    if db_url and "?pgbouncer=true" in db_url:
        db_url = db_url.replace("?pgbouncer=true", "")
    elif db_url and "&pgbouncer=true" in db_url:
        db_url = db_url.replace("&pgbouncer=true", "")
    
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cur = conn.cursor()

    # 0. Test User Setup
    test_user_email = "gatetejules1@gmail.com"
    test_user_id = "8370130e-1958-40c4-8110-4f9d5038810e"
    
    # 1. Organization
    org_name = "Dosteon Demo Restaurant"
    cur.execute("SELECT id FROM organizations WHERE name = %s;", (org_name,))
    row = cur.fetchone()
    if not row:
        cur.execute(
            "INSERT INTO organizations (name, type, settings) VALUES (%s, %s, %s) RETURNING id;",
            (org_name, "restaurant", json.dumps({"opening_time": "08:00", "closing_time": "22:00"}))
        )
        org_id = cur.fetchone()[0]
        print(f"Created Org: {org_name}")
    else:
        org_id = row[0]
        print(f"Using existing Org: {org_name}")

    # 1.1 Link Test User Profile
    cur.execute("SELECT id FROM profiles WHERE email = %s;", (test_user_email,))
    if not cur.fetchone():
        cur.execute(
            "INSERT INTO profiles (id, email, role, organization_id, first_name, last_name) VALUES (%s, %s, %s, %s, %s, %s);",
            (test_user_id, test_user_email, "admin", org_id, "Test", "User")
        )
        print(f"Created profile for {test_user_email}")
    else:
        cur.execute(
            "UPDATE profiles SET organization_id = %s, role = 'admin' WHERE id = %s;",
            (org_id, test_user_id)
        )
        print(f"Updated profile for {test_user_email}")

    # 2. Location
    cur.execute("SELECT id FROM locations WHERE organization_id = %s AND location_type = 'restaurant';", (org_id,))
    row = cur.fetchone()
    if not row:
        cur.execute(
            "INSERT INTO locations (organization_id, country, city, location_type) VALUES (%s, %s, %s, %s) RETURNING id;",
            (org_id, "Rwanda", "Kigali", "restaurant")
        )
        loc_id = cur.fetchone()[0]
        print("Created Location.")
    else:
        loc_id = row[0]

    # 3. Canonical Layer
    canonical_data = [
        ("Whole Milk", "Dairy", "Liquid", "litre"),
        ("Arabica Coffee Beans", "Dry Goods", "Grain", "kg"),
        ("White Sugar", "Dry Goods", "Sweetener", "kg"),
        ("Irish Potatoes", "Fresh Produce", "Tuber", "kg")
    ]

    for name, cat, ptype, unit in canonical_data:
        cur.execute(
            """INSERT INTO canonical_products (name, category, product_type, base_unit) 
               VALUES (%s, %s, %s, %s) 
               ON CONFLICT (name) DO UPDATE SET category = EXCLUDED.category RETURNING id;""",
            (name, cat, ptype, unit)
        )
    print("Seeded Canonical Layer.")

    # 4. Contextual & Event Layer
    cur.execute("SELECT id, name, base_unit FROM canonical_products;")
    canonicals = cur.fetchall()
    for cp_id, cp_name, cp_unit in canonicals:
        cur.execute("SELECT id FROM contextual_products WHERE canonical_product_id = %s AND organization_id = %s;", (cp_id, org_id))
        row = cur.fetchone()
        if not row:
            cur.execute(
                "INSERT INTO contextual_products (canonical_product_id, organization_id, location_id, reorder_threshold) VALUES (%s, %s, %s, %s) RETURNING id;",
                (cp_id, org_id, loc_id, 10.0)
            )
            ctx_id = cur.fetchone()[0]
            print(f"Operationalized: {cp_name}")

            # 5. Opening Stock Event
            cur.execute(
                "INSERT INTO inventory_events (contextual_product_id, event_type, quantity, unit, actor_type, metadata) VALUES (%s, %s, %s, %s, %s, %s);",
                (ctx_id, "opening_stock", 50.0, cp_unit, "system", json.dumps({"reason": "Initial Seeding"}))
            )

    print("--- SEEDING COMPLETE ---")
    cur.close()
    conn.close()

if __name__ == "__main__":
    seed_layered_psycopg2()
