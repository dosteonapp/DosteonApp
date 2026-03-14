from fastapi import APIRouter, Depends, HTTPException, Header, Body
from app.schemas.auth import UserSignup, UserLogin, Token, MagicLinkRequest, ForgotPasswordRequest, PasswordResetConfirm, UserMe, RefreshTokenRequest
from app.services.auth_service import auth_service
from app.api.deps import oauth2_scheme

router = APIRouter()

@router.post("/signup")
async def signup(user_data: UserSignup):
    return await auth_service.signup(user_data)

@router.post("/login", response_model=Token)
async def login(login_data: UserLogin):
    return await auth_service.login(login_data)

@router.get("/me", response_model=UserMe)
async def get_me(token: str = Depends(oauth2_scheme)):
    return await auth_service.get_me(token)

@router.post("/onboard")
async def onboard_user(
    org_data: dict = Body(...), 
    token: str = Depends(oauth2_scheme)
):
    """Initialize organization and link to user profile"""
    return await auth_service.onboard_user(org_data, token)

@router.post("/refresh", response_model=Token)
async def refresh_token(request: RefreshTokenRequest):
    return await auth_service.refresh_token(request)

@router.post("/magic-link")
async def magic_link(request: MagicLinkRequest):
    return await auth_service.sign_in_with_magic_link(request)

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    return await auth_service.forgot_password(request)

@router.post("/reset-password")
async def reset_password(request: PasswordResetConfirm):
    return await auth_service.reset_password(request)

@router.get("/social-login/{provider}")
async def social_login(provider: str):
    return auth_service.get_social_login_url(provider)
