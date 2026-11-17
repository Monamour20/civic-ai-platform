from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    live_complaints: int
    critical_incidents: int
    mean_resolution_hours: float
    ai_route_accuracy: float
    fraud_alerts: int
    issue_distribution: list[dict]
    department_load: list[dict]


class TelemetryRead(BaseModel):
    service_name: str
    metric_name: str
    metric_value: float
    unit: str
    dimensions: dict
