from pydantic import BaseModel, EmailStr, field_validator
import re
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    email: EmailStr

class UserSignup(UserBase):
    password: str
    first_name: str
    last_name: str
    # 'admin' usually creates the org, 'manager'/'staff' usually join one
    role: Literal["admin", "manager", "staff", "restaurant", "supplier"] 
    organization_name: Optional[str] = None # Provided if creating a new org
    invite_code: Optional[str] = None # Provided if joining an existing org

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one capital letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[^A-Za-z0-9]", v):
            raise ValueError("Password must contain at least one special character")
        return v

class MagicLinkRequest(UserBase):
    pass

class ForgotPasswordRequest(UserBase):
    account_type: Optional[Literal["restaurant", "supplier"]] = None

class PasswordResetConfirm(BaseModel):
    new_password: str
    access_token: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one capital letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[^A-Za-z0-9]", v):
            raise ValueError("Password must contain at least one special character")
        return v

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserLogin(UserBase):
    password: str

class OrgSettings(BaseModel):
    opening_time: str = "08:00"
    closing_time: str = "22:00"

class OrganizationBase(BaseModel):
    name: str
    type: str = "restaurant"
    settings: OrgSettings = OrgSettings()

class Profile(UserBase):
    id: UUID
    role: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    organization_id: Optional[UUID] = None
    team_id: Optional[UUID] = None
    created_at: Optional[datetime] = None

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Profile

class UserMe(Profile):
    session_valid: bool = True
    onboarding_completed: Optional[bool] = None
    onboarding_skipped: Optional[bool] = None
    email_verified: Optional[bool] = None
    password_changed_at: Optional[str] = None


class TeamInviteRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: Literal["owner_manager", "procurement_officer", "kitchen_staff"]


class TeamRoleUpdate(BaseModel):
    user_id: UUID
    role: Literal["owner_manager", "procurement_officer", "kitchen_staff"]


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one capital letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v


class OnboardRequest(BaseModel):
    organization_name: str
    address: str
    phone: Optional[str] = None
    opening_time: str
    closing_time: str
    selected_canonical_ids: list[str]
    # Optional map of canonical product ID -> opening quantity.
    # Used to seed initial stock counts during onboarding.
    opening_quantities: Optional[dict[str, float]] = None
