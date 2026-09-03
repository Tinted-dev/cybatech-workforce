from app.database.database import SessionLocal
from app.models.organization import Organization
from app.models.user import User
from app.core.security import hash_password

AT = chr(64)

db = SessionLocal()

try:
    org = Organization(name="Cybatech Test Org")
    db.add(org)
    db.commit()
    db.refresh(org)

    admin_email = "denisadmin" + AT + "cybatech.com"

    admin_user = User(
        organization_id=org.id,
        email=admin_email,
        hashed_password=hash_password("adminpass123"),
        role="admin",
        is_active=True,
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)

    print("Created organization:", org.id, org.name)
    print("Created user:", admin_user.id, admin_user.email, admin_user.role)
    print("Email length:", len(admin_user.email))
    print("Contains @:", AT in admin_user.email)

finally:
    db.close()
