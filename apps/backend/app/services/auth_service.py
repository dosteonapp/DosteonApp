import asyncio
from datetime import datetime
from app.core.config import settings
from app.schemas.auth import UserSignup, UserLogin, MagicLinkRequest, ForgotPasswordRequest, PasswordResetConfirm, RefreshTokenRequest, UserBase
from app.db.repositories.profile_repository import profile_repo
from app.db.repositories.organization_repository import organization_repo
from app.services.email_service import email_service
from fastapi import HTTPException, status
import firebase_admin.auth as fb_auth

ROLE_MAP = {
    # Signup/onboarding
    "restaurant":           "OWNER",
    "supplier":             "OWNER",
    "admin":                "OWNER",
    # Invite role keys (from TeamInviteRequest)
    "owner_manager":        "MANAGER",
    "procurement_officer":  "CHEF",
    "kitchen_staff":        "STAFF",
    # Raw enum strings (idempotent round-trips)
    "OWNER":    "OWNER",
    "MANAGER":  "MANAGER",
    "CHEF":     "CHEF",
    "STAFF":    "STAFF",
    # Legacy lowercase aliases
    "manager":  "MANAGER",
    "staff":    "STAFF",
    "chef":     "CHEF",
}

def map_role(role: str) -> str:
    return ROLE_MAP.get(role, "STAFF")

def map_firebase_error(error_str: str) -> str:
    error_lower = error_str.lower()
    if "email-already-exists" in error_lower:
        return "An account with this email already exists. Please sign in instead."
    if "invalid-email" in error_lower:
        return "Please enter a valid email address."
    if "invalid-password" in error_lower:
        return "Password must be at least 6 characters long."
    return "Signup failed. Please check your details and try again."

class AuthService:
    async def _send_verification_email_background(self, user_data: UserSignup, org_id):
        try:
            # Generate Verification Link via Firebase Admin API
            verification_link = await asyncio.to_thread(
                lambda: fb_auth.generate_email_verification_link(user_data.email)
            )

            try:
                greeting_name = user_data.first_name or user_data.email.split('@')[0]
                email_service.send_verification_email(
                    user_data.email,
                    verification_link,
                    greeting_name,
                )
            except Exception as e:
                print(f"FAILED to send verification email to {user_data.email}: {e}")
        except Exception as e:
            print(f"Background verification email error for {user_data.email}: {e}")

    async def signup(self, user_data: UserSignup):
        try:
            # 1. Create Firebase user FIRST
            try:
                display_name = f"{user_data.first_name or ''} {user_data.last_name or ''}".strip()
                user_res = await asyncio.to_thread(lambda: fb_auth.create_user(
                    email=user_data.email,
                    password=user_data.password,
                    email_verified=False,
                    display_name=display_name if display_name else None,
                ))
            except Exception as e:
                error_str = str(e)
                print(f"Firebase auth.create_user failed: {error_str}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=map_firebase_error(error_str)
                )

            user_id = str(user_res.uid)

            # 2. Firebase user exists — now safe to create the organization.
            _prefix = (user_data.email.split('@')[0] or "my").replace('.', ' ').replace('_', ' ').title()
            default_org_name = f"{_prefix}'s Restaurant"
            org = await organization_repo._create_async(default_org_name)
            org_id = org["id"]

            # 3. Write org_id back to Firebase custom claims
            try:
                await asyncio.to_thread(lambda: fb_auth.set_custom_user_claims(
                    user_id,
                    {
                        "first_name": user_data.first_name,
                        "last_name": user_data.last_name,
                        "role": user_data.role,
                        "organization_id": str(org_id),
                    }
                ))
            except Exception as meta_err:
                print(f"[signup] custom claims update warning for {user_data.email}: {meta_err}")

            # 4. Map role to valid Prisma enum value
            prisma_role = map_role(user_data.role)

            # 5. Create Profile row in Prisma DB
            from app.db.prisma import db

            try:
                await db.profile.update_many(
                    where={
                        "email": user_data.email,
                        "id": {"not": user_id},
                        "deleted_at": None,
                    },
                    data={"deleted_at": datetime.utcnow()},
                )
            except Exception as dedupe_err:
                print(f"Profile dedupe warning for {user_data.email}: {dedupe_err}")

            await db.profile.upsert(
                where={"id": user_id},
                data={
                    "create": {
                        "id": user_id,
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

            # 6. Auto-create a default Brand
            try:
                await db.brand.create(data={
                    "name": default_org_name,
                    "organization_id": str(org_id),
                    "is_active": True,
                })
            except Exception as brand_err:
                print(f"[signup] Brand auto-creation warning for org {org_id}: {brand_err}")

            # 7. Kick off verification email in the background
            async def _email_with_timeout():
                try:
                    await asyncio.wait_for(
                        self._send_verification_email_background(user_data, org_id),
                        timeout=30.0
                    )
                except asyncio.TimeoutError:
                    print(f"[email] Verification email timed out for {user_data.email}")
            asyncio.create_task(_email_with_timeout())

            return {
                "status": "ok",
                "message": "Signup successful. Check email for confirmation link.",
                "user_id": user_id,
                "organization_id": str(org_id)
            }

        except HTTPException:
            raise
        except Exception as e:
            error_str = str(e)
            print(f"Signup error: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Signup failed. Please try again."
            )

    async def login(self, login_data: UserLogin):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Login should be performed via the Firebase Client SDK."
        )

    async def resend_verification(self, user_data: UserBase):
        from app.core.login_tracker import check_resend_cooldown, record_resend_attempt
        await check_resend_cooldown(user_data.email)
        try:
            from app.db.prisma import db
            first_name: str = "there"
            try:
                profile = await db.profile.find_first(
                    where={"email": user_data.email, "deleted_at": None},
                    order={"created_at": "desc"},
                )
                if profile and getattr(profile, "first_name", None):
                    first_name = profile.first_name
            except Exception:
                pass

            verification_link = await asyncio.to_thread(
                lambda: fb_auth.generate_email_verification_link(user_data.email)
            )

            try:
                email_service.send_verification_email(
                    user_data.email,
                    verification_link,
                    first_name,
                )
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="We couldn't send the verification email. Please try again later.",
                )

            await record_resend_attempt(user_data.email)
            return {
                "status": "ok",
                "message": "If an account exists for this email, a new verification link has been sent.",
            }
        except Exception:
            return {
                "status": "ok",
                "message": "If an account exists for this email, a new verification link has been sent.",
            }

    async def get_me(self, current_user: dict):
        from app.db.prisma import db
        org_id = current_user.get("organization_id")
        workspace_slug = None
        daily_stock_count = None
        if org_id:
            try:
                org = await db.organization.find_unique(where={"id": str(org_id)})
                if org:
                    workspace_slug = org.slug
                    daily_stock_count = org.daily_stock_count
            except Exception:
                pass

        return {
            "id": current_user["id"],
            "email": current_user["email"],
            "role": current_user.get("role") or "STAFF",
            "first_name": current_user.get("first_name"),
            "last_name": current_user.get("last_name"),
            "avatar_url": current_user.get("avatar_url"),
            "organization_id": current_user.get("organization_id"),
            "team_id": current_user.get("team_id"),
            "onboarding_completed": current_user.get("onboarding_completed"),
            "onboarding_skipped": current_user.get("onboarding_skipped"),
            "email_verified": current_user.get("email_verified"),
            "password_changed_at": current_user.get("password_changed_at"),
            "workspace_slug": workspace_slug,
            "daily_stock_count": daily_stock_count,
        }

    async def update_me(self, user_id: str, profile_data: dict):
        updated = await profile_repo.update(user_id, profile_data)
        try:
            # Re-fetch current claims to preserve them
            user_record = await asyncio.to_thread(lambda: fb_auth.get_user(user_id))
            current_claims = user_record.custom_claims or {}
            current_claims.update(profile_data)
            await asyncio.to_thread(lambda: fb_auth.set_custom_user_claims(
                user_id,
                current_claims
            ))
        except Exception as e:
            print(f"[update_me] Firebase claims sync failed for {user_id}: {e}")
        return updated

    async def delete_account(self, current_user: dict) -> None:
        from app.db.prisma import db
        from app.core.logging import get_logger

        logger = get_logger("auth.delete_account")

        user_id = str(current_user.get("id"))
        org_id = current_user.get("organization_id")

        if org_id:
            org_id_str = str(org_id)
            try:
                await db.organization.update(
                    where={"id": org_id_str},
                    data={
                        "deleted_at": datetime.utcnow(),
                        "name": f"Deleted Organization {org_id_str}",
                    },
                )
            except Exception as e:
                logger.error("Failed to soft-delete organization", extra={"extra_context": {"organization_id": org_id_str, "error": str(e)}})

            try:
                await db.inventoryevent.update_many(
                    where={"organization_id": org_id_str},
                    data={"organization_id": None},
                )
            except Exception as e:
                logger.error("Failed to anonymize inventory events", extra={"extra_context": {"organization_id": org_id_str, "error": str(e)}})

        if user_id:
            try:
                anonymized_email = f"deleted+{user_id}@example.invalid"
                await db.profile.update(
                    where={"id": user_id},
                    data={
                        "email": anonymized_email,
                        "first_name": None,
                        "last_name": None,
                        "avatar_url": None,
                        "deleted_at": datetime.utcnow(),
                    },
                )
            except Exception as e:
                logger.error("Failed to soft-delete profile", extra={"extra_context": {"user_id": user_id, "error": str(e)}})

        if user_id:
            try:
                await asyncio.to_thread(lambda: fb_auth.delete_user(user_id))
            except Exception as e:
                logger.error("Failed to delete Firebase user", extra={"extra_context": {"user_id": user_id, "error": str(e)}})

    async def forgot_password(self, request: ForgotPasswordRequest):
        from app.db.prisma import db

        first_name: str = "there"

        try:
            try:
                profile = await db.profile.find_first(
                    where={"email": request.email, "deleted_at": None},
                    order={"created_at": "desc"},
                )
                if profile and getattr(profile, "first_name", None):
                    first_name = profile.first_name
            except Exception:
                pass

            try:
                reset_link = await asyncio.to_thread(
                    lambda: fb_auth.generate_password_reset_link(request.email)
                )
            except Exception as e:
                print(f"Forgot password link generation error for {request.email}: {e}")
                return {
                    "status": "ok",
                    "message": "If an account exists for this email, a password reset link has been sent.",
                }

            try:
                email_service.send_password_reset_email(
                    request.email,
                    reset_link,
                    first_name,
                )
            except Exception as e:
                print(
                    "Forgot password: failed to send reset email to",
                    request.email,
                    e,
                )

            return {
                "status": "ok",
                "message": "If an account exists for this email, a password reset link has been sent.",
            }
        except Exception as e:
            print(f"Forgot password unexpected error for {request.email}: {e}")
            return {
                "status": "ok",
                "message": "If an account exists for this email, a password reset link has been sent.",
            }

    async def reset_password(self, request: PasswordResetConfirm):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset should be performed via the Firebase Client SDK."
        )

    async def change_password(self, user_id: str, user_email: str, current_password: str, new_password: str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Change password should be performed via the Firebase Client SDK."
        )

    async def sign_in_with_magic_link(self, request: MagicLinkRequest):
        try:
            from app.db.prisma import db
            first_name: str = "there"
            try:
                profile = await db.profile.find_first(
                    where={"email": request.email, "deleted_at": None},
                    order={"created_at": "desc"},
                )
                if profile and getattr(profile, "first_name", None):
                    first_name = profile.first_name
            except Exception:
                pass

            magic_link = await asyncio.to_thread(
                lambda: fb_auth.generate_sign_in_with_email_link(
                    request.email,
                    fb_auth.ActionCodeSettings(url=settings.AUTH_REDIRECT_URL)
                )
            )

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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token refresh should be performed via the Firebase Client SDK."
        )

    def get_social_login_url(self, provider: str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Social login should be performed via the Firebase Client SDK."
        )

    async def export_user_data(self, current_user: dict) -> dict:
        from app.db.prisma import db

        user_id = str(current_user["id"])
        org_id = str(current_user.get("organization_id") or "")

        profile_data = None
        org_data = None
        products = []
        events = []

        try:
            p = await db.profile.find_unique(where={"id": user_id})
            if p:
                profile_data = {
                    "id": p.id,
                    "email": p.email,
                    "first_name": p.first_name,
                    "last_name": p.last_name,
                    "role": p.role.value if hasattr(p.role, "value") else str(p.role),
                    "created_at": p.created_at.isoformat() if p.created_at else None,
                }
        except Exception:
            pass

        if org_id:
            try:
                o = await db.organization.find_unique(where={"id": org_id})
                if o:
                    org_data = {
                        "id": o.id,
                        "name": o.name,
                        "address": o.address,
                        "created_at": o.created_at.isoformat() if o.created_at else None,
                    }
            except Exception:
                pass

            try:
                raw_products = await db.contextualproduct.find_many(
                    where={"organization_id": org_id, "is_active": True}
                )
                products = [
                    {
                        "id": cp.id,
                        "name": cp.name,
                        "sku": cp.sku,
                        "current_stock": cp.current_stock,
                        "created_at": cp.created_at.isoformat() if cp.created_at else None,
                    }
                    for cp in raw_products
                ]
            except Exception:
                pass

            try:
                raw_events = await db.inventoryevent.find_many(
                    where={"organization_id": org_id},
                    order={"created_at": "desc"},
                    take=1000,
                )
                events = [
                    {
                        "id": e.id,
                        "event_type": e.event_type.value if hasattr(e.event_type, "value") else str(e.event_type),
                        "quantity": e.quantity,
                        "unit": e.unit,
                        "occurred_at": e.occurred_at.isoformat() if e.occurred_at else None,
                    }
                    for e in raw_events
                ]
            except Exception:
                pass

        return {
            "exported_at": datetime.utcnow().isoformat(),
            "user": profile_data,
            "organization": org_data,
            "inventory_products": products,
            "inventory_events": events,
        }

auth_service = AuthService()