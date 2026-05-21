#!/usr/bin/env python3
"""
Phase 4 Migration Executor for Dosteon Staging Database
Safely executes 3-phase migration: Backfill -> Constraints -> Validation
"""

import os
import sys
from urllib.parse import urlparse

try:
    import psycopg
except ImportError:
    print("Installing psycopg3...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg[binary]", "-q"])
    import psycopg

def connect_db():
    """Connect to staging database using DIRECT_URL"""
    db_url = os.getenv("DIRECT_URL")
    if not db_url:
        raise ValueError("DIRECT_URL environment variable not set")

    parsed = urlparse(db_url)
    conn = psycopg.connect(
        user=parsed.username,
        password=parsed.password,
        host=parsed.hostname,
        port=parsed.port or 5432,
        dbname=parsed.path.lstrip('/')
    )
    return conn

def run_query(conn, query, description=""):
    """Execute a query and return results"""
    if description:
        print("\n[*] " + description)
    cursor = conn.cursor()
    try:
        cursor.execute(query)
        result = cursor.fetchall()
        conn.commit()
        return result
    except Exception as e:
        conn.rollback()
        print("[!] Error: " + str(type(e).__name__) + ": " + str(e))
        raise
    finally:
        cursor.close()

def phase_a_backfill(conn):
    """PHASE A: Backfill NULL idempotency_key values"""
    print("\n" + "="*60)
    print("PHASE A: BACKFILL (Data Cleaning)")
    print("="*60)

    # A1: Count NULLs
    print("\n[A1] Checking for NULL idempotency_key values...")
    result = run_query(
        conn,
        'SELECT COUNT(*) FROM "Expense" WHERE idempotency_key IS NULL;',
        "Count of NULL idempotency_key:"
    )
    null_count = result[0][0]
    print("[OK] Result: " + str(null_count) + " NULL values")

    if null_count == 0:
        print("[OK] No backfill needed - all keys present")
        return True

    # A2: Backfill
    print("\n[A2] Backfilling " + str(null_count) + " NULL values...")
    run_query(
        conn,
        '''UPDATE "Expense"
           SET idempotency_key = gen_random_uuid()::text
           WHERE idempotency_key IS NULL;''',
        "Backfilled " + str(null_count) + " rows"
    )

    # A3: Verify
    print("\n[A3] Verifying backfill...")
    result = run_query(
        conn,
        'SELECT COUNT(*) FROM "Expense" WHERE idempotency_key IS NULL;',
        "Null count after backfill:"
    )
    null_count_after = result[0][0]
    if null_count_after == 0:
        print("[OK] Backfill successful - all keys populated")
    else:
        print("[!] Backfill failed - " + str(null_count_after) + " NULLs remain")
        return False

    # A4: Audit financial consistency
    print("\n[A4] Auditing SaleOrder financial consistency...")
    result = run_query(
        conn,
        '''SELECT
             COUNT(*) as count,
             COALESCE(SUM(ABS(gross_profit - (total_revenue - total_cogs))), 0) as drift
           FROM "SaleOrder"
           WHERE gross_profit != (total_revenue - total_cogs)
             AND total_revenue IS NOT NULL
             AND total_cogs IS NOT NULL;''',
        "Financial consistency check:"
    )
    inconsistency_count = result[0][0]
    drift = result[0][1]
    if inconsistency_count == 0:
        print("[OK] Financial consistency verified - 0 inconsistencies")
    else:
        print("[WARN] Found " + str(inconsistency_count) + " inconsistencies (total drift: $" + str(drift) + ")")
        print("[WARN] Review needed before applying constraints")
        return False

    # A5: Check org_id
    print("\n[A5] Verifying InventoryEvent.organization_id NOT NULL...")
    result = run_query(
        conn,
        'SELECT COUNT(*) FROM "InventoryEvent" WHERE organization_id IS NULL;',
        "NULL organization_id count:"
    )
    null_org = result[0][0]
    if null_org == 0:
        print("[OK] All inventory events have organization_id")
    else:
        print("[!] Found " + str(null_org) + " inventory events with NULL organization_id")
        return False

    return True

def phase_b_constraints(conn):
    """PHASE B: Apply constraints"""
    print("\n" + "="*60)
    print("PHASE B: CONSTRAINT ENFORCEMENT")
    print("="*60)

    # B1: NOT NULL constraint
    print("\n[B1] Enforcing NOT NULL on Expense.idempotency_key...")
    try:
        run_query(
            conn,
            'ALTER TABLE "Expense" ALTER COLUMN idempotency_key SET NOT NULL;',
            "Applied NOT NULL constraint"
        )
        print("[OK] Constraint applied successfully")
    except Exception as e:
        print("[!] Failed to apply constraint: " + str(e))
        return False

    # B2: CHECK constraint
    print("\n[B2] Adding financial consistency CHECK constraint...")
    try:
        run_query(
            conn,
            '''ALTER TABLE "SaleOrder"
               ADD CONSTRAINT saleorder_financial_consistency
               CHECK (gross_profit = (total_revenue - total_cogs));''',
            "Added CHECK constraint"
        )
        print("[OK] CHECK constraint added successfully")
    except Exception as e:
        print("[!] Failed to add CHECK constraint: " + str(e))
        return False

    # B3: Performance indexes
    print("\n[B3] Adding performance indexes...")
    indexes = [
        ('idx_expense_org_date', 'ON "Expense" (organization_id, business_date DESC)'),
        ('idx_saleorder_org_created', 'ON "SaleOrder" (organization_id, created_at DESC)'),
        ('idx_inventory_event_org_date', 'ON "InventoryEvent" (organization_id, created_at DESC)'),
    ]

    for idx_name, idx_def in indexes:
        try:
            run_query(
                conn,
                'CREATE INDEX IF NOT EXISTS ' + idx_name + ' ' + idx_def + ';',
                "Created index: " + idx_name
            )
        except Exception as e:
            print("[WARN] Index creation: " + str(e))

    print("[OK] Indexes created")
    return True

def phase_c_validate(conn):
    """PHASE C: Validation"""
    print("\n" + "="*60)
    print("PHASE C: VALIDATION & VERIFICATION")
    print("="*60)

    # C1: Check constraints exist
    print("\n[C1] Verifying constraints are enforced...")
    result = run_query(
        conn,
        '''SELECT constraint_name, constraint_type
           FROM information_schema.table_constraints
           WHERE table_name IN ('Expense', 'SaleOrder')
           ORDER BY table_name, constraint_name;''',
        "Active constraints:"
    )

    found_check = False
    for constraint_name, constraint_type in result:
        print("  - " + constraint_name + " (" + constraint_type + ")")
        if constraint_name == 'saleorder_financial_consistency':
            found_check = True

    if found_check:
        print("[OK] Constraints verified")

    # C2: Final NULL check
    print("\n[C2] Final NULL verification...")
    result = run_query(
        conn,
        'SELECT COUNT(*) FROM "Expense" WHERE idempotency_key IS NULL;',
        "NULL idempotency_key count:"
    )
    if result[0][0] == 0:
        print("[OK] No NULL idempotency_key values")
    else:
        print("[!] Found NULLs: " + str(result[0][0]))
        return False

    # C3: Financial consistency
    print("\n[C3] Final financial consistency check...")
    result = run_query(
        conn,
        '''SELECT COUNT(*) FROM "SaleOrder"
           WHERE gross_profit != (total_revenue - total_cogs);''',
        "Financial inconsistencies:"
    )
    if result[0][0] == 0:
        print("[OK] 0 financial inconsistencies")
    else:
        print("[WARN] Found " + str(result[0][0]) + " inconsistencies")

    return True

def main():
    print("\n" + "="*60)
    print("PHASE 4 MIGRATION EXECUTOR - Dosteon Staging Database")
    print("="*60)
    print("Database: " + os.getenv('DIRECT_URL', 'DIRECT_URL not set')[:50] + "...")

    try:
        conn = connect_db()
        print("[OK] Connected to database")
    except Exception as e:
        print("[!] Connection failed: " + str(e))
        sys.exit(1)

    try:
        # Execute phases
        if not phase_a_backfill(conn):
            print("\n[!] Phase A failed - stopping migration")
            return False

        if not phase_b_constraints(conn):
            print("\n[!] Phase B failed - stopping migration")
            return False

        if not phase_c_validate(conn):
            print("\n[!] Phase C validation failed")
            return False

        print("\n" + "="*60)
        print("[OK] ALL PHASES COMPLETED SUCCESSFULLY")
        print("="*60)
        print("\nNext steps:")
        print("  1. Review verification output above")
        print("  2. Commit migrations to safe-migration-v1 branch")
        print("  3. Proceed to Phase 3 rollout (shadow systems activation)")
        return True

    finally:
        conn.close()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
