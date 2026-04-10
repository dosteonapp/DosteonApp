from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    ENV: str = Field("development", validation_alias="ENV")
    PROJECT_NAME: str = "Dosteon API"
    API_V1_STR: str = "/api/v1"
    
    # Supabase
    s_url: str = Field("https://fpxzixwzixwzixwzixwz.supabase.co", validation_alias="SUPABASE_URL")
    s_anon_key: str = Field(..., validation_alias="SUPABASE_ANON_KEY")
    s_service_role_key: Optional[str] = Field(None, validation_alias="SUPABASE_SERVICE_ROLE_KEY")
    DATABASE_URL: Optional[str] = Field(None, validation_alias="DATABASE_URL")
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = Field(
    default=["http://localhost:3000", "https://app.dosteon.com", "https://dosteon-app.vercel.app", "https://dosteon-app-git-main-dosteonapp.vercel.app"],
    validation_alias="BACKEND_CORS_ORIGINS"
    )

    # Auth Redirect (for Email Verification/Callback)
    AUTH_REDIRECT_URL: str = Field(
    "https://app.dosteon.com/auth/callback",
    validation_alias="AUTH_REDIRECT_URL"
    )
    
    # SMTP Settings (for manual email fallback)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = Field(None, validation_alias="SMTP_USER")
    SMTP_PASS: Optional[str] = Field(None, validation_alias="SMTP_PASS")
    FROM_EMAIL: Optional[str] = Field(None, validation_alias="FROM_EMAIL")

    # Resend API (primary email provider in production)
    RESEND_API_KEY: Optional[str] = Field(None, validation_alias="RESEND_API_KEY")
    RESEND_FROM_EMAIL: Optional[str] = Field(None, validation_alias="RESEND_FROM_EMAIL")

    # Internal admin API key — used to protect product review endpoints
    ADMIN_API_KEY: Optional[str] = Field(None, validation_alias="ADMIN_API_KEY")

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=False
    )

settings = Settings()

# Guard: service role key must be present and must not equal the anon key.
# If either condition fails we exit immediately so Render marks the deploy
# as failed rather than serving broken signups silently.
import sys as _sys
if not settings.s_service_role_key:
    print(
        "CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not set. "
        "Admin operations (signup, email verification) will fail. "
        "Set the env var on Render and redeploy.",
        file=_sys.stderr,
        flush=True,
    )
    _sys.exit(1)
if settings.s_service_role_key == settings.s_anon_key:
    print(
        "CRITICAL: SUPABASE_SERVICE_ROLE_KEY equals SUPABASE_ANON_KEY. "
        "The service role key is required — do not use the anon key here. "
        "Fix the env var on Render and redeploy.",
        file=_sys.stderr,
        flush=True,
    )
    _sys.exit(1)
