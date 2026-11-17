from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_user
from backend.database.session import get_db
from backend.schemas.evidence import EvidenceUploadResponse
from backend.services.complaint_service import get_complaint
from backend.services.evidence_service import save_evidence

router = APIRouter(prefix="/evidence", tags=["Evidence"])


@router.post("/{complaint_id}/upload", response_model=EvidenceUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_evidence(
    complaint_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> EvidenceUploadResponse:
    complaint = get_complaint(db, complaint_id)
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    evidence, fraud = await save_evidence(db, complaint_id, file)
    return EvidenceUploadResponse(
        complaint_id=complaint_id,
        file_name=evidence.file_name,
        storage_uri=evidence.storage_uri,
        sha256=evidence.sha256,
        trust_score=evidence.trust_score,
        gps_verified=evidence.gps_verified,
        timestamp_verified=evidence.timestamp_verified,
        exif_summary=evidence.exif_payload,
        fraud_indicators=fraud,
    )
