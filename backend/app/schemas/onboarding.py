from pydantic import BaseModel, field_validator
from typing import Optional, List
from enum import Enum


# ---------------------------------------------------------------------------
# Shared
# ---------------------------------------------------------------------------

class BrandOut(BaseModel):
    id: str
    name: str


# ---------------------------------------------------------------------------
# Step 1 — Business
# ---------------------------------------------------------------------------

class BusinessRequest(BaseModel):
    name: str
    phone: Optional[str] = None
    city: Optional[str] = None
    business_type: str = "restaurant"
    daily_stock_count: bool = False
    has_multiple_brands: bool = False
    brands: List[str] = []

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Restaurant name is required")
        return v.strip()

    @field_validator("brands")
    @classmethod
    def validate_brands(cls, v: List[str]) -> List[str]:
        return [b.strip() for b in v if b.strip()]


# ---------------------------------------------------------------------------
# Step 2 — Operating Hours
# ---------------------------------------------------------------------------

class DayEnum(str, Enum):
    SUN = "SUN"
    MON = "MON"
    TUE = "TUE"
    WED = "WED"
    THU = "THU"
    FRI = "FRI"
    SAT = "SAT"


class OperatingDay(BaseModel):
    day: DayEnum
    opening_time: str   # "HH:MM"
    closing_time: str   # "HH:MM"
    is_open: bool


class HoursRequest(BaseModel):
    operating_days: List[OperatingDay]

    @field_validator("operating_days")
    @classmethod
    def at_least_one_open(cls, v: List[OperatingDay]) -> List[OperatingDay]:
        if not any(d.is_open for d in v):
            raise ValueError("At least one operating day must be selected")
        return v


# ---------------------------------------------------------------------------
# Step 3 — Menu
# ---------------------------------------------------------------------------

class DishItem(BaseModel):
    name: str
    price: float = 0
    category: str = "Signature"
    brand_id: Optional[str] = None  # null = shared (org-level), set = brand-specific

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        return v.strip()


class MenuRequest(BaseModel):
    dishes: List[DishItem]
    # Minimum dish validation is handled in the service to support per-brand partial submissions


# ---------------------------------------------------------------------------
# Step 4 — Inventory
# ---------------------------------------------------------------------------

class InventoryItem(BaseModel):
    canonical_product_id: str
    opening_quantity: float = 0
    unit: str


class InventoryRequest(BaseModel):
    items: List[InventoryItem] = []


# ---------------------------------------------------------------------------
# Completion response
# ---------------------------------------------------------------------------

class OnboardingCompleteResponse(BaseModel):
    onboarding_completed: bool
    organization_id: str
    organization_name: str
    phone: Optional[str] = None
    hours_display: Optional[str] = None        # e.g. "09:00 AM - 11:00 PM"
    operating_days_display: Optional[str] = None  # e.g. "Mon, Tue, Wed"
    menu_dishes_count: int = 0
    inventory_items_count: int = 0
    brands: List[BrandOut] = []                # all active brands for this org
