from fastapi import Depends, HTTPException, Header, status
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials
from app.core.security import verify_supabase_token
from app.db.repositories.profile_repository import profile_repo
from app.core.logging import get_logger, set_log_user_context
from app.core.config import settings
from typing import List, Optional
from uuid import UUID

logger = get_logger("deps")
security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)


async def _resolve_user_from_credentials(credentials: HTTPAuthorizationCredentials) -> dict:
    token = credentials.credentials
    payload = await verify_supabase_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 1. Try to get profile by ID
    profile = await profile_repo.get_profile_by_id(payload["id"])

    # 2. Fallback: try by email (handles users created before profile fix)
    if not profile and "email" in payload:
        profile = await profile_repo.get_profile_by_email(payload["email"])

    # 3. Auto-create profile if still not found
    # This handles users who signed up via Supabase directly or before the fix
    if not profile:
        email = payload.get("email")
        logger.warning(f"Profile not found for {email} — auto-creating")

        from app.db.prisma import db  # noqa: F401 (kept for engine init side effects)
        from app.db.repositories.organization_repository import organization_repo
        from app.core.supabase import supabase
        import asyncio

        user_id = payload["id"]
        metadata = payload.get("user_metadata") or {}
        first_name = metadata.get("first_name") or (email.split("@")[0] if email else "User")
        last_name = metadata.get("last_name")

        async def ensure_profile_and_org() -> dict:
            # If another request just created the profile, reuse it
            existing = await profile_repo.get_profile_by_id(user_id)
            if existing:
                return existing

            # Try to reuse organization from Supabase metadata when present
            org_id = metadata.get("organization_id")
            if org_id:
                try:
                    org = await organization_repo._get_by_id_async(UUID(org_id))
                    if org is None:
                        org_id = None
                    else:
                        org_id = org["id"]
                except Exception:
                    org_id = None

            # Create a default organization if none is available
            if not org_id:
                org = await organization_repo._create_async(f"{first_name}'s Restaurant")
                org_id = org["id"]

            # NOTE: inventory is NOT bootstrapped here.
            # ContextualProducts are created only from the user's onboarding selection.

            # Create or update profile idempotently
            profile_data = {
                "id": user_id,
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "role": "OWNER",
                "organization_id": str(org_id),
            }
            profile_obj = await profile_repo.create_profile(profile_data)

            # Ensure Supabase user_metadata carries the organization_id
            current_org_meta = metadata.get("organization_id")
            if current_org_meta != str(org_id):
                supabase.auth.admin.update_user_by_id(
                    user_id,
                    {"user_metadata": {**metadata, "organization_id": str(org_id)}},
                )

            return profile_obj

        # Small, bounded retry to handle transient connection issues / races
        last_error: Exception | None = None
        for attempt in range(2):
            try:
                profile = await ensure_profile_and_org()
                if profile:
                    break
            except Exception as e:  # pragma: no cover - defensive logging path
                last_error = e
                logger.error(
                    f"Auto-create profile attempt {attempt + 1} failed for {email}: {e}",
                )

                # If a parallel request succeeded in the meantime, reuse that profile
                existing = await profile_repo.get_profile_by_id(user_id)
                if existing:
                    profile = existing
                    break

                # Brief backoff before a final retry
                if attempt == 0:
                    await asyncio.sleep(0.2)

        if not profile:
            logger.error(f"Auto-create profile failed: {last_error or ''}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found and could not be created. Please contact support.",
            )

    # Attach selected Supabase user_metadata flags to the profile dict so
    # downstream callers (e.g. /auth/me) can expose them without having
    # to re-fetch the Supabase user.
    metadata = payload.get("user_metadata") or {}
    try:
        profile["onboarding_completed"] = metadata.get("onboarding_completed")
        profile["onboarding_skipped"] = metadata.get("onboarding_skipped")
        profile["email_verified"] = metadata.get("email_verified")
        profile["password_changed_at"] = metadata.get("password_changed_at")
    except TypeError:
        # In case profile is not directly mutable, fall back to a plain dict
        profile = {
            **dict(profile),
            "onboarding_completed": metadata.get("onboarding_completed"),
            "onboarding_skipped": metadata.get("onboarding_skipped"),
            "email_verified": metadata.get("email_verified"),
            "password_changed_at": metadata.get("password_changed_at"),
        }

    # Populate structured log context for this request
    try:
        set_log_user_context(
            str(profile.get("id")) if profile.get("id") else None,
            str(profile.get("organization_id")) if profile.get("organization_id") else None,
        )
    except Exception:
        # Logging context should never break auth resolution
        pass

    return profile


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return await _resolve_user_from_credentials(credentials)


async def get_optional_user(credentials: HTTPAuthorizationCredentials | None = Depends(optional_security)):
    """Return the current user when Authorization is present; otherwise None.

    Used for endpoints where authentication is preferred but onboarding can be skipped.
    """
    if not credentials:
        return None
    return await _resolve_user_from_credentials(credentials)


class SecurityContext:
    def __init__(self, user: dict):
        self.user = user

    @property
    def user_id(self) -> str:
        return str(self.user.get("id")) if self.user.get("id") else None

    @property
    def organization_id(self) -> str:
        return str(self.user.get("organization_id")) if self.user.get("organization_id") else None

    @property
    def role(self) -> str:
        return self.user.get("role")


class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: dict = Depends(get_current_user)):
        if user["role"] not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user['role']}' does not have access to this resource"
            )
        return user


# ---------------------------------------------------------------------------
# Role groups
# ---------------------------------------------------------------------------
# OWNER / MANAGER  → full access (settings, team, inventory, kitchen)
# CHEF             → Procurement Officer: inventory write + kitchen
# STAFF            → Kitchen Staff: kitchen only (read-only inventory)
# ---------------------------------------------------------------------------

# Human-readable display names exposed to the API (e.g. in error messages)
ROLE_LABELS: dict[str, str] = {
    "OWNER":    "Owner",
    "MANAGER":  "Manager",
    "CHEF":     "Procurement Officer",
    "STAFF":    "Kitchen Staff",
}

RESTAURANT_ROLES = ["OWNER", "MANAGER", "CHEF", "STAFF"]

# All authenticated restaurant users (read-only operations)
get_restaurant_user = RoleChecker(RESTAURANT_ROLES)

# Owner / Manager only (settings, team management)
get_admin_user = RoleChecker(["OWNER", "MANAGER"])
get_manager_user = RoleChecker(["OWNER", "MANAGER"])

# Inventory writers: Owner, Manager, and Procurement Officer (CHEF)
get_inventory_writer = RoleChecker(["OWNER", "MANAGER", "CHEF"])

get_supplier_user = RoleChecker(["SUPPLIER"])


async def get_security_context(user: dict = Depends(get_restaurant_user)) -> SecurityContext:
    """Standard security context for restaurant endpoints (any authenticated role)."""
    return SecurityContext(user)


async def get_admin_context(user: dict = Depends(get_admin_user)) -> SecurityContext:
    """Security context for Owner/Manager-only endpoints (settings, team)."""
    return SecurityContext(user)


async def get_inventory_write_context(user: dict = Depends(get_inventory_writer)) -> SecurityContext:
    """Security context for inventory write endpoints.

    Allowed roles: OWNER, MANAGER, CHEF (Procurement Officer).
    Kitchen Staff (STAFF) receive 403.
    """
    return SecurityContext(user)


def require_admin_key(x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key")):
    """Validate the internal admin API key header.

    Used to protect Dosteon-internal product review endpoints.
    Set ADMIN_API_KEY in backend .env to enable.
    """
    if not settings.ADMIN_API_KEY:
        raise HTTPException(status_code=503, detail="Admin API not configured on this server.")
    if x_admin_key != settings.ADMIN_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid or missing X-Admin-Key header.")