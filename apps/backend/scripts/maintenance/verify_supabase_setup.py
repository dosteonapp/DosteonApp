#!/usr/bin/env python3
"""
Supabase Setup Verification Script

This script verifies:
1. Environment variables are set correctly
2. Database connection works
3. Supabase auth is configured properly
4. Service role key has admin permissions
5. Database schema is up to date
"""

import os
import sys
import asyncio
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_header(text):
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}{text:^60}{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")

def print_success(text):
    print(f"{GREEN}✓{RESET} {text}")

def print_error(text):
    print(f"{RED}✗{RESET} {text}")

def print_warning(text):
    print(f"{YELLOW}⚠{RESET} {text}")

def print_info(text):
    print(f"{BLUE}ℹ{RESET} {text}")


async def verify_environment_variables():
    """Check if all required environment variables are set."""
    print_header("1. Environment Variables")
    
    required_vars = {
        'SUPABASE_URL': 'Supabase Project URL',
        'SUPABASE_ANON_KEY': 'Supabase Anonymous Key',
        'SUPABASE_SERVICE_ROLE_KEY': 'Supabase Service Role Key',
        'DATABASE_URL': 'Database Connection URL (pooled)',
        'DIRECT_URL': 'Direct Database Connection URL',
    }
    
    all_set = True
    for var, description in required_vars.items():
        value = os.getenv(var)
        if value and value != f'your_{var.lower()}':
            # Mask sensitive values
            if 'KEY' in var or 'PASSWORD' in var:
                masked = value[:10] + '...' + value[-4:] if len(value) > 14 else '***'
                print_success(f"{description}: {masked}")
            elif 'URL' in var:
                # Show URL but mask password
                if '@' in value:
                    parts = value.split('@')
                    if ':' in parts[0]:
                        user_pass = parts[0].split(':')
                        masked_url = f"{user_pass[0]}:***@{parts[1]}"
                        print_success(f"{description}: {masked_url}")
                    else:
                        print_success(f"{description}: {value}")
                else:
                    print_success(f"{description}: {value}")
            else:
                print_success(f"{description}: {value}")
        else:
            print_error(f"{description}: NOT SET")
            all_set = False
    
    return all_set


async def verify_database_connection():
    """Test database connection using Prisma."""
    print_header("2. Database Connection")
    
    try:
        from app.db.prisma import db
        
        print_info("Connecting to database...")
        
        # Ensure we're not already connected
        if db.is_connected():
            await db.disconnect()
        
        await db.connect()
        print_success("Database connection established")
        
        # Test a simple query
        print_info("Testing database query...")
        result = await db.query_raw("SELECT 1 as test")
        print_success("Database query successful")
        
        # Check if tables exist
        print_info("Checking database schema...")
        tables_query = """
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """
        tables = await db.query_raw(tables_query)
        
        if tables and len(tables) > 0:
            print_success(f"Found {len(tables)} tables in database")
            table_names = [t['table_name'] for t in tables[:5]]
            print_info("Tables: " + ", ".join(table_names))
            if len(tables) > 5:
                print_info(f"  ... and {len(tables) - 5} more")
        else:
            print_warning("No tables found - you need to run migrations")
            print_info("Run: make db-migrate")
        
        await db.disconnect()
        return True
        
    except Exception as e:
        print_error(f"Database connection failed: {e}")
        print_info("Make sure your DATABASE_URL and DIRECT_URL are correct")
        return False


async def verify_supabase_auth():
    """Test Supabase authentication setup."""
    print_header("3. Supabase Authentication")
    
    try:
        from app.core.supabase import supabase
        
        # Test service role key by listing users (admin operation)
        print_info("Testing service role key permissions...")
        try:
            response = supabase.auth.admin.list_users(page=1, per_page=1)
            print_success("Service role key has admin permissions")
            
            # Check if any users exist
            if hasattr(response, 'users') and response.users:
                print_info(f"Found {len(response.users)} user(s) in first page")
            else:
                print_warning("No users found in database")
                print_info("You can create a test user through Supabase dashboard or signup")
                
        except Exception as e:
            print_error(f"Service role key test failed: {e}")
            print_warning("Make sure SUPABASE_SERVICE_ROLE_KEY is correct")
            return False
        
        # Test anon key
        print_info("Testing anonymous key...")
        anon_key = os.getenv('SUPABASE_ANON_KEY')
        if anon_key and len(anon_key) > 20:
            print_success("Anonymous key is set")
        else:
            print_error("Anonymous key is missing or invalid")
            return False
        
        return True
        
    except Exception as e:
        print_error(f"Supabase auth verification failed: {e}")
        return False


async def verify_database_schema():
    """Check if database schema matches Prisma schema."""
    print_header("4. Database Schema")
    
    try:
        from app.db.prisma import db
        
        # Ensure clean connection
        if db.is_connected():
            await db.disconnect()
            
        await db.connect()
        
        # Check for key tables
        key_tables = [
            'Organization',
            'Profile', 
            'InventoryItem',
            'Order',
            'Sale'
        ]
        
        print_info("Checking for key tables...")
        tables_found = 0
        for table in key_tables:
            try:
                # Try to query the table
                result = await db.query_raw(f'SELECT COUNT(*) as count FROM "{table}"')
                count = result[0]['count'] if result and len(result) > 0 else 0
                print_success(f"{table}: {count} records")
                tables_found += 1
            except Exception as e:
                print_error(f"{table}: NOT FOUND")
        
        await db.disconnect()
        
        if tables_found == 0:
            print_warning("No tables found - you need to run migrations")
            print_info("Run: make db-migrate")
            return False
        elif tables_found < len(key_tables):
            print_warning(f"Only {tables_found}/{len(key_tables)} tables found")
            print_info("Run: make db-migrate")
            return False
        
        return True
        
    except Exception as e:
        print_error(f"Schema verification failed: {e}")
        return False


async def verify_prisma_client():
    """Check if Prisma client is generated."""
    print_header("5. Prisma Client")
    
    try:
        from app.db.prisma import db
        print_success("Prisma client is generated and importable")
        
        # Check if client has expected models
        expected_models = ['organization', 'profile', 'inventoryitem', 'order', 'sale']
        found_models = []
        
        for model in expected_models:
            if hasattr(db, model):
                found_models.append(model)
        
        if len(found_models) == len(expected_models):
            print_success(f"All {len(expected_models)} expected models are available")
        else:
            print_warning(f"Found {len(found_models)}/{len(expected_models)} expected models")
            missing = set(expected_models) - set(found_models)
            if missing:
                print_info(f"Missing models: {', '.join(missing)}")
        
        return True
        
    except ImportError as e:
        print_error("Prisma client not generated")
        print_info("Run: make db-generate")
        return False
    except Exception as e:
        print_error(f"Prisma client verification failed: {e}")
        return False


async def main():
    """Run all verification checks."""
    print(f"\n{BLUE}╔{'═'*58}╗{RESET}")
    print(f"{BLUE}║{' '*58}║{RESET}")
    print(f"{BLUE}║{'Supabase Setup Verification':^58}║{RESET}")
    print(f"{BLUE}║{' '*58}║{RESET}")
    print(f"{BLUE}╚{'═'*58}╝{RESET}")
    
    results = {}
    
    # Run all checks
    results['env'] = await verify_environment_variables()
    results['prisma'] = await verify_prisma_client()
    results['database'] = await verify_database_connection()
    results['auth'] = await verify_supabase_auth()
    results['schema'] = await verify_database_schema()
    
    # Summary
    print_header("Summary")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for check, result in results.items():
        status = f"{GREEN}PASS{RESET}" if result else f"{RED}FAIL{RESET}"
        print(f"  {check.upper():20} {status}")
    
    print(f"\n{BLUE}{'─'*60}{RESET}")
    
    if passed == total:
        print(f"\n{GREEN}✓ All checks passed! ({passed}/{total}){RESET}")
        print(f"\n{GREEN}Your Supabase setup is ready to go! 🚀{RESET}\n")
        return 0
    else:
        print(f"\n{YELLOW}⚠ {passed}/{total} checks passed{RESET}")
        print(f"\n{YELLOW}Please fix the issues above before proceeding.{RESET}\n")
        
        # Provide helpful next steps
        if not results['env']:
            print_info("Fix: Edit apps/backend/.env with your Supabase credentials")
        if not results['prisma']:
            print_info("Fix: Run 'make db-generate' to generate Prisma client")
        if not results['database']:
            print_info("Fix: Check your DATABASE_URL and DIRECT_URL in .env")
        if not results['schema']:
            print_info("Fix: Run 'make db-migrate' to apply database migrations")
        if not results['auth']:
            print_info("Fix: Check your SUPABASE_SERVICE_ROLE_KEY in .env")
        
        print()
        return 1


if __name__ == '__main__':
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
