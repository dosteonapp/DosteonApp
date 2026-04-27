from fastapi import APIRouter, Depends, Body, Response, Request
from app.schemas.auth import (
    UserSignup, UserLogin, Token, MagicLinkRequest, ForgotPasswordRequest,
    PasswordResetConfirm, UserMe, RefreshTokenRequest, UserBase,
    ChangePasswordRequest,
)
from app.services.auth_service import auth_service
from app.api.deps import get_current_user, get_admin_context, SecurityContext
from app.core.rate_limit import limiter
from app.core.csrf import set_csrf_cookie, verify_csrf

router = APIRouter()

# ---------------------------------------------------------------------------
# Public endpoints — no CSRF (no session cookie to steal)
# ---------------------------------------------------------------------------

@router.post("/signup")
@limiter.limit("5/minute")
async def signup(request: Request, user_data: UserSignup):
    return await auth_service.signup(user_data)

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(request: Request, login_data: UserLogin):
    return await auth_service.login(login_data)

@router.post("/refresh", response_model=Token)
async def refresh_token(request: RefreshTokenRequest):
    return await auth_service.refresh_token(request)

@router.post("/magic-link")
@limiter.limit("3/minute")
async def magic_link(request: Request, body: MagicLinkRequest):
    return await auth_service.sign_in_with_magic_link(body)

@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(request: Request, body: ForgotPasswordRequest):
    return await auth_service.forgot_password(body)

@router.post("/reset-password")
@limiter.limit("3/minute")
async def reset_password(request: Request, body: PasswordResetConfirm):
    return await auth_service.reset_password(body)

@router.post("/resend-verification")
@limiter.limit("5/minute")
async def resend_verification(request: Request, body: UserBase):
    """Resend the signup email verification link for a given email address."""
    return await auth_service.resend_verification(body)

@router.get("/social-login/{provider}")
async def social_login(provider: str):
    return auth_service.get_social_login_url(provider)

# ---------------------------------------------------------------------------
# Authenticated GET — issues a fresh CSRF token via cookie
# ---------------------------------------------------------------------------

@router.get("/me", response_model=UserMe)
async def get_me(
    response: Response,
    current_user: dict = Depends(get_current_user),
):
    """Return the current user profile and refresh the CSRF token cookie."""
    set_csrf_cookie(response)
    return await auth_service.get_me(current_user)

# ---------------------------------------------------------------------------
# Authenticated mutations — require CSRF
# ---------------------------------------------------------------------------

@router.patch("/me")
async def update_me(
    profile_data: dict = Body(...),
    current_user: dict = Depends(get_current_user),
    _csrf: None = Depends(verify_csrf),
):
    return await auth_service.update_me(current_user["id"], profile_data)

@router.post("/change-password")
async def change_password(
    body: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
    _csrf: None = Depends(verify_csrf),
):
    return await auth_service.change_password(
        current_user["id"],
        current_user["email"],
        body.current_password,
        body.new_password,
    )

@router.delete("/account", status_code=204)
async def delete_account(
    ctx: SecurityContext = Depends(get_admin_context),
    _csrf: None = Depends(verify_csrf),
):
    """Permanently delete the authenticated owner's account (Owner/Manager only)."""
    await auth_service.delete_account(ctx.user)
    return None


@router.get("/export")
async def export_my_data(current_user: dict = Depends(get_current_user)):
    """GDPR Article 20 — data portability export.

    Returns all personal data held for the authenticated user:
    profile, organization, and inventory records.
    No CSRF required — this is a read-only GET.
    """
    return await auth_service.export_user_data(current_user)
