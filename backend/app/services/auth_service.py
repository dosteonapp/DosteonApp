from app.core.supabase import supabase
from app.schemas.auth import UserSignup, UserLogin, MagicLinkRequest, ForgotPasswordRequest, PasswordResetConfirm, RefreshTokenRequest
from app.repositories.profile_repository import profile_repo
from app.repositories.organization_repository import organization_repo
from app.services.email_service import email_service # New Integration
from fastapi import HTTPException, status
from uuid import UUID

class AuthService:
    async def signup(self, user_data: UserSignup):
        try:
            org_id = None
            
            # 1. Create Organization (if Admin)
            if user_data.organization_name:
                org = organization_repo.create(user_data.organization_name)
                org_id = org["id"]
            elif user_data.invite_code:
                org_id = user_data.invite_code

            # 2. Signup User (Using Supabase Auth)
            # We use native sign_up first. 
            # If rate limit is hit, the error "email rate limit exceeded" is returned.
            # To BRING BACK the Google App Integration for email sending:
            # We catch that error or use the "Admin" method to send manually.
            
            # --- GOOGLE APP INTEGRATION FLOW ---
            # We want to skip Supabase's built-in email and use Gmail SMTP
            # This is done by creating the user and then generating an Invite/Signup link.
            
            res = supabase.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password,
                "options": {
                    "email_redirect_to": "http://localhost:3000/auth/callback",
                    "data": {
                        "first_name": user_data.first_name,
                        "last_name": user_data.last_name,
                        "role": user_data.role,
                        "organization_id": org_id
                    }
                }
            })
            
            if res.user is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Signup failed")

            # --- OPTIONAL: MANUAL EMAIL RE-SEND (IF INTEGRATED) ---
            # If you want to MANUALLY send the email to bypass Supabase's SMTP limits:
            # verification_link = supabase.auth.admin.generate_link({
            #     "type": "signup",
            #     "email": user_data.email,
            #     "options": {"redirectTo": "http://localhost:3000/auth/callback"}
            # }).properties.action_link
            # email_service.send_verification_email(user_data.email, verification_link, user_data.first_name)

            return {
                "status": "ok",
                "message": "Signup successful. Check email for confirmation link.",
                "user_id": res.user.id,
                "organization_id": org_id
            }
        except Exception as e:
            # Check for rate limit and provide a helpful message
            error_str = str(e)
            if "email rate limit exceeded" in error_str:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS, 
                    detail="Email rate limit hit. (Please configure Google SMTP in Supabase Dashboard to bypass this limit and restore full integration.)"
                )
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_str)

    async def login(self, login_data: UserLogin):
        try:
            auth_response = supabase.auth.sign_in_with_password({
                "email": login_data.email,
                "password": login_data.password
            })
            
            if not auth_response.user or not auth_response.session:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

            return {
                "access_token": auth_response.session.access_token,
                "refresh_token": auth_response.session.refresh_token,
                "token_type": "bearer",
                "user": {
                    "id": auth_response.user.id,
                    "email": auth_response.user.email,
                    "role": auth_response.user.user_metadata.get("role", "staff"),
                    "first_name": auth_response.user.user_metadata.get("first_name"),
                    "last_name": auth_response.user.user_metadata.get("last_name"),
                    "organization_id": auth_response.user.user_metadata.get("organization_id")
                }
            }
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    async def get_me(self, token: str):
        try:
            user_response = supabase.auth.get_user(token)
            if not user_response.user:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")
                
            return {
                "id": user_response.user.id,
                "email": user_response.user.email,
                "role": user_response.user.user_metadata.get("role"),
                "first_name": user_response.user.user_metadata.get("first_name"),
                "last_name": user_response.user.user_metadata.get("last_name"),
                "organization_id": user_response.user.user_metadata.get("organization_id"),
                "team_id": user_response.user.user_metadata.get("team_id")
            }
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    async def forgot_password(self, request: ForgotPasswordRequest):
        try:
            supabase.auth.reset_password_for_email(request.email, {
                "redirect_to": "http://localhost:3000/auth/callback"
            })
            return {"message": "Password reset link sent to your email"}
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    async def reset_password(self, request: PasswordResetConfirm):
        try:
            supabase.auth.set_session(request.access_token, "") 
            supabase.auth.update_user({"password": request.new_password})
            return {"message": "Password updated successfully"}
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    async def sign_in_with_magic_link(self, request: MagicLinkRequest):
        try:
            supabase.auth.sign_in_with_otp({
                "email": request.email,
                "options": {"email_redirect_to": "http://localhost:3000/auth/callback"}
            })
            return {"message": "Magic link sent to your email"}
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    def get_social_login_url(self, provider: str):
        try:
            res = supabase.auth.sign_in_with_oauth({
                "provider": provider,
                "options": {"redirect_to": "http://localhost:3000/auth/callback"}
            })
            return {"url": res.url}
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

auth_service = AuthService()
