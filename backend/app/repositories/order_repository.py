from app.core.supabase import supabase
from typing import List

class OrderRepository:
    def __init__(self):
        self.table = "orders"

    def get_user_orders(self, user_id: str) -> List[dict]:
        result = supabase.table(self.table).select("*").eq("user_id", user_id).execute()
        return result.data

    def create_order(self, order_data: dict) -> dict:
        result = supabase.table(self.table).insert(order_data).execute()
        return result.data[0]

    def update_order(self, order_id: str, order_data: dict) -> dict:
        result = supabase.table(self.table).update(order_data).eq("id", order_id).execute()
        return result.data[0]

order_repo = OrderRepository()
