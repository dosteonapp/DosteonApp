from fastapi import APIRouter, Depends, Query, Request
from app.schemas.inventory import (
    InventoryItem, InventoryItemCreate, InventoryItemUpdate, CanonicalCatalogItem,
    InventoryProductItem, InventoryStats,
    StockUsageStats, StockUsageEvent,
    ConsumptionCreate, WasteCreate,
)
from app.services.inventory_service import inventory_service
from typing import List, Optional
from app.api.deps import (
    get_restaurant_user, get_optional_user,
    get_brand_context, get_brand_mutation_context,
    SecurityContext,
)
from app.core.rate_limit import limiter

router = APIRouter()


# ---------------------------------------------------------------------------
# Enhanced product list (Product Catalog tab)
# ---------------------------------------------------------------------------

@router.get("/products", response_model=List[InventoryProductItem])
async def read_products(
    ctx:      SecurityContext      = Depends(get_brand_context),
    search:   Optional[str]        = Query(None, description="Search by name or SKU"),
    category: Optional[str]        = Query(None, description="Filter by category"),
):
    """Enhanced product list with brand, status classification, search/filter."""
    return await inventory_service.get_products(
        ctx.organization_id,
        brand_id=ctx.brand_id,
        search=search,
        category=category,
    )


@router.get("/stats", response_model=InventoryStats)
async def read_inventory_stats(ctx: SecurityContext = Depends(get_brand_context)):
    """Return items_in_stock / healthy / low / critical counts with last-week trend."""
    return await inventory_service.get_stats(ctx.organization_id, brand_id=ctx.brand_id)


# ---------------------------------------------------------------------------
# Stock Usage tab
# ---------------------------------------------------------------------------

@router.get("/stock-usage/stats", response_model=StockUsageStats)
async def read_stock_usage_stats(ctx: SecurityContext = Depends(get_brand_context)):
    """Today's consumption + waste totals and top items."""
    return await inventory_service.get_stock_usage_stats(
        ctx.organization_id, brand_id=ctx.brand_id
    )


@router.get("/stock-usage/history", response_model=List[StockUsageEvent])
async def read_stock_usage_history(
    ctx:   SecurityContext = Depends(get_brand_context),
    limit: int             = Query(10, ge=1, le=50),
):
    """Recent USED / WASTED events for the Kitchen Service History feed."""
    return await inventory_service.get_stock_usage_history(
        ctx.organization_id, brand_id=ctx.brand_id, limit=limit
    )


@router.post("/stock-usage/consumption", status_code=201)
@limiter.limit("120/minute")
async def log_consumption(
    request: Request,
    data:    ConsumptionCreate,
    ctx:     SecurityContext = Depends(get_brand_mutation_context),
):
    """Log a USED event for a product (decrements current_stock)."""
    event = await inventory_service.log_consumption(
        ctx.organization_id, ctx.brand_id, data, actor_id=ctx.user_id
    )
    return {"id": event.id, "status": "logged"}


@router.post("/stock-usage/waste", status_code=201)
@limiter.limit("120/minute")
async def log_waste(
    request: Request,
    data:    WasteCreate,
    ctx:     SecurityContext = Depends(get_brand_mutation_context),
):
    """Log a WASTED event for a product (decrements current_stock)."""
    event = await inventory_service.log_waste(
        ctx.organization_id, ctx.brand_id, data, actor_id=ctx.user_id
    )
    return {"id": event.id, "status": "logged"}


# ---------------------------------------------------------------------------
# Canonical catalog
# ---------------------------------------------------------------------------

@router.get("/catalog", response_model=List[CanonicalCatalogItem])
async def read_canonical_catalog(current_user: dict | None = Depends(get_optional_user)):
    """Read the full canonical global catalog.

    This endpoint is readable without authentication so onboarding step 3
    can display the global catalog even before a full session is established.
    When Authorization is present, it will still be validated.
    """
    return await inventory_service.get_catalog()


@router.get("/catalog/search")
async def search_canonical_catalog(
    q: str = Query(default="", description="Search term for product name or SKU"),
    current_user: dict = Depends(get_restaurant_user)
):
    """
    Search the global catalog for suggestions.
    Excludes items already active in this org's inventory.
    """
    return await inventory_service.search_catalog(q, current_user["organization_id"])


@router.get("/", response_model=List[InventoryItem])
async def read_inventory(
    ctx: SecurityContext = Depends(get_brand_context),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of items to return"),
):
    """Read inventory items for the organisation, scoped to the resolved brand.

    Pass X-Brand-ID header to select a specific brand. Omit it to use the
    default (first active brand). Rows with brand_id=null are always included
    for backwards compatibility.
    """
    return await inventory_service.get_inventory(
        ctx.organization_id, skip=offset, limit=limit, brand_id=ctx.brand_id
    )


@router.post("/", response_model=InventoryItem)
@limiter.limit("60/minute")
async def create_item(
    request: Request,
    item: InventoryItemCreate,
    current_user: dict = Depends(get_restaurant_user)
):
    """Add a new inventory item to the organization"""
    return await inventory_service.add_item(current_user["organization_id"], item)


@router.patch("/{item_id}", response_model=InventoryItem)
@limiter.limit("120/minute")
async def update_item(
    request: Request,
    item_id: str,
    item: InventoryItemUpdate,
    current_user: dict = Depends(get_restaurant_user)
):
    """Update an existing inventory item"""
    return await inventory_service.update_item(item_id, item)


@router.delete("/{item_id}")
@limiter.limit("60/minute")
async def delete_item(
    request: Request,
    item_id: str,
    current_user: dict = Depends(get_restaurant_user)
):
    """Remove an inventory item"""
    await inventory_service.remove_item(current_user["organization_id"], item_id)
    return {"status": "success"}