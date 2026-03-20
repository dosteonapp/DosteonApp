from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from app.core.security import verify_supabase_token
from app.db.repositories.profile_repository import profile_repo
from app.core.logging import get_logger
from typing import List

logger = get_logger("deps")
security = HTTPBearer()

async def get_current_user(credentials=Depends(security)):
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
        logger.warning(f"Profile not found for {payload.get('email')} — auto-creating")
        try:
            from app.db.prisma import db
            from app.db.repositories.organization_repository import organization_repo
            import asyncio

            # Create a default org for this user
            first_name = payload.get("user_metadata", {}).get("first_name") or \
                         payload.get("email", "User").split("@")[0]
            org = await organization_repo._create_async(f"{first_name}'s Restaurant")
            org_id = org["id"]

            # Bootstrap inventory in background
            from app.db.repositories.inventory_repository import inventory_repo
            asyncio.create_task(inventory_repo.bootstrap_organization(str(org_id)))

            # Create profile
            await db.profile.create(
                data={
                    "id": payload["id"],
                    "email": payload["email"],
                    "first_name": payload.get("user_metadata", {}).get("first_name"),
                    "last_name": payload.get("user_metadata", {}).get("last_name"),
                    "role": "OWNER",
                    "organization_id": str(org_id),
                }
            )

            # Sync org_id back to Supabase metadata
            from app.core.supabase import supabase
            supabase.auth.admin.update_user_by_id(
                payload["id"],
                {"user_metadata": {"organization_id": str(org_id)}}
            )

            profile = await profile_repo.get_profile_by_id(payload["id"])
        except Exception as e:
            logger.error(f"Auto-create profile failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User profile not found and could not be created. Please contact support.",
            )

    return profile


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


# Helper instances
RESTAURANT_ROLES = ["OWNER", "MANAGER", "CHEF", "STAFF"]
get_restaurant_user = RoleChecker(RESTAURANT_ROLES)
get_admin_user = RoleChecker(["OWNER", "MANAGER"])
get_manager_user = RoleChecker(["OWNER", "MANAGER"])
get_supplier_user = RoleChecker(["SUPPLIER"])