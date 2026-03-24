from fastapi import APIRouter, Depends, Body, Query
from app.services.restaurant_service import restaurant_service
from app.services.team_service import team_service
from app.api.deps import (
    get_restaurant_user,
    get_admin_user,
    get_security_context,
    get_admin_context,
    SecurityContext,
)
from app.schemas.inventory import (
    RestaurantInventoryItemCreate,
    RestaurantInventoryItemUpdate,
    InventoryStockUpdate,
    OpeningChecklistDraft,
    OpeningChecklistSubmit,
    KitchenUsageLog,
    KitchenWasteLog,
    ClosingChecklistSubmit,
)
from app.schemas.auth import TeamInviteRequest, TeamRoleUpdate

router = APIRouter()

@router.get("/stats")
async def get_restaurant_stats(ctx: SecurityContext = Depends(get_security_context)):
    """Get restaurant dashboard statistics (Healthy, Low, Critical)"""
    return await restaurant_service.get_stats(ctx.organization_id)

@router.get("/inventory/running-low")
async def get_running_low(ctx: SecurityContext = Depends(get_security_context)):
    """Match frontend: Get items with stock below minimum level"""
    return await restaurant_service.get_low_stock_items(ctx.organization_id)

@router.get("/inventory/items")
async def get_inventory_items(ctx: SecurityContext = Depends(get_security_context)):
    """Match frontend: Get all inventory items for the organization"""
    return await restaurant_service.get_inventory_items(ctx.organization_id)

@router.post("/inventory/items")
async def add_inventory_item(
    payload: RestaurantInventoryItemCreate,
    ctx: SecurityContext = Depends(get_security_context)
):
    """Add a new item to the restaurant inventory"""
    return await restaurant_service.create_inventory_item(ctx.organization_id, payload.dict())

@router.patch("/inventory/items/{id}")
async def update_inventory_item(
    id: str,
    payload: RestaurantInventoryItemUpdate,
    ctx: SecurityContext = Depends(get_security_context)
):
    """Update an existing inventory item"""
    return await restaurant_service.update_inventory_item(ctx.organization_id, id, payload.dict(exclude_unset=True))

@router.post("/inventory/update-stock")
async def update_stock(
    payload: InventoryStockUpdate,
    ctx: SecurityContext = Depends(get_security_context)
):
    """Manually override current stock levels"""
    return await restaurant_service.update_item_stock(ctx.organization_id, payload.itemId, payload.newQuantity)

@router.get("/inventory/items/{id}")
async def get_inventory_item(id: str, ctx: SecurityContext = Depends(get_security_context)):
    """Get details for a single inventory item"""
    return await restaurant_service.get_inventory_item_by_id(ctx.organization_id, id)

@router.get("/inventory/items/{id}/activities")
async def get_item_activities(id: str, ctx: SecurityContext = Depends(get_security_context)):
    """Get history/activities for a single inventory item"""
    return await restaurant_service.get_item_activities(ctx.organization_id, id)

@router.get("/opening-checklist/items")
async def get_opening_checklist(ctx: SecurityContext = Depends(get_security_context)):
    """Get items for the daily opening stock count"""
    return await restaurant_service.get_opening_checklist(ctx.organization_id)

@router.post("/opening-checklist/save-draft")
async def save_opening_checklist_draft(
    payload: OpeningChecklistDraft,
    ctx: SecurityContext = Depends(get_security_context)
):
    """Save progress of the daily opening stock count without submitting"""
    return await restaurant_service.save_opening_draft(ctx.organization_id, payload.dict())

@router.post("/opening-checklist/submit")
async def submit_opening_checklist(
    payload: OpeningChecklistSubmit,
    ctx: SecurityContext = Depends(get_security_context)
):
    """Submit the daily opening stock count"""
    return await restaurant_service.submit_opening_checklist(ctx.organization_id, payload.dict())


@router.get("/day-status")
async def get_day_status(ctx: SecurityContext = Depends(get_security_context)):
    """Get the current operational status of the day lifecycle"""
    return await restaurant_service.get_day_status(ctx.organization_id)

@router.get("/settings")
async def get_settings(ctx: SecurityContext = Depends(get_admin_context)):
    """Get organization settings like opening/closing times (Owner/manager only)"""
    return await restaurant_service.get_settings(ctx.organization_id)

@router.patch("/settings")
async def update_settings(
    settings: dict = Body(...),
    ctx: SecurityContext = Depends(get_admin_context)
):
    """Update organization settings (Admin only)"""
    return await restaurant_service.update_settings(ctx.organization_id, settings)


@router.get("/team")
async def list_team(ctx: SecurityContext = Depends(get_admin_context)):
    """List all team members in the current organization (Owner/manager only)."""
    return await team_service.list_team_members(ctx.organization_id)


@router.post("/team/invite")
async def invite_team_member(
    body: TeamInviteRequest,
    ctx: SecurityContext = Depends(get_admin_context),
):
    """Invite a new team member by email with an assigned role."""
    return await team_service.invite_member(
        organization_id=ctx.organization_id,
        inviter_id=ctx.user_id,
        payload=body.model_dump(),
    )


@router.patch("/team/role")
async def update_team_member_role(
    body: TeamRoleUpdate,
    ctx: SecurityContext = Depends(get_admin_context),
):
    """Update the RBAC role of an existing team member (Owner/manager only)."""
    return await team_service.update_member_role(
        organization_id=ctx.organization_id,
        user_id=str(body.user_id),
        role_key=body.role,
    )


@router.delete("/team/{user_id}")
async def remove_team_member(
    user_id: str,
    ctx: SecurityContext = Depends(get_admin_context),
):
    """Remove a team member from the organization (Owner/manager only)."""
    return await team_service.remove_member(
        organization_id=ctx.organization_id,
        user_id=user_id,
    )

# Placeholder Kitchen Endpoints to prevent frontend 404s
@router.get("/kitchen/summary")
async def kitchen_summary(ctx: SecurityContext = Depends(get_security_context)):
    return {
        "health": "Healthy",
        "healthSubtext": "Ready for service",
        "criticalIngredients": 0,
        "criticalSubtext": "Everything is in stock"
    }

@router.post("/kitchen/log-usage")
async def log_usage(
    payload: KitchenUsageLog,
    ctx: SecurityContext = Depends(get_security_context)
):
    """Log ingredient usage in kitchen"""
    return await restaurant_service.record_kitchen_event(ctx.organization_id, payload.itemId, payload.amount, "usage")

@router.post("/kitchen/log-waste")
async def log_waste(
    payload: KitchenWasteLog,
    ctx: SecurityContext = Depends(get_security_context)
):
    """Log ingredient waste in kitchen"""
    return await restaurant_service.record_kitchen_event(ctx.organization_id, payload.itemId, payload.amount, "waste", payload.reason)

@router.get("/kitchen/items")
async def kitchen_items(search: str = "", ctx: SecurityContext = Depends(get_security_context)):
    return await restaurant_service.get_inventory_items(ctx.organization_id)

@router.get("/notifications")
async def get_notifications(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    ctx: SecurityContext = Depends(get_security_context),
):
    """Match frontend: Get restaurant notifications/alerts"""
    return await restaurant_service.get_notifications(ctx.organization_id, offset=offset, limit=limit)

@router.get("/recent-activities")
async def recent_activities(
    offset: int = Query(0, ge=0),
    limit: int = Query(5, ge=1, le=100),
    ctx: SecurityContext = Depends(get_security_context),
):
    """Match frontend: Get recent dashboard activities"""
    return await restaurant_service.get_recent_activities(ctx.organization_id, offset=offset, limit=limit)

@router.get("/closing/status")
async def get_closing_status(ctx: SecurityContext = Depends(get_security_context)):
    """Get prerequisites for closing the day"""
    return await restaurant_service.get_closing_status(ctx.organization_id)

@router.get("/closing/indicators")
async def get_closing_indicators(ctx: SecurityContext = Depends(get_security_context)):
    """Get closing indicators (Used/Wasted counts) for dashboard"""
    return await restaurant_service.get_closing_indicators(ctx.organization_id)


@router.post("/closing/submit")
async def submit_closing_checklist(
    payload: ClosingChecklistSubmit,
    ctx: SecurityContext = Depends(get_security_context)
):
    """Submit the end-of-day closing checklist and mark the day as closed."""
    return await restaurant_service.submit_closing_checklist(ctx.organization_id, payload.dict())
