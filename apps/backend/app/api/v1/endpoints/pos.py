from fastapi import APIRouter, Depends, Body
from app.services.pos_service import pos_service
from app.api.deps import get_restaurant_user

router = APIRouter()

@router.get("/menu")
async def get_menu(current_user: dict = Depends(get_restaurant_user)):
    """Get the active menu items for the restaurant"""
    return await pos_service.get_menu(current_user["organization_id"])

@router.post("/order")
async def place_order(
    menu_item_id: str = Body(..., embed=True),
    quantity: int = Body(1, embed=True),
    current_user: dict = Depends(get_restaurant_user)
):
    """Place an order and trigger automatic inventory deduction"""
    return await pos_service.place_order(current_user["organization_id"], menu_item_id, quantity)
