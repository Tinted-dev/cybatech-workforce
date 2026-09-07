from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.models.location import Location
from app.schemas.attendance import ClockInRequest, ClockOutRequest, AttendanceResponse
from app.core.dependencies import get_current_employee, require_admin

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
):
    organization_id = current_user["organization_id"]

    return (
        db.query(Attendance)
        .filter(Attendance.organization_id == organization_id)
        .order_by(Attendance.clock_in_time.desc())
        .all()
    )
