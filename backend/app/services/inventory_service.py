from app.repositories.inventory_repository import inventory_repo
from app.schemas.inventory import InventoryCreate, InventoryUpdate

class InventoryService:
    async def get_inventory(self, user_id: str):
        return inventory_repo.get_user_inventory(user_id)

    async def add_item(self, user_id: str, item_data: InventoryCreate):
        data = item_data.model_dump()
        data["user_id"] = user_id
        return inventory_repo.create_item(data)

    async def update_item(self, item_id: str, item_data: InventoryUpdate):
        return inventory_repo.update_item(item_id, item_data.model_dump(exclude_unset=True))

    async def remove_item(self, item_id: str):
        return inventory_repo.delete_item(item_id)

inventory_service = InventoryService()
