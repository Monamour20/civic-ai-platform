from pydantic import BaseModel


class GISIssueRead(BaseModel):
    complaint_public_id: str
    issue_category: str
    ward: str
    department: str
    severity: str
    status: str
    latitude: float
    longitude: float
    ai_confidence: float
    escalation_risk: float


class GISIssueCreate(GISIssueRead):
    pass
