from fastapi import APIRouter
from app.api.v1.endpoints import auth, inventory, restaurant, pos, test_role, supplier, orders
from datetime import datetime

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(restaurant.router, prefix="/restaurant", tags=["restaurant"])
api_router.include_router(pos.router, prefix="/pos", tags=["pos"])
api_router.include_router(supplier.router, prefix="/supplier", tags=["supplier"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(test_role.router, prefix="/test", tags=["test"])

@api_router.get("/health/live", tags=["system"])
async def liveness():
    """Liveness probe to confirm the app is running."""
    return {"status": "alive"}

@api_router.get("/health/ready", tags=["system"])
async def readiness():
    """Readiness probe — checks DB connection without using raw SQL (avoids PgBouncer prepared statement conflict)."""
    from app.db.prisma import db
    try:
        if not db.is_connected():
            return {"status": "ready", "database": "disconnected", "error": "Not connected"}
        # Use a Prisma model query instead of raw SQL to avoid prepared statement issues
        await db.organization.find_first()
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        return {"status": "ready", "database": "disconnected", "error": str(e)}

@api_router.get("/health", tags=["system"])
async def health():
    return {"status": "ok", "version": "1.0.0"}