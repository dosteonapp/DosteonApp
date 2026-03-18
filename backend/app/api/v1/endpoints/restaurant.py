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

@router.get("/inventory/items")
async def get_inventory_items(current_user: dict = Depends(get_restaurant_user)):
    """Match frontend: Get all inventory items for the organization"""
    return await restaurant_service.get_inventory_items(current_user["organization_id"])

@router.post("/inventory/items")
async def add_inventory_item(
    payload: dict = Body(...),
    current_user: dict = Depends(get_restaurant_user)
):
    """Add a new item to the restaurant inventory"""
    return await restaurant_service.create_inventory_item(current_user["organization_id"], payload)

@router.patch("/inventory/items/{id}")
async def update_inventory_item(
    id: str,
    payload: dict = Body(...),
    current_user: dict = Depends(get_restaurant_user)
):
    """Update an existing inventory item"""
    return await restaurant_service.update_inventory_item(current_user["organization_id"], id, payload)

@router.post("/inventory/update-stock")
async def update_stock(
    itemId: str = Body(..., alias="itemId", embed=True),
    newQuantity: float = Body(..., alias="newQuantity", embed=True),
    current_user: dict = Depends(get_restaurant_user)
):
    """Manually override current stock levels"""
    return await restaurant_service.update_item_stock(current_user["organization_id"], itemId, newQuantity)

@router.get("/inventory/items/{id}")
async def get_inventory_item(id: str, current_user: dict = Depends(get_restaurant_user)):
    """Get details for a single inventory item"""
    return await restaurant_service.get_inventory_item_by_id(id)

@router.get("/inventory/items/{id}/activities")
async def get_item_activities(id: str, current_user: dict = Depends(get_restaurant_user)):
    """Get history/activities for a single inventory item"""
    return await restaurant_service.get_item_activities(id)

@router.get("/opening-checklist/items")
async def get_opening_checklist(current_user: dict = Depends(get_restaurant_user)):
    """Get items for the daily opening stock count"""
    return await restaurant_service.get_opening_checklist(current_user["organization_id"])

@router.post("/opening-checklist/save-draft")
async def save_opening_checklist_draft(
    payload: dict = Body(...),
    current_user: dict = Depends(get_restaurant_user)
):
    """Save progress of the daily opening stock count without submitting"""
    return await restaurant_service.save_opening_draft(current_user["organization_id"], payload)

@router.post("/opening-checklist/submit")
async def submit_opening_checklist(
    payload: dict = Body(...),
    current_user: dict = Depends(get_restaurant_user)
):
    """Submit the daily opening stock count"""
    return await restaurant_service.submit_opening_checklist(current_user["organization_id"], payload)


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

@router.post("/kitchen/log-usage")
async def log_usage(
    itemId: str = Body(..., alias="itemId", embed=True),
    amount: float = Body(..., embed=True),
    current_user: dict = Depends(get_restaurant_user)
):
    """Log ingredient usage in kitchen"""
    return await restaurant_service.record_kitchen_event(current_user["organization_id"], itemId, amount, "usage")

@router.post("/kitchen/log-waste")
async def log_waste(
    itemId: str = Body(..., alias="itemId", embed=True),
    amount: float = Body(..., embed=True),
    reason: str = Body(None, embed=True),
    current_user: dict = Depends(get_restaurant_user)
):
    """Log ingredient waste in kitchen"""
    return await restaurant_service.record_kitchen_event(current_user["organization_id"], itemId, amount, "waste", reason)

@router.get("/kitchen/items")
async def kitchen_items(search: str = "", current_user: dict = Depends(get_restaurant_user)):
    return await restaurant_service.get_inventory_items(current_user["organization_id"])

@router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_restaurant_user)):
    """Match frontend: Get restaurant notifications/alerts"""
    return await restaurant_service.get_notifications(current_user["organization_id"])

@router.get("/recent-activities")
async def recent_activities(current_user: dict = Depends(get_restaurant_user)):
    """Match frontend: Get recent dashboard activities"""
    return await restaurant_service.get_recent_activities(current_user["organization_id"])

@router.get("/closing/status")
async def get_closing_status(current_user: dict = Depends(get_restaurant_user)):
    """Get prerequisites for closing the day"""
    return await restaurant_service.get_closing_status(current_user["organization_id"])

@router.get("/closing/indicators")
async def get_closing_indicators(current_user: dict = Depends(get_restaurant_user)):
    """Get closing indicators (Used/Wasted counts) for dashboard"""
    return await restaurant_service.get_closing_indicators(current_user["organization_id"])
