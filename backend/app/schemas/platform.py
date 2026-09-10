from datetime import datetime
from pydantic import BaseModel, EmailStr


class PlatformLoginRequest(BaseModel):
    email: EmailStr
    password: str


class PlatformTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class OrganizationSummary(BaseModel):
    id: int
    name: str
    is_active: bool
    employee_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class CreateOrganizationRequest(BaseModel):
    organization_name: str
    admin_email: EmailStr
    admin_password: str
