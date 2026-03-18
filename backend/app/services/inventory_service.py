from app.db.repositories.inventory_repository import inventory_repo
from app.schemas.inventory import InventoryItemCreate, InventoryItemUpdate
from uuid import UUID

class InventoryService:
    async def get_inventory(self, organization_id: str):
        return await inventory_repo.get_by_organization(UUID(organization_id))

    async def add_item(self, organization_id: str, item_data: InventoryItemCreate):
        # 1. Create Contextual Product
        ctx = await inventory_repo.create_contextual_product(
            canonical_product_id=item_data.canonical_product_id,
            organization_id=UUID(organization_id),
            brand_name=item_data.brand_name,
            pack_size=item_data.pack_size,
            pack_unit=item_data.pack_unit,
            location_id=item_data.location_id,
            reorder_threshold=item_data.reorder_threshold
        )
        
        # 2. Add Opening Stock Event
        if item_data.opening_stock > 0:
            await inventory_repo.add_event(
                contextual_product_id=ctx["id"],
                event_type="opening_stock",
                quantity=item_data.opening_stock,
                unit=item_data.pack_unit or "unit",
                metadata={"reason": "Initial item setup"}
            )
        
        return await inventory_repo.get_by_id(UUID(ctx["id"]))

    async def update_item(self, item_id: str, item_data: InventoryItemUpdate):
        return await inventory_repo.update_contextual_product(UUID(item_id), item_data.model_dump(exclude_unset=True))

    async def remove_item(self, item_id: str):
        return await inventory_repo.delete_contextual_product(UUID(item_id))

inventory_service = InventoryService()
