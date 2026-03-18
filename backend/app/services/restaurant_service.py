from app.db.repositories.inventory_repository import inventory_repo
from app.db.repositories.organization_repository import organization_repo
from fastapi import HTTPException, status
from uuid import UUID
from datetime import datetime

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
        if not organization_id: return []
        inventory = await inventory_repo.get_by_organization(UUID(organization_id))
        
        # Filter for items where current stock is below threshold
        low_stock = [
            {
                "id": str(i["id"]),
                "name": i["name"],
                "imageUrl": i.get("imageUrl"),
                "unitsLeftLabel": f"{i['current_stock']} {i['unit']} left",
                "needLabel": f"Need {i['min_level'] * 2} {i['unit']}"
            }
            for i in inventory 
            if i.get("current_stock", 0) <= i.get("min_level", 1)
        ]
        return low_stock

    async def get_inventory_items(self, organization_id: str):
        if not organization_id:
            raise HTTPException(status_code=403, detail="User is not linked to any organization")
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

    async def get_inventory_item_by_id(self, item_id: str):
        item = await inventory_repo.get_by_id(UUID(item_id))
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
        
        # Transform for frontend compatibility (matches InventoryItem interface)
        return {
            "id": str(item["id"]),
            "name": item["name"],
            "sku": item.get("sku", "N/A"),
            "category": item.get("category", "General"),
            "brand": item.get("brand", "N/A"),
            "unit": item.get("unit", "units"),
            "currentStock": item.get("current_stock", 0),
            "minLevel": item.get("min_level", 0),
            "restockPoint": item.get("min_level", 0) * 1.5,
            "costPerUnit": 0,
            "status": item["status"],
            "imageUrl": item.get("image_url")
        }

    async def get_item_activities(self, item_id: str):
        # Placeholder activities based on real events in the future
        # For now, just return a mock list that looks somewhat real
        return [
            {
                "id": "mock-act-1",
                "action": "Updated",
                "change": "-",
                "performer": "Procurement Officer",
                "activity": "Inventory Initialization",
                "timestamp": "Oct 06, 2025; 14:32"
            }
        ]

    async def create_inventory_item(self, organization_id: str, payload: dict):
        name = payload.get("name")
        category = payload.get("category", "General")
        stock = float(payload.get("currentStock") or 0)
        unit = payload.get("unit", "units")
        location = payload.get("location", "Main Storage")
        
        if not name:
             raise HTTPException(status_code=400, detail="Item name is required")
             
        # 1. Ensure canonical product exists
        canonical_id = await inventory_repo.ensure_canonical(name, category)
        
        # 2. Create the contextual product for this restaurant
        # In a real app, you'd handle images and expiry as well
        item = await inventory_repo.create_contextual_product(
            organization_id=organization_id,
            canonical_product_id=canonical_id,
            name=name,
            current_stock=stock,
            pack_unit=unit,
            storage_type=location,
            status="Healthy" if stock > 0 else "Critical"
        )
        
        return {"success": True, "item": item}

    async def update_inventory_item(self, organization_id: str, item_id: str, payload: dict):
        # 1. Map frontend fields to DB fields if needed
        data = {}
        if "name" in payload: data["name"] = payload["name"]
        if "currentStock" in payload: data["current_stock"] = float(payload["currentStock"])
        if "unit" in payload: data["pack_unit"] = payload["unit"]
        if "location" in payload: data["storage_type"] = payload["location"]
        
        # 2. Update
        try:
            await inventory_repo.update_contextual_product(UUID(item_id), data)
            return {"success": True}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def get_recent_activities(self, organization_id: str):
        if not organization_id: return []
        events = await inventory_repo.get_recent_events(organization_id, limit=5)
        activities = []
        for e in events:
            # Simple title mapping
            title = "Inventory Update"
            if e.event_type == "USED": title = "Stock Log: Usage"
            elif e.event_type == "WASTED": title = "Stock Log: Waste"
            elif e.event_type == "ADJUSTMENT": title = "Manual stock update"
            elif e.event_type == "OPENING": title = "Opening Stock"
            
            p_name = e.product.name if e.product else "Unknown Item"
            unit = e.product.pack_unit if e.product else ""
            
            activities.append({
                "id": str(e.id),
                "title": title,
                "description": f"{abs(e.quantity)} {unit} of {p_name} {e.metadata.get('reason') if e.metadata else ''}",
                "time": e.created_at.strftime("%b %d, %H:%M"),
                "type": str(e.event_type)
            })
        return activities

    async def get_notifications(self, organization_id: str):
        if not organization_id: return []
        low_stock = await inventory_repo.get_low_stock(UUID(organization_id))
        notifications = []
        for i, item in enumerate(low_stock):
            notifications.append({
                "id": f"ntf-low-{i}",
                "type": "alert",
                "title": "Critical Stock Level",
                "description": f"Item '{item['name']}' has reached critical stock level ({item['currentStock']} {item['unit']} remaining).",
                "time": "Just now",
                "unread": True
            })
            
        # Add a success notification if stock was checked today
        notifications.append({
            "id": "ntf-stock-checked",
            "type": "success",
            "title": "Daily Stock Confirmed",
            "description": "Daily stock count has been successfully confirmed for all items.",
            "time": "2 hours ago",
            "unread": False
        })
        
        return notifications

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
        items = payload.get("items", [])
        for item in items:
            try:
                item_id = str(item["id"])
                # Safe UUID check
                UUID(item_id)
                p = await inventory_repo.get_by_id(UUID(item_id))
                if not p: continue
                
                new_total = float(item.get("totalOpening") or item.get("todayOpening") or 0)
                diff = new_total - p.get("current_stock", 0)
                
                await inventory_repo.add_event(
                    contextual_product_id=item_id,
                    event_type="OPENING",
                    quantity=diff,
                    unit=item.get("unit", "kg"),
                    metadata={"reason": "Daily Opening Check"}
                )
            except:
                continue
        
        # Sync with DayStatus (Lifecycle)
        try:
            from app.db.prisma import db
            # Update daystatus
            await db.daystatus.upsert(
                where={"organization_id": organization_id},
                update={"state": "OPEN", "is_opening_completed": True, "opened_at": datetime.now()},
                create={"organization_id": organization_id, "state": "OPEN", "is_opening_completed": True, "opened_at": datetime.now()}
            )
        except:
            pass
            
        return {"success": True}

    async def submit_closing_checklist(self, organization_id: str, payload: dict):
        items = payload.get("items", [])
        for item in items:
            try:
                item_id = str(item["id"])
                UUID(item_id)
                p = await inventory_repo.get_by_id(UUID(item_id))
                if not p: continue
                
                new_total = float(item.get("currentStock", 0))
                diff = new_total - p.get("current_stock", 0)

                await inventory_repo.add_event(
                    contextual_product_id=item_id,
                    event_type="CLOSING_CORRECTION",
                    quantity=diff,
                    unit=item.get("unit", "kg"),
                    metadata={"reason": "Daily Closing Check"}
                )
            except:
                continue
        return {"success": True}

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
            
        settings = org.get("settings") or {}
        # Ensure name is included in the settings returned to frontend
        settings["name"] = org.get("name")
        return settings

    async def update_settings(self, organization_id: str, settings: dict):
        # If name is provided, update it on the organization level too
        new_name = settings.get("name")
        if new_name:
            organization_repo.update_name(organization_id, new_name)
            
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

    async def update_item_stock(self, organization_id: str, item_id: str, new_quantity: float):
        # 1. Get current stock to calculate difference
        item = await inventory_repo.get_by_id(UUID(item_id))
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
            
        current = item.get("current_stock", 0)
        diff = new_quantity - current
        
        # 2. Add as a manual adjustment event
        await inventory_repo.add_event(
            contextual_product_id=item_id,
            event_type="ADJUSTMENT",
            quantity=diff,
            unit=item.get("unit", "unit"),
            metadata={"reason": "Manual stock override"}
        )
        return {"success": True, "newQuantity": new_quantity}

    async def record_kitchen_event(self, organization_id: str, item_id: str, amount: float, event_type: str, reason: str = None):
        # 1. Verify item exists
        item = await inventory_repo.get_by_id(UUID(item_id))
        if not item:
            raise HTTPException(status_code=404, detail="Inventory item not found")
        
        # 2. Record the deduction event
        # Usage and waste are negative adjustments to stock
        quantity_to_deduct = -abs(amount)
        
        # Map frontend 'usage/waste' to Enum
        db_event_type = "USED" if event_type == "usage" else "WASTED"
        
        await inventory_repo.add_event(
            contextual_product_id=item_id,
            event_type=db_event_type,
            quantity=quantity_to_deduct,
            unit=item.get("unit", "unit"),
            metadata={"reason": reason or f"Kitchen {event_type}"}
        )
        return {"success": True}

    async def get_closing_indicators(self, organization_id: str):
        from app.db.prisma import db
        from datetime import datetime, time
        
        # Get start of today (local or UTC depends on DB config, let's assume Timestamptz handled by Prisma)
        today_start = datetime.combine(datetime.now().date(), time.min)
        
        # Count items with events recorded today
        usage_count = await db.inventoryevent.count(
            where={
                "event_type": "USED",
                "created_at": {"gte": today_start},
                "product": {
                    "is": {
                        "organization_id": organization_id
                    }
                }
            }
        )
        waste_count = await db.inventoryevent.count(
            where={
                "event_type": "WASTED",
                "created_at": {"gte": today_start},
                "product": {
                    "is": {
                        "organization_id": organization_id
                    }
                }
            }
        )
        
        return {
            "itemsUsed": usage_count,
            "itemsWasted": waste_count
        }

restaurant_service = RestaurantService()
