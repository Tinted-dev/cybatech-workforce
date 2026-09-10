from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.user import User
from app.models.employee import Employee
from app.models.department import Department
from app.schemas.employee import EmployeeCreateRequest, EmployeeUpdateRequest, EmployeeResponse
from app.core.security import hash_password
from app.core.dependencies import require_admin

router = APIRouter(prefix="/employees", tags=["employees"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def build_employee_response(employee: Employee, user: User, department: Department | None) -> EmployeeResponse:
    return EmployeeResponse(
        id=employee.id,
        user_id=user.id,
        organization_id=employee.organization_id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=employee.is_active,
        must_change_password=user.must_change_password,
        department_id=employee.department_id,
        department_name=department.name if department else None,
        has_registered_device=employee.registered_device_id is not None,
        created_at=employee.created_at,
    )


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    payload: EmployeeCreateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    organization_id = current_user["organization_id"]

    existing = (
        db.query(User)
        .filter(User.organization_id == organization_id, User.email == payload.email)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists in your organization",
        )

    department = None
    if payload.department_id is not None:
        department = (
            db.query(Department)
            .filter(Department.id == payload.department_id, Department.organization_id == organization_id)
            .first()
        )
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found",
            )

    new_user = User(
        organization_id=organization_id,
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        is_active=True,
        must_change_password=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_employee = Employee(
        user_id=new_user.id,
        organization_id=organization_id,
        department_id=payload.department_id,
        is_active=True,
    )
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    return build_employee_response(new_employee, new_user, department)


@router.get("", response_model=list[EmployeeResponse])
def list_employees(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    organization_id = current_user["organization_id"]

    results = (
        db.query(Employee, User, Department)
        .join(User, Employee.user_id == User.id)
        .outerjoin(Department, Employee.department_id == Department.id)
        .filter(Employee.organization_id == organization_id)
        .all()
    )

    return [
        build_employee_response(employee, user, department)
        for employee, user, department in results
    ]


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    organization_id = current_user["organization_id"]

    result = (
        db.query(Employee, User, Department)
        .join(User, Employee.user_id == User.id)
        .outerjoin(Department, Employee.department_id == Department.id)
        .filter(Employee.id == employee_id, Employee.organization_id == organization_id)
        .first()
    )

    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    employee, user, department = result
    return build_employee_response(employee, user, department)


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    payload: EmployeeUpdateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    organization_id = current_user["organization_id"]

    result = (
        db.query(Employee, User)
        .join(User, Employee.user_id == User.id)
        .filter(Employee.id == employee_id, Employee.organization_id == organization_id)
        .first()
    )

    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    employee, user = result

    if payload.full_name is not None:
        user.full_name = payload.full_name

    if payload.role is not None:
        user.role = payload.role

    if payload.is_active is not None:
        employee.is_active = payload.is_active

    department = None
    if payload.department_id is not None:
        department = (
            db.query(Department)
            .filter(Department.id == payload.department_id, Department.organization_id == organization_id)
            .first()
        )
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found",
            )
        employee.department_id = payload.department_id

    db.commit()
    db.refresh(employee)
    db.refresh(user)

    if employee.department_id and not department:
        department = db.query(Department).filter(Department.id == employee.department_id).first()

    return build_employee_response(employee, user, department)


@router.post("/{employee_id}/reset-device", response_model=EmployeeResponse)
def reset_employee_device(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    organization_id = current_user["organization_id"]

    result = (
        db.query(Employee, User, Department)
        .join(User, Employee.user_id == User.id)
        .outerjoin(Department, Employee.department_id == Department.id)
        .filter(Employee.id == employee_id, Employee.organization_id == organization_id)
        .first()
    )

    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    employee, user, department = result

    employee.registered_device_id = None
    db.commit()
    db.refresh(employee)

    return build_employee_response(employee, user, department)
