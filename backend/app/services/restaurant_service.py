from app.db.repositories.inventory_repository import inventory_repo
from fastapi import HTTPException, status
from uuid import UUID
from datetime import datetime
import json


class RestaurantService:
    async def get_stats(self, organization_id: str):
        if not organization_id:
            return {"totalItems": 0, "healthy": 0, "low": 0, "critical": 0}

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
            "changes": {"total": 0, "healthy": 0, "low": 0, "critical": 0}
        }

    async def get_low_stock_items(self, organization_id: str):
        if not organization_id:
            return []
        inventory = await inventory_repo.get_by_organization(UUID(organization_id))
        return [
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

    async def get_inventory_items(self, organization_id: str):
        if not organization_id:
            raise HTTPException(status_code=403, detail="User is not linked to any organization")
        inventory = await inventory_repo.get_by_organization(UUID(organization_id))
        return [
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

    async def get_inventory_item_by_id(self, item_id: str):
        item = await inventory_repo.get_by_id(UUID(item_id))
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
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
            "avgPrice": 0,
            "status": item["status"],
            "imageUrl": item.get("image_url")
        }

    async def get_item_activities(self, item_id: str):
        from app.db.prisma import db
        events = await db.inventoryevent.find_many(
            where={"contextual_product_id": item_id},
            include={"product": True},
            order={"created_at": "desc"},
            take=30
        )
        return [self._map_inventory_event(e) for e in events]

    async def create_inventory_item(self, organization_id: str, payload: dict):
        name = payload.get("name")
        category = payload.get("category", "General")
        stock = float(payload.get("currentStock") or 0)
        unit = payload.get("unit", "units")
        location = payload.get("location", "Main Storage")
        image_url = payload.get("imageUrl")

        if not name:
            raise HTTPException(status_code=400, detail="Item name is required")

        canonical_id = await inventory_repo.ensure_canonical(name, category)
        item = await inventory_repo.create_contextual_product(
            organization_id=organization_id,
            canonical_product_id=canonical_id,
            name=name,
            current_stock=stock,
            pack_unit=unit,
            storage_type=location,
            image_url=image_url,
            status="Healthy" if stock > 0 else "Critical"
        )
        return {"success": True, "item": item}

    async def update_inventory_item(self, organization_id: str, item_id: str, payload: dict):
        data = {}
        if "name" in payload: data["name"] = payload["name"]
        if "currentStock" in payload: data["current_stock"] = float(payload["currentStock"])
        if "unit" in payload: data["pack_unit"] = payload["unit"]
        if "location" in payload: data["storage_type"] = payload["location"]
        if "imageUrl" in payload: data["image_url"] = payload["imageUrl"]

        try:
            await inventory_repo.update_contextual_product(UUID(item_id), data)
            return {"success": True}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def update_item_stock(self, organization_id: str, item_id: str, new_quantity: float):
        try:
            await inventory_repo.update_contextual_product(
                UUID(item_id),
                {"current_stock": new_quantity}
            )
            return {"success": True}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    def _map_inventory_event(self, e):
        action = "Updated"
        if e.event_type == "OPENING": action = "Received"
        elif e.event_type == "USED": action = "Removed"
        elif e.event_type == "WASTED": action = "Removed"
        elif e.event_type == "ADJUSTMENT": action = "Updated"

        performer = "System Agent"
        if e.event_type in ["OPENING", "ADJUSTMENT"]:
            performer = "Procurement Officer"
        elif e.event_type in ["USED", "WASTED"]:
            performer = "Kitchen Staff"

        p_name = "Unknown Item"
        unit = ""
        try:
            if hasattr(e, 'product') and e.product:
                p_name = e.product.name or "Unknown Item"
                unit = e.product.pack_unit or ""
        except:
            pass

        q = int(e.quantity) if e.quantity == int(e.quantity) else e.quantity
        change = f"{'+' if q > 0 else ''}{q} {unit or ''}"
        reason = e.metadata.get("reason", "Inventory Update") if e.metadata else "Inventory Update"
        timestamp = e.created_at.strftime("%b %d, %Y; %H:%M") if e.created_at else ""

        return {
            "id": str(e.id),
            "action": action,
            "change": change,
            "performer": performer,
            "activity": f"{p_name}: {reason}",
            "title": f"{action}: {p_name}",
            "description": f"{p_name} updated by {q} {unit}",
            "time": timestamp,
            "timestamp": timestamp
        }

    async def get_recent_activities(self, organization_id: str):
        if not organization_id:
            return []
        events = await inventory_repo.get_recent_events(organization_id, limit=5)
        return [self._map_inventory_event(e) for e in events]

    async def get_opening_checklist(self, organization_id: str):
        if not organization_id:
            return []
        inventory = await inventory_repo.get_by_organization(UUID(organization_id))
        return [
            {
                "id": str(i["id"]),
                "name": i["name"],
                "unit": i.get("unit", "units"),
                "lastCount": i.get("current_stock", 0),
                "category": i.get("category", "General"),
            }
            for i in inventory
        ]

    async def save_opening_draft(self, organization_id: str, payload: dict):
        try:
            from app.db.prisma import db
            confirmed_ids = payload.get("confirmedIds", [])
            counts = payload.get("counts", {})
            await db.daystatus.update(
                where={"organization_id": organization_id},
                data={
                    "metadata": json.dumps({
                        "draft_confirmed_ids": confirmed_ids,
                        "draft_counts": counts
                    })
                }
            )
            return {"success": True}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def submit_opening_checklist(self, organization_id: str, payload: dict):
        try:
            from app.db.prisma import db
            counts = payload.get("counts", {})

            for item_id, quantity in counts.items():
                await inventory_repo.update_contextual_product(
                    UUID(item_id),
                    {"current_stock": float(quantity)}
                )
                await inventory_repo.add_event(
                    contextual_product_id=item_id,
                    event_type="OPENING",
                    quantity=float(quantity),
                    unit="units",
                    metadata={"reason": "Opening stock count"}
                )

            await db.daystatus.update(
                where={"organization_id": organization_id},
                data={
                    "is_opening_completed": True,
                    "state": "OPEN",
                    "opened_at": datetime.utcnow(),
                    "metadata": json.dumps({})
                }
            )
            return {"success": True}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def get_day_status(self, organization_id: str):
        from app.db.prisma import db
        ds = await db.daystatus.find_unique(where={"organization_id": organization_id})
        if not ds:
            raise HTTPException(status_code=404, detail="Day status not found")
        return {
            "state": ds.state,
            "business_date": str(ds.business_date),
            "is_opening_completed": ds.is_opening_completed,
            "opened_at": str(ds.opened_at) if ds.opened_at else None,
            "closed_at": str(ds.closed_at) if ds.closed_at else None,
        }

    async def get_settings(self, organization_id: str):
        from app.db.prisma import db
        import json

        if not organization_id:
            return {"name": "Restaurant", "opening_time": "08:00", "closing_time": "22:00"}

        org = await db.organization.find_unique(where={"id": organization_id})
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")

        settings = org.settings or {}
        if isinstance(settings, str):
            settings = json.loads(settings)

        return {
            "name": org.name,
            "opening_time": settings.get("opening_time", "08:00"),
            "closing_time": settings.get("closing_time", "22:00"),
        }

    async def update_settings(self, organization_id: str, settings: dict):
        from app.db.prisma import db
        import json

        org = await db.organization.update(
            where={"id": organization_id},
            data={"settings": json.dumps(settings)}
        )
        return {
            "name": org.name,
            "opening_time": settings.get("opening_time", "08:00"),
            "closing_time": settings.get("closing_time", "00:00"),
        }

    async def get_notifications(self, organization_id: str):
        if not organization_id:
            return []
        inventory = await inventory_repo.get_by_organization(UUID(organization_id))
        notifications = []
        for item in inventory:
            stock = item.get("current_stock", 0)
            min_lvl = item.get("min_level", 0)
            if stock <= 0:
                notifications.append({
                    "id": str(item["id"]),
                    "type": "critical",
                    "message": f"{item['name']} is out of stock",
                })
            elif stock <= min_lvl:
                notifications.append({
                    "id": str(item["id"]),
                    "type": "warning",
                    "message": f"{item['name']} is running low ({stock} {item.get('unit', 'units')} left)",
                })
        return notifications

    async def get_closing_status(self, organization_id: str):
        from app.db.prisma import db
        ds = await db.daystatus.find_unique(where={"organization_id": organization_id})
        return {
            "can_close": ds.is_opening_completed if ds else False,
            "state": ds.state if ds else "CLOSED",
        }

    async def get_closing_indicators(self, organization_id: str):
        events = await inventory_repo.get_recent_events(organization_id, limit=100)
        used = sum(1 for e in events if e.event_type == "USED")
        wasted = sum(1 for e in events if e.event_type == "WASTED")
        return {"used": used, "wasted": wasted}

    async def record_kitchen_event(self, organization_id: str, item_id: str, amount: float, event_type: str, reason: str = None):
        mapped_type = "USED" if event_type == "usage" else "WASTED"
        await inventory_repo.add_event(
            contextual_product_id=item_id,
            event_type=mapped_type,
            quantity=-abs(amount),
            unit="units",
            metadata={"reason": reason} if reason else {}
        )
        return {"success": True}


restaurant_service = RestaurantService()




