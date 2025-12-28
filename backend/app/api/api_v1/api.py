from fastapi import APIRouter
from app.api.api_v1.endpoints import auth, inventory, orders, test_role

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(test_role.router, prefix="/test", tags=["test"])
