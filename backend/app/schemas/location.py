from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class LocationCreateRequest(BaseModel):
    name: str
    latitude: Decimal
    longitude: Decimal


class LocationUpdateRequest(BaseModel):
    name: str | None = None
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    is_active: bool | None = None


class LocationResponse(BaseModel):
    id: int
    organization_id: int
    name: str
    latitude: Decimal
    longitude: Decimal
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
