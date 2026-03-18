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
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not initialized",
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
# Updated roles for the Restaurant Focus V1
RESTAURANT_ROLES = ["admin", "manager", "staff", "restaurant"]

get_restaurant_user = RoleChecker(RESTAURANT_ROLES)
get_admin_user = RoleChecker(["admin"])
get_manager_user = RoleChecker(["admin", "manager"])
get_supplier_user = RoleChecker(["supplier"])
