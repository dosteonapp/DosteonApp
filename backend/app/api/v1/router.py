from fastapi import APIRouter
from app.api.v1.endpoints import auth, inventory, restaurant, pos, test_role, supplier, orders, metrics, admin, onboarding, brands, sales
from datetime import datetime

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(onboarding.router, prefix="/onboarding", tags=["onboarding"])
api_router.include_router(brands.router, prefix="/brands", tags=["brands"])
api_router.include_router(sales.router, prefix="/sales", tags=["sales"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(restaurant.router, prefix="/restaurant", tags=["restaurant"])
api_router.include_router(pos.router, prefix="/pos", tags=["pos"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(test_role.router, prefix="/test", tags=["test"])
api_router.include_router(metrics.router, tags=["metrics"])
api_router.include_router(admin.router)

@api_router.get("/health/live", tags=["system"])
async def liveness():
    """Liveness probe to confirm the app is running."""
    return {"status": "alive"}

@api_router.get("/health/ready", tags=["system"])
async def readiness():
    """Readiness probe to confirm DB + dependencies are ready."""
    from app.db.prisma import db
    try:
        # Check if database is connected or can be pinged
        if not db.is_connected():
            return {"status": "ready", "database": "disconnected"}
            
        # Optional: perform a simple query to verify DB responsiveness
        await db.execute_raw("SELECT 1")
        
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        return {"status": "ready", "database": "disconnected", "error": str(e)}

@api_router.get("/health", tags=["system"])
async def health():
    return {"status": "ok", "version": "1.0.0"}
