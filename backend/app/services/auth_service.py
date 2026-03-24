import asyncio
from app.core.supabase import supabase
from app.core.config import settings
from app.schemas.auth import UserSignup, UserLogin, MagicLinkRequest, ForgotPasswordRequest, PasswordResetConfirm, RefreshTokenRequest, UserBase
from app.db.repositories.profile_repository import profile_repo
from app.db.repositories.organization_repository import organization_repo
from app.services.email_service import email_service
from fastapi import HTTPException, status

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
    return ROLE_MAP.get(role, "STAFF")

# Human-readable error messages for known Supabase errors
SUPABASE_ERROR_MAP = {
    "email address has already been registered": "An account with this email already exists. Please sign in instead.",
    "email rate limit exceeded": "Too many signup attempts. Please wait a few minutes and try again.",
    "invalid email": "Please enter a valid email address.",
    "password should be at least": "Password must be at least 8 characters long.",
    "unable to validate email address": "This email address could not be validated. Please try a different one.",
    "error sending confirmation email": "We couldn't send a confirmation email right now. Please try again in a few minutes or contact support.",
}

def map_supabase_error(error_str: str) -> str:
    error_lower = error_str.lower()
    for key, message in SUPABASE_ERROR_MAP.items():
        if key in error_lower:
            return message
    return "Signup failed. Please check your details and try again."


class AuthService:
    async def _send_verification_email_background(self, user_data: UserSignup, org_id):
        """Generate verification link and send email in the background.

        This runs outside the main signup response path so slow email providers
        or occasional Supabase slowness don't block the user-facing request.
        """
        try:
            # Generate Verification Link via Supabase Admin API
            link_res = supabase.auth.admin.generate_link({
                "type": "signup",
                "email": user_data.email,
                "options": {"redirect_to": settings.AUTH_REDIRECT_URL}
            })

            if not link_res or not link_res.properties or not link_res.properties.action_link:
                print("Link generation failed, falling back to standard signup email flow")
                # Fall back to Supabase's built-in email flow
                supabase.auth.sign_up({
                    "email": user_data.email,
                    "password": user_data.password,
                    "options": {"email_redirect_to": settings.AUTH_REDIRECT_URL}
                })
                return

            verification_link = link_res.properties.action_link
            try:
                email_service.send_verification_email(
                    user_data.email,
                    verification_link,
                    user_data.first_name,
                )
            except Exception as e:
                # Log but never break signup if background email sending fails.
                print(f"FAILED to send verification email to {user_data.email}: {e}")
        except Exception as e:
            # Never break signup if email sending fails; just log.
            print(f"Background verification email error for {user_data.email}: {e}")

    async def signup(self, user_data: UserSignup):
        try:
            # 1. Create a default organization.
            # If user skips onboarding, this name stays until updated in Settings.
            default_org_name = f"{user_data.first_name}'s Restaurant"
            org = await organization_repo._create_async(default_org_name)
            org_id = org["id"]

            # 2. Create User via Supabase Admin API
            try:
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
            except Exception as e:
                error_str = str(e)
                print(f"Supabase admin.create_user failed: {error_str}")

                # Fall back to the standard sign_up flow if the service role
                # key is not allowed (e.g. using anon key in any environment).
                # This keeps signup working even if SUPABASE_SERVICE_ROLE_KEY
                # is missing or misconfigured in production.
                if "user not allowed" in error_str.lower():
                    fallback_res = supabase.auth.sign_up({
                        "email": user_data.email,
                        "password": user_data.password,
                        "options": {
                            "email_redirect_to": settings.AUTH_REDIRECT_URL,
                            "data": {
                                "first_name": user_data.first_name,
                                "last_name": user_data.last_name,
                                "role": user_data.role,
                                "organization_id": str(org_id),
                            },
                        },
                    })
                    user_res = fallback_res
                else:
                    # In non-dev environments or for other errors, propagate
                    # so we can surface a proper signup failure.
                    raise

            if not user_res or not user_res.user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User creation failed. Please try again."
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

            # 5. Bootstrap inventory in background — don't block signup response.
            # This prevents the ~15s timeout caused by 58 sequential DB inserts.
            from app.db.repositories.inventory_repository import inventory_repo
            asyncio.create_task(inventory_repo.bootstrap_organization(str(org_id)))

            # 6. Kick off verification email in the background so the
            #    signup response can return quickly.
            asyncio.create_task(self._send_verification_email_background(user_data, org_id))

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
            if "rate limit" in error_str.lower():
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many signup attempts. Please wait a few minutes and try again."
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=map_supabase_error(error_str)
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
                    detail="Invalid email or password."
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
            error_str = str(e).lower()
            if "invalid" in error_str or "credentials" in error_str or "password" in error_str:
                detail = "Invalid email or password."
            elif "email not confirmed" in error_str:
                detail = "Please verify your email before signing in."
            else:
                detail = "Login failed. Please try again."
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=detail
            )

    async def resend_verification(self, user_data: UserBase):
        """Resend email verification link for an existing user.

        This is used by the signup confirmation screen's "Resend verification email" action.
        The behavior is intentionally idempotent: if the email does not exist or is already
        verified, we do not leak that information to the caller; we just return a generic
        success message as long as Supabase doesn't hard-fail the request.
        """
        try:
            from app.db.prisma import db

            # Try to get a friendly first_name from the profile table for personalization.
            first_name: str = "there"
            try:
                profile = await db.profile.find_first(where={"email": user_data.email})
                if profile and getattr(profile, "first_name", None):
                    first_name = profile.first_name
            except Exception:
                # If profile lookup fails, we fall back to a generic greeting.
                pass

            # Generate a fresh email verification link via Supabase Admin API.
            link_res = supabase.auth.admin.generate_link({
                "type": "signup",
                "email": user_data.email,
                "options": {"redirect_to": settings.AUTH_REDIRECT_URL},
            })

            if not link_res or not link_res.properties or not link_res.properties.action_link:
                # If link generation fails entirely, surface a friendly error.
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Could not generate verification link. Please try again later.",
                )

            verification_link = link_res.properties.action_link
            try:
                email_service.send_verification_email(
                    user_data.email,
                    verification_link,
                    first_name,
                )
            except Exception:
                # Surface a friendly error if email sending fails.
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="We couldn't send the verification email. Please try again later.",
                )

            return {
                "status": "ok",
                "message": "If an account exists for this email, a new verification link has been sent.",
            }

        except HTTPException:
            raise
        except Exception as e:
            error_str = str(e)
            print(f"Resend verification error: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=map_supabase_error(error_str),
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
        Skippable onboarding — updates the default org name if user provides one.
        If skipped, the default org name stays and can be changed in Settings.
        """
        try:
            user_id = current_user["id"]
            org_id = current_user.get("organization_id")
            org_name = org_data.get("organization_name", "").strip()

            if not org_id:
                raise HTTPException(
                    status_code=400,
                    detail="No organization linked to this user."
                )

            if org_name:
                await organization_repo.update(org_id, {"name": org_name})

            supabase.auth.admin.update_user_by_id(
                user_id,
			{"user_metadata": {"organization_id": str(org_id), "onboarding_completed": True}}
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
        """Initiate a password reset flow.

        This endpoint is intentionally idempotent and non-leaky:
        - It does not reveal whether an email exists in the system.
        - Operational issues with Supabase or email providers are treated as
          soft failures: we log them but still return 200 with a generic
          success message so the UI never sees a hard 4xx/5xx.
        """

        from app.db.prisma import db

        # Default friendly name in case profile lookup fails.
        first_name: str = "there"

        try:
            try:
                profile = await db.profile.find_first(where={"email": request.email})
                if profile and getattr(profile, "first_name", None):
                    first_name = profile.first_name
            except Exception:
                # Profile lookup is best-effort only; never fail the flow on this.
                pass

            # Choose redirect URL based on account_type so that recovery
            # links land on the correct reset-password page.
            base_redirect = settings.AUTH_REDIRECT_URL
            if request.account_type == "supplier":
                redirect_url = f"{base_redirect}?account_type=supplier"
            else:
                redirect_url = base_redirect

            try:
                link_res = supabase.auth.admin.generate_link({
                    "type": "recovery",
                    "email": request.email,
                    "options": {"redirect_to": redirect_url}
                })
            except Exception as e:
                # Log Supabase issues but don't surface raw details to the client.
                print(f"Forgot password link generation error for {request.email}: {e}")
                # Fall through to generic success response below.
                return {
                    "status": "ok",
                    "message": "If an account exists for this email, a password reset link has been sent.",
                }

            if not link_res or not link_res.properties or not link_res.properties.action_link:
                print(
                    "Forgot password: Supabase returned no action_link for",
                    request.email,
                )
                return {
                    "status": "ok",
                    "message": "If an account exists for this email, a password reset link has been sent.",
                }

            reset_link = link_res.properties.action_link
            try:
                email_service.send_password_reset_email(
                    request.email,
                    reset_link,
                    first_name,
                )
            except Exception as e:
                # Log operational issues but keep the endpoint idempotent and non-leaky.
                print(
                    "Forgot password: failed to send reset email to",
                    request.email,
                    e,
                )

            # Always return a generic success message so the client
            # never sees a hard error or learns whether the email exists.
            return {
                "status": "ok",
                "message": "If an account exists for this email, a password reset link has been sent.",
            }
        except Exception as e:
            # Catch-all: log, but still respond 200 with generic message.
            print(f"Forgot password unexpected error for {request.email}: {e}")
            return {
                "status": "ok",
                "message": "If an account exists for this email, a password reset link has been sent.",
            }

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
            from app.db.prisma import db

            first_name: str = "there"
            try:
                profile = await db.profile.find_first(where={"email": request.email})
                if profile and getattr(profile, "first_name", None):
                    first_name = profile.first_name
            except Exception:
                pass

            link_res = supabase.auth.admin.generate_link({
                "type": "magiclink",
                "email": request.email,
                "options": {"redirect_to": settings.AUTH_REDIRECT_URL},
            })

            if not link_res or not link_res.properties or not link_res.properties.action_link:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Could not generate magic link. Please try again later.",
                )

            magic_link = link_res.properties.action_link
            try:
                email_service.send_magic_link_email(
                    request.email,
                    magic_link,
                    first_name,
                )
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="We couldn't send the magic link email. Please try again later.",
                )

            return {"message": "Magic link sent to your email"}
        except HTTPException:
            raise
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
				"options": {"redirect_to": settings.AUTH_REDIRECT_URL}
            })
            return {"url": res.url}
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )


auth_service = AuthService()