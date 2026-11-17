from sqlalchemy.orm import Session

from backend.models.department import DepartmentAssignment


ROUTING_MATRIX = {
    "garbage": ("Sanitation Command", 12),
    "pothole": ("Roads & Public Works", 8),
    "water": ("Water Utility Cell", 6),
    "streetlight": ("Electrical Maintenance", 18),
    "drainage": ("Drainage Response Unit", 4),
}


def route_complaint(db: Session, complaint_id: int, issue_category: str, confidence_threshold: float) -> DepartmentAssignment:
    normalized = issue_category.lower()
    department, sla_hours = next(
        (value for key, value in ROUTING_MATRIX.items() if key in normalized),
        ("Civic Operations Desk", 24),
    )
    routing_confidence = 0.917 if department != "Civic Operations Desk" else confidence_threshold
    escalation_risk = 0.84 if "drainage" in normalized or "pothole" in normalized else 0.42
    assignment = DepartmentAssignment(
        complaint_id=complaint_id,
        department_name=department,
        routing_confidence=routing_confidence,
        escalation_risk=escalation_risk,
        assignment_reason=f"Matched {issue_category} to {department} with SLA {sla_hours}h.",
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


def get_sla_hours(department_name: str) -> int:
    for department, sla in ROUTING_MATRIX.values():
        if department == department_name:
            return sla
    return 24
