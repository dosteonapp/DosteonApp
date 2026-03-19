from fastapi import APIRouter, Depends, Query
from app.schemas.inventory import InventoryItem, InventoryItemCreate, InventoryItemUpdate, CanonicalCatalogItem
from app.services.inventory_service import inventory_service
from typing import List
from app.api.deps import get_restaurant_user

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
async def read_inventory(current_user: dict = Depends(get_restaurant_user)):
    """Read all inventory items for the organization"""
    return await inventory_service.get_inventory(current_user["organization_id"])


@router.post("/", response_model=InventoryItem)
async def create_item(
    item: InventoryItemCreate,
    current_user: dict = Depends(get_restaurant_user)
):
    """Add a new inventory item to the organization"""
    return await inventory_service.add_item(current_user["organization_id"], item)


@router.patch("/{item_id}", response_model=InventoryItem)
async def update_item(
    item_id: str,
    item: InventoryItemUpdate,
    current_user: dict = Depends(get_restaurant_user)
):
    """Update an existing inventory item"""
    return await inventory_service.update_item(item_id, item)


@router.delete("/{item_id}")
async def delete_item(
    item_id: str,
    current_user: dict = Depends(get_restaurant_user)
):
    """Remove an inventory item"""
    await inventory_service.remove_item(item_id)
    return {"status": "success"}