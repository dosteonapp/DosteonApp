from app.db.prisma import db
from typing import List, Optional
from uuid import UUID
from prisma.models import ContextualProduct, CanonicalProduct, InventoryEvent
from prisma import Json

class InventoryRepository:
    async def get_by_organization(self, organization_id: UUID) -> List[dict]:
        products = await db.contextualproduct.find_many(
            where={"organization_id": str(organization_id)},
            include={
                "canonical": True,
                "location": True
            }
        )

        result = []
        for p in products:
            try:
                loc = "Main Storage"
                if p.location:
                    loc = p.location.location_type
                elif p.storage_type:
                    loc = p.storage_type

                result.append({
                    "id": p.id,
                    "name": p.name or (p.canonical.name if p.canonical else "Unknown Item"),
                    "category": p.canonical.category if p.canonical else "General",
                    "subcategory": p.canonical.subcategory if p.canonical else "Other",
                    "sku": p.sku or (p.canonical.sku if p.canonical else "N/A"),
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
            except Exception:
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
            except:
                continue
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
            if p.location:
                loc = p.location.location_type
            elif p.storage_type:
                loc = p.storage_type

            return {
                "id": p.id,
                "name": p.name or (p.canonical.name if p.canonical else "Unknown Item"),
                "category": p.canonical.category if p.canonical else "General",
                "subcategory": p.canonical.subcategory if p.canonical else "Other",
                "sku": p.sku or (p.canonical.sku if p.canonical else "N/A"),
                "brand": p.brand_name or "Generic",
                "unit": p.pack_unit or (p.canonical.base_unit if p.canonical else "units"),
                "current_stock": p.current_stock,
                "min_level": float(p.reorder_threshold or 0),
                "critical_level": float(p.critical_threshold or 0),
                "location": loc,
                "status": p.status or "active",
                "image_url": p.image_url,
                "created_at": p.created_at,
                "updated_at": p.updated_at,
                "canonical_id": p.canonical_product_id,
            }
        except Exception as e:
            print(f"Error in get_by_id: {e}")
            return None

    async def ensure_canonical(self, name: str, category: str) -> str:
        existing = await db.canonicalproduct.find_first(
            where={"name": {"equals": name, "mode": "insensitive"}}
        )
        if existing:
            return existing.id

        import re, uuid
        prefix = re.sub(r'[^A-Z]', '', name.upper())[:3] or "USR"
        new_sku = f"{prefix}-{str(uuid.uuid4())[:8].upper()}"

        new_c = await db.canonicalproduct.create(
            data={
                "sku": new_sku,
                "name": name,
                "category": category,
                "base_unit": "units",
                "is_public": False,
                "synonyms": []
            }
        )
        return new_c.id

    async def search_catalog(self, query: str, organization_id: str = None) -> List[dict]:
        existing_ids = []
        if organization_id:
            existing = await db.contextualproduct.find_many(
                where={"organization_id": organization_id, "is_active": True}
            )
            existing_ids = [p.canonical_product_id for p in existing]

        where_filter: dict = {
            "OR": [
                {"name": {"contains": query, "mode": "insensitive"}},
                {"sku": {"contains": query, "mode": "insensitive"}}
            ]
        }

        if existing_ids:
            where_filter["id"] = {"not_in": existing_ids}

        canonicals = await db.canonicalproduct.find_many(
            where=where_filter,
            take=10,
            order={"name": "asc"}
        )

        return [
            {
                "id": c.id,
                "name": c.name,
                "category": c.category,
                "subcategory": c.subcategory,
                "sku": c.sku,
                "unit": c.base_unit,
                "is_public": c.is_public
            }
            for c in canonicals
        ]

    async def get_catalog(self) -> List[dict]:
        canonicals = await db.canonicalproduct.find_many(
            where={"is_public": True},
            order={"category": "asc"}
        )
        return [
            {
                "id": c.id,
                "name": c.name,
                "category": c.category,
                "subcategory": c.subcategory,
                "sku": c.sku,
                "base_unit": c.base_unit,
                "product_type": c.product_type,
                "is_critical_item": c.is_critical_item,
                "synonyms": c.synonyms,
                "created_at": c.created_at,
                "updated_at": c.updated_at,
            }
            for c in canonicals
        ]

    async def bootstrap_organization(self, organization_id: str):
        canonicals = await db.canonicalproduct.find_many(where={"is_public": True})

        created = 0
        skipped = 0
        for c in canonicals:
            exists = await db.contextualproduct.find_first(
                where={
                    "organization_id": organization_id,
                    "canonical_product_id": c.id
                }
            )
            if not exists:
                await db.contextualproduct.create(
                    data={
                        "organization_id": organization_id,
                        "canonical_product_id": c.id,
                        "current_stock": 0.0,
                        "reorder_threshold": 5.0,
                        "critical_threshold": 2.0,
                        "status": "active",
                        "is_active": True,
                    }
                )
                created += 1
            else:
                skipped += 1

        print(f"  Bootstrap complete: {created} created, {skipped} already existed")
        return True

    async def create_contextual_product(self, **kwargs) -> dict:
        data = {k: str(v) if isinstance(v, UUID) else v for k, v in kwargs.items()}
        data = {k: v for k, v in data.items() if v is not None}
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
        event = await db.inventoryevent.create(
            data={
                "contextual_product_id": contextual_product_id,
                "event_type": event_type,
                "quantity": quantity,
                "unit": unit,
                "metadata": Json(metadata) if metadata else Json.null
            }
        )

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