from app.repositories.inventory_repository import inventory_repo
from app.repositories.organization_repository import organization_repo
from fastapi import HTTPException, status

class RestaurantService:
    async def get_stats(self, organization_id: str):
        if not organization_id:
            return {
                "totalItems": 0,
                "healthy": 0,
                "low": 0,
                "critical": 0
            }
            
        inventory = inventory_repo.get_by_organization(organization_id)
        
        total = len(inventory)
        low = 0
        critical = 0
        healthy = 0
        
        for item in inventory:
            stock = item.get("current_stock", 0)
            min_lvl = item.get("min_level", 0)
            
            if stock <= 0:
                critical += 1
            elif stock <= min_lvl:
                low += 1
            else:
                healthy += 1
        
        return {
            "totalItems": total,
            "healthy": healthy,
            "low": low,
            "critical": critical
        }

    async def get_low_stock_items(self, organization_id: str):
        inventory = inventory_repo.get_by_organization(organization_id)
        # Low stock = below min_level
        low_stock = [
            {
                "id": str(i["id"]),
                "name": i["name"],
                "imageUrl": i.get("image_url"),
                "unitsLeftLabel": f"{i['current_stock']} {i['unit']}",
                "needLabel": f"Need {i['min_level'] * 2} {i['unit']}" # Placeholder logic for 'Need'
            }
            for i in inventory 
            if i.get("current_stock", 0) <= i.get("min_level", 0)
        ]
        return low_stock

    async def get_settings(self, organization_id: str):
        org = organization_repo.get_by_id(organization_id)
        if not org:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
        return org.get("settings", {})

    async def update_settings(self, organization_id: str, settings: dict):
        updated_org = organization_repo.update_settings(organization_id, settings)
        return updated_org.get("settings", {})

    async def get_day_status(self, organization_id: str):
        # Fetch from day_status table
        from app.core.supabase import supabase
        res = supabase.table("day_status").select("*").eq("organization_id", organization_id).single().execute()
        if res.data:
            return {
                "shiftStatus": res.data["state"].capitalize() if res.data["state"] != "OPEN" else "Active",
                "openingCompleted": res.data["is_opening_completed"],
                "lastOpeningDate": res.data["opening_time"]
            }
        return {"shiftStatus": "Closed", "openingCompleted": False}

restaurant_service = RestaurantService()
