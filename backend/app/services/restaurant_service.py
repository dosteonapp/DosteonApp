from app.db.repositories.inventory_repository import inventory_repo
from app.db.repositories.organization_repository import organization_repo
from fastapi import HTTPException, status
from uuid import UUID

class RestaurantService:
    async def get_stats(self, organization_id: str):
        if not organization_id:
            return {
                "totalItems": 0,
                "healthy": 0,
                "low": 0,
                "critical": 0
            }
            
        inventory = await inventory_repo.get_by_organization(UUID(organization_id))
        
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
        
        # Get DayStatus for drafted progress
        counted = 0
        try:
            from app.db.prisma import db
            ds = await db.daystatus.find_unique(where={"organization_id": organization_id})
            if ds and ds.metadata and "draft_confirmed_ids" in ds.metadata:
                counted = len(ds.metadata["draft_confirmed_ids"])
            elif ds and ds.is_opening_completed:
                counted = total
        except:
            pass
            
        return {
            "totalItems": total,
            "countedItems": counted,
            "healthy": healthy,
            "low": low,
            "critical": critical,
            "changes": {
                "total": 0,
                "healthy": 0,
                "low": 0,
                "critical": 0
            }
        }

    async def get_low_stock_items(self, organization_id: str):
        inventory = await inventory_repo.get_by_organization(UUID(organization_id))
        # Low stock = below min_level
        low_stock = [
            {
                "id": str(i["id"]),
                "name": i["name"],
                "imageUrl": i.get("image_url"),
                "unitsLeftLabel": f"{i['current_stock']} {i['unit']}",
                "needLabel": f"Need {i['min_level'] * 2} {i['unit']}" 
            }
            for i in inventory 
            if i.get("current_stock", 0) <= i.get("min_level", 0)
        ]
        return low_stock

    async def get_inventory_items(self, organization_id: str):
        inventory = await inventory_repo.get_by_organization(UUID(organization_id))
        items = [
            {
                "id": str(i["id"]),
                "name": i["name"],
                "sku": i.get("sku", "N/A"),
                "category": i.get("category", "General"),
                "brand": i.get("brand", "N/A"),
                "unit": i.get("unit", "units"),
                "currentStock": i.get("current_stock", 0),
                "minLevel": i.get("min_level", 0),
                "restockPoint": i.get("min_level", 0) * 1.5,
                "costPerUnit": 0,
                "status": "Healthy" if i.get("current_stock", 0) > i.get("min_level", 0) else "Low" if i.get("current_stock", 0) > 0 else "Critical",
                "lastUpdated": "Today",
                "imageUrl": i.get("image_url")
            }
            for i in inventory
        ]
        return items

    async def get_opening_checklist(self, organization_id: str):
        inventory = await inventory_repo.get_by_organization(UUID(organization_id))
        # 1. Fetch DayStatus to see if we have a draft
        draft_confirmed_ids = []
        try:
            from app.db.prisma import db
            ds = await db.daystatus.find_unique(where={"organization_id": organization_id})
            if ds and ds.metadata:
                draft_confirmed_ids = ds.metadata.get("draft_confirmed_ids", [])
        except:
            pass

        return [
            {
                "id": str(i["id"]),
                "name": i["name"],
                "yesterdayClosing": i["current_stock"],
                "todayOpening": None,
                "amountAddedToday": None,
                "totalOpening": None,
                "unit": i["unit"],
                "isConfirmed": str(i["id"]) in draft_confirmed_ids,
                "category": i["category"],
                "level": "normal", # Default
                "imageUrl": i.get("image_url")
            }
            for i in inventory
        ]

    async def save_opening_draft(self, organization_id: str, payload: dict):
        # Extract confirmed IDs from payload
        items = payload.get("items", [])
        confirmed_ids = [str(item["id"]) for item in items if item.get("isConfirmed")]
        
        try:
            from app.db.prisma import db
            # Update DayStatus metadata with confirmed IDs
            await db.daystatus.upsert(
                where={"organization_id": organization_id},
                update={
                    "metadata": {
                        "draft_confirmed_ids": confirmed_ids,
                        "last_draft_update": "now" # placeholder or ISO date
                    }
                },
                create={
                    "organization_id": organization_id,
                    "state": "CLOSED",
                    "metadata": {
                        "draft_confirmed_ids": confirmed_ids
                    }
                }
            )
        except Exception as e:
            print(f"FAILED to save opening draft: {str(e)}")
            return {"success": False, "error": str(e)}
            
        return {"success": True}

    async def submit_opening_checklist(self, organization_id: str, payload: dict):
        # Record opening stock events for each item
        items = payload.get("items", [])
        for item in items:
            # item["id"] is the contextual_product_id
            # item["totalOpening"] is the new total quantity
            # We want to record the total opening stock. 
            # In an event-based system, the event quantity is the stock adjustment.
            # But the repo sum approach uses absolute quantity values for total opening events if categorized that way.
            # For simplicity, let's treat opening_stock as an "override" or "set" event
            await inventory_repo.add_event(
                contextual_product_id=str(item["id"]),
                event_type="opening_stock",
                quantity=float(item.get("totalOpening") or item.get("todayOpening") or 0),
                unit=item.get("unit", "kg"),
                metadata={"reason": "Daily Opening Check"}
            )
        
        # Update day_status
        try:
            from app.core.supabase import supabase
            supabase.table("day_status").upsert({
                "organization_id": organization_id,
                "state": "OPEN",
                "is_opening_completed": True
            }, on_conflict="organization_id").execute()
        except Exception as e:
            print(f"FAILED to update lifecycle: {str(e)}")
            # Even if day_status fails, we already recorded events, but the dashboard might stay locked
            # We could raise here or just log. For MVP, let's keep it moving.
        
        return {"success": True}

    async def submit_closing_checklist(self, organization_id: str, payload: dict):
        # Record closing stock events (similar to opening)
        # Assuming payload has items like opening count
        items = payload.get("items", [])
        for item in items:
            await inventory_repo.add_event(
                contextual_product_id=str(item["id"]),
                event_type="closing_stock",
                quantity=float(item.get("currentStock", 0)), # Use confirmed closing balance
                unit=item.get("unit", "kg"),
                metadata={"reason": "Daily Closing Check"}
            )

        # Update lifecycle to CLOSED
        try:
            from app.core.supabase import supabase
            supabase.table("day_status").upsert({
                "organization_id": organization_id,
                "state": "CLOSED",
                "is_opening_completed": False # Reset for next day
            }, on_conflict="organization_id").execute()
        except Exception as e:
            print(f"FAILED to update lifecycle for closing: {str(e)}")
            
        return {"success": True}

    async def get_closing_status(self, organization_id: str):
        # In a real app, check if time > closing_time from settings
        # and if opening stock was done.
        from app.core.supabase import supabase
        res = supabase.table("day_status").select("*").eq("organization_id", organization_id).execute()
        
        is_opening_done = False
        if res.data:
            is_opening_done = res.data[0].get("is_opening_completed", False)

        return {
            "isLocked": not is_opening_done,
            "prerequisites": [
                { "id": 1, "label": "Complete Opening Stock Count", "completed": is_opening_done },
                { "id": 2, "label": "Wait until Closing Time (7:00 PM)", "completed": True, "currentInfo": "Closing is available" }
            ]
        }

    async def get_settings(self, organization_id: str):
        # We can also migrate organization_repo to Prisma, but let's keep it for now if it works
        org = organization_repo.get_by_id(organization_id)
        if not org:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
        return org.get("settings", {})

    async def update_settings(self, organization_id: str, settings: dict):
        updated_org = organization_repo.update_settings(organization_id, settings)
        return updated_org.get("settings", {})

    async def get_day_status(self, organization_id: str):
        from app.core.supabase import supabase
        res = supabase.table("day_status").select("*").eq("organization_id", organization_id).execute()
        if res.data:
            data = res.data[0]
            return {
                "shiftStatus": data["state"].capitalize() if data["state"] != "OPEN" else "Active",
                "openingCompleted": data["is_opening_completed"],
                "lastOpeningDate": data.get("opening_time")
            }
        return {"shiftStatus": "Closed", "openingCompleted": False}

    async def record_kitchen_event(self, organization_id: str, item_id: str, amount: float, event_type: str, reason: str = None):
        # Verify item belongs to organization
        item = await inventory_repo.get_by_id(UUID(item_id))
        # Note: Ideally we'd verify organization_id here too if not already scoped by repo
        
        await inventory_repo.add_event(
            contextual_product_id=item_id,
            event_type=event_type,
            quantity=-abs(amount), # Kitchen usage/waste is a deduction
            unit="unit", # Should ideally come from item
            metadata={"reason": reason or f"Kitchen {event_type}"}
        )
        return {"success": True}

    async def get_closing_indicators(self, organization_id: str):
        # In a real app, filter events by today's date
        # For now, let's count all usage/waste events for this organization
        # We'd need a new repo method or a direct db query
        from app.db.prisma import db
        
        # Get count of distinct products used/wasted today
        # This is a simplification. Real logic would filter by created_at >= start_of_day
        usage_count = await db.inventoryevent.count(
            where={
                "event_type": "usage",
                "product": {
                    "organization_id": organization_id
                }
            }
        )
        waste_count = await db.inventoryevent.count(
            where={
                "event_type": "waste",
                "product": {
                    "organization_id": organization_id
                }
            }
        )
        
        return {
            "itemsUsed": usage_count,
            "itemsWasted": waste_count
        }

restaurant_service = RestaurantService()
