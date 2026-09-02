from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Attendance(Base):
    __tablename__ = "attendance"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id"),
        nullable=False,
        index=True
    )

    organization_id: Mapped[int] = mapped_column(
        ForeignKey("organizations.id"),
        nullable=False,
        index=True
    )

    location_id: Mapped[int] = mapped_column(
        ForeignKey("locations.id"),
        nullable=False,
        index=True
    )

    clock_in_time: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    clock_in_latitude: Mapped[float] = mapped_column(
        Numeric(9, 6),
        nullable=False
    )

    clock_in_longitude: Mapped[float] = mapped_column(
        Numeric(9, 6),
        nullable=False
    )

    clock_out_time: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    clock_out_latitude: Mapped[float | None] = mapped_column(
        Numeric(9, 6),
        nullable=True
    )

    clock_out_longitude: Mapped[float | None] = mapped_column(
        Numeric(9, 6),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )