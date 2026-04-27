"""
Onboarding endpoints — /api/v1/onboarding/*

All routes require authentication (Bearer token) + CSRF verification.
All writes are scoped to the authenticated user's organization_id.
"""
from fastapi import APIRouter, Depends, Request
from app.schemas.onboarding import (
    BusinessRequest,
    HoursRequest,
    MenuRequest,
    InventoryRequest,
    OnboardingCompleteResponse,
)
from app.services.onboarding_service import onboarding_service
from app.api.deps import get_current_user
from app.core.csrf import verify_csrf
from app.core.rate_limit import limiter
from fastapi import HTTPException, status

router = APIRouter()


def _require_org(current_user: dict) -> str:
    """Return organization_id or raise 400 if not set."""
    org_id = current_user.get("organization_id")
    if not org_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No organization linked to this account",
        )
    return str(org_id)


# ---------------------------------------------------------------------------
# Step 1 — Business details
# ---------------------------------------------------------------------------

@router.patch("/business")
@limiter.limit("30/minute")
async def save_business(
    request: Request,
    body: BusinessRequest,
    current_user: dict = Depends(get_current_user),
    _csrf: None = Depends(verify_csrf),
):
    org_id = _require_org(current_user)
    return await onboarding_service.save_business(body, org_id)


# ---------------------------------------------------------------------------
# Step 2 — Operating hours
# ---------------------------------------------------------------------------

@router.patch("/hours")
@limiter.limit("30/minute")
async def save_hours(
    request: Request,
    body: HoursRequest,
    current_user: dict = Depends(get_current_user),
    _csrf: None = Depends(verify_csrf),
):
    org_id = _require_org(current_user)
    return await onboarding_service.save_hours(body, org_id)


# ---------------------------------------------------------------------------
# Step 3 — Menu
# ---------------------------------------------------------------------------

@router.post("/menu")
@limiter.limit("30/minute")
async def save_menu(
    request: Request,
    body: MenuRequest,
    current_user: dict = Depends(get_current_user),
    _csrf: None = Depends(verify_csrf),
):
    org_id = _require_org(current_user)
    return await onboarding_service.save_menu(body, org_id)


# ---------------------------------------------------------------------------
# Step 4 — Core inventory
# ---------------------------------------------------------------------------

@router.post("/inventory")
@limiter.limit("30/minute")
async def save_inventory(
    request: Request,
    body: InventoryRequest,
    current_user: dict = Depends(get_current_user),
    _csrf: None = Depends(verify_csrf),
):
    org_id = _require_org(current_user)
    user_id = str(current_user["id"])
    return await onboarding_service.save_inventory(body, org_id, user_id)


# ---------------------------------------------------------------------------
# Complete — finalise onboarding
# ---------------------------------------------------------------------------

@router.post("/complete", response_model=OnboardingCompleteResponse)
@limiter.limit("10/minute")
async def complete_onboarding(
    request: Request,
    current_user: dict = Depends(get_current_user),
    _csrf: None = Depends(verify_csrf),
):
    org_id = _require_org(current_user)
    user_id = str(current_user["id"])
    return await onboarding_service.complete_onboarding(org_id, user_id)


# ---------------------------------------------------------------------------
# Progress — fetch current onboarding state for pre-fill on page load
# ---------------------------------------------------------------------------

@router.get("/progress")
async def get_onboarding_progress(
    current_user: dict = Depends(get_current_user),
):
    """Return whatever onboarding data has already been saved so the frontend
    can pre-fill forms and resume from the first incomplete step."""
    from app.db.prisma import db

    org_id = _require_org(current_user)

    org = await db.organization.find_unique(where={"id": org_id})
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    settings: dict = {}
    if org.settings and isinstance(org.settings, dict):
        settings = org.settings

    # Brands (sorted oldest-first so order is stable)
    brands = await db.brand.find_many(
        where={"organization_id": org_id},
        order={"created_at": "asc"},
    )
    brand_names = [b.name for b in brands]
    brand_objects = [{"id": str(b.id), "name": b.name} for b in brands]

    # Menu items (onboarding source only) — include brand_id so multi-brand menus restore correctly
    menu_items = await db.menuitem.find_many(
        where={"organization_id": org_id, "source": "onboarding"}
    )
    dishes = [
        {
            "name": m.name,
            "price": m.price,
            "category": m.category,
            "brand_id": str(m.brand_id) if m.brand_id else None,
        }
        for m in menu_items
    ]

    return {
        "step1": {
            "name": org.name,
            "phone": org.phone if hasattr(org, "phone") else None,
            "city": org.city if hasattr(org, "city") else None,
            "business_type": org.type,
            "daily_stock_count": org.daily_stock_count if hasattr(org, "daily_stock_count") else False,
            "has_multiple_brands": len(brand_names) > 1,
            "brands": brand_names,
            "brand_objects": brand_objects,   # [{id, name}] — used by frontend for per-brand menu tabs
        },
        "step2": {
            "operating_days": settings.get("operating_days", []),
        },
        "step3": {
            "dishes": dishes,
        },
        "onboarding_completed": current_user.get("onboarding_completed", False),
    }
