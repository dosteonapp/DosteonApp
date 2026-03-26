from fastapi import APIRouter, Depends, HTTPException, Header, Body
from app.schemas.auth import UserSignup, UserLogin, Token, MagicLinkRequest, ForgotPasswordRequest, PasswordResetConfirm, UserMe, RefreshTokenRequest, UserBase, OnboardRequest
from app.services.auth_service import auth_service
from app.api.deps import get_current_user, get_optional_user
from app.core.rate_limit import limiter
from fastapi import Request

router = APIRouter()

@router.post("/signup")
@limiter.limit("5/minute")
async def signup(request: Request, user_data: UserSignup):
    return await auth_service.signup(user_data)

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(request: Request, login_data: UserLogin):
    return await auth_service.login(login_data)

@router.get("/me", response_model=UserMe)
async def get_me(current_user: dict = Depends(get_current_user)):
    return await auth_service.get_me(current_user)

@router.patch("/me")
async def update_me(
    profile_data: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    return await auth_service.update_me(current_user["id"], profile_data)

@router.post("/onboard")
async def onboard_user(
    org_data: OnboardRequest,
    current_user: dict | None = Depends(get_optional_user),
):
    """Initialize organization and link to user profile.

    If the user is authenticated, we update their organization name.
    If unauthenticated (e.g. coming from a stale link), we treat this as a
    skipped onboarding step and return a harmless success so the UI can
    continue the flow.
    """
    if not current_user:
        return {
            "status": "ok",
            "organization_id": None,
            "message": "Onboarding skipped (user not authenticated)",
        }

    return await auth_service.onboard_user(org_data.model_dump(exclude_unset=False), current_user)

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
async def reset_password(request: PasswordResetConfirm):
    return await auth_service.reset_password(request)

@router.post("/resend-verification")
@limiter.limit("5/minute")
async def resend_verification(request: Request, body: UserBase):
    """Resend the signup email verification link for a given email address."""
    return await auth_service.resend_verification(body)

@router.get("/social-login/{provider}")
async def social_login(provider: str):
    return auth_service.get_social_login_url(provider)
