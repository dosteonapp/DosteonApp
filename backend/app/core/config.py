from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, model_validator
from typing import Optional, Literal


class Settings(BaseSettings):
    # ── Environment identity ──────────────────────────────────────────────
    APP_ENV: Literal["development", "staging", "production"] = Field(
        "development", validation_alias="APP_ENV"
    )
    PROJECT_NAME: str = "Dosteon API"
    API_V1_STR: str = "/api/v1"

    # ── Feature flags ─────────────────────────────────────────────────────
    DEBUG: bool = Field(False, validation_alias="DEBUG")
    LOG_LEVEL: str = Field("INFO", validation_alias="LOG_LEVEL")

    # ── Rate limits (requests per minute) ─────────────────────────────────
    RATE_LIMIT_DEFAULT: str = Field("60/minute", validation_alias="RATE_LIMIT_DEFAULT")
    RATE_LIMIT_AUTH: str = Field("10/minute", validation_alias="RATE_LIMIT_AUTH")
    RATE_LIMIT_MUTATIONS: str = Field("120/minute", validation_alias="RATE_LIMIT_MUTATIONS")

    # ── Supabase ──────────────────────────────────────────────────────────
    s_url: str = Field("https://fpxzixwzixwzixwzixwz.supabase.co", validation_alias="SUPABASE_URL")
    s_anon_key: str = Field(..., validation_alias="SUPABASE_ANON_KEY")
    s_service_role_key: Optional[str] = Field(None, validation_alias="SUPABASE_SERVICE_ROLE_KEY")
    DATABASE_URL: Optional[str] = Field(None, validation_alias="DATABASE_URL")
    DIRECT_URL: Optional[str] = Field(None, validation_alias="DIRECT_URL")

    # ── CORS ──────────────────────────────────────────────────────────────
    BACKEND_CORS_ORIGINS: list[str] = Field(
        default=["http://localhost:3000", "https://app.dosteon.com", "https://dosteon-app.vercel.app", "https://dosteon-app-git-main-dosteonapp.vercel.app"],
        validation_alias="BACKEND_CORS_ORIGINS"
    )

    # ── Auth Redirect (for Email Verification/Callback) ───────────────────
    AUTH_REDIRECT_URL: str = Field(
        "https://app.dosteon.com/auth/callback",
        validation_alias="AUTH_REDIRECT_URL"
    )

    # ── SMTP Settings (for manual email fallback) ─────────────────────────
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = Field(None, validation_alias="SMTP_USER")
    SMTP_PASS: Optional[str] = Field(None, validation_alias="SMTP_PASS")
    FROM_EMAIL: Optional[str] = Field(None, validation_alias="FROM_EMAIL")

    # ── Resend API (primary email provider in production) ─────────────────
    RESEND_API_KEY: Optional[str] = Field(None, validation_alias="RESEND_API_KEY")
    RESEND_FROM_EMAIL: Optional[str] = Field(None, validation_alias="RESEND_FROM_EMAIL")

    # ── Internal admin API key ─────────────────────────────────────────────
    ADMIN_API_KEY: Optional[str] = Field(None, validation_alias="ADMIN_API_KEY")

    # ── Dev email override ─────────────────────────────────────────────────
    # If set and APP_ENV=development, all outgoing emails are redirected here.
    DEV_EMAIL_OVERRIDE: Optional[str] = Field(None, validation_alias="DEV_EMAIL_OVERRIDE")

    # ── Derived helpers ────────────────────────────────────────────────────
    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def is_staging(self) -> bool:
        return self.APP_ENV == "staging"

    @property
    def is_development(self) -> bool:
        return self.APP_ENV == "development"

    # ── Safety guard: crash loudly if environments are crossed ────────────
    @model_validator(mode="after")
    def validate_env_db_consistency(self) -> "Settings":
        db = (self.DATABASE_URL or "").lower()
        if not db:
            return self

        if self.APP_ENV == "production" and "staging" in db:
            raise ValueError(
                "CRITICAL: APP_ENV=production but DATABASE_URL contains 'staging'. "
                "You are pointing production at the staging database. Fix DATABASE_URL."
            )
        if self.APP_ENV == "staging" and self._looks_like_prod_db(db):
            raise ValueError(
                "CRITICAL: APP_ENV=staging but DATABASE_URL looks like production. "
                "You are pointing staging at the production database. Fix DATABASE_URL."
            )
        return self

    def _looks_like_prod_db(self, _db_url: str) -> bool:
        # Add your production Supabase project ref here once known.
        # e.g., return "abcdefghijklmnop" in _db_url
        return False

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
