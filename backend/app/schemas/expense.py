from pydantic import BaseModel, field_validator
from typing import Optional, List
from enum import Enum


class ExpenseTypeEnum(str, Enum):
    INGREDIENT = "INGREDIENT"
    OPERATIONAL_COST = "OPERATIONAL_COST"
    OTHER = "OTHER"


class ExpenseCreate(BaseModel):
    item_name: str
    expense_type: ExpenseTypeEnum
    source: Optional[str] = None
    amount: float
    quantity: Optional[float] = None
    unit: Optional[str] = None
    supplier: Optional[str] = None
    unit_cost: Optional[float] = None
    transport_cost: Optional[float] = None
    idempotency_key: Optional[str] = None

    @field_validator("item_name")
    @classmethod
    def item_name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("item_name is required")
        return v.strip()

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("amount must be greater than 0")
        return v

    @field_validator("quantity")
    @classmethod
    def quantity_positive(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("quantity must be greater than 0")
        return v


class ExpenseOut(BaseModel):
    id: str
    organization_id: str
    brand_id: Optional[str]
    item_name: str
    expense_type: str
    source: Optional[str]
    amount: float
    quantity: Optional[float]
    unit: Optional[str]
    supplier: Optional[str] = None
    unit_cost: Optional[float] = None
    transport_cost: Optional[float] = None
    contextual_product_id: Optional[str]
    business_date: Optional[str]
    occurred_at: Optional[str]
    logged_by: Optional[str]
    idempotency_key: Optional[str]
    created_at: Optional[str]
    inventory_updated: bool = False
    note: Optional[str] = None


class ExpenseStats(BaseModel):
    total_expenses: float
    cogs: float
    overhead: float
    expense_count: int


class ExpenseWeekStats(BaseModel):
    total: float
    cogs: float
    overhead: float
    vs_last_week_pct: Optional[float]
    daily_breakdown: List[dict]


class ExpenseHistoryItem(BaseModel):
    id: str
    item_name: str
    expense_type: str
    source: Optional[str]
    amount: float
    quantity: Optional[float]
    unit: Optional[str]
    supplier: Optional[str] = None
    unit_cost: Optional[float] = None
    transport_cost: Optional[float] = None
    brand_id: Optional[str]
    business_date: Optional[str]
    occurred_at: Optional[str]


class ExpenseHistoryPage(BaseModel):
    total: int
    page: int
    limit: int
    pages: int
    items: List[ExpenseHistoryItem]


class ExpenseUpdate(BaseModel):
    item_name: Optional[str] = None
    amount: Optional[float] = None
    quantity: Optional[str] = None
    unit: Optional[str] = None
    expense_type: Optional[str] = None
    supplier: Optional[str] = None
    unit_cost: Optional[float] = None
    transport_cost: Optional[float] = None
