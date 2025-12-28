from app.core.supabase import supabase
from typing import List, Optional

class InventoryRepository:
    def __init__(self):
        self.table = "inventory" # Assuming this table name

    def get_user_inventory(self, user_id: str) -> List[dict]:
        result = supabase.table(self.table).select("*").eq("user_id", user_id).execute()
        return result.data

    def create_item(self, item_data: dict) -> dict:
        result = supabase.table(self.table).insert(item_data).execute()
        return result.data[0]

    def update_item(self, item_id: str, item_data: dict) -> dict:
        result = supabase.table(self.table).update(item_data).eq("id", item_id).execute()
        return result.data[0]

    def delete_item(self, item_id: str):
        supabase.table(self.table).delete().eq("id", item_id).execute()

inventory_repo = InventoryRepository()
