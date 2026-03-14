from app.repositories.inventory_repository import inventory_repo
from app.schemas.inventory import InventoryItemCreate, InventoryItemUpdate
from uuid import UUID

class InventoryService:
    async def get_inventory(self, organization_id: str):
        return inventory_repo.get_by_organization(organization_id)

    async def add_item(self, organization_id: str, item_data: InventoryItemCreate):
        data = item_data.model_dump()
        data["organization_id"] = organization_id
        return inventory_repo.create_item(data)

    async def update_item(self, item_id: str, item_data: InventoryItemUpdate):
        return inventory_repo.update_item(UUID(item_id), item_data.model_dump(exclude_unset=True))

    async def remove_item(self, item_id: str):
        return inventory_repo.delete_item(UUID(item_id))

    async def get_catalog(self):
        return inventory_repo.get_catalog()

inventory_service = InventoryService()
