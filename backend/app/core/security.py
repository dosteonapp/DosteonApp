import jwt
from typing import Optional, Dict, Any
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("security")

async def verify_supabase_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify the Supabase JWT token.
    In a real production environment, this would verify the signature using 
    the Supabase JWT secret or public key.
    
    For now, we use the Supabase client's get_user which is the most 
    bulletproof way as it also checks session validity with the Auth server.
    """
    try:
        from app.core.supabase import supabase
        
        # This call verifies the token integrity and checks with Supabase GoTrue
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            return None
            
        # Return the user data as the payload
        return {
            "id": user_response.user.id,
            "email": user_response.user.email,
            "role": user_response.user.role,
            "app_metadata": user_response.user.app_metadata,
            "user_metadata": user_response.user.user_metadata,
        }
    except Exception as e:
        logger.error(f"JWT Verification failed: {str(e)}")
        return None
