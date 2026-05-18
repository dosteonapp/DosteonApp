import json
import firebase_admin
from firebase_admin import credentials
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("firebase")

def initialize_firebase():
    """
    Initialize Firebase Admin SDK.
    """
    if not firebase_admin._apps:
        try:
            if settings.FIREBASE_ADMIN_CREDENTIALS:
                # Load credentials from stringified JSON
                cred_dict = json.loads(settings.FIREBASE_ADMIN_CREDENTIALS)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                logger.info("Firebase Admin initialized via credentials JSON.")
            else:
                # Fallback to Application Default Credentials (e.g. deployed to GCP or Vercel with GOOGLE_APPLICATION_CREDENTIALS)
                logger.warning("FIREBASE_ADMIN_CREDENTIALS not found. Defaulting to GOOGLE_APPLICATION_CREDENTIALS if set.")
                firebase_admin.initialize_app()
                logger.info("Firebase Admin initialized via default credentials.")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin: {e}")
