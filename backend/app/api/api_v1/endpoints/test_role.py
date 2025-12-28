from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.schemas.auth import Profile

router = APIRouter()

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Returns the current user's profile to verify authentication and role.
    """
    return {
        "message": f"Hello {current_user.get('first_name', 'User')}, you are logged in as a {current_user.get('role')}",
        "user": current_user
    }

@router.get("/restaurant-only")
async def restaurant_only(current_user: dict = Depends(get_current_user)):
    """
    Example of a route that should only be accessible by restaurants.
    """
    if current_user.get("role") != "restaurant":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Only restaurants can access this route")
    
    return {"message": "Welcome, Restaurant Owner!"}

@router.get("/supplier-only")
async def supplier_only(current_user: dict = Depends(get_current_user)):
    """
    Example of a route that should only be accessible by suppliers.
    """
    if current_user.get("role") != "supplier":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Only suppliers can access this route")
    
    return {"message": "Welcome, Supplier!"}
