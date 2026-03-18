from fastapi import APIRouter, Depends, HTTPException
from app.schemas.orders import Order, OrderCreate, OrderUpdate
from app.services.order_service import order_service
from typing import List

router = APIRouter()

@router.get("/", response_model=List[Order])
async def read_orders(user_id: str):
    return await order_service.get_orders(user_id)

@router.post("/", response_model=Order)
async def create_order(user_id: str, order: OrderCreate):
    return await order_service.create_order(user_id, order)

@router.patch("/{order_id}", response_model=Order)
async def update_order(order_id: str, order: OrderUpdate):
    return await order_service.update_order(order_id, order)
