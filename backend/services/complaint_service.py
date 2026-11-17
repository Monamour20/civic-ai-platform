from uuid import uuid4

from sqlalchemy.orm import Session

from backend.models.complaint import CivicComplaint, ComplaintStatus, IssueSeverity
from backend.schemas.complaint import ComplaintCreate


ISSUE_SEVERITY_MAP = {
    "illegal garbage dumping": IssueSeverity.high,
    "road potholes": IssueSeverity.high,
    "water leakage": IssueSeverity.high,
    "broken streetlights": IssueSeverity.medium,
    "damaged streetlights": IssueSeverity.medium,
    "drainage issues": IssueSeverity.critical,
    "drainage failures": IssueSeverity.critical,
}


def create_complaint(db: Session, payload: ComplaintCreate, citizen_id: int | None = None) -> CivicComplaint:
    complaint = CivicComplaint(
        public_id=f"CIV-{uuid4().hex[:8].upper()}",
        title=payload.title,
        description=payload.description,
        issue_category=payload.issue_category,
        severity=ISSUE_SEVERITY_MAP.get(payload.issue_category.lower(), IssueSeverity.medium),
        status=ComplaintStatus.submitted,
        ward=payload.ward,
        latitude=payload.latitude,
        longitude=payload.longitude,
        citizen_id=citizen_id,
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint


def list_complaints(db: Session, limit: int = 50) -> list[CivicComplaint]:
    return (
        db.query(CivicComplaint)
        .order_by(CivicComplaint.created_at.desc())
        .limit(limit)
        .all()
    )


def get_complaint(db: Session, complaint_id: int) -> CivicComplaint | None:
    return db.query(CivicComplaint).filter(CivicComplaint.id == complaint_id).first()


def update_status(db: Session, complaint: CivicComplaint, status: ComplaintStatus) -> CivicComplaint:
    complaint.status = status
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint
