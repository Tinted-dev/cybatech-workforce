from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator


class EmployeeCreateRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str = ""
    role: str = "employee"
    department_id: int | None = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str) -> str:
        if value not in ("admin", "employee"):
            raise ValueError('role must be either "admin" or "employee"')
        return value


class EmployeeUpdateRequest(BaseModel):
    full_name: str | None = None
    role: str | None = None
    is_active: bool | None = None
    department_id: int | None = None

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
    full_name: str
    role: str
    is_active: bool
    must_change_password: bool
    department_id: int | None
    department_name: str | None
    created_at: datetime

    class Config:
        from_attributes = True
