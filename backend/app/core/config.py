from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Dosteon API"
    API_V1_STR: str = "/api/v1"
    
    s_url: str = Field(..., validation_alias="SUPABASE_URL")
    s_anon_key: str = Field(..., validation_alias="SUPABASE_ANON_KEY")
    s_service_role_key: Optional[str] = Field(None, validation_alias="SUPABASE_SERVICE_ROLE_KEY")
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",  # Ignore extra fields in .env
        case_sensitive=True
    )

settings = Settings()
