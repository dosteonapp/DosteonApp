from fastapi import APIRouter, Depends, Query, Request

from app.api.deps import get_brand_context, get_brand_mutation_context, SecurityContext
from app.core.rate_limit import limiter
from app.schemas.expense import ExpenseCreate
from app.services.expense_service import expense_service

router = APIRouter()


@router.post("", status_code=201)
@limiter.limit("20/minute")
async def create_expense(
    request: Request,
    payload: ExpenseCreate,
    ctx: SecurityContext = Depends(get_brand_mutation_context),
):
    """Log an expense. If type=INGREDIENT and quantity is provided, creates a
    RECEIVED InventoryEvent and increments current_stock on the matching
    ContextualProduct (case-insensitive name search). Returns
    inventory_updated=false with a descriptive note if no product is found."""
    return await expense_service.create_expense(
        org_id=ctx.organization_id,
        brand_id=ctx.brand_id,
        user_id=ctx.user_id,
        data=payload,
    )


@router.get("/stats/today")
async def expense_stats_today(ctx: SecurityContext = Depends(get_brand_context)):
    """Today's expense totals: total_expenses, cogs (INGREDIENT), overhead (OVERHEAD), count."""
    return await expense_service.get_today_stats(ctx.organization_id, ctx.brand_id)


@router.get("/stats/week")
async def expense_stats_week(ctx: SecurityContext = Depends(get_brand_context)):
    """Rolling 7-day expense totals vs prior 7 days, with per-day breakdown."""
    return await expense_service.get_week_stats(ctx.organization_id, ctx.brand_id)


@router.get("/history")
async def expense_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    days: int = Query(7, ge=1, le=90),
    ctx: SecurityContext = Depends(get_brand_context),
):
    """Paginated expense history. Use ?days=7|14|30 to set the lookback window."""
    return await expense_service.get_history(
        org_id=ctx.organization_id,
        brand_id=ctx.brand_id,
        page=page,
        limit=limit,
        days=days,
    )
