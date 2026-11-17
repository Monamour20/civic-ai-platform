from collections import deque
from datetime import datetime, timezone

AI_EXECUTION_EVENTS: deque[dict] = deque(maxlen=250)


def record_ai_event(event: dict) -> None:
    AI_EXECUTION_EVENTS.appendleft(
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            **event,
        }
    )


def ai_execution_metrics() -> list[dict]:
    events = list(AI_EXECUTION_EVENTS)
    completed = [event for event in events if event.get("state") == "completed"]
    failures = [event for event in events if event.get("state") == "failed"]
    latest_latency = completed[0].get("latency_ms", 0) if completed else 0
    latest_confidence = completed[0].get("confidence_score", 0) if completed else 0
    return [
        {
            "service_name": "ollama-mistral",
            "metric_name": "latest_reasoning_latency_ms",
            "metric_value": latest_latency,
            "unit": "ms",
            "dimensions": {"model": "mistral"},
        },
        {
            "service_name": "ollama-llava",
            "metric_name": "latest_multimodal_confidence",
            "metric_value": round(latest_confidence * 100, 2),
            "unit": "percent",
            "dimensions": {"model": "llava"},
        },
        {
            "service_name": "ai-job-runner",
            "metric_name": "completed_jobs",
            "metric_value": len(completed),
            "unit": "jobs",
            "dimensions": {"window": "memory"},
        },
        {
            "service_name": "ai-job-runner",
            "metric_name": "failed_jobs",
            "metric_value": len(failures),
            "unit": "jobs",
            "dimensions": {"window": "memory"},
        },
    ]
