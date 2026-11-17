from datetime import datetime
from pydantic import BaseModel


class EvidenceUploadResponse(BaseModel):
    complaint_id: int
    file_name: str
    storage_uri: str
    sha256: str
    trust_score: float
    gps_verified: bool
    timestamp_verified: bool
    exif_summary: dict
    fraud_indicators: list[dict]


class EvidenceMetadataRead(BaseModel):
    id: int
    complaint_id: int
    file_name: str
    content_type: str
    sha256: str
    captured_at: datetime | None
    latitude: float | None
    longitude: float | None
    gps_verified: bool
    timestamp_verified: bool
    trust_score: float
    exif_payload: dict

    model_config = {"from_attributes": True}
