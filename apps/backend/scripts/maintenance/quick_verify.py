#!/usr/bin/env python3
"""Quick verification of Supabase setup."""

import os
import sys
import asyncio
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from dotenv import load_dotenv
load_dotenv()

async def main():
    print("\n🔍 Quick Supabase Verification\n")
    print("="*50)
    
    # 1. Check environment
    print("\n1. Environment Variables:")
    supabase_url = os.getenv('SUPABASE_URL')
    if supabase_url:
        print(f"   ✓ SUPABASE_URL: {supabase_url}")
    else:
        print("   ✗ SUPABASE_URL not set")
        return
    
    # 2. Test database connection
    print("\n2. Database Connection:")
    try:
        from app.db.prisma import db
        await db.connect()
        result = await db.query_raw("SELECT current_database(), current_user")
        print(f"   ✓ Connected to: {result[0]['current_database']}")
        print(f"   ✓ User: {result[0]['current_user']}")
        
        # Check what tables exist
        tables = await db.query_raw("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """)
        
        print(f"\n   Found {len(tables)} tables:")
        for t in tables:
            print(f"     - {t['table_name']}")
        
        await db.disconnect()
        
    except Exception as e:
        print(f"   ✗ Database error: {e}")
        return
    
    # 3. Test auth
    print("\n3. Supabase Auth:")
    try:
        from app.core.supabase import supabase
        response = supabase.auth.admin.list_users(page=1, per_page=1)
        print(f"   ✓ Auth working (service role key valid)")
        
        # Try to get user count
        try:
            all_users = supabase.auth.admin.list_users(page=1, per_page=100)
            user_count = len(all_users.users) if hasattr(all_users, 'users') else 0
            print(f"   ✓ Users in database: {user_count}")
        except:
            print(f"   ✓ Auth configured (no users yet)")
            
    except Exception as e:
        print(f"   ✗ Auth error: {e}")
        return
    
    print("\n" + "="*50)
    print("\n✅ Basic setup is working!\n")
    
    # Next steps
    print("📋 Next Steps:")
    print("   1. If tables are missing, run: make db-migrate")
    print("   2. To seed test data, run: make db-seed")
    print("   3. To start the backend: make dev-backend")
    print("   4. To start everything: make dev\n")

if __name__ == '__main__':
    asyncio.run(main())
