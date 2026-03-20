from app.core.supabase import supabase
from app.core.config import settings

from app.schemas.auth import UserSignup, UserLogin, MagicLinkRequest, ForgotPasswordRequest, PasswordResetConfirm, RefreshTokenRequest
from app.db.repositories.profile_repository import profile_repo
from app.db.repositories.organization_repository import organization_repo
from app.services.email_service import email_service
from fastapi import HTTPException, status
from uuid import UUID

# Map frontend role values to valid Prisma UserRole enum values
ROLE_MAP = {
    "restaurant": "OWNER",
    "supplier": "OWNER",
    "admin": "OWNER",
    "manager": "MANAGER",
    "staff": "STAFF",
    "chef": "CHEF",
    "OWNER": "OWNER",
    "MANAGER": "MANAGER",
    "CHEF": "CHEF",
    "STAFF": "STAFF",
}

def map_role(role: str) -> str:
    """Safely convert any frontend role string to a valid Prisma UserRole."""
    return ROLE_MAP.get(role, "STAFF")


class AuthService:
    async def signup(self, user_data: UserSignup):
        try:
            # 1. Create a default organization.
            # If user skips onboarding, this default name stays until they
            # update it in Settings. If they complete onboarding, it gets renamed.
            default_org_name = f"{user_data.first_name}'s Restaurant"
            org = await organization_repo._create_async(default_org_name)
            org_id = org["id"]

            # 2. Create User via Supabase Admin API
            user_res = supabase.auth.admin.create_user({
                "email": user_data.email,
                "password": user_data.password,
                "email_confirm": False,
                "user_metadata": {
                    "first_name": user_data.first_name,
                    "last_name": user_data.last_name,
                    "role": user_data.role,
                    "organization_id": str(org_id)
                }
            })

            if not user_res or not user_res.user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User creation failed"
                )

            # 3. Map role to valid Prisma enum value
            prisma_role = map_role(user_data.role)

            # 4. Create Profile row in Prisma DB
            from app.db.prisma import db
            await db.profile.upsert(
                where={"id": str(user_res.user.id)},
                data={
                    "create": {
                        "id": str(user_res.user.id),
                        "email": user_data.email,
                        "first_name": user_data.first_name,
                        "last_name": user_data.last_name,
                        "role": prisma_role,
                        "organization_id": str(org_id),
                    },
                    "update": {
                        "organization_id": str(org_id),
                    }
                }
            )

            # 5. Bootstrap inventory for new org
            from app.db.repositories.inventory_repository import inventory_repo
            await inventory_repo.bootstrap_organization(str(org_id))

            # 6. Generate Verification Link
            link_res = supabase.auth.admin.generate_link({
                "type": "signup",
                "email": user_data.email,
                "options": {"redirect_to": settings.AUTH_REDIRECT_URL}
            })

            if not link_res or not link_res.properties or not link_res.properties.action_link:
                print("Link generation failed, falling back to standard signup")
                supabase.auth.sign_up({
                    "email": user_data.email,
                    "password": user_data.password,
                    "options": {"email_redirect_to": settings.AUTH_REDIRECT_URL}
                })
            else:
                # 7. Send verification email via Gmail SMTP
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
                "user_id": str(user_res.user.id),
                "organization_id": str(org_id)
            }

        except HTTPException:
            raise
        except Exception as e:
            error_str = str(e)
            print(f"Signup error: {e}")
            if "email rate limit exceeded" in error_str:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Email rate limit hit. Please configure Google SMTP in Supabase Dashboard."
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_str
            )

    async def login(self, login_data: UserLogin):
        try:
            auth_response = supabase.auth.sign_in_with_password({
                "email": login_data.email,
                "password": login_data.password
            })

            if not auth_response.user or not auth_response.session:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials"
                )

            return {
                "access_token": auth_response.session.access_token,
                "refresh_token": auth_response.session.refresh_token,
                "token_type": "bearer",
                "user": {
                    "id": auth_response.user.id,
                    "email": auth_response.user.email,
                    "role": auth_response.user.user_metadata.get("role", "STAFF"),
                    "first_name": auth_response.user.user_metadata.get("first_name"),
                    "last_name": auth_response.user.user_metadata.get("last_name"),
                    "organization_id": auth_response.user.user_metadata.get("organization_id")
                }
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e)
            )

    async def get_me(self, current_user: dict):
        return {
            "id": current_user["id"],
            "email": current_user["email"],
            "role": current_user.get("role") or "STAFF",
            "first_name": current_user.get("first_name"),
            "last_name": current_user.get("last_name"),
            "organization_id": current_user.get("organization_id"),
            "team_id": current_user.get("team_id")
        }

    async def update_me(self, user_id: str, profile_data: dict):
        updated = await profile_repo.update(user_id, profile_data)
        try:
            supabase.auth.admin.update_user_by_id(
                user_id,
                {"user_metadata": profile_data}
            )
        except:
            pass
        return updated

    async def onboard_user(self, org_data: dict, current_user: dict):
        """
        Called from the onboarding page when user customizes their org name.
        If skipped, the default org name set at signup remains and can be
        changed anytime from Settings.
        """
        try:
            user_id = current_user["id"]
            org_id = current_user.get("organization_id")
            org_name = org_data.get("organization_name", "").strip()

            if not org_id:
                raise HTTPException(
                    status_code=400,
                    detail="No organization linked to this user"
                )

            # Only update if user provided a non-empty name
            if org_name:
                await organization_repo.update(org_id, {"name": org_name})

            # Sync org_id to Supabase metadata
            supabase.auth.admin.update_user_by_id(
                user_id,
                {"user_metadata": {"organization_id": str(org_id)}}
            )

            return {
                "status": "ok",
                "organization_id": org_id,
                "message": "Onboarding completed"
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def forgot_password(self, request: ForgotPasswordRequest):
        try:
            supabase.auth.reset_password_for_email(request.email, {
                "redirect_to": settings.AUTH_REDIRECT_URL
            })
            return {"message": "Password reset link sent to your email"}
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

    async def reset_password(self, request: PasswordResetConfirm):
        try:
            supabase.auth.set_session(request.access_token, "")
            supabase.auth.update_user({"password": request.new_password})
            return {"message": "Password updated successfully"}
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

    async def sign_in_with_magic_link(self, request: MagicLinkRequest):
        try:
            supabase.auth.sign_in_with_otp({
                "email": request.email,
                "options": {"email_redirect_to": settings.AUTH_REDIRECT_URL}
            })
            return {"message": "Magic link sent to your email"}
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

    async def refresh_token(self, request: RefreshTokenRequest):
        try:
            res = supabase.auth.refresh_session(request.refresh_token)
            if not res.session:
                raise HTTPException(status_code=401, detail="Invalid refresh token")
            return {
                "access_token": res.session.access_token,
                "refresh_token": res.session.refresh_token,
                "token_type": "bearer",
                "user": {
                    "id": res.user.id,
                    "email": res.user.email,
                    "role": res.user.user_metadata.get("role", "STAFF"),
                    "first_name": res.user.user_metadata.get("first_name"),
                    "last_name": res.user.user_metadata.get("last_name"),
                    "organization_id": res.user.user_metadata.get("organization_id")
                }
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=401, detail=str(e))

    def get_social_login_url(self, provider: str):
        try:
            res = supabase.auth.sign_in_with_oauth({
                "provider": provider,
                "options": {"redirect_to": "http://localhost:3000/auth/callback"}
            })
            return {"url": res.url}
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )


auth_service = AuthService()