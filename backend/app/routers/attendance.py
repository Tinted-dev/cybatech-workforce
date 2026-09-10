from datetime import datetime, date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.models.location import Location
from app.models.user import User
from app.models.department import Department
from app.schemas.attendance import ClockInRequest, ClockOutRequest, AttendanceResponse
from app.core.dependencies import get_current_employee, require_admin
from app.core.geo import distance_meters

router = APIRouter(prefix="/attendance", tags=["attendance"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/clock-in", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def clock_in(
    payload: ClockInRequest,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    open_shift = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == current_employee.id,
            Attendance.clock_out_time.is_(None),
        )
        .first()
    )

    if open_shift:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already clocked in. Clock out before clocking in again.",
        )

    employee_record = db.query(Employee).filter(Employee.id == current_employee.id).first()

    if employee_record.registered_device_id is None:
        employee_record.registered_device_id = payload.device_id
        db.commit()
        db.refresh(employee_record)
    elif employee_record.registered_device_id != payload.device_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This device is not registered to your account. Ask your admin to reset your device.",
        )

    location = (
        db.query(Location)
        .filter(
            Location.id == payload.location_id,
            Location.organization_id == current_employee.organization_id,
        )
        .first()
    )

    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found",
        )

    distance = distance_meters(
        location.latitude,
        location.longitude,
        payload.latitude,
        payload.longitude,
    )

    if distance > location.allowed_radius_meters:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"You are {int(distance)}m away from {location.name}. "
                f"You must be within {location.allowed_radius_meters}m to clock in."
            ),
        )

    new_attendance = Attendance(
        employee_id=current_employee.id,
        organization_id=current_employee.organization_id,
        location_id=payload.location_id,
        clock_in_time=datetime.utcnow(),
        clock_in_latitude=payload.latitude,
        clock_in_longitude=payload.longitude,
    )
    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)

    return new_attendance


@router.post("/clock-out", response_model=AttendanceResponse)
def clock_out(
    payload: ClockOutRequest,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    if (
        current_employee.registered_device_id is not None
        and current_employee.registered_device_id != payload.device_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This device is not registered to your account. Ask your admin to reset your device.",
        )

    open_shift = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == current_employee.id,
            Attendance.clock_out_time.is_(None),
        )
        .first()
    )

    if not open_shift:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not currently clocked in.",
        )

    open_shift.clock_out_time = datetime.utcnow()
    open_shift.clock_out_latitude = payload.latitude
    open_shift.clock_out_longitude = payload.longitude

    db.commit()
    db.refresh(open_shift)

    return open_shift


@router.get("/status", response_model=AttendanceResponse | None)
def clock_status(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    open_shift = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == current_employee.id,
            Attendance.clock_out_time.is_(None),
        )
        .first()
    )
    return open_shift


@router.get("", response_model=list[AttendanceResponse])
def list_attendance(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
    start_date: date | None = None,
    end_date: date | None = None,
    employee_id: int | None = None,
    location_id: int | None = None,
):
    organization_id = current_user["organization_id"]

    query = (
        db.query(Attendance, User, Department)
        .join(Employee, Attendance.employee_id == Employee.id)
        .join(User, Employee.user_id == User.id)
        .outerjoin(Department, Employee.department_id == Department.id)
        .filter(Attendance.organization_id == organization_id)
    )

    if start_date is not None:
        query = query.filter(Attendance.clock_in_time >= start_date)

    if end_date is not None:
        end_of_day = datetime.combine(end_date, datetime.max.time())
        query = query.filter(Attendance.clock_in_time <= end_of_day)

    if employee_id is not None:
        query = query.filter(Attendance.employee_id == employee_id)

    if location_id is not None:
        query = query.filter(Attendance.location_id == location_id)

    results = query.order_by(Attendance.clock_in_time.desc()).all()

    responses = []
    for attendance, user, department in results:
        response = AttendanceResponse.model_validate(attendance)
        response.employee_full_name = user.full_name
        response.employee_email = user.email
        response.department_name = department.name if department else None
        responses.append(response)

    return responses
