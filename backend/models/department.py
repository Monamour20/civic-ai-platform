from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database.base import Base


class MunicipalDepartment(Base):
    __tablename__ = "municipal_departments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(160), unique=True)
    jurisdiction: Mapped[str] = mapped_column(String(160), index=True)
    escalation_email: Mapped[str] = mapped_column(String(255))
    sla_hours: Mapped[int] = mapped_column(Integer, default=24)


class DepartmentAssignment(Base):
    __tablename__ = "department_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    complaint_id: Mapped[int] = mapped_column(ForeignKey("civic_complaints.id"), index=True)
    department_id: Mapped[int | None] = mapped_column(ForeignKey("municipal_departments.id"), nullable=True)
    department_name: Mapped[str] = mapped_column(String(160))
    routing_confidence: Mapped[float] = mapped_column(Float)
    escalation_risk: Mapped[float] = mapped_column(Float, default=0.0)
    assignment_reason: Mapped[str] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(80), default="assigned")
    assigned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    complaint: Mapped["CivicComplaint"] = relationship(back_populates="assignments")
