from app.core.supabase import supabase
from app.core.config import settings

from app.schemas.auth import UserSignup, UserLogin, MagicLinkRequest, ForgotPasswordRequest, PasswordResetConfirm, RefreshTokenRequest
from app.db.repositories.profile_repository import profile_repo
from app.db.repositories.organization_repository import organization_repo
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

            # 2. Create User via Admin API (Allows us to control email sending)
            user_res = supabase.auth.admin.create_user({
                "email": user_data.email,
                "password": user_data.password,
                "email_confirm": False, # We will send the link ourselves
                "user_metadata": {
                    "first_name": user_data.first_name,
                    "last_name": user_data.last_name,
                    "role": user_data.role,
                    "organization_id": str(org_id) if org_id else None
                }
            })

            if not user_res:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User creation failed")

            # 3. Generate Verification Link
            link_res = supabase.auth.admin.generate_link({
                "type": "signup",
                "email": user_data.email,
                "options": {"redirect_to": settings.AUTH_REDIRECT_URL}
            })

            if not link_res or not link_res.properties or not link_res.properties.action_link:
                # If link generation fails, fall back to simple signup (might hit rate limit)
                print("Link generation failed, falling back to standard signup")
                supabase.auth.sign_up({
                    "email": user_data.email,
                    "password": user_data.password,
                    "options": {"email_redirect_to": settings.AUTH_REDIRECT_URL}
                })
            else:
                # 4. Send Manual Email via Gmail SMTP
                verification_link = link_res.properties.action_link
                email_sent = email_service.send_verification_email(
                    user_data.email, 
                    verification_link, 
                    user_data.first_name
                )
                
                if not email_sent:
                   print(f"FAILED to send manual email to {user_data.email}")

            return {
                "status": "ok",
                "message": "Signup successful. Check email for confirmation link.",
                "user_id": user_res.id if hasattr(user_res, 'id') else None,
                "organization_id": org_id
            }

        except Exception as e:
            # Check for rate limit and provide a helpful message
            error_str = str(e)
            print(f"Signup error: {e}")
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

    async def get_me(self, current_user: dict):
        return {
            "id": current_user["id"],
            "email": current_user["email"],
            "role": current_user.get("role") or "staff",
            "first_name": current_user.get("first_name"),
            "last_name": current_user.get("last_name"),
            "organization_id": current_user.get("organization_id"),
            "team_id": current_user.get("team_id")
        }



    async def onboard_user(self, org_data: dict, current_user: dict):
        try:
            user_id = current_user["id"]
            user_metadata = {"role": current_user.get("role", "staff")}
            
            org_name = org_data.get("organization_name")
            if not org_name:
                raise HTTPException(status_code=400, detail="Organization name is required")

            # 2. Create Organization
            org = organization_repo.create(org_name)
            org_id = org["id"]

            # 3. Update User Profile in DB
            await profile_repo.update(user_id, {"organization_id": org_id})

            # 4. Sync metadata to Supabase Auth
            supabase.auth.admin.update_user_by_id(
                user_id,
                {"user_metadata": {**user_metadata, "organization_id": str(org_id)}}
            )

            return {"status": "ok", "organization_id": org_id, "message": "Onboarding completed"}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))


    async def forgot_password(self, request: ForgotPasswordRequest):
        try:
            supabase.auth.reset_password_for_email(request.email, {
                "redirect_to": settings.AUTH_REDIRECT_URL
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
                "options": {"email_redirect_to": settings.AUTH_REDIRECT_URL}
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
