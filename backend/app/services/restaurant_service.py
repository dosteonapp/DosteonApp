from app.repositories.inventory_repository import inventory_repo
from app.repositories.order_repository import order_repo

class RestaurantService:
    async def get_stats(self, user_id: str):
        inventory = inventory_repo.get_user_inventory(user_id)
        orders = order_repo.get_user_orders(user_id)
        
        inventory_count = len(inventory)
        in_progress_count = len([o for o in orders if o.get("status") != "completed"])
        low_stock_count = len([i for i in inventory if i.get("currentStock", 0) <= i.get("minimumLevel", 0)])
        
        return {
            "inventoryCount": inventory_count,
            "inProgressCount": in_progress_count,
            "lowStockCount": low_stock_count
        }

    async def get_low_stock_items(self, user_id: str):
        inventory = inventory_repo.get_user_inventory(user_id)
        low_stock = [i for i in inventory if i.get("currentStock", 0) <= i.get("minimumLevel", 0)]
        return {"items": low_stock, "total": len(low_stock)}

    async def get_recent_orders(self, user_id: str):
        orders = order_repo.get_user_orders(user_id)
        # Sort by created_at desc if available, otherwise just take last 5
        orders.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        recent = orders[:5]
        return {"orders": recent}

restaurant_service = RestaurantService()
