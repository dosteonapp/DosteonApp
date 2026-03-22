from app.db.repositories.inventory_repository import inventory_repo
from app.schemas.inventory import InventoryItemCreate, InventoryItemUpdate
from uuid import UUID
from fastapi import HTTPException, status

class InventoryService:
    async def get_inventory(self, organization_id: str, skip: int = 0, limit: int | None = None):
        """Fetch inventory for an organization with optional pagination.

        skip: number of items to skip (offset)
        limit: maximum number of items to return
        """
        take = limit if limit is not None and limit > 0 else None
        return await inventory_repo.get_by_organization(UUID(organization_id), skip=skip, take=take)

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
                event_type="OPENING",
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

    async def remove_item(self, organization_id: str, item_id: str):
        """Soft-delete an inventory item, ensuring it belongs to the org."""

        item_uuid = UUID(item_id)
        existing = await inventory_repo.get_by_id(item_uuid)
        if not existing or str(existing.get("organization_id")) != str(organization_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

        return await inventory_repo.delete_contextual_product(item_uuid)

inventory_service = InventoryService()