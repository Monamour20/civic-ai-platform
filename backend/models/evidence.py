from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database.base import Base


class EvidenceMetadata(Base):
    __tablename__ = "evidence_metadata"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    complaint_id: Mapped[int] = mapped_column(ForeignKey("civic_complaints.id"), index=True)
    file_name: Mapped[str] = mapped_column(String(255))
    content_type: Mapped[str] = mapped_column(String(120))
    storage_uri: Mapped[str] = mapped_column(String(500))
    sha256: Mapped[str] = mapped_column(String(128), index=True)
    captured_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    device_make: Mapped[str | None] = mapped_column(String(120), nullable=True)
    device_model: Mapped[str | None] = mapped_column(String(120), nullable=True)
    exif_payload: Mapped[dict] = mapped_column(JSON, default=dict)
    gps_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    timestamp_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    trust_score: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    complaint: Mapped["CivicComplaint"] = relationship(back_populates="evidence")


class FraudIndicator(Base):
    __tablename__ = "fraud_indicators"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    evidence_id: Mapped[int] = mapped_column(ForeignKey("evidence_metadata.id"), index=True)
    indicator_type: Mapped[str] = mapped_column(String(120))
    risk_score: Mapped[float] = mapped_column(Float)
    explanation: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
