from app.core.supabase import supabase
from typing import List, Optional
from uuid import UUID

class POSRepository:
    def __init__(self):
        self.menu_table = "menu_items"
        self.recipe_table = "recipes"
        self.sales_table = "sales_logs"

    def get_menu_items(self, organization_id: str) -> List[dict]:
        result = supabase.table(self.menu_table).select("*").eq("organization_id", organization_id).eq("is_active", True).execute()
        return result.data

    def get_recipe(self, menu_item_id: str) -> List[dict]:
        # Fetch ingredients required for a menu item
        result = supabase.table(self.recipe_table).select("*").eq("menu_item_id", menu_item_id).execute()
        return result.data

    def log_sale(self, organization_id: str, menu_item_id: str, quantity: int = 1) -> dict:
        data = {
            "organization_id": organization_id,
            "menu_item_id": menu_item_id,
            "quantity_sold": quantity
        }
        result = supabase.table(self.sales_table).insert(data).execute()
        return result.data[0]

pos_repo = POSRepository()
