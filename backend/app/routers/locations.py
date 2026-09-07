from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.location import Location
from app.schemas.location import LocationCreateRequest, LocationUpdateRequest, LocationResponse
from app.core.dependencies import require_admin

router = APIRouter(prefix="/locations", tags=["locations"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
def create_location(
    payload: LocationCreateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    organization_id = current_user["organization_id"]

    new_location = Location(
        organization_id=organization_id,
        name=payload.name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        is_active=True,
    )
    db.add(new_location)
    db.commit()
    db.refresh(new_location)

    return new_location


@router.get("", response_model=list[LocationResponse])
def list_locations(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    organization_id = current_user["organization_id"]

    return db.query(Location).filter(Location.organization_id == organization_id).all()


@router.get("/{location_id}", response_model=LocationResponse)
def get_location(
    location_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    organization_id = current_user["organization_id"]

    location = (
        db.query(Location)
        .filter(Location.id == location_id, Location.organization_id == organization_id)
        .first()
    )

    if not location:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location not found")

    return location


@router.put("/{location_id}", response_model=LocationResponse)
def update_location(
    location_id: int,
    payload: LocationUpdateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    organization_id = current_user["organization_id"]

    location = (
        db.query(Location)
        .filter(Location.id == location_id, Location.organization_id == organization_id)
        .first()
    )

    if not location:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location not found")

    if payload.name is not None:
        location.name = payload.name
    if payload.latitude is not None:
        location.latitude = payload.latitude
    if payload.longitude is not None:
        location.longitude = payload.longitude
    if payload.is_active is not None:
        location.is_active = payload.is_active

    db.commit()
    db.refresh(location)

    return location
