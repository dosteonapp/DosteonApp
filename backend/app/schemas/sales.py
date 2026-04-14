from pydantic import BaseModel, field_validator
from typing import Optional, List
from enum import Enum
from datetime import datetime, date


class SaleChannelEnum(str, Enum):
    DINE_IN = "DINE_IN"
    TAKEAWAY = "TAKEAWAY"
    DELIVERY = "DELIVERY"


# ---------------------------------------------------------------------------
# Menu management
# ---------------------------------------------------------------------------

class MenuItemCreate(BaseModel):
    name: str
    price: float = 0
    cost: Optional[float] = 0
    category: str = "Signature"

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Dish name is required")
        return v.strip()

    @field_validator("price")
    @classmethod
    def price_non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Price must be non-negative")
        return v


class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    cost: Optional[float] = None
    category: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("Dish name cannot be empty")
        return v.strip() if v else v

    @field_validator("price", "cost")
    @classmethod
    def non_negative(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v < 0:
            raise ValueError("Value must be non-negative")
        return v


# ---------------------------------------------------------------------------
# Sale log
# ---------------------------------------------------------------------------

class SaleLogItem(BaseModel):
    menu_item_id: str
    quantity: int = 1

    @field_validator("quantity")
    @classmethod
    def positive_qty(cls, v: int) -> int:
        if v < 1:
            raise ValueError("Quantity must be at least 1")
        return v


class SaleLogRequest(BaseModel):
    channel: SaleChannelEnum = SaleChannelEnum.DINE_IN
    items: List[SaleLogItem]

    @field_validator("items")
    @classmethod
    def has_items(cls, v: List[SaleLogItem]) -> List[SaleLogItem]:
        if not v:
            raise ValueError("At least one item is required")
        return v
