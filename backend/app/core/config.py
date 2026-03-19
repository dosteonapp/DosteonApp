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
    default=["http://localhost:3000", "https://dosteon-app.vercel.app"],
    validation_alias="BACKEND_CORS_ORIGINS"
    )
    
    # Auth Redirect (for Email Verification/Callback)
    AUTH_REDIRECT_URL: str = Field(
    "http://localhost:3000/auth/callback",
    validation_alias="AUTH_REDIRECT_URL"
    )
    
    # SMTP Settings (for manual email fallback)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = Field(None, validation_alias="SMTP_USER")
    SMTP_PASS: Optional[str] = Field(None, validation_alias="SMTP_PASS")
    FROM_EMAIL: Optional[str] = Field(None, validation_alias="FROM_EMAIL")

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=False
    )

settings = Settings()
