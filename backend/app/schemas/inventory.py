from pydantic import BaseModel
from typing import Optional, Union, Any
from enum import Enum
from datetime import datetime

class UnitType(str, Enum):
    KILOGRAM = "kg"
    GRAM = "g"
    LITER = "liter"
    MILLILITER = "ml"
    PIECE = "piece"
    BOX = "box"

class InventoryBase(BaseModel):
    name: str
    category: Union[str, dict]
    currentStock: float
    branded: Optional[str] = None
    brandName: Optional[str] = None
    unit: UnitType
    minimumLevel: float
    storageLocation: Optional[str] = None
    expiryDate: Optional[datetime] = None
    stockLevel: Optional[str] = None # derivable

class InventoryCreate(InventoryBase):
    pass

class InventoryUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[Union[str, dict]] = None
    currentStock: Optional[float] = None
    unit: Optional[UnitType] = None
    minimumLevel: Optional[float] = None

class Inventory(InventoryBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
