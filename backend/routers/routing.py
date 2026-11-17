from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.auth.dependencies import require_roles
from backend.database.session import get_db
from backend.models.user import Role
from backend.schemas.ai import RoutingRequest, RoutingResponse
from backend.services.complaint_service import get_complaint
from backend.services.routing_service import get_sla_hours, route_complaint

router = APIRouter(prefix="/routing", tags=["Municipal Routing"])


@router.post("/assign", response_model=RoutingResponse)
def assign_department(
    payload: RoutingRequest,
    db: Session = Depends(get_db),
    _=Depends(require_roles(Role.operator, Role.analyst)),
) -> RoutingResponse:
    complaint = get_complaint(db, payload.complaint_id)
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    assignment = route_complaint(db, complaint.id, complaint.issue_category, payload.confidence_threshold)
    return RoutingResponse(
        complaint_id=complaint.id,
        assigned_department=assignment.department_name,
        routing_confidence=assignment.routing_confidence,
        escalation_risk=assignment.escalation_risk,
        sla_hours=get_sla_hours(assignment.department_name),
        reason=assignment.assignment_reason,
    )
