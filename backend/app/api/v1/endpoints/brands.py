from fastapi import APIRouter, Depends, Response
from app.schemas.brand import BrandCreate, BrandUpdate, BrandOut
from app.services.brand_service import brand_service
from app.api.deps import get_current_user, get_security_context, SecurityContext
from app.core.csrf import set_csrf_cookie, verify_csrf
from typing import List

router = APIRouter()

# ---------------------------------------------------------------------------
# Read — no CSRF (GET)
# ---------------------------------------------------------------------------

@router.get("/", response_model=List[BrandOut])
async def list_brands(
    response: Response,
    ctx: SecurityContext = Depends(get_security_context),
):
    """List all active brands for the authenticated user's organisation."""
    set_csrf_cookie(response)
    return await brand_service.list_brands(ctx.organization_id)


# ---------------------------------------------------------------------------
# Mutations — require CSRF
# ---------------------------------------------------------------------------

@router.post("/", response_model=BrandOut, status_code=201)
async def create_brand(
    data: BrandCreate,
    ctx: SecurityContext = Depends(get_security_context),
    _csrf: None = Depends(verify_csrf),
):
    """Create a new brand under the authenticated user's organisation."""
    return await brand_service.create_brand(data, ctx.organization_id)


@router.patch("/{brand_id}", response_model=BrandOut)
async def update_brand(
    brand_id: str,
    data: BrandUpdate,
    ctx: SecurityContext = Depends(get_security_context),
    _csrf: None = Depends(verify_csrf),
):
    """Update a brand. Validates ownership before applying changes."""
    return await brand_service.update_brand(brand_id, data, ctx.organization_id)


@router.delete("/{brand_id}", status_code=204)
async def delete_brand(
    brand_id: str,
    ctx: SecurityContext = Depends(get_security_context),
    _csrf: None = Depends(verify_csrf),
):
    """Soft-delete a brand (sets deleted_at). Returns 400 if it is the last active brand."""
    await brand_service.delete_brand(brand_id, ctx.organization_id)
    return None
