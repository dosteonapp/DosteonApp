from app.db.repositories.inventory_repository import inventory_repo
from fastapi import HTTPException, status
from uuid import UUID
from datetime import datetime
import json
import traceback
from prisma import Json


class RestaurantService:
    async def get_stats(self, organization_id: str, brand_id: str | None = None):
        if not organization_id:
            return {"totalItems": 0, "countedItems": 0, "healthy": 0, "low": 0, "critical": 0, "changes": {"total": 0, "healthy": 0, "low": 0, "critical": 0}}

        try:
            UUID(str(organization_id))
        except:
            return {"totalItems": 0, "countedItems": 0, "healthy": 0, "low": 0, "critical": 0, "changes": {"total": 0, "healthy": 0, "low": 0, "critical": 0}}

        inventory = await inventory_repo.get_by_organization(UUID(organization_id), brand_id=brand_id)
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
                "lastUpdated": i.get("updated_at").isoformat() if i.get("updated_at") else None,
                "imageUrl": i.get("image_url")
            }
            for i in inventory
        ]

    async def get_inventory_item_by_id(self, organization_id: str, item_id: str):
        item = await inventory_repo.get_by_id(UUID(item_id))
        if not item or str(item.get("organization_id")) != str(organization_id):
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

    async def get_item_activities(self, organization_id: str, item_id: str):
        # Ensure the item belongs to the caller's organization before exposing history
        item = await inventory_repo.get_by_id(UUID(item_id))
        if not item or str(item.get("organization_id")) != str(organization_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
        from app.db.prisma import db
        events = await db.inventoryevent.find_many(
            where={"contextual_product_id": item_id},
            include={"product": True},
            order={"created_at": "desc"},
            take=30
        )
        return [self._map_inventory_event(e) for e in events]

    async def create_inventory_item(self, organization_id: str, payload: dict):
        await self._require_unlocked(organization_id)
        name = payload.get("name")
        category = payload.get("category", "General")
        stock = float(payload.get("currentStock") or 0)
        unit = payload.get("unit", "units")
        location = payload.get("location", "Main Storage")
        image_url = payload.get("imageUrl")
        canonical_id = payload.get("canonicalId")

        if not name:
            raise HTTPException(status_code=400, detail="Item name is required")

        # Prefer linking to an existing canonical product when provided; otherwise ensure one exists.
        # When the user creates a brand-new product (no canonical_id), flag it for admin review
        # so it can be promoted to the global catalog if appropriate.
        is_user_created = not canonical_id
        if canonical_id:
            canonical_product_id = str(canonical_id)
        else:
            canonical_product_id = await inventory_repo.ensure_canonical(name, category)
        # Create contextual product with zero stock, then record opening stock via events
        item = await inventory_repo.create_contextual_product(
            organization_id=organization_id,
            canonical_product_id=canonical_product_id,
            name=name,
            current_stock=0.0,
            pack_unit=unit,
            storage_type=location,
            image_url=image_url,
            status="Healthy" if stock > 0 else "Critical",
            pending_canonical_review=is_user_created,
        )
        if stock > 0:
            await inventory_repo.add_event(
                contextual_product_id=str(item["id"]),
                organization_id=str(organization_id),
                event_type="OPENING_STOCK",
                quantity=stock,
                unit=unit,
                metadata={"reason": "Initial item setup"}
            )
        return {"success": True, "item": item}

    async def update_inventory_item(self, organization_id: str, item_id: str, payload: dict):
        await self._require_unlocked(organization_id)
        # Enforce that the contextual product belongs to the caller's organization
        existing = await inventory_repo.get_by_id(UUID(item_id))
        if not existing or str(existing.get("organization_id")) != str(organization_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

        data = {}
        if "name" in payload:
            data["name"] = payload["name"]
        if "unit" in payload:
            data["pack_unit"] = payload["unit"]
        if "location" in payload:
            data["storage_type"] = payload["location"]
        if "imageUrl" in payload:
            data["image_url"] = payload["imageUrl"]

        # If stock is being updated, record it as an ADJUSTMENT event instead of direct mutation
        if "currentStock" in payload:
            try:
                new_quantity = float(payload["currentStock"])
            except (TypeError, ValueError):
                raise HTTPException(status_code=400, detail="Invalid currentStock value")

            current_quantity = float(existing.get("current_stock") or 0)
            delta = new_quantity - current_quantity
            if delta != 0:
                unit_value = payload.get("unit") or existing.get("unit") or "units"
                await inventory_repo.add_event(
                    contextual_product_id=str(existing["id"]),
                    organization_id=str(organization_id),
                    event_type="ADJUSTED",
                    quantity=delta,
                    unit=unit_value,
                    metadata={"reason": "Manual stock adjustment via item update"}
                )

        try:
            await inventory_repo.update_contextual_product(UUID(item_id), data)
            return {"success": True}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def update_item_stock(self, organization_id: str, item_id: str, new_quantity: float):
        await self._require_unlocked(organization_id)
        # Enforce that the contextual product belongs to the caller's organization
        existing = await inventory_repo.get_by_id(UUID(item_id))
        if not existing or str(existing.get("organization_id")) != str(organization_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

        try:
            current_quantity = float(existing.get("current_stock") or 0)
            delta = float(new_quantity) - current_quantity
            if delta != 0:
                unit_value = existing.get("unit") or "units"
                await inventory_repo.add_event(
                    contextual_product_id=str(existing["id"]),
                    organization_id=str(organization_id),
                    event_type="ADJUSTED",
                    quantity=delta,
                    unit=unit_value,
                    metadata={"reason": "Manual stock override"}
                )
            return {"success": True}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    def _map_inventory_event(self, e):
        action = "Updated"
        if e.event_type == "OPENING_STOCK": action = "Received"
        elif e.event_type == "USED": action = "Removed"
        elif e.event_type == "WASTED": action = "Removed"
        elif e.event_type == "ADJUSTED": action = "Updated"

        performer = "System Agent"
        if e.event_type in ["OPENING_STOCK", "ADJUSTED"]:
            performer = "Procurement Officer"
        elif e.event_type in ["USED", "WASTED"]:
            performer = "Kitchen Staff"

        p_name = "Unknown Item"
        unit = ""
        try:
            if hasattr(e, 'product') and e.product:
                # Prefer contextual name, then canonical fallback
                if getattr(e.product, "name", None):
                    p_name = e.product.name
                elif hasattr(e.product, "canonical") and e.product.canonical and getattr(e.product.canonical, "name", None):
                    p_name = e.product.canonical.name

                # Ensure we always have a non-empty, human-friendly name
                if not p_name or p_name.strip() == "":
                    p_name = "Inventory Item"

                unit = getattr(e.product, "pack_unit", None) or ""
        except Exception:
            # Mapping errors must never break the activity feed
            p_name = "Inventory Item"

        q = int(e.quantity) if e.quantity == int(e.quantity) else e.quantity
        change = f"{'+' if q > 0 else ''}{q} {unit or ''}"
        reason = e.metadata.get("reason", "Inventory update") if e.metadata else "Inventory update"
        timestamp = e.created_at.strftime("%b %d, %Y; %H:%M") if e.created_at else ""

        # Friendlier, more specific copy for the dashboard feed
        activity_label = f"{p_name}: {reason}"
        description = f"{p_name} updated by {change}"

        if e.event_type == "OPENING_STOCK":
            activity_label = f"Opening stock recorded for {p_name}"
            description = f"Opening quantity set to {change.replace('+', '').strip()}"
        elif e.event_type == "USED":
            activity_label = f"Usage logged for {p_name}"
        elif e.event_type == "WASTED":
            activity_label = f"Waste logged for {p_name}"
        elif e.event_type == "ADJUSTED":
            activity_label = f"Manual adjustment for {p_name}"

        return {
            "id": str(e.id),
            "action": action,
            "change": change,
            "performer": performer,
            "activity": activity_label,
            "title": f"{action}: {p_name}",
            "description": description,
            "time": timestamp,
            "timestamp": timestamp,
        }

    async def get_recent_activities(self, organization_id: str, offset: int = 0, limit: int = 5, brand_id: str | None = None):
        if not organization_id:
            return []

        # Fetch more than requested to account for zero-quantity events that will be filtered out
        fetch_limit = max(limit * 3, limit + 10)
        events = await inventory_repo.get_recent_events(organization_id, limit=fetch_limit, brand_id=brand_id)

        # Filter out 0 quantity updates which are non-informative for recent view
        meaningful_events = [e for e in events if e.quantity != 0]
        window = meaningful_events[offset: offset + limit]
        return [self._map_inventory_event(e) for e in window]

    async def get_opening_checklist(self, organization_id: str):
        if not organization_id:
            return []
        inventory = await inventory_repo.get_by_organization(UUID(organization_id))

        # Query today's positive inventory events to compute amountAddedToday
        from app.db.prisma import db
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_events = await db.inventoryevent.find_many(
            where={
                "organization_id": str(organization_id),
                "created_at": {"gte": today_start},
                "quantity": {"gt": 0},
            }
        )

        # Sum positive quantities per product for today
        added_today: dict[str, float] = {}
        for event in today_events:
            pid = event.contextual_product_id
            added_today[pid] = added_today.get(pid, 0.0) + float(event.quantity)

        result = []
        for i in inventory:
            item_id = str(i["id"])
            today_opening = float(i.get("current_stock", 0))
            amount_added = round(added_today.get(item_id, 0.0), 3)
            result.append({
                "id": item_id,
                "name": i["name"],
                "unit": i.get("unit", "units"),
                "lastCount": today_opening,
                "category": i.get("category", "General"),
                "todayOpening": today_opening,
                "amountAddedToday": amount_added,
                "totalOpening": round(today_opening + amount_added, 3),
            })
        return result

    async def save_opening_draft(self, organization_id: str, payload: dict):
        try:
            if not organization_id:
                raise ValueError("No organization ID linked to user profile")

            org_id_str = str(organization_id)
            UUID(org_id_str)

            from app.db.prisma import db
            confirmed_ids = payload.get("confirmedIds", [])
            counts = payload.get("counts", {})

            await db.daystatus.upsert(
                where={"organization_id": org_id_str},
                data={
                    "create": {
                        "organization_id": org_id_str,
                        "state": "CLOSED",
                        "business_date": datetime.utcnow(),
                        "updated_at": datetime.utcnow(),
                        "metadata": Json({
                            "draft_confirmed_ids": confirmed_ids,
                            "draft_counts": counts
                        })
                    },
                    "update": {
                        "metadata": Json({
                            "draft_confirmed_ids": confirmed_ids,
                            "draft_counts": counts
                        })
                    }
                }
            )
            return {"success": True}
        except Exception as e:
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))

    async def save_closing_draft(self, organization_id: str, payload: dict):
        try:
            if not organization_id:
                raise ValueError("No organization ID linked to user profile")

            org_id_str = str(organization_id)
            UUID(org_id_str)

            from app.db.prisma import db
            confirmed_ids = payload.get("confirmedIds", [])

            ds = await db.daystatus.find_first(where={"organization_id": org_id_str})
            if ds:
                existing_meta = dict(ds.metadata) if ds.metadata else {}
                existing_meta["closing_draft_confirmed_ids"] = confirmed_ids
                await db.daystatus.update(
                    where={"organization_id": org_id_str},
                    data={"metadata": Json(existing_meta)}
                )
            return {"success": True}
        except Exception as e:
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))

    async def submit_opening_checklist(self, organization_id: str, payload: dict):
        # Enforce 6-hour gap between closing and next Opening Stock submission
        state = await self.get_system_state(organization_id)
        if not state["canStartOpening"]:
            raise HTTPException(
                status_code=403,
                detail=f"Opening Stock is not available yet. Available at: {state['openingAvailableAt']}",
            )
        try:
            from app.db.prisma import db
            counts = payload.get("counts", {})

            # 1. Update all items in a single high-speed transaction
            await inventory_repo.bulk_add_opening_events(organization_id, counts)

            org_id_str = str(organization_id)
            ds = await db.daystatus.find_first(where={"organization_id": org_id_str})

            if ds:
                await db.daystatus.update(
                    where={"organization_id": org_id_str},
                    data={
                        "is_opening_completed": True,
                        "state": "OPEN",
                        "opened_at": datetime.utcnow(),
                        "metadata": Json({})
                    }
                )
            else:
                await db.daystatus.create(
                    data={
                        "organization_id": org_id_str,
                        "is_opening_completed": True,
                        "state": "OPEN",
                        "opened_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow(),
                        "business_date": datetime.now().date(),
                        "metadata": Json({})
                    }
                )
            return {"success": True}
        except Exception as e:
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))

    OPENING_GAP_HOURS = 6  # Minimum hours between closing and next Opening Stock

    async def get_system_state(self, organization_id: str):
        """Single source of truth for system state.

        Returns:
          systemState       – "LOCKED" | "UNLOCKED"
          canStartOpening   – whether Opening Stock is available right now
          openingAvailableAt – ISO-8601 UTC datetime when it becomes available
                               (None if already available or no previous close)
        """
        from app.db.prisma import db
        from datetime import timedelta, timezone

        if not organization_id:
            return {"systemState": "LOCKED", "canStartOpening": True, "openingAvailableAt": None}

        try:
            ds = await db.daystatus.find_unique(where={"organization_id": str(organization_id)})

            if ds and str(ds.state) == "OPEN":
                return {"systemState": "UNLOCKED", "canStartOpening": False, "openingAvailableAt": None}

            # LOCKED — check 6-hour gap since last close
            can_start = True
            available_at = None

            if ds and ds.closed_at:
                closed_utc = ds.closed_at.replace(tzinfo=timezone.utc) if ds.closed_at.tzinfo is None else ds.closed_at
                gap_end = closed_utc + timedelta(hours=self.OPENING_GAP_HOURS)
                now_utc = datetime.now(timezone.utc)
                can_start = now_utc >= gap_end
                if not can_start:
                    available_at = gap_end.isoformat()

            return {
                "systemState": "LOCKED",
                "canStartOpening": can_start,
                "openingAvailableAt": available_at,
            }
        except Exception:
            return {"systemState": "LOCKED", "canStartOpening": True, "openingAvailableAt": None}

    async def _require_unlocked(self, organization_id: str):
        """Raise 403 if the day is not OPEN (LOCKED state)."""
        state = await self.get_system_state(organization_id)
        if state["systemState"] != "UNLOCKED":
            raise HTTPException(
                status_code=403,
                detail="Action not allowed: complete Opening Stock to unlock this feature."
            )

    async def get_day_status(self, organization_id: str):
        try:
            if not organization_id:
                return {
                    "state": "CLOSED",
                    "business_date": str(datetime.now().date()),
                    "is_opening_completed": False,
                    "opened_at": None,
                    "closed_at": None,
                    "metadata": {},
                }

            org_id_str = str(organization_id)
            try:
                UUID(org_id_str)
            except:
                return {
                    "state": "CLOSED",
                    "business_date": str(datetime.now().date()),
                    "is_opening_completed": False,
                    "opened_at": None,
                    "metadata": {},
                }

            from app.db.prisma import db
            ds = await db.daystatus.find_unique(where={"organization_id": org_id_str})

            if not ds:
                ds = await db.daystatus.create(
                    data={
                        "organization_id": org_id_str,
                        "state": "CLOSED",
                        "business_date": datetime.utcnow(),
                        "updated_at": datetime.utcnow(),
                        "metadata": Json({})
                    }
                )

            metadata = ds.metadata or {}
            if isinstance(metadata, str):
                try:
                    metadata = json.loads(metadata)
                except:
                    metadata = {}

            # If the record is effectively a stub (no opening or closing
            # activity has ever been recorded), surface it as PRE_OPEN so
            # the UI can run Daily Stock Count instead of appearing locked.
            is_stub = (
                str(ds.state) == "CLOSED"
                and not bool(ds.is_opening_completed)
                and not ds.opened_at
                and not ds.closed_at
            )

            effective_state = "PRE_OPEN" if is_stub else (str(ds.state) if ds.state else "CLOSED")

            return {
                "state": effective_state,
                "business_date": ds.business_date.isoformat() if hasattr(ds.business_date, 'isoformat') else str(ds.business_date),
                "is_opening_completed": bool(ds.is_opening_completed),
                "opened_at": ds.opened_at.isoformat() if ds.opened_at and hasattr(ds.opened_at, 'isoformat') else (str(ds.opened_at) if ds.opened_at else None),
                "closed_at": ds.closed_at.isoformat() if ds.closed_at and hasattr(ds.closed_at, 'isoformat') else (str(ds.closed_at) if ds.closed_at else None),
                "metadata": metadata if isinstance(metadata, dict) else {},
            }
        except Exception as e:
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Restaurant Service Error: {str(e)}")

    async def get_settings(self, organization_id: str):
        from app.db.prisma import db

        if not organization_id:
            return {"name": "Restaurant", "opening_time": "08:00", "closing_time": "22:00"}

        org = await db.organization.find_unique(where={"id": organization_id})
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")

        settings = org.settings or {}
        if isinstance(settings, str):
            try:
                settings = json.loads(settings)
            except:
                settings = {}

        return {
            "id": str(org.id),
            "name": org.name,
            "logo_url": org.logo_url,
            **settings
        }

    async def update_settings(self, organization_id: str, new_settings: dict):
        from app.db.prisma import db

        update_data = {"settings": Json(new_settings)}
        if "name" in new_settings:
            update_data["name"] = new_settings["name"]
        if "logo_url" in new_settings:
            update_data["logo_url"] = new_settings["logo_url"]

        org = await db.organization.update(
            where={"id": organization_id},
            data=update_data
        )

        return {
            "id": str(org.id),
            "name": org.name,
            "logo_url": org.logo_url,
            **new_settings
        }

    async def get_notifications(self, organization_id: str, offset: int = 0, limit: int = 50):
        if not organization_id:
            return []

        inventory = await inventory_repo.get_by_organization(UUID(organization_id))
        notifications = []
        for item in inventory:
            stock = item.get("current_stock", 0)
            min_lvl = item.get("min_level", 0)
            # Prefer the most recent update timestamp for time-based display on the
            # frontend; fall back to created_at if needed.
            ts = item.get("updated_at") or item.get("created_at")
            if hasattr(ts, "isoformat"):
                ts_value = ts.isoformat()
            else:
                ts_value = str(ts) if ts is not None else None
            if stock <= 0:
                notifications.append({
                    "id": str(item["id"]),
                    "type": "critical",
                    "message": f"{item['name']} is out of stock",
                    "timestamp": ts_value,
                })
            elif stock <= min_lvl:
                notifications.append({
                    "id": str(item["id"]),
                    "type": "warning",
                    "message": f"{item['name']} is running low ({stock} {item.get('unit', 'units')} left)",
                    "timestamp": ts_value,
                })

        # Apply simple offset/limit pagination on the in-memory notifications list
        return notifications[offset: offset + limit]

    async def get_closing_status(self, organization_id: str):
        from app.db.prisma import db
        ds = await db.daystatus.find_unique(where={"organization_id": organization_id})
        return {
            "can_close": ds.is_opening_completed if ds else False,
            "state": str(ds.state) if ds and ds.state else "CLOSED",
        }

    async def get_closing_indicators(self, organization_id: str):
        events = await inventory_repo.get_recent_events(organization_id, limit=100)
        used = sum(1 for e in events if e.event_type == "USED")
        wasted = sum(1 for e in events if e.event_type == "WASTED")
        return {"used": used, "wasted": wasted}

    async def record_kitchen_event(self, organization_id: str, item_id: str, amount: float, event_type: str, reason: str = None):
        await self._require_unlocked(organization_id)
        # Ensure the item is within the caller's organization before mutating stock
        existing = await inventory_repo.get_by_id(UUID(item_id))
        if not existing or str(existing.get("organization_id")) != str(organization_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

        mapped_type = "USED" if event_type == "usage" else "WASTED"
        await inventory_repo.add_event(
            contextual_product_id=item_id,
            organization_id=str(organization_id),
            event_type=mapped_type,
            quantity=-abs(amount),
            unit="units",
            metadata={"reason": reason} if reason else {}
        )
        return {"success": True}

    async def submit_closing_checklist(self, organization_id: str, payload: dict):
        """Persist a lightweight record of the closing checklist and mark the day as closed.
        Only allowed when UNLOCKED (day is OPEN).

        This mirrors the opening checklist submission by updating DayStatus on the
        backend so future sessions (and other services) can see that the day was
        properly closed, while still keeping the detailed UI state local-first.
        """
        await self._require_unlocked(organization_id)
        try:
            from app.db.prisma import db

            org_id_str = str(organization_id)
            summary = payload.get("summary") or {}
            items = payload.get("items") or []

            ds = await db.daystatus.find_first(where={"organization_id": org_id_str})

            from prisma.enums import DayState  # type: ignore

            if ds:
                await db.daystatus.update(
                    where={"organization_id": org_id_str},
                    data={
                        "state": DayState.CLOSED,
                        "closed_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow(),
                        "metadata": Json({
                            "closing_summary": summary,
                            "closing_items_count": len(items),
                        }),
                    },
                )
            else:
                await db.daystatus.create(
                    data={
                        "organization_id": org_id_str,
                        "state": DayState.CLOSED,
                        "business_date": datetime.utcnow(),
                        "closed_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow(),
                        "is_opening_completed": False,
                        "metadata": Json({
                            "closing_summary": summary,
                            "closing_items_count": len(items),
                        }),
                    }
                )

            # Record CLOSING_STOCK snapshot events — physical count only, no stock mutation
            for item in items:
                item_id = item.get("id")
                # Prefer user-entered physical count; fall back to system currentStock
                raw_count = item.get("physicalCount") if item.get("physicalCount") is not None else item.get("currentStock")
                if not item_id or raw_count is None:
                    continue
                try:
                    closing_qty = float(raw_count)
                except (TypeError, ValueError):
                    continue
                unit = item.get("unit") or "units"
                await inventory_repo.record_snapshot_event(
                    contextual_product_id=str(item_id),
                    organization_id=org_id_str,
                    event_type="CLOSING_STOCK",
                    quantity=closing_qty,
                    unit=unit,
                    metadata={"reason": "Closing stock verification"},
                )

            return {"success": True}
        except Exception as e:
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))


restaurant_service = RestaurantService()