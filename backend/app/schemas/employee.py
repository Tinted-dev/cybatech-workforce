from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator


class EmployeeCreateRequest(BaseModel):
    email: EmailStr
    password: str
    role: str = "employee"

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str) -> str:
        if value not in ("admin", "employee"):
            raise ValueError('role must be either "admin" or "employee"')
        return value


class EmployeeUpdateRequest(BaseModel):
    role: str | None = None
    is_active: bool | None = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str | None) -> str | None:
        if value is not None and value not in ("admin", "employee"):
            raise ValueError('role must be either "admin" or "employee"')
        return value


class EmployeeResponse(BaseModel):
    id: int
    user_id: int
    organization_id: int
    email: str
    role: str
    is_active: bool
    must_change_password: bool
    created_at: datetime

    class Config:
        from_attributes = True
