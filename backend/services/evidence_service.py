from fastapi import UploadFile
from sqlalchemy.orm import Session

from backend.exif.extractor import detect_fraud_indicators, extract_exif_metadata
from backend.models.evidence import EvidenceMetadata, FraudIndicator


async def save_evidence(db: Session, complaint_id: int, file: UploadFile) -> tuple[EvidenceMetadata, list[dict]]:
    metadata = await extract_exif_metadata(file)
    evidence = EvidenceMetadata(
        complaint_id=complaint_id,
        file_name=file.filename or "citizen-evidence.jpg",
        content_type=file.content_type or "application/octet-stream",
        storage_uri=f"s3://civic-ai-evidence/{complaint_id}/{file.filename}",
        sha256=metadata["sha256"],
        captured_at=metadata["captured_at"],
        latitude=metadata["latitude"],
        longitude=metadata["longitude"],
        device_make=metadata["device_make"],
        device_model=metadata["device_model"],
        exif_payload=metadata["raw"],
        gps_verified=metadata["gps_verified"],
        timestamp_verified=metadata["timestamp_verified"],
        trust_score=metadata["trust_score"],
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    fraud_indicators = detect_fraud_indicators(metadata)
    for indicator in fraud_indicators:
        db.add(FraudIndicator(evidence_id=evidence.id, **indicator))
    db.commit()
    return evidence, fraud_indicators
