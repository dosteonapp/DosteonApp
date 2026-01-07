from fastapi import APIRouter, Depends
from app.services.restaurant_service import restaurant_service
from app.api.deps import get_restaurant_user

router = APIRouter()

@router.get("/stats")
async def get_restaurant_stats(current_user: dict = Depends(get_restaurant_user)):
    """Get restaurant dashboard statistics"""
    return await restaurant_service.get_stats(current_user["id"])

@router.get("/inventory/low-stock")
async def get_low_stock(current_user: dict = Depends(get_restaurant_user)):
    """Get items with stock below minimum level"""
    return await restaurant_service.get_low_stock_items(current_user["id"])

@router.get("/orders/recent")
async def get_recent_orders(current_user: dict = Depends(get_restaurant_user)):
    """Get the most recent orders for the restaurant"""
    return await restaurant_service.get_recent_orders(current_user["id"])
