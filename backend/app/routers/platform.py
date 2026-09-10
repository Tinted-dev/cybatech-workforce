from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import SessionLocal
from app.models.platform_admin import PlatformAdmin
from app.models.organization import Organization
from app.models.employee import Employee
from app.schemas.platform import PlatformLoginRequest, PlatformTokenResponse, OrganizationSummary
from app.core.security import verify_password, create_access_token
from app.core.dependencies import require_platform_admin

router = APIRouter(prefix="/platform", tags=["platform"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/login", response_model=PlatformTokenResponse)
def platform_login(credentials: PlatformLoginRequest, db: Session = Depends(get_db)):
    admin = db.query(PlatformAdmin).filter(PlatformAdmin.email == credentials.email).first()

    if not admin or not verify_password(credentials.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({
        "platform_admin_id": admin.id,
        "type": "platform",
    })

    return PlatformTokenResponse(access_token=token)


@router.get("/organizations", response_model=list[OrganizationSummary])
def list_organizations(
    db: Session = Depends(get_db),
    _: dict = Depends(require_platform_admin),
):
    results = (
        db.query(Organization, func.count(Employee.id))
        .outerjoin(Employee, Employee.organization_id == Organization.id)
        .group_by(Organization.id)
        .order_by(Organization.created_at.desc())
        .all()
    )

    return [
        OrganizationSummary(
            id=org.id,
            name=org.name,
            is_active=org.is_active,
            employee_count=count,
            created_at=org.created_at,
        )
        for org, count in results
    ]


@router.put("/organizations/{organization_id}", response_model=OrganizationSummary)
def update_organization_status(
    organization_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    _: dict = Depends(require_platform_admin),
):
    organization = db.query(Organization).filter(Organization.id == organization_id).first()

    if not organization:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    organization.is_active = is_active
    db.commit()
    db.refresh(organization)

    employee_count = db.query(Employee).filter(Employee.organization_id == organization_id).count()

    return OrganizationSummary(
        id=organization.id,
        name=organization.name,
        is_active=organization.is_active,
        employee_count=employee_count,
        created_at=organization.created_at,
    )
