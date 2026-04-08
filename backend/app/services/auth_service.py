import asyncio
from datetime import datetime
from app.core.supabase import supabase
from app.core.config import settings
from app.core.metrics import ONBOARDING_COMPLETED_COUNTER
from app.core.retry import with_retry
from app.schemas.auth import UserSignup, UserLogin, MagicLinkRequest, ForgotPasswordRequest, PasswordResetConfirm, RefreshTokenRequest, UserBase
from app.db.repositories.profile_repository import profile_repo
from app.db.repositories.organization_repository import organization_repo
from app.services.email_service import email_service
from fastapi import HTTPException, status

# Map frontend role values to valid Prisma UserRole enum values.
# DB roles: OWNER / MANAGER (full access), CHEF (Procurement Officer), STAFF (Kitchen Staff)
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
                    # Service role key is missing — fall back to public sign_up.
                    # Supabase may return 500 if its built-in SMTP isn't configured
                    # (our project relies on Resend via the admin flow). Catch that
                    # specific error so we can still complete signup and send our
                    # own verification email via the background task below.
                    try:
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
                    except Exception as fallback_e:
                        fallback_err = str(fallback_e).lower()
                        # If the only failure was Supabase's own email sending,
                        # check whether the user was still created and continue.
                        if "error sending confirmation email" in fallback_err or "confirmation email" in fallback_err:
                            print(f"Fallback sign_up email error (non-fatal): {fallback_e}")
                            # Try to recover the created user via admin lookup
                            try:
                                recovered = supabase.auth.admin.get_user_by_email(user_data.email)
                                if recovered and recovered.user:
                                    # Simulate the shape downstream code expects
                                    class _FakeRes:
                                        user = recovered.user
                                    user_res = _FakeRes()
                                else:
                                    raise HTTPException(
                                        status_code=status.HTTP_400_BAD_REQUEST,
                                        detail="User creation failed. Please try again."
                                    )
                            except HTTPException:
                                raise
                            except Exception:
                                raise HTTPException(
                                    status_code=status.HTTP_400_BAD_REQUEST,
                                    detail="User creation failed. Please try again."
                                )
                        else:
                            raise
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

            # 4a. Soft-delete any existing profile rows for this email that
            #     belong to different Supabase user IDs. This prevents
            #     duplicate active profiles when a Supabase user has been
            #     deleted and re-created or when historical data exists.
            try:
                await db.profile.update_many(
                    where={
                        "email": user_data.email,
                        "id": {"not": str(user_res.user.id)},
                        "deleted_at": None,
                    },
                    data={"deleted_at": datetime.utcnow()},
                )
            except Exception as dedupe_err:  # pragma: no cover - safety net
                # Never break signup on best-effort deduplication.
                print(f"Profile dedupe warning for {user_data.email}: {dedupe_err}")

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

            # 5. Kick off verification email in the background so the
            #    signup response can return quickly. Wrapped with a 30s
            #    timeout so hung email tasks don't accumulate silently.
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
        from app.core.login_tracker import check_lockout, record_failure, reset_attempts

        # Reject locked-out accounts before touching Supabase (anti-enumeration safe)
        await check_lockout(login_data.email)

        try:
            auth_response = supabase.auth.sign_in_with_password({
                "email": login_data.email,
                "password": login_data.password
            })

            if not auth_response.user or not auth_response.session:
                await record_failure(login_data.email)
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password."
                )

            # Successful login — clear any accumulated failures
            await reset_attempts(login_data.email)

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
            await record_failure(login_data.email)
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
                profile = await db.profile.find_first(
                    where={"email": user_data.email, "deleted_at": None},
                    order={"created_at": "desc"},
                )
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
            "avatar_url": current_user.get("avatar_url"),
            "organization_id": current_user.get("organization_id"),
            "team_id": current_user.get("team_id"),
            "onboarding_completed": current_user.get("onboarding_completed"),
            "onboarding_skipped": current_user.get("onboarding_skipped"),
            "email_verified": current_user.get("email_verified"),
            "password_changed_at": current_user.get("password_changed_at"),
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

    async def delete_account(self, current_user: dict) -> None:
        """Delete the authenticated user's account and anonymize operational data.

        This is an OWNER/MANAGER-only operation, enforced at the API layer.
        The flow is best-effort: failures in one step should not prevent
        the others from running, but all errors are logged.
        """
        from app.db.prisma import db
        from app.core.logging import get_logger

        logger = get_logger("auth.delete_account")

        user_id = str(current_user.get("id"))
        org_id = current_user.get("organization_id")

        # 1. Delete Supabase auth user (best-effort)
        if user_id:
            try:
                supabase.auth.admin.delete_user(user_id)
            except Exception as e:  # pragma: no cover - defensive logging
                logger.error("Failed to delete Supabase user", extra={"extra_context": {"user_id": user_id, "error": str(e)}})

        # 2. Soft-delete and anonymize Profile
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
            except Exception as e:  # pragma: no cover - defensive logging
                logger.error("Failed to soft-delete profile", extra={"extra_context": {"user_id": user_id, "error": str(e)}})

        # 3. Soft-delete Organization and anonymize InventoryEvents
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
            except Exception as e:  # pragma: no cover - defensive logging
                logger.error("Failed to soft-delete organization", extra={"extra_context": {"organization_id": org_id_str, "error": str(e)}})

            try:
                await db.inventoryevent.update_many(
                    where={"organization_id": org_id_str},
                    data={"organization_id": None},
                )
            except Exception as e:  # pragma: no cover - defensive logging
                logger.error("Failed to anonymize inventory events", extra={"extra_context": {"organization_id": org_id_str, "error": str(e)}})

    async def onboard_user(self, org_data: dict, current_user: dict):
        """Required onboarding — all 5 fields must be provided.

                Fields expected in org_data:
                    organization_name       (str, required)
                    address                 (str, required)
                    opening_time            (str HH:MM, required)
                    closing_time            (str HH:MM, required)
                    selected_canonical_ids  (list[str], required, min 1)
                    opening_quantities      (dict[canonical_id, float], optional)
        """
        try:
            user_id = current_user["id"]
            org_id = current_user.get("organization_id")

            # If the profile exists but is not linked to an organization yet,
            # create a default organization on-the-fly so onboarding can
            # complete instead of failing with a 400.
            if not org_id:
                fallback_name = (org_data.get("organization_name") or current_user.get("first_name") or "New Restaurant").strip()
                org = await organization_repo._create_async(fallback_name or "New Restaurant")
                org_id = org["id"]

                # Persist the organization link on the profile for future requests.
                await profile_repo.update(user_id, {"organization_id": str(org_id)})

                # Best-effort: ensure Supabase user_metadata also carries org ID.
                try:
                    supabase.auth.admin.update_user_by_id(
                        user_id,
                        {"user_metadata": {"organization_id": str(org_id)}}
                    )
                except Exception:
                    # Never fail onboarding purely because metadata sync failed.
                    pass

            org_name = (org_data.get("organization_name") or "").strip()
            address = (org_data.get("address") or "").strip()
            phone = (org_data.get("phone") or "").strip()
            opening_time = (org_data.get("opening_time") or "").strip()
            closing_time = (org_data.get("closing_time") or "").strip()
            selected_ids: list = org_data.get("selected_canonical_ids") or []
            opening_quantities: dict | None = org_data.get("opening_quantities") or None

            missing = []
            if not org_name:
                missing.append("organization_name")
            if not address:
                missing.append("address")
            if not opening_time:
                missing.append("opening_time")
            if not closing_time:
                missing.append("closing_time")
            if not selected_ids:
                missing.append("selected_canonical_ids")

            if missing:
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing required fields: {', '.join(missing)}",
                )

            # Critical organization update — wrap in retry/backoff to
            # ride out brief database connectivity issues.
            await with_retry(
                lambda: organization_repo.update(
                    org_id,
                    {
                        "name": org_name,
                        "address": address,
                        "phone": phone,
                        "opening_time": opening_time,
                        "closing_time": closing_time,
                    },
                )
            )

            from app.db.repositories.inventory_repository import inventory_repo
            # 1. Create contextual products for the selected canonical items.
            # These bulk writes are critical to opening flows, so we add
            # retry/backoff to tolerate transient DB errors.
            await with_retry(
                lambda: inventory_repo.create_from_canonical_selection(
                    str(org_id), selected_ids
                )
            )

            # 1b. For legacy organizations that previously had the full
            #     canonical catalog bootstrapped, deactivate any
            #     legacy-bootstrapped items that were *not* selected
            #     during this onboarding step so that core inventory
            #     reflects the user's choices.
            try:
                from uuid import UUID  # Local import to avoid polluting module scope
                from app.db.prisma import db

                org_id_str = str(org_id)

                # Normalize and validate canonical IDs to protect the
                # raw SQL we are about to build.
                normalized: set[str] = set()
                for cid in selected_ids:
                    try:
                        normalized.add(str(UUID(str(cid))))
                    except Exception:
                        continue

                if normalized:
                    values_clause = ",".join(f"'{cid}'::uuid" for cid in normalized)
                    trim_query = f"""
UPDATE contextual_products
SET is_active = FALSE,
    status = 'archived'
WHERE organization_id = '{org_id_str}'
  AND metadata ->> 'legacy_bootstrapped' = 'true'
  AND canonical_product_id NOT IN ({values_clause});
"""
                    await db.execute_raw(trim_query)
            except Exception:
                # Never fail onboarding purely because legacy inventory
                # trimming is unavailable; the user can still operate on
                # the full set of items.
                pass

            # 2. If opening quantities were provided, translate canonical IDs
            #    to contextual IDs and seed opening stock via bulk events.
            if opening_quantities:
                from app.db.prisma import db

                canonical_ids = [cid for cid in selected_ids if cid in opening_quantities]
                if canonical_ids:
                    ctx_products = await db.contextualproduct.find_many(
                        where={
                            "organization_id": str(org_id),
                            "canonical_product_id": {"in": canonical_ids},
                        }
                    )

                    ctx_counts: dict[str, float] = {}
                    for p in ctx_products:
                        qty = float(opening_quantities.get(p.canonical_product_id) or 0)
                        if qty > 0:
                            ctx_counts[p.id] = qty

                    if ctx_counts:
                        await with_retry(
                            lambda: inventory_repo.bulk_add_opening_events(
                                str(org_id), ctx_counts
                            )
                        )

            supabase.auth.admin.update_user_by_id(
                user_id,
                {"user_metadata": {"organization_id": str(org_id), "onboarding_completed": True}}
            )

            # Increment onboarding completion counter for observability
            try:
                ONBOARDING_COMPLETED_COUNTER.inc()
            except Exception:
                # Metrics must never break the main flow
                pass

            return {
                "status": "ok",
                "organization_id": org_id,
                "message": "Onboarding completed"
            }
        except HTTPException:
            raise
        except Exception as e:
            # Treat unexpected failures (e.g. database connectivity) as
            # server-side errors so the frontend can surface them as
            # backend issues rather than client input problems.
            raise HTTPException(status_code=500, detail=str(e))

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
                profile = await db.profile.find_first(
                    where={"email": request.email, "deleted_at": None},
                    order={"created_at": "desc"},
                )
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
            user_res = supabase.auth.get_user(request.access_token)
            if not user_res or not user_res.user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired reset token."
                )
            supabase.auth.admin.update_user_by_id(
                user_res.user.id,
                {"password": request.new_password}
            )
            return {"message": "Password updated successfully"}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

    async def change_password(self, user_id: str, user_email: str, current_password: str, new_password: str):
        try:
            # Verify current password by re-authenticating
            try:
                supabase.auth.sign_in_with_password({
                    "email": user_email,
                    "password": current_password
                })
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Current password is incorrect."
                )

            # Update password via admin API, recording the change timestamp
            supabase.auth.admin.update_user_by_id(
                user_id,
                {
                    "password": new_password,
                    "user_metadata": {"password_changed_at": datetime.utcnow().isoformat()},
                }
            )
            return {"message": "Password updated successfully"}
        except HTTPException:
            raise
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
                profile = await db.profile.find_first(
                    where={"email": request.email, "deleted_at": None},
                    order={"created_at": "desc"},
                )
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