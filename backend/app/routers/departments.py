from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.department import Department
from app.schemas.department import DepartmentCreateRequest, DepartmentUpdateRequest, DepartmentResponse
from app.core.dependencies import require_admin, get_current_user

router = APIRouter(prefix="/departments", tags=["departments"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(
    payload: DepartmentCreateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    organization_id = current_user["organization_id"]

    new_department = Department(
        organization_id=organization_id,
        name=payload.name,
        is_active=True,
    )
    db.add(new_department)
    db.commit()
    db.refresh(new_department)

    return new_department


@router.get("", response_model=list[DepartmentResponse])
def list_departments(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    organization_id = current_user["organization_id"]

    return db.query(Department).filter(Department.organization_id == organization_id).all()


@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    organization_id = current_user["organization_id"]

    department = (
        db.query(Department)
        .filter(Department.id == department_id, Department.organization_id == organization_id)
        .first()
    )

    if not department:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    return department


@router.put("/{department_id}", response_model=DepartmentResponse)
def update_department(
    department_id: int,
    payload: DepartmentUpdateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    organization_id = current_user["organization_id"]

    department = (
        db.query(Department)
        .filter(Department.id == department_id, Department.organization_id == organization_id)
        .first()
    )

    if not department:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    if payload.name is not None:
        department.name = payload.name
    if payload.is_active is not None:
        department.is_active = payload.is_active

    db.commit()
    db.refresh(department)

    return department
