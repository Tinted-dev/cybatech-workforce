from fastapi import APIRouter, HTTPException, status
from sqlalchemy.orm import Session
from fastapi import Depends

from app.database.database import SessionLocal
from app.core.config import ALLOW_REGISTRATION
from app.models.user import User
from app.models.organization import Organization
from app.schemas.auth import LoginRequest, TokenResponse, RegisterRequest, ChangePasswordRequest
from app.core.security import verify_password, create_access_token, hash_password
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({
        "user_id": user.id,
        "organization_id": user.organization_id,
        "role": user.role,
        "must_change_password": user.must_change_password,
    })

    return TokenResponse(access_token=token)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if not ALLOW_REGISTRATION:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Registration is currently closed",
        )

    new_org = Organization(name=payload.organization_name)
    db.add(new_org)
    db.commit()
    db.refresh(new_org)

    new_user = User(
        organization_id=new_org.id,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role="admin",
        is_active=True,
        must_change_password=False,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({
        "user_id": new_user.id,
        "organization_id": new_user.organization_id,
        "role": new_user.role,
        "must_change_password": new_user.must_change_password,
    })

    return TokenResponse(access_token=token)


@router.put("/change-password", response_model=TokenResponse)
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == current_user["user_id"]).first()

    if not user or not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect",
        )

    user.hashed_password = hash_password(payload.new_password)
    user.must_change_password = False
    db.commit()
    db.refresh(user)

    token = create_access_token({
        "user_id": user.id,
        "organization_id": user.organization_id,
        "role": user.role,
        "must_change_password": user.must_change_password,
    })

    return TokenResponse(access_token=token)
