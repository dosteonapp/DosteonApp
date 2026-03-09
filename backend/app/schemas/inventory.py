from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class InventoryItemBase(BaseModel):
    name: str
    sku: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    unit: str = "unit"
    current_stock: float = 0
    min_level: float = 0
    restock_point: float = 0
    cost_per_unit: float = 0
    image_url: Optional[str] = None
    location: Optional[str] = None

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    current_stock: Optional[float] = None
    min_level: Optional[float] = None
    restock_point: Optional[float] = None
    cost_per_unit: Optional[float] = None
    image_url: Optional[str] = None
    location: Optional[str] = None

class InventoryItem(InventoryItemBase):
    id: UUID
    organization_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
