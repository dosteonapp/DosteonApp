import asyncio
import os
import sys
import uuid
from datetime import datetime

# Add parent directory to sys.path to allow imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.prisma import connect_db, db
from app.services.restaurant_service import restaurant_service

async def debug_status():
    print("Starting DayStatus Debug...")
    try:
        await connect_db()
        print("Connected to DB.")
        
        # We need a sample organization ID. 
        # I'll try to find one from the organization table first.
        orgs = await db.organization.find_many(take=1)
        if not orgs:
            print("No organizations found to test with.")
            # Let's create a temporary one if needed, but for now we'll just try a random UUID
            org_id = str(uuid.uuid4())
            print(f"Using random UUID: {org_id}")
        else:
            org_id = orgs[0].id
            print(f"Using existing organization: {org_id}")
            
        print(f"Calling get_day_status with {org_id}...")
        status = await restaurant_service.get_day_status(org_id)
        print("SUCCESS! Status returned:")
        print(status)
        
    except Exception as e:
        print("FAILURE! Error details:")
        import traceback
        traceback.print_exc()
    finally:
        if db.is_connected():
            await db.disconnect()

if __name__ == "__main__":
    asyncio.run(debug_status())
