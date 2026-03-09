from fastapi import APIRouter, Depends, Body
from app.services.restaurant_service import restaurant_service
from app.api.deps import get_restaurant_user, get_admin_user

router = APIRouter()

@router.get("/stats")
async def get_restaurant_stats(current_user: dict = Depends(get_restaurant_user)):
    """Get restaurant dashboard statistics (Healthy, Low, Critical)"""
    return await restaurant_service.get_stats(current_user["organization_id"])

@router.get("/inventory/running-low")
async def get_running_low(current_user: dict = Depends(get_restaurant_user)):
    """Match frontend: Get items with stock below minimum level"""
    return await restaurant_service.get_low_stock_items(current_user["organization_id"])

@router.get("/day-status")
async def get_day_status(current_user: dict = Depends(get_restaurant_user)):
    """Get the current operational status of the day lifecycle"""
    return await restaurant_service.get_day_status(current_user["organization_id"])

@router.get("/settings")
async def get_settings(current_user: dict = Depends(get_restaurant_user)):
    """Get organization settings like opening/closing times"""
    return await restaurant_service.get_settings(current_user["organization_id"])

@router.patch("/settings")
async def update_settings(
    settings: dict = Body(...),
    current_user: dict = Depends(get_admin_user)
):
    """Update organization settings (Admin only)"""
    return await restaurant_service.update_settings(current_user["organization_id"], settings)

# Placeholder Kitchen Endpoints to prevent frontend 404s
@router.get("/kitchen/summary")
async def kitchen_summary(current_user: dict = Depends(get_restaurant_user)):
    return {
        "health": "Healthy",
        "healthSubtext": "Ready for service",
        "criticalIngredients": 0,
        "criticalSubtext": "Everything is in stock"
    }

@router.get("/kitchen/items")
async def kitchen_items(search: str = "", current_user: dict = Depends(get_restaurant_user)):
    return [] # Placeholder for now

@router.get("/recent-activities")
async def recent_activities(current_user: dict = Depends(get_restaurant_user)):
    return [] # Placeholder
