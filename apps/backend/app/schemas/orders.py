from pydantic import BaseModel
from typing import List, Optional, Union
from datetime import datetime
from enum import Enum

class OrderStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"

class OrderItem(BaseModel):
    product: Union[str, dict]
    quantity: float
    price: float

class OrderBase(BaseModel):
    customer: Union[str, dict]
    items: List[OrderItem]
    status: OrderStatus = OrderStatus.PENDING

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None

class Order(OrderBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
