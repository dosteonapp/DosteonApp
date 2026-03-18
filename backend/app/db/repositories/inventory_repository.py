from app.db.prisma import db
from typing import List, Optional
from uuid import UUID
from prisma.models import ContextualProduct, CanonicalProduct, InventoryEvent

class InventoryRepository:
    async def get_by_organization(self, organization_id: UUID) -> List[dict]:
        # Fetch contextual products with their canonical details and inventory events
        products = await db.contextualproduct.find_many(
            where={"organization_id": str(organization_id)},
            include={
                "canonical": True,
                "location": True
            }
        )
        
        # Transform into a flat structure for the frontend
        result = []
        for p in products:
            try:
                cat = p.canonical.category if p.canonical else "General"
                loc = "Main Storage"
                if p.location:
                   loc = p.location.location_type
                elif p.storage_type:
                   loc = p.storage_type
                
                result.append({
                    "id": p.id,
                    "name": p.name or (p.canonical.name if p.canonical else "Unknown Item"),
                    "category": cat,
                    "brand": p.brand_name or "Generic",
                    "unit": p.pack_unit or (p.canonical.base_unit if p.canonical else "units"),
                    "current_stock": p.current_stock,
                    "min_level": float(p.reorder_threshold or 0),
                    "location": loc,
                    "status": p.status or "active",
                    "imageUrl": p.image_url,
                    "canonical_id": p.canonical_product_id,
                    "created_at": p.created_at,
                    "updated_at": p.updated_at
                })
            except Exception as e:
                # Log or skip individual item if it's uniquely broken
                # but for now, let's keep the dashboard loading
                continue
        return result

    async def get_low_stock(self, organization_id: UUID) -> List[dict]:
        products = await db.contextualproduct.find_many(
            where={"organization_id": str(organization_id)},
            include={"canonical": True}
        )
        
        result = []
        for p in products:
            try:
                threshold = float(p.reorder_threshold or 0)
                if p.current_stock <= threshold or p.status in ["Critical", "Low"]:
                    result.append({
                        "id": p.id,
                        "name": p.name or (p.canonical.name if p.canonical else "Unknown"),
                        "currentStock": p.current_stock,
                        "unit": p.pack_unit or (p.canonical.base_unit if p.canonical else "units")
                    })
            except: continue
        return result

    async def get_by_id(self, item_id: UUID) -> Optional[dict]:
        p = await db.contextualproduct.find_unique(
            where={"id": str(item_id)},
            include={"canonical": True, "inventory_events": True, "location": True}
        )
        if not p:
            return None
            
        try:
            loc = "Main Storage"
            if p.location: loc = p.location.location_type
            elif p.storage_type: loc = p.storage_type

            return {
                "id": p.id,
                "name": p.name or (p.canonical.name if p.canonical else "Unknown Item"),
                "category": p.canonical.category if p.canonical else "General",
                "brand": p.brand_name or "Generic",
                "unit": p.pack_unit or (p.canonical.base_unit if p.canonical else "units"),
                "current_stock": p.current_stock,
                "min_level": float(p.reorder_threshold or 0),
                "critical_level": float(p.critical_threshold or 0),
                "location": loc,
                "status": p.status or "active",
                "created_at": p.created_at
            }
        except:
            return None

    async def ensure_canonical(self, name: str, category: str) -> str:
        # 1. Try to find existing by name (case-insensitive)
        existing = await db.canonicalproduct.find_first(
            where={"name": {"equals": name, "mode": "insensitive"}}
        )
        if existing:
            return existing.id
            
        # 2. Create new if not found
        new_c = await db.canonicalproduct.create(
            data={
                "name": name,
                "category": category,
                "base_unit": "units",
                "is_public": False
            }
        )
        return new_c.id

    async def get_catalog(self) -> List[dict]:
        # Return the canonical layer
        canonicals = await db.canonicalproduct.find_many(order={"category": "asc"})
        # Convert to dict manually if needed, but Prisma model works mostly
        return [c.model_dict() if hasattr(c, 'model_dict') else c.__dict__ for c in canonicals]

    async def create_contextual_product(self, **kwargs) -> dict:
        # Convert UUIDs to strings for Prisma
        data = {k: str(v) if isinstance(v, UUID) else v for k, v in kwargs.items()}
        ctx = await db.contextualproduct.create(data=data)
        return ctx.__dict__

    async def update_contextual_product(self, item_id: UUID, data: dict) -> dict:
        ctx = await db.contextualproduct.update(
            where={"id": str(item_id)},
            data=data
        )
        return ctx.__dict__

    async def delete_contextual_product(self, item_id: UUID):
        await db.contextualproduct.delete(where={"id": str(item_id)})

    async def add_event(self, contextual_product_id: str, event_type: str, quantity: float, unit: str, metadata: dict = None):
        # 1. Create the inventory event
        event = await db.inventoryevent.create(
            data={
                "contextual_product_id": contextual_product_id,
                "event_type": event_type,
                "quantity": quantity,
                "unit": unit,
                "metadata": metadata
            }
        )
        
        # 2. Update the performance cache on ContextualProduct
        # In production, this should be an atomic increment if supported, or a transaction
        await db.contextualproduct.update(
            where={"id": contextual_product_id},
            data={"current_stock": {"increment": quantity}}
        )
        
        return event

    async def get_recent_events(self, organization_id: str, limit: int = 5) -> List[InventoryEvent]:
        return await db.inventoryevent.find_many(
            where={
                "product": {
                    "is": {
                        "organization_id": organization_id
                    }
                }
            },
            include={"product": True},
            order={"created_at": "desc"},
            take=limit
        )

inventory_repo = InventoryRepository()
