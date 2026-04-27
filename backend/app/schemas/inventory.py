from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from enum import Enum


# ---------------------------------------------------------------------------
# Stock-usage enums
# ---------------------------------------------------------------------------

class ConsumptionReasonEnum(str, Enum):
    CUSTOMER_SERVICE = "CUSTOMER_SERVICE"
    STAFF_MEAL       = "STAFF_MEAL"
    OTHER            = "OTHER"


class WasteReasonEnum(str, Enum):
    SPOILED_EXPIRED      = "SPOILED_EXPIRED"
    DAMAGED_PACKAGING    = "DAMAGED_PACKAGING"
    SPILLED_DROPPED      = "SPILLED_DROPPED"
    OVERCOOKED_BURNED    = "OVERCOOKED_BURNED"
    QUALITY_ISSUE        = "QUALITY_ISSUE"
    OTHER                = "OTHER"


# ---------------------------------------------------------------------------
# Stock-usage request / response
# ---------------------------------------------------------------------------

class ConsumptionCreate(BaseModel):
    product_id:          UUID
    quantity:            float = Field(gt=0)
    consumption_reason:  ConsumptionReasonEnum


class WasteCreate(BaseModel):
    product_id:   UUID
    quantity:     float = Field(gt=0)
    waste_reason: WasteReasonEnum


class StockUsageEvent(BaseModel):
    id:                  UUID
    product_id:          UUID
    product_name:        str
    event_type:          str          # "USED" | "WASTED"
    quantity:            float        # absolute value; sign conveyed by event_type
    unit:                str
    consumption_reason:  Optional[str] = None
    waste_reason:        Optional[str] = None
    occurred_at:         datetime

    class Config:
        from_attributes = True


class StockUsageStats(BaseModel):
    most_used_item:    Optional[str]  = None
    consumption_today: float          = 0
    waste_today:       float          = 0
    most_wasted_item:  Optional[str]  = None


# ---------------------------------------------------------------------------
# Product catalog response
# ---------------------------------------------------------------------------

class InventoryProductItem(BaseModel):
    id:            UUID
    name:          str
    sku:           Optional[str]  = None
    category:      str
    brand_name:    Optional[str]  = None   # Restaurant brand (Brand.name)
    unit:          str
    current_stock: float
    min_level:     float
    status_class:  str                     # "healthy" | "low" | "critical"
    updated_at:    datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Inventory stats (banner cards)
# ---------------------------------------------------------------------------

class StatCard(BaseModel):
    value:              int
    vs_last_week_pct:   Optional[float] = None


class InventoryStats(BaseModel):
    items_in_stock: StatCard
    healthy_stock:  StatCard
    low_stock:      StatCard
    critical:       StatCard

class CanonicalCatalogItem(BaseModel):
    id: UUID
    name: str
    category: str
    product_type: str
    base_unit: str
    is_critical_item: bool = False
    synonyms: List[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class InventoryItem(BaseModel):
    id: UUID
    name: str # From Canonical
    category: str # From Canonical
    brand: Optional[str] = None # From Contextual
    unit: str # From Contextual/Canonical
    current_stock: float = 0 # Aggregated from Events
    min_level: float = 0 # From Contextual (reorder_threshold)
    location: Optional[str] = None # From Contextual
    status: str = "active"
    canonical_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class InventoryItemCreate(BaseModel):
    canonical_product_id: UUID
    brand_name: Optional[str] = None
    pack_size: Optional[float] = None
    pack_unit: Optional[str] = None
    location_id: Optional[UUID] = None
    reorder_threshold: float = 0
    opening_stock: float = 0

class InventoryItemUpdate(BaseModel):
    brand_name: Optional[str] = None
    reorder_threshold: Optional[float] = None
    status: Optional[str] = None

class StockEventCreate(BaseModel):
    contextual_product_id: UUID
    event_type: str # opening_stock, consumption, delivery, adjustment, transfer, closing_stock
    quantity: float
    unit: str
    metadata: Optional[dict] = None


class RestaurantInventoryItemCreate(BaseModel):
    """Request payload for creating a contextual inventory item from the restaurant UI."""

    name: str
    category: str = "General"
    currentStock: float = 0
    unit: str = "units"
    location: str = "Main Storage"
    imageUrl: Optional[str] = None
    # Optional link to an existing canonical product (preferred when available)
    canonicalId: Optional[UUID] = None


class RestaurantInventoryItemUpdate(BaseModel):
    """Request payload for updating a contextual inventory item from the restaurant UI."""

    name: Optional[str] = None
    currentStock: Optional[float] = None
    unit: Optional[str] = None
    location: Optional[str] = None
    imageUrl: Optional[str] = None


class InventoryStockUpdate(BaseModel):
    """Request payload for manually overriding an item's stock quantity."""

    itemId: str
    newQuantity: float


class OpeningChecklistDraft(BaseModel):
    """Payload for saving a draft of the opening stock checklist."""

    confirmedIds: List[str] = Field(default_factory=list)
    counts: Dict[str, float] = Field(default_factory=dict)


class OpeningChecklistSubmit(BaseModel):
    """Payload for submitting the opening stock checklist."""

    counts: Dict[str, float]


class KitchenUsageLog(BaseModel):
    """Payload for logging kitchen usage for an item."""

    itemId: str
    amount: float


class KitchenWasteLog(BaseModel):
    """Payload for logging kitchen waste for an item."""

    itemId: str
    amount: float
    reason: Optional[str] = None


class ClosingChecklistSubmit(BaseModel):
    """Payload for submitting the end-of-day closing checklist.

    For now this accepts a lightweight summary and the raw items array
    from the frontend so that we can safely persist high-level audit
    information without constraining the UI too tightly.
    """

    summary: Dict[str, Any]
    items: List[Dict[str, Any]]

