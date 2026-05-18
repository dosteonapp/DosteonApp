import jwt
from typing import Optional, Dict, Any
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("security")

async def verify_firebase_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify the Firebase ID token using firebase-admin.
    """
    try:
        from firebase_admin import auth
        
        # Verify the token integrity and check with Firebase Auth
        decoded_token = auth.verify_id_token(token)
        
        if not decoded_token or not decoded_token.get("uid"):
            return None
            
        # Return the user data as the payload
        return {
            "id": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "role": decoded_token.get("role", "STAFF"),
            "app_metadata": decoded_token, # Custom claims or other metadata
            "user_metadata": decoded_token, # Keep parity with expected payload
        }
    except Exception as e:
        logger.error(f"JWT Verification failed: {str(e)}")
        return None
