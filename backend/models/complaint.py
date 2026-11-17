import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database.base import Base


class ComplaintStatus(str, enum.Enum):
    submitted = "submitted"
    ai_triage = "ai_triage"
    routed = "routed"
    in_progress = "in_progress"
    resolved = "resolved"
    escalated = "escalated"
    disputed = "disputed"


class IssueSeverity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class CivicComplaint(Base):
    __tablename__ = "civic_complaints"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    public_id: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    issue_category: Mapped[str] = mapped_column(String(120), index=True)
    severity: Mapped[IssueSeverity] = mapped_column(Enum(IssueSeverity), default=IssueSeverity.medium)
    status: Mapped[ComplaintStatus] = mapped_column(Enum(ComplaintStatus), default=ComplaintStatus.submitted)
    ward: Mapped[str] = mapped_column(String(120), index=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    citizen_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    evidence: Mapped[list["EvidenceMetadata"]] = relationship(back_populates="complaint")
    analyses: Mapped[list["AIAnalysisResult"]] = relationship(back_populates="complaint")
    assignments: Mapped[list["DepartmentAssignment"]] = relationship(back_populates="complaint")
