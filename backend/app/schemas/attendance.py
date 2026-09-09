from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class ClockInRequest(BaseModel):
    location_id: int
    latitude: Decimal
    longitude: Decimal


class ClockOutRequest(BaseModel):
    latitude: Decimal
    longitude: Decimal


class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    employee_full_name: str | None = None
    employee_email: str | None = None
    department_name: str | None = None
    organization_id: int
    location_id: int
    clock_in_time: datetime
    clock_in_latitude: Decimal
    clock_in_longitude: Decimal
    clock_out_time: datetime | None
    clock_out_latitude: Decimal | None
    clock_out_longitude: Decimal | None
    created_at: datetime

    class Config:
        from_attributes = True
