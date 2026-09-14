from app.database.database import SessionLocal
from app.models.platform_admin import PlatformAdmin
from app.core.security import hash_password

AT = chr(64)

db = SessionLocal()

try:
    admin = PlatformAdmin(
        email="platform" + AT + "cybatech.com",
        hashed_password=hash_password("platformpass123"),
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)

    print("Created platform admin:", admin.id, admin.email)

finally:
    db.close()
