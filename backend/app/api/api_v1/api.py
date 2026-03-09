from fastapi import APIRouter
from app.api.api_v1.endpoints import auth, inventory, test_role, restaurant, pos

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(restaurant.router, prefix="/restaurant", tags=["restaurant"])
api_router.include_router(pos.router, prefix="/pos", tags=["pos"])
api_router.include_router(test_role.router, prefix="/test", tags=["test"])
