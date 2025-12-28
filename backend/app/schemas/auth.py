from pydantic import BaseModel, EmailStr, field_validator
import re
from typing import Optional, Literal
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserSignup(UserBase):
    password: str
    first_name: str
    last_name: str
    role: Literal["restaurant", "supplier"]

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one capital letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

class MagicLinkRequest(UserBase):
    pass

class ForgotPasswordRequest(UserBase):
    pass

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
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserLogin(UserBase):
    password: str

class Profile(UserBase):
    id: str
    role: Literal["restaurant", "supplier"]
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    created_at: Optional[datetime] = None

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Profile

class UserMe(Profile):
    session_valid: bool = True
