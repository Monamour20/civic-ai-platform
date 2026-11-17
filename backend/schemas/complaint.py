from datetime import datetime
from pydantic import BaseModel, Field

from backend.models.complaint import ComplaintStatus, IssueSeverity


class ComplaintCreate(BaseModel):
    title: str = Field(min_length=5, max_length=255)
    description: str = Field(min_length=10)
    issue_category: str
    ward: str
    latitude: float | None = None
    longitude: float | None = None


class ComplaintRead(BaseModel):
    id: int
    public_id: str
    title: str
    description: str
    issue_category: str
    severity: IssueSeverity
    status: ComplaintStatus
    ward: str
    latitude: float | None
    longitude: float | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ComplaintStatusUpdate(BaseModel):
    status: ComplaintStatus
    resolution_note: str | None = None
