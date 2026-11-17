from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_user, require_roles
from backend.database.session import get_db
from backend.models.user import Role, User
from backend.schemas.complaint import ComplaintCreate, ComplaintRead, ComplaintStatusUpdate
from backend.services.complaint_service import create_complaint, get_complaint, list_complaints, update_status

router = APIRouter(prefix="/complaints", tags=["Civic Complaints"])


@router.post("", response_model=ComplaintRead, status_code=status.HTTP_201_CREATED)
def submit_complaint(
    payload: ComplaintCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ComplaintRead:
    return create_complaint(db, payload, citizen_id=user.id)


@router.get("", response_model=list[ComplaintRead])
def get_complaints(
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.operator, Role.analyst, Role.department_user)),
) -> list[ComplaintRead]:
    return list_complaints(db, limit=limit)


@router.get("/{complaint_id}", response_model=ComplaintRead)
def read_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> ComplaintRead:
    complaint = get_complaint(db, complaint_id)
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


@router.patch("/{complaint_id}/status", response_model=ComplaintRead)
def patch_complaint_status(
    complaint_id: int,
    payload: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.operator, Role.department_user)),
) -> ComplaintRead:
    complaint = get_complaint(db, complaint_id)
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return update_status(db, complaint, payload.status)
