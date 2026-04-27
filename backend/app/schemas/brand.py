from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID


class BrandCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Brand name cannot be empty")
        if len(v) > 100:
            raise ValueError("Brand name must be 100 characters or fewer")
        return v


class BrandUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Brand name cannot be empty")
            if len(v) > 100:
                raise ValueError("Brand name must be 100 characters or fewer")
        return v


class BrandOut(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    logo_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True
