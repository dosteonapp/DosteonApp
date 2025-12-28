from fastapi import APIRouter, Depends, HTTPException
from app.schemas.inventory import Inventory, InventoryCreate, InventoryUpdate
from app.services.inventory_service import inventory_service
from typing import List

from app.api.deps import get_current_user
from app.schemas.auth import Profile

router = APIRouter()

@router.get("/", response_model=List[Inventory])
async def read_inventory(current_user: Profile = Depends(get_current_user)):
    return await inventory_service.get_inventory(current_user.id)

@router.post("/", response_model=Inventory)
async def create_item(item: InventoryCreate, current_user: Profile = Depends(get_current_user)):
    return await inventory_service.add_item(current_user.id, item)

@router.patch("/{item_id}", response_model=Inventory)
async def update_item(item_id: str, item: InventoryUpdate, current_user: Profile = Depends(get_current_user)):
    return await inventory_service.update_item(item_id, item)

@router.delete("/{item_id}")
async def delete_item(item_id: str, current_user: Profile = Depends(get_current_user)):
    await inventory_service.remove_item(item_id)
    return {"status": "success"}
