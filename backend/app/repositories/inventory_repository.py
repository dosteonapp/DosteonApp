from app.core.supabase import supabase
from typing import List, Optional
from uuid import UUID

class InventoryRepository:
    def __init__(self):
        self.table = "inventory_items"

    def get_by_organization(self, organization_id: UUID) -> List[dict]:
        result = supabase.table(self.table).select("*").eq("organization_id", str(organization_id)).execute()
        return result.data

    def get_by_id(self, item_id: UUID) -> Optional[dict]:
        result = supabase.table(self.table).select("*").eq("id", str(item_id)).execute()
        return result.data[0] if result.data else None

    def create_item(self, item_data: dict) -> dict:
        result = supabase.table(self.table).insert(item_data).execute()
        return result.data[0]

    def update_item(self, item_id: UUID, item_data: dict) -> dict:
        result = supabase.table(self.table).update(item_data).eq("id", str(item_id)).execute()
        return result.data[0]

    def delete_item(self, item_id: UUID):
        supabase.table(self.table).delete().eq("id", str(item_id)).execute()

inventory_repo = InventoryRepository()
