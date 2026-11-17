from pydantic import BaseModel, Field


class AIAnalysisRequest(BaseModel):
    complaint_id: int
    include_vision: bool = True
    include_reasoning: bool = True
    include_forensics: bool = True


class AIAnalysisResponse(BaseModel):
    complaint_id: int
    severity_prediction: str
    confidence_score: float
    recommended_department: str
    reasoning_trace: list[dict]
    detected_issues: list[dict]
    model_outputs: dict


class RoutingRequest(BaseModel):
    complaint_id: int
    confidence_threshold: float = Field(default=0.82, ge=0.0, le=1.0)


class RoutingResponse(BaseModel):
    complaint_id: int
    assigned_department: str
    routing_confidence: float
    escalation_risk: float
    sla_hours: int
    reason: str
