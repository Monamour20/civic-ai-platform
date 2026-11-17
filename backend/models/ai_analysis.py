from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database.base import Base


class AIAnalysisResult(Base):
    __tablename__ = "ai_analysis_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    complaint_id: Mapped[int] = mapped_column(ForeignKey("civic_complaints.id"), index=True)
    model_name: Mapped[str] = mapped_column(String(120), index=True)
    pipeline_stage: Mapped[str] = mapped_column(String(120), index=True)
    confidence_score: Mapped[float] = mapped_column(Float)
    severity_prediction: Mapped[str] = mapped_column(String(80))
    reasoning_summary: Mapped[str] = mapped_column(Text)
    detected_objects: Mapped[list] = mapped_column(JSON, default=list)
    raw_response: Mapped[dict] = mapped_column(JSON, default=dict)
    latency_ms: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    complaint: Mapped["CivicComplaint"] = relationship(back_populates="analyses")
