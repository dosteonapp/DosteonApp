from app.db.repositories.inventory_repository import inventory_repo
from app.schemas.inventory import (
    InventoryItemCreate, InventoryItemUpdate,
    ConsumptionCreate, WasteCreate,
)
from uuid import UUID
from fastapi import HTTPException, status
from typing import Optional

class InventoryService:
    async def get_inventory(
        self,
        organization_id: str,
        skip: int = 0,
        limit: int | None = None,
        brand_id: str | None = None,
    ):
        """Fetch inventory for an organization with optional pagination.

        brand_id: when provided, applies the fallback filter (null rows + brand rows).
        skip: number of items to skip (offset)
        limit: maximum number of items to return
        """
        take = limit if limit is not None and limit > 0 else None
        return await inventory_repo.get_by_organization(
            UUID(organization_id), skip=skip, take=take, brand_id=brand_id
        )

    async def add_item(self, organization_id: str, item_data: InventoryItemCreate):
        # 1. Create Contextual Product
        ctx = await inventory_repo.create_contextual_product(
            canonical_product_id=str(item_data.canonical_product_id),
            organization_id=organization_id,
            brand_name=item_data.brand_name,
            pack_size=item_data.pack_size,
            pack_unit=item_data.pack_unit,
            location_id=str(item_data.location_id) if item_data.location_id else None,
            reorder_threshold=item_data.reorder_threshold,
            current_stock=0.0,
            status="active",
            is_active=True,
        )

        # 2. Add Opening Stock Event if provided
        if item_data.opening_stock > 0:
            await inventory_repo.add_event(
                contextual_product_id=ctx["id"],
                organization_id=str(organization_id),
                event_type="OPENING_STOCK",
                quantity=item_data.opening_stock,
                unit=item_data.pack_unit or "units",
                metadata={"reason": "Initial item setup"}
            )

        return await inventory_repo.get_by_id(UUID(ctx["id"]))

    async def get_catalog(self):
        return await inventory_repo.get_catalog()

    async def search_catalog(self, query: str, organization_id: str = None):
        """Search canonical catalog, excluding items already in org inventory."""
        return await inventory_repo.search_catalog(query, organization_id)

    async def update_item(self, item_id: str, item_data: InventoryItemUpdate):
        return await inventory_repo.update_contextual_product(
            UUID(item_id),
            item_data.model_dump(exclude_unset=True)
        )

    # -----------------------------------------------------------------------
    # Enhanced product catalog
    # -----------------------------------------------------------------------

    async def get_products(
        self,
        organization_id: str,
        brand_id: Optional[str] = None,
        search: Optional[str] = None,
        category: Optional[str] = None,
    ):
        products = await inventory_repo.get_products_enhanced(
            organization_id, brand_id=brand_id, search=search, category=category
        )
        result = []
        for p in products:
            reorder  = float(p.reorder_threshold  or 0)
            critical = float(p.critical_threshold or 0)
            stock    = float(p.current_stock or 0)

            if stock <= critical:
                status_class = "critical"
            elif stock <= reorder:
                status_class = "low"
            else:
                status_class = "healthy"

            canonical  = p.canonical
            brand_obj  = p.brand

            result.append({
                "id":            p.id,
                "name":          p.name or (canonical.name if canonical else "Unknown"),
                "sku":           p.sku  or (canonical.sku  if canonical else None),
                "category":      canonical.category if canonical else "General",
                "brand_name":    brand_obj.name if brand_obj else None,
                "unit":          p.pack_unit or (canonical.base_unit if canonical else "units"),
                "current_stock": stock,
                "min_level":     reorder,
                "status_class":  status_class,
                "updated_at":    p.updated_at,
            })
        return result

    async def get_stats(
        self,
        organization_id: str,
        brand_id: Optional[str] = None,
    ):
        return await inventory_repo.get_inventory_counts(organization_id, brand_id=brand_id)

    # -----------------------------------------------------------------------
    # Stock usage
    # -----------------------------------------------------------------------

    async def get_stock_usage_stats(
        self,
        organization_id: str,
        brand_id: Optional[str] = None,
    ):
        return await inventory_repo.get_usage_stats_today(organization_id, brand_id=brand_id)

    async def get_stock_usage_history(
        self,
        organization_id: str,
        brand_id: Optional[str] = None,
        limit: int = 10,
    ):
        events = await inventory_repo.get_usage_history(organization_id, brand_id=brand_id, limit=limit)
        result = []
        for e in events:
            p = e.product
            name = "Unknown"
            unit = "units"
            if p:
                name = p.name or (p.canonical.name if p.canonical else "Unknown")
                unit = p.pack_unit or (p.canonical.base_unit if p.canonical else "units")
            result.append({
                "id":                 e.id,
                "product_id":         e.contextual_product_id,
                "product_name":       name,
                "event_type":         e.event_type,
                "quantity":           abs(e.quantity),
                "unit":               unit,
                "consumption_reason": e.consumption_reason,
                "waste_reason":       e.waste_reason,
                "occurred_at":        e.occurred_at,
            })
        return result

    async def log_consumption(
        self,
        organization_id: str,
        brand_id: Optional[str],
        data: ConsumptionCreate,
        actor_id: Optional[str] = None,
    ):
        product_id = str(data.product_id)
        # Validate product belongs to org (and brand if scoped)
        product = await inventory_repo.get_by_id(UUID(product_id))
        if not product or str(product.get("organization_id", "")) != organization_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        return await inventory_repo.add_usage_event(
            contextual_product_id=product_id,
            organization_id=organization_id,
            event_type="USED",
            quantity=data.quantity,
            unit=product.get("unit", "units"),
            consumption_reason=data.consumption_reason.value,
            actor_id=actor_id,
        )

    async def log_waste(
        self,
        organization_id: str,
        brand_id: Optional[str],
        data: WasteCreate,
        actor_id: Optional[str] = None,
    ):
        product_id = str(data.product_id)
        product = await inventory_repo.get_by_id(UUID(product_id))
        if not product or str(product.get("organization_id", "")) != organization_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        return await inventory_repo.add_usage_event(
            contextual_product_id=product_id,
            organization_id=organization_id,
            event_type="WASTED",
            quantity=data.quantity,
            unit=product.get("unit", "units"),
            waste_reason=data.waste_reason.value,
            actor_id=actor_id,
        )

    async def remove_item(self, organization_id: str, item_id: str):
        """Soft-delete an inventory item, ensuring it belongs to the org."""

        item_uuid = UUID(item_id)
        existing = await inventory_repo.get_by_id(item_uuid)
        if not existing or str(existing.get("organization_id")) != str(organization_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

        return await inventory_repo.delete_contextual_product(item_uuid)

inventory_service = InventoryService()