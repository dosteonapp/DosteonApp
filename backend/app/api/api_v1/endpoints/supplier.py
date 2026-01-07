from fastapi import APIRouter, Depends
from app.services.supplier_service import supplier_service
from app.api.deps import get_supplier_user

router = APIRouter()

@router.get("/stats")
async def get_supplier_stats(current_user: dict = Depends(get_supplier_user)):
    """Get supplier dashboard statistics"""
    return await supplier_service.get_stats(current_user["id"])

@router.get("/orders")
async def get_supplier_orders(current_user: dict = Depends(get_supplier_user)):
    """Get orders directed to this supplier"""
    return await supplier_service.get_orders(current_user["id"])

@router.get("/products")
async def get_supplier_products(current_user: dict = Depends(get_supplier_user)):
    """Get products managed by this supplier"""
    return await supplier_service.get_products(current_user["id"])
