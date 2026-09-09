from datetime import datetime
from pydantic import BaseModel


class DepartmentCreateRequest(BaseModel):
    name: str


class DepartmentUpdateRequest(BaseModel):
    name: str | None = None
    is_active: bool | None = None


class DepartmentResponse(BaseModel):
    id: int
    organization_id: int
    name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
