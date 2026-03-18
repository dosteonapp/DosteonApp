from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from app.core.security import verify_supabase_token
from app.db.repositories.profile_repository import profile_repo
from app.core.logging import get_logger
from typing import List

logger = get_logger("deps")
security = HTTPBearer()

async def get_current_user(credentials = Depends(security)):
    token = credentials.credentials
    payload = await verify_supabase_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user profile from our DB to ensure it exists and to get roles
    profile = await profile_repo.get_profile_by_id(payload["id"])
    
    # Fallback to email if ID doesn't match (essential for seeded users)
    if not profile and "email" in payload:
        profile = await profile_repo.get_profile_by_email(payload["email"])
        if profile:
            # OPTIONAL: Update the profile with the correct ID for future hits
            try:
                # We need a low-level update because we are changing the ID
                # Actually, Prisma doesn't support changing @id easily.
                # But for now, returning the profile found by email is enough.
                pass
            except:
                pass

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User profile with email {payload.get('email')} not initialized in database",
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
# Updated roles for the Restaurant Focus V1 (Match Prisma Enum Case)
RESTAURANT_ROLES = ["OWNER", "MANAGER", "CHEF", "STAFF"]

get_restaurant_user = RoleChecker(RESTAURANT_ROLES)
get_admin_user = RoleChecker(["OWNER", "MANAGER"])
get_manager_user = RoleChecker(["OWNER", "MANAGER"])
get_supplier_user = RoleChecker(["SUPPLIER"])
