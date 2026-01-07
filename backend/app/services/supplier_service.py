from app.repositories.inventory_repository import inventory_repo
from app.repositories.order_repository import order_repo

class SupplierService:
    async def get_stats(self, user_id: str):
        products = inventory_repo.get_user_inventory(user_id)
        orders = order_repo.get_supplier_orders(user_id)
        
        product_count = len(products)
        active_orders_count = len([o for o in orders if o.get("status") not in ["completed", "cancelled"]])
        
        # Calculate total sales if price exists in orders
        total_sales = sum([o.get("total_amount", 0) for o in orders if o.get("status") == "completed"])
        
        return {
            "productCount": product_count,
            "activeOrdersCount": active_orders_count,
            "totalSales": total_sales
        }

    async def get_orders(self, user_id: str):
        orders = order_repo.get_supplier_orders(user_id)
        return {"items": orders, "total": len(orders)}

    async def get_products(self, user_id: str):
        products = inventory_repo.get_user_inventory(user_id)
        return {"items": products, "total": len(products)}

supplier_service = SupplierService()
