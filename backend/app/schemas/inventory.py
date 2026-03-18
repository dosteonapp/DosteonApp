from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

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
