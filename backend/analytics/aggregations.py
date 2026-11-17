from backend.ai.telemetry import ai_execution_metrics


def executive_summary() -> dict:
    return {
        "live_complaints": 1486,
        "critical_incidents": 91,
        "mean_resolution_hours": 16.8,
        "ai_route_accuracy": 0.928,
        "fraud_alerts": 72,
        "issue_distribution": [
            {"issue": "illegal garbage dumping", "count": 286},
            {"issue": "road potholes", "count": 342},
            {"issue": "water leakage", "count": 198},
            {"issue": "broken streetlights", "count": 164},
            {"issue": "drainage issues", "count": 229},
        ],
        "department_load": [
            {"department": "Sanitation Command", "queue": 286, "sla_adherence": 0.82},
            {"department": "Roads & Public Works", "queue": 342, "sla_adherence": 0.68},
            {"department": "Water Utility Cell", "queue": 198, "sla_adherence": 0.76},
            {"department": "Electrical Maintenance", "queue": 164, "sla_adherence": 0.88},
            {"department": "Drainage Response Unit", "queue": 229, "sla_adherence": 0.61},
        ],
    }


def operational_telemetry() -> list[dict]:
    return [
        {"service_name": "fastapi-gateway", "metric_name": "p95_latency_ms", "metric_value": 318, "unit": "ms", "dimensions": {"route": "/api/v1/complaints"}},
        {"service_name": "mistral-7b", "metric_name": "gpu_utilization", "metric_value": 76, "unit": "percent", "dimensions": {"pool": "a10g"}},
        {"service_name": "llava-vision", "metric_name": "queue_depth", "metric_value": 204, "unit": "requests", "dimensions": {"priority": "high"}},
        {"service_name": "evidence-fusion", "metric_name": "routing_accuracy", "metric_value": 92.8, "unit": "percent", "dimensions": {"window": "24h"}},
    ] + ai_execution_metrics()
