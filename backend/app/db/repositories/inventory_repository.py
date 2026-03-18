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
                "inventory_events": True,
                "location": True
            }
        )
        
        # Transform into a flat structure for the frontend
        result = []
        for p in products:
            result.append({
                "id": p.id,
                "name": p.name or p.canonical.name,
                "category": p.category or p.canonical.category,
                "brand": p.brand_name,
                "unit": p.pack_unit or p.canonical.base_unit,
                "current_stock": p.current_stock,
                "min_level": float(p.reorder_threshold or 0),
                "location": p.location.location_type if p.location else p.storage_type,
                "status": p.status,
                "canonical_id": p.canonical_product_id,
                "created_at": p.created_at,
                "updated_at": p.updated_at
            })
        return result

    async def get_by_id(self, item_id: UUID) -> Optional[dict]:
        p = await db.contextualproduct.find_unique(
            where={"id": str(item_id)},
            include={"canonical": True, "inventory_events": True, "location": True}
        )
        if not p:
            return None
            
        return {
            "id": p.id,
            "name": p.name or p.canonical.name,
            "category": p.category or p.canonical.category,
            "brand": p.brand_name,
            "unit": p.pack_unit or p.canonical.base_unit,
            "current_stock": p.current_stock,
            "min_level": float(p.reorder_threshold or 0),
            "critical_level": float(p.critical_threshold or 0),
            "location": p.location.location_type if p.location else p.storage_type,
            "status": p.status,
            "created_at": p.created_at
        }

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

inventory_repo = InventoryRepository()
