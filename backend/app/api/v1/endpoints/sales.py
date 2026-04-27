from fastapi import APIRouter, Depends, Query
from datetime import date
from typing import Optional
from app.api.deps import (
    get_brand_context,
    get_brand_mutation_context,
    SecurityContext,
)
from app.schemas.sales import MenuItemCreate, MenuItemUpdate, SaleLogRequest
from app.services.sales_service import sales_service

router = APIRouter()

# ---------------------------------------------------------------------------
# Menu management (read)
# ---------------------------------------------------------------------------

@router.get("/menu")
async def get_menu(
    search: str = Query(""),
    ctx: SecurityContext = Depends(get_brand_context),
):
    """List active menu items grouped by category. Supports ?search= for name filtering."""
    return await sales_service.get_menu(ctx.organization_id, ctx.brand_id, search)


# ---------------------------------------------------------------------------
# Menu management (mutations)
# ---------------------------------------------------------------------------

@router.post("/menu", status_code=201)
async def create_menu_item(
    payload: MenuItemCreate,
    ctx: SecurityContext = Depends(get_brand_mutation_context),
):
    """Create a new menu item under the current brand."""
    return await sales_service.create_menu_item(
        ctx.organization_id, ctx.brand_id, payload.model_dump()
    )


@router.patch("/menu/{item_id}")
async def update_menu_item(
    item_id: str,
    payload: MenuItemUpdate,
    ctx: SecurityContext = Depends(get_brand_mutation_context),
):
    """Update a menu item's name, price, cost, or category."""
    return await sales_service.update_menu_item(
        ctx.organization_id, item_id, payload.model_dump(exclude_none=True)
    )


@router.post("/menu/{item_id}/archive")
async def archive_menu_item(
    item_id: str,
    ctx: SecurityContext = Depends(get_brand_mutation_context),
):
    """Soft-delete a menu item (sets status to 'archived'). Idempotent."""
    return await sales_service.archive_menu_item(ctx.organization_id, item_id)


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------

@router.get("/stats/today")
async def stats_today(ctx: SecurityContext = Depends(get_brand_context)):
    """Today's revenue, COGS, gross profit, and active category count."""
    return await sales_service.get_today_stats(ctx.organization_id, ctx.brand_id)


@router.get("/stats/week")
async def stats_week(ctx: SecurityContext = Depends(get_brand_context)):
    """Rolling 7-day stats vs previous 7 days: revenue, margin, best day."""
    return await sales_service.get_week_stats(ctx.organization_id, ctx.brand_id)


@router.get("/stats/menu")
async def stats_menu(ctx: SecurityContext = Depends(get_brand_context)):
    """Menu overview: total active dishes, top seller (30d), avg price, avg margin."""
    return await sales_service.get_menu_stats(ctx.organization_id, ctx.brand_id)


# ---------------------------------------------------------------------------
# Sale log & history
# ---------------------------------------------------------------------------

@router.post("/log", status_code=201)
async def log_sale(
    payload: SaleLogRequest,
    ctx: SecurityContext = Depends(get_brand_mutation_context),
):
    """Log a completed sale. Computes totals from current menu item prices/costs."""
    return await sales_service.log_sale(
        organization_id=ctx.organization_id,
        brand_id=ctx.brand_id,
        user_id=ctx.user_id,
        channel=payload.channel.value,
        items=[{"menu_item_id": i.menu_item_id, "quantity": i.quantity} for i in payload.items],
    )


@router.get("/history")
async def get_history(
    filter_date: Optional[date] = Query(None, alias="date"),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    channel: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    ctx: SecurityContext = Depends(get_brand_context),
):
    """Paginated sale order history. Filters: ?date=YYYY-MM-DD or ?start_date=&end_date=, ?channel=DINE_IN|TAKEAWAY|DELIVERY."""
    return await sales_service.get_history(
        ctx.organization_id, ctx.brand_id,
        filter_date, start_date, end_date,
        channel, page, limit,
    )


@router.get("/history/{order_id}")
async def get_order_detail(
    order_id: str,
    ctx: SecurityContext = Depends(get_brand_context),
):
    """Single sale order with all line items and menu item names expanded."""
    return await sales_service.get_order_detail(ctx.organization_id, order_id)
