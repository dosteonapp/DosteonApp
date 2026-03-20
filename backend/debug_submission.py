import asyncio
import os
import sys
from uuid import UUID

# Add parent directory to sys.path to allow imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.prisma import connect_db, db
from app.services.restaurant_service import RestaurantService

async def debug_submission():
    print("Starting DayStatus Submission Debug...")
    await connect_db()
    
    restaurant_service = RestaurantService()
    
    # Use the existing organization
    org = await db.organization.find_first()
    if not org:
        print("No organization found.")
        return
    
    org_id = str(org.id)
    print(f"Using organization: {org_id}")
    
    # 1. Get contextual products to have valid IDs
    products = await db.contextualproduct.find_many(where={"organization_id": org_id}, take=2)
    if not products:
        print("No products found for this organization.")
        return
    
    counts = {str(p.id): 10.0 for p in products}
    print(f"Submitting counts for {len(counts)} items...")
    
    try:
        res = await restaurant_service.submit_opening_checklist(org_id, {"counts": counts})
        print(f"SUCCESS! Submission result: {res}")
    except Exception as e:
        print(f"FAILURE! Error: {e}")
        import traceback
        traceback.print_exc()

    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(debug_submission())
