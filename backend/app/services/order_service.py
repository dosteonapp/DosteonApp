from app.repositories.order_repository import order_repo
from app.schemas.orders import OrderCreate, OrderUpdate

class OrderService:
    async def get_orders(self, user_id: str):
        return order_repo.get_user_orders(user_id)

    async def create_order(self, user_id: str, order_data: OrderCreate):
        data = order_data.model_dump()
        data["user_id"] = user_id
        return order_repo.create_order(data)

    async def update_order(self, order_id: str, order_data: OrderUpdate):
        return order_repo.update_order(order_id, order_data.model_dump(exclude_unset=True))

order_service = OrderService()
