from fastapi import APIRouter, Depends, Query, Request
from app.schemas.inventory import InventoryItem, InventoryItemCreate, InventoryItemUpdate, CanonicalCatalogItem
from app.services.inventory_service import inventory_service
from typing import List
from app.api.deps import get_restaurant_user
from app.core.rate_limit import limiter

router = APIRouter()


@router.get("/catalog", response_model=List[CanonicalCatalogItem])
async def read_canonical_catalog(current_user: dict = Depends(get_restaurant_user)):
    """Read the full canonical global catalog"""
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
    current_user: dict = Depends(get_restaurant_user),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of items to return"),
):
    """Read inventory items for the organization with optional pagination."""
    return await inventory_service.get_inventory(current_user["organization_id"], skip=offset, limit=limit)


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