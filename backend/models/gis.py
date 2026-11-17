from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from backend.database.base import Base


class GISIssueRecord(Base):
    __tablename__ = "gis_issue_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    complaint_public_id: Mapped[str] = mapped_column(String(32), index=True)
    issue_category: Mapped[str] = mapped_column(String(120), index=True)
    ward: Mapped[str] = mapped_column(String(120), index=True)
    department: Mapped[str] = mapped_column(String(160))
    severity: Mapped[str] = mapped_column(String(80), index=True)
    status: Mapped[str] = mapped_column(String(80), index=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    ai_confidence: Mapped[float] = mapped_column(Float)
    escalation_risk: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
